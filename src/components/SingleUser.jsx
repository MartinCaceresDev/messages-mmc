import { useEffect, useState } from "react";
import { actions, useAuthContext, useChatContext } from "../context";

export const SingleUser = ({ otherUser: singleOtherUser }) => {

  const { user } = useAuthContext();
  const { onOtherUserClick, toggleSeen, otherUser, unreadMessages, dispatch } = useChatContext();
  const [unSeenMessages, setUnSeenMessages] = useState(0);

  // on click on user name we change other user
  const handleUserClick = () => {
    dispatch({ type: actions.setAllMessages, payload: [] });
    onOtherUserClick(singleOtherUser);
    dispatch({ type: actions.setIsMenuOpen, payload: false });
  };

  // check if we have unseen messages from that user
  useEffect(() => {
    const unSeenMessagesList = unreadMessages.length
      ? unreadMessages.filter(message => message.from.uid === singleOtherUser.uid && message.to.uid === user.uid)
      : [];
    setUnSeenMessages(unSeenMessagesList.length);
  }, [unreadMessages]);

  // when we open other user messages, unseen messages become 0
  useEffect(() => {
    singleOtherUser.uid === otherUser?.uid && setUnSeenMessages(0);
  }, [toggleSeen]);

  return (
    <div onClick={handleUserClick} className={`flex ${unSeenMessages ? 'justify-between' : 'justify-start'} px-2 items-center cursor-pointer hover:font-medium hover:bg-green-800 py-1 transition-all rounded-lg`}>

      {/* other user name */}
      <span className='capitalize text-white'>{singleOtherUser.displayName}</span>

      {/* unseen messages notification */}
      {unSeenMessages
        ? <span className='text-white rounded-full text-center pl-1.5 pr-2 bg-orange-600'>{unSeenMessages}</span>
        : null
      }
    </div>
  );
};
