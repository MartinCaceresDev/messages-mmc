import { useEffect, useRef } from "react";
import { formatDistanceToNow } from 'date-fns';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useChatContext } from "../context/ChatProvider";

export const SingleMessage = ({ fromUid, message, userId, time: timeString, lastSeen }) => {
  const scrollRef = useRef();

  const { allMessages } = useChatContext();

  useEffect(() => {
    scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  // get exact message time
  const time = new Date(timeString);
  const hours = time.getHours() < 10 ? `0${time.getHours()}` : time.getHours();
  const minutes = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes();
  const timestamp = `${time.toLocaleDateString().slice(0, -4)}${time.getFullYear() - 2000} ${hours}:${minutes}`;

  // get time ago message
  const timeAgo = formatDistanceToNow(time);
  const timeAgoMsg = `${timeAgo} ago`;

  return (
    <article ref={scrollRef} className={` my-2 ${fromUid === userId ? 'self-end items-end' : 'self-start items-start'} flex flex-col max-w-[50%]`}>

      {/* message */}
      <span className={`${fromUid === userId ? 'bg-blue-700' : 'bg-gray-300 text-black'} min-w-full text-left p-3 rounded-lg mb-1 text-sm sm:text-base`}>
        {message}
      </span>

      {/* time ago */}
      <span title={timestamp} className='text-xs text-orange-300 mb-1'>
        {timeAgoMsg}
      </span>

      {/* message was read? */}
      {lastSeen
        && <span title='Message was seen.' className='-mt-2 text-xs text-green-500'>
          <DoneAllIcon sx={{ height: '15px' }} />
        </span>}
    </article>
  );
};
