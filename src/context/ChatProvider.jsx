import { createContext, useContext, useEffect, useState } from 'react';
import { getUnreadMessages, makeRequest } from '../helpers';
import { usePrepareMessage, useRoomsIds } from '../hooks';
import { useAuthContext } from './AuthProvider';


const ChatContext = createContext();
export const useChatContext = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {

  const [allUsers, setAllUsers] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [toggleSeen, setToggleSeen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState([]);

  const { user, loading, socket } = useAuthContext();

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
      joinToRooms(onlyOtherUsers)
      setAllUsers(onlyOtherUsers);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!loading) getUsers();
  }, [user, loading])

  // CHANGE OTHER USER
  const onOtherUserClick = (anotherUser) => setOtherUser(anotherUser);

  // GET ALL UNREAD MESSAGES FROM DB
  useEffect(() => {
    getUnreadMessages()
      .then(unreadMessagesList => setUnreadMessages(unreadMessagesList))
      .catch(err => console.log(err));
  }, [user])

  // GET CHATS WITH OTHER USER FROM DB
  useEffect(() => {
    if (otherUser) {
      (async () => {
        try {
          const roomId = useRoomsIds(user, null, otherUser);
          setRoom(roomId);
          const messagesDB = await makeRequest('get', `/api/chats/${roomId}`);
          setAllMessages(messagesDB);
        } catch (err) {
          console.log(err);
        }
      })();
    }
  }, [otherUser])

  // SEND NEW MESSAGE
  const sendNewMessage = async (message) => {
    const newMessage = usePrepareMessage(message, user, otherUser, room);
    socket.emit('newMessage', newMessage);
    setAllMessages(prev => [...prev, newMessage]);
    makeRequest('post', '/api/chats', newMessage);
  };

  // WHEN ANOTHER USER CONNECTS, UPDATE LIST
  useEffect(() => {
    const handleNewUser = (newUser) => {
      const allUsersUpdated = [...allUsers, newUser];
      const roomsIds = useRoomsIds(user, allUsersUpdated);
      socket.emit('joinToRooms', roomsIds);
      setAllUsers(allUsersUpdated)
    };
    socket.on('newUser', handleNewUser);
    return () => socket.off('newUser', handleNewUser);
  }, [allUsers]);

  // NEW MESSAGE RECEIVED
  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      if (newMessage.room === room) {
        setAllMessages(prev => [...prev, newMessage])
      }
      setUnreadMessages(prev => [...prev, newMessage]);
    };
    socket.on('newMessage', handleNewMessage);
    return () => socket.off('newMessage', handleNewMessage);
  }, [allMessages])

  // EMIT MESSAGES AS SEEN
  const messagesAreSeen = async () => {
    socket.emit('messagesAreSeen', { room, allMessages, user: otherUser });
    const tempUnreadMessages = [];
    unreadMessages.forEach(msg => {
      if (msg.from.uid === otherUser.uid && msg.to.uid === user.uid) {
        return;
      }
      return tempUnreadMessages.push(msg);
    });
    setUnreadMessages(tempUnreadMessages);
    setToggleSeen(prev => !prev);
    makeRequest('patch', `/api/chats/${room}`, otherUser);
  };

  // RECEIVE MESSAGES AS SEEN
  useEffect(() => {
    const onMessagesSeen = ({ allMessages, user }) => {
      const tempMessagesSeen = [];
      allMessages.forEach(message => {
        if (message.from.uid === user.uid && message.room === room) {
          tempMessagesSeen.push({ ...message, read: true });
        } else if (message.room === room) {
          tempMessagesSeen.push(message);
        } else return;
      });
      if (tempMessagesSeen.length) {
        setAllMessages(tempMessagesSeen);
      }
    };
    socket.on('messagesAreSeen', onMessagesSeen);
    return () => socket.off('messagesAreSeen', onMessagesSeen);
  }, [toggleSeen])

  return (
    <ChatContext.Provider value={{
      allUsers, sendNewMessage, onOtherUserClick, allMessages, setAllMessages, otherUser, setOtherUser,
      messagesAreSeen, isMenuOpen, setIsMenuOpen, toggleSeen, unreadMessages, setUnreadMessages, setRoom
    }}>
      {children}
    </ChatContext.Provider>
  )
}
