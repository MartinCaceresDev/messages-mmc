import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile
} from 'firebase/auth';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase-config';
import { urlServer } from '../utils';
import { makeRequest } from '../helpers';
import { useRoomsIds } from '../hooks';

const socket = io(urlServer);

const AuthContext = createContext();
export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {

  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  const createUser = async (username, email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(auth.currentUser, { displayName: username });
      setUser(auth.currentUser);
      socket.emit('newUser', { user: auth.currentUser });
      navigate('/', { replace: true });
      makeRequest('post', '/api/users', { user: auth.currentUser })
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

  return (
    <AuthContext.Provider value={{ user, loading, createUser, login, logout, socket }}>
      {children}
    </AuthContext.Provider>
  );
}
