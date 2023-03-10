import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";

export const LoginPage = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useAuthContext();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    login(email, password);
  };

  return (
    <div className='bg-gray-900 h-screen flex justify-center items-center'>
      <form onSubmit={onSubmit} className='py-8 px-5 sm:px-12 outline-none w-80 flex flex-col bg-gray-400 rounded-lg'>
        <h1 className='text-center text-2xl pb-3 font-semibold text-teal-900'>Login</h1>
        <input
          className='outline-none my-1.5 p-2'
          type='text'
          placeholder='your email'
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          autoComplete="false"
          className='outline-none my-1.5 p-2'
          type='password'
          placeholder='your password'
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className='bg-blue-700 transition-all text-white rounded-lg py-2 font-medium my-3 cursor-pointer hover:bg-blue-900'>
          Login
        </button>
        <span className='text-center'>
          Don't have an account?
          <Link to='/register' className='font-semibold cursor-pointer underline hover:text-lime-900'>
            Register
          </Link>
        </span>
      </form>
    </div>
  )
}
