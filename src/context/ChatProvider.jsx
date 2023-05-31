import { createContext, useContext, useEffect, useState, useReducer } from 'react';
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
      const data = await makeRequest('get', '/api/users');
      const onlyOtherUsers = data.filter(item => item.user.uid !== user.uid);
      joinToRooms(onlyOtherUsers);
      dispatch(actions.setAllUsers(onlyOtherUsers));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!loading) getUsers();
  }, [user, loading]);

  // CHANGE OTHER USER
  const onOtherUserClick = (anotherUser) => dispatch(actions.setOtherUser(anotherUser));

  // GET ALL UNREAD MESSAGES FROM DB
  useEffect(() => {
    getUnreadMessages()
      .then(unreadMessagesList => dispatch(actions.setUnreadMessages(unreadMessagesList)))
      .catch(err => console.log(err));
  }, [user]);

  // GET CHATS WITH OTHER USER FROM DB
  useEffect(() => {
    if (chatState.otherUser) {
      (async () => {
        try {
          const roomId = useRoomsIds(user, null, chatState.otherUser);
          dispatch(actions.setRoom(roomId));
          const messagesDB = await makeRequest('get', `/api/chats/${roomId}`);
          dispatch(actions.setAllMessages(messagesDB));
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
    dispatch(actions.setAllMessages([...chatState.allMessages, newMessage]));
    makeRequest('post', '/api/chats', newMessage);
  };

  // WHEN ANOTHER USER CONNECTS, UPDATE LIST
  useEffect(() => {
    const handleNewUser = (newUser) => {
      const allUsersUpdated = [...chatState.allUsers, newUser];
      const roomsIds = useRoomsIds(user, allUsersUpdated);
      socket.emit('joinToRooms', roomsIds);
      dispatch(actions.setAllUsers(allUsersUpdated));
    };
    socket.on('newUser', handleNewUser);
    return () => socket.off('newUser', handleNewUser);
  }, [chatState.allUsers]);

  // NEW MESSAGE RECEIVED
  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      newMessage.room === chatState.room && dispatch(actions.setAllMessages([...chatState.allMessages, newMessage]));
      dispatch(actions.setUnreadMessages([...chatState.unreadMessages, newMessage]));
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

    dispatch(actions.setUnreadMessages(tempUnreadMessages));
    dispatch(actions.setToggleSeen());

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
      if (tempMessagesSeen.length) dispatch(actions.setAllMessages(tempMessagesSeen));
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
