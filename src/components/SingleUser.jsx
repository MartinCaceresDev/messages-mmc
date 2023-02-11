import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthProvider";
import { useChatContext } from "../context/ChatProvider"

export const SingleUser = ({ otherUser: singleOtherUser }) => {

  const { user } = useAuthContext();
  const { onOtherUserClick, toggleSeen, otherUser, unreadMessages, setIsMenuOpen } = useChatContext();
  const [unSeenMessages, setUnSeenMessages] = useState(0);

  const handleUserClick = () => {
    onOtherUserClick(singleOtherUser);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const unSeenMessagesList = unreadMessages.length
      ? unreadMessages.filter(message => message.from.uid === singleOtherUser.uid && message.to.uid === user.uid)
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
      onClick={handleUserClick}
      className={`flex ${unSeenMessages ? 'justify-between' : 'justify-start'}  items-center cursor-pointer hover:font-medium hover:bg-green-800 px-4 py-1 transition-all rounded-lg`}
    >
      <span className='capitalize text-white'>
        {singleOtherUser.displayName}
      </span>
      {unSeenMessages
        ? <span className='text-white rounded-full text-center pl-1.5 pr-2 bg-orange-600'>{unSeenMessages}</span>
        : null
      }
    </div>
  )
}
