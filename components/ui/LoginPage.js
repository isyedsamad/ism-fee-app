'use client'
import React, { useEffect, useState } from 'react'
import Loading from './Loading';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
const LoginPage = () => {
  const router = useRouter();
  const { user, loading, logout, setLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = username + "@ism.com"
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  }, [user, loading]);
  return (
    <>
    {loading && (
      <Loading />
    )}
        <div className='w-screen h-screen flex justify-center items-center bg-gray-200 px-5'>
            <div className='py-6 px-5 sm:px-8 bg-white rounded-lg w-full max-w-sm flex justify-center items-center flex-col gap-5'>
                <h1 className='font-semibold text-lg text-(--primary)'>Member Login</h1>
                <form onSubmit={submitHandler}>
                    <input type='text' name='username' value={username} onChange={
                      (e) => setUsername(e.target.value)
                    } placeholder='enter username' className='w-full px-4 py-2 border-2 text-sm border-gray-200 rounded-md' />
                    <input type='password' name='password' value={password} onChange={
                      (e) => { setPassword(e.target.value) }
                    } placeholder='enter password' className='w-full px-4 py-2 border-2 mt-3 text-sm border-gray-200 rounded-md' />
                    <input type='submit' value='Login' className='w-full px-5 py-2 bg-(--primary) text-white rounded-md mt-5 font-semibold hover:bg-(--primary)/85 cursor-pointer' />
                </form>
            </div>
        </div>
    </>
  )
}

export default LoginPage