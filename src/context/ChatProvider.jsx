import { createContext, useContext, useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase-config';
import { useRoomsIds, prepareMessage, makeRequest, urlServer } from '../utils';

const socket = io(urlServer);

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const ChatProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [toggleSeen, setToggleSeen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState([]);

  const createUser = async (username, email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(auth.currentUser, { displayName: username });
      setUser(auth.currentUser);
      socket.emit('newUser', { user: auth.currentUser });
      navigate('/', { replace: true });
      makeRequest('post', urlServer, '/api/users', { user: auth.currentUser })
    } catch (err) {
      console.log(err);
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setUser(auth.currentUser);
      navigate('/', { replace: true });
    } catch (err) {
      console.log(err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setOtherUser(null);
      setRoom(null);
      setAllMessages([]);
      setUnreadMessages([]);
      const roomsIds = useRoomsIds(user, allUsers);
      socket.emit('leaveRooms', roomsIds);
    } catch (err) {
      console.log(err);
    }
  };

  // RECOVER USER
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) navigate('/');
    })
  }, [])

  // GET USERS LIST
  const getUsers = async () => {
    try {
      const data = await makeRequest('get', urlServer, '/api/users');
      const onlyOtherUsers = data.filter(item => item.user.uid !== user.uid);
      const roomsIds = useRoomsIds(user, onlyOtherUsers);
      socket.emit('joinToRooms', roomsIds);
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
    const getUnreadMessages = async () => {
      try {
        const unreadMessagesList = await makeRequest('get', urlServer, '/api/chats');
        setUnreadMessages(unreadMessagesList);
      } catch (err) {
        console.log(err);
      }
    };
    getUnreadMessages();
  }, [user])

  // GET CHATS WITH OTHER USER FROM DB
  useEffect(() => {
    if (otherUser) {
      (async () => {
        try {
          const roomId = useRoomsIds(user, null, otherUser);
          setRoom(roomId);
          const messagesDB = await makeRequest('get', urlServer, `/api/chats/${roomId}`);
          setAllMessages(messagesDB);
        } catch (err) {
          console.log(err);
        }
      })();
    }
  }, [otherUser])

  // SEND NEW MESSAGE
  const sendNewMessage = async (message) => {
    const newMessage = prepareMessage(message, user, otherUser, room);
    socket.emit('newMessage', newMessage);
    setAllMessages(prev => [...prev, newMessage]);
    makeRequest('post', urlServer, '/api/chats', newMessage);
  };

  // UPDATE USERS LIST
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
    setToggleSeen(prev => !prev);
    makeRequest('patch', urlServer, `/api/chats/${room}`, otherUser);
  };

  // RECEIVE MESSAGES ARE SEEN
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
    <AppContext.Provider value={{
      user, createUser, login, logout, loading, allUsers, sendNewMessage, onOtherUserClick, allMessages,
      otherUser, messagesAreSeen, isMenuOpen, setIsMenuOpen, toggleSeen, unreadMessages
    }}>
      {children}
    </AppContext.Provider>
  )
}
