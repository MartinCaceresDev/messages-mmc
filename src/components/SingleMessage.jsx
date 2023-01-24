import { useEffect, useRef } from "react";
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useAppContext } from "../context/ChatProvider";

export const SingleMessage = ({ fromUid, message, userId, time: timeString, lastSeen }) => {
  const scrollRef = useRef();

  const { allMessages } = useAppContext();

  useEffect(() => {
    scrollRef.current.scrollIntoView({ behavior: "smooth" })
  }, [allMessages]);

  const time = new Date(timeString);
  const hours = time.getHours() < 10 ? `0${time.getHours()}` : time.getHours();
  const minutes = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes();
  const timestamp = `${time.toLocaleDateString().slice(0, -4)}${time.getFullYear() - 2000} ${hours}:${minutes}`

  return (
    <article ref={scrollRef} className={` my-2 ${fromUid === userId ? 'self-end items-end' : 'self-start items-start'} flex flex-col max-w-[50%]`}>
      <span className={`${fromUid === userId ? 'bg-blue-700' : 'bg-gray-300 text-black'} min-w-full text-center p-3 rounded-lg mb-1 text-sm sm:text-base`}>
        {message}
      </span>
      <span className='text-xs text-orange-300 mb-1'>{timestamp}</span>
      {lastSeen && <span className='-mt-2 text-xs text-green-500'><DoneAllIcon /></span>}
    </article>
  )
}
