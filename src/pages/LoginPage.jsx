import { Link } from "react-router-dom";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuthContext } from "../context/AuthProvider";

// form validations
const schema = yup.object().shape({
  email: yup.string().email('Insert a valid email.').required('Email is required.'),
  password: yup.string().min(6, 'Password must have at least 6 characters.').required('Password is required.')
});

export const LoginPage = () => {

  // form validations
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const { login } = useAuthContext();

  const onSubmit = ({ email, password }) => login(email, password);

  return (
    <div className='bg-gray-900 h-screen flex justify-center items-center'>
      <form onSubmit={handleSubmit(onSubmit)} className='py-8 px-5 sm:px-12 outline-none w-80 flex flex-col bg-gray-400 rounded-lg'>
        <h1 className='text-center text-2xl pb-3 font-semibold text-teal-900'>Login</h1>

        {/* email */}
        <input
          autoComplete='off'
          className='outline-none my-1.5 p-2'
          type='text'
          placeholder='your email'
          {...register('email')}
        />
        {errors.email?.message && <span className='text-xs text-red-600 italic mb-2'>{errors.email.message}</span>}

        {/* password */}
        <input
          className='outline-none my-1.5 p-2'
          type='password'
          placeholder='your password'
          {...register('password')}
        />
        {errors.password?.message && <span className='text-xs text-red-600 italic mb-2'>{errors.password.message}</span>}

        <button className='bg-blue-700 transition-all text-white rounded-lg py-2 font-medium my-3 cursor-pointer hover:bg-blue-900'>Login</button>
        <span className='text-center'>
          Don't have an account?
          <Link to='/register' className='font-semibold cursor-pointer underline hover:text-lime-900'>Register</Link>
        </span>
      </form>
    </div>
  )
}
