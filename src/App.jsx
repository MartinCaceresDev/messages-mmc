import { Route, Routes } from 'react-router-dom';
import { PrivateRoute } from './components';
import { ChatsPage, LoginPage, RegisterPage } from './pages';
import './index.css'

export default function App() {

  return (
    <Routes>
      <Route path='/' element={<PrivateRoute><ChatsPage /></PrivateRoute>} />
      <Route path='login' element={<LoginPage />} />
      <Route path='register' element={<RegisterPage />} />
    </Routes>
  )
}
