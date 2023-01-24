import { useEffect, useState } from "react";
import { useAppContext } from "../context/ChatProvider"

export const SingleUser = ({ otherUser: singleOtherUser }) => {

  const { onOtherUserClick, toggleSeen, otherUser, unreadMessages } = useAppContext();
  const [unSeenMessages, setUnSeenMessages] = useState(0);

  useEffect(() => {
    const unSeenMessagesList = unreadMessages.length
      ? unreadMessages.filter(message => message.from.uid === singleOtherUser.uid && !message.read)
      : [];
    setUnSeenMessages(unSeenMessagesList.length);
  }, [unreadMessages]);

  useEffect(() => {
    if (singleOtherUser.uid === otherUser?.uid) {
      setUnSeenMessages(0);
    }
  }, [toggleSeen])

  return (
    <div
      onClick={() => onOtherUserClick(singleOtherUser)}
      className='flex justify-between items-center cursor-pointer hover:font-medium hover:bg-green-800 px-4 py-1 transition-all rounded-lg'
    >
      <span className='capitalize text-white'>
        {singleOtherUser.displayName}
      </span>
      <span className='text-white rounded-full text-center pl-1.5 pr-2 bg-orange-600'>{unSeenMessages}</span>
    </div>
  )
}