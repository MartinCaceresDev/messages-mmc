import { createContext, useContext, useEffect, useReducer } from 'react';
import { getUnreadMessages, makeRequest } from '../helpers';
import { usePrepareMessage, useRoomsIds } from '../hooks';
import { useAuthContext } from './AuthProvider';
import { actions, chatInitialState, chatReducer } from './';


const ChatContext = createContext();
export const useChatContext = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {

  const { user, loading, socket } = useAuthContext();
  const [chatState, dispatch] = useReducer(chatReducer, chatInitialState);

  // JOIN USER TO ALL ROOMS
  const joinToRooms = (onlyOtherUsers) => {
    const roomsIds = useRoomsIds(user, onlyOtherUsers);
    socket.emit('joinToRooms', roomsIds);
  };

  // GET USERS LIST
  const getUsers = async () => {
    try {
      dispatch({ type: actions.setLoadingUsers, payload: true });
      const data = await makeRequest('get', '/api/users');
      const onlyOtherUsers = data.filter(item => item.user.uid !== user?.uid);
      joinToRooms(onlyOtherUsers);
      dispatch({ type: actions.setAllUsers, payload: onlyOtherUsers });
      dispatch({ type: actions.setLoadingUsers, payload: false });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!loading && user) getUsers();
  }, [user, loading]);

  // CHANGE OTHER USER
  const onOtherUserClick = (anotherUser) => dispatch({ type: actions.setOtherUser, payload: anotherUser });

  // GET ALL UNREAD MESSAGES FROM DB
  useEffect(() => {
    getUnreadMessages()
      .then(unreadMessagesList => dispatch({ type: actions.setUnreadMessages, payload: unreadMessagesList }))
      .catch(err => console.log(err));
  }, [user]);

  // GET CHATS WITH OTHER USER FROM DB
  useEffect(() => {
    if (chatState.otherUser) {
      (async () => {
        try {
          dispatch({ type: actions.setLoadingMessages, payload: true });
          const roomId = useRoomsIds(user, null, chatState.otherUser);
          dispatch({ type: actions.setRoom, payload: roomId });
          const messagesDB = await makeRequest('get', `/api/chats/${roomId}`);
          dispatch({ type: actions.setAllMessages, payload: messagesDB });
          dispatch({ type: actions.setLoadingMessages, payload: false });
        } catch (err) {
          console.log(err);
        }
      })();
    }
  }, [chatState.otherUser]);

  // SEND NEW MESSAGE
  const sendNewMessage = async (message) => {
    const newMessage = usePrepareMessage(message, user, chatState.otherUser, chatState.room);
    socket.emit('newMessage', newMessage);
    dispatch({ type: actions.setAllMessages, payload: [...chatState.allMessages, newMessage] });
    makeRequest('post', '/api/chats', newMessage);
  };

  // WHEN ANOTHER USER CONNECTS, UPDATE LIST
  useEffect(() => {
    const handleNewUser = (newUser) => {
      const allUsersUpdated = [...chatState.allUsers, newUser];
      const roomsIds = useRoomsIds(user, allUsersUpdated);
      socket.emit('joinToRooms', roomsIds);
      dispatch({ type: actions.setAllUsers, payload: allUsersUpdated });
    };
    socket.on('newUser', handleNewUser);
    return () => socket.off('newUser', handleNewUser);
  }, [chatState.allUsers]);

  // NEW MESSAGE RECEIVED
  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      newMessage.room === chatState.room && dispatch(actions.setAllMessages([...chatState.allMessages, newMessage]));
      dispatch({ type: actions.setUnreadMessages, payload: [...chatState.unreadMessages, newMessage] });
    };
    socket.on('newMessage', handleNewMessage);
    return () => socket.off('newMessage', handleNewMessage);
  }, [chatState.allMessages]);

  // EMIT MESSAGES AS SEEN
  const messagesAreSeen = async () => {
    socket.emit('messagesAreSeen', { room: chatState.room, allMessages: chatState.allMessages, user: chatState.otherUser });

    const tempUnreadMessages = [];
    chatState.unreadMessages.forEach(msg => {
      if (msg.from.uid === chatState.otherUser.uid && msg.to.uid === user.uid) return;
      return tempUnreadMessages.push(msg);
    });

    dispatch({ type: actions.setUnreadMessages, payload: tempUnreadMessages });
    dispatch({ type: actions.setToggleSeen });

    // save seen in DB
    makeRequest('patch', `/api/chats/${chatState.room}`, chatState.otherUser);
  };

  // RECEIVE MESSAGES AS SEEN
  useEffect(() => {
    const onMessagesSeen = ({ allMessages, user }) => {
      const tempMessagesSeen = [];
      allMessages.forEach(message => {
        if (message.from.uid === user.uid && message.room === chatState.room) {
          tempMessagesSeen.push({ ...message, read: true });
        } else if (message.room === chatState.room) {
          tempMessagesSeen.push(message);
        } else return;
      });
      if (tempMessagesSeen.length) dispatch({ type: actions.setAllMessages, payload: tempMessagesSeen });
    };
    socket.on('messagesAreSeen', onMessagesSeen);
    return () => socket.off('messagesAreSeen', onMessagesSeen);
  }, [chatState.toggleSeen]);

  return (
    <ChatContext.Provider value={{ sendNewMessage, onOtherUserClick, dispatch, messagesAreSeen, ...chatState }}>
      {children}
    </ChatContext.Provider>
  );
};
