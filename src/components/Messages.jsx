import { useEffect, useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { useChatContext } from "../context/ChatProvider";
import { useAuthContext } from "../context/AuthProvider";
import { SingleMessage } from "./";

export const Messages = () => {

  const { user } = useAuthContext();
  const { sendNewMessage, allMessages, otherUser, setIsMenuOpen, isMenuOpen } = useChatContext();
  const [newMessage, setNewMessage] = useState('');
  const [messagesToRender, setMessagesToRender] = useState([]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!newMessage) return;
    sendNewMessage(newMessage);
    setNewMessage('');
  };

  useEffect(() => {
    const otherPersonReadMessages = allMessages.length
      && allMessages.filter(message => message.from.uid === user.uid && message.read === true);

    const lastSeenId = otherPersonReadMessages.length && otherPersonReadMessages[otherPersonReadMessages.length - 1].messageId;

    const tempMessages = allMessages.map(message => {
      if (message.messageId === lastSeenId) {
        return <SingleMessage key={message.messageId} time={message.time} fromUid={message.from.uid} userId={user.uid} message={message.message} lastSeen={true} />;
      } else {
        return <SingleMessage key={message.messageId} time={message.time} fromUid={message.from.uid} userId={user.uid} message={message.message} />
      }
    });
    setMessagesToRender(tempMessages);
  }, [allMessages])


  return (
    <div className='flex flex-col justify-between items-center w-full sm:w-4/6'>
      <div className='px-4 basis-16 shrink-0 bg-zinc-800 w-full flex justify-center items-center relative'>
        <div onClick={() => setIsMenuOpen(prev => !prev)} className='sm:hidden text-white absolute left-6'>
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </div>
        <span className='text-lg capitalize text-green-400 font-medium'>{otherUser ? otherUser.displayName : 'Select a user'}</span>
      </div>

      <section className='text-white flex flex-col w-full overflow-y-auto p-3 sm:p-5 bg-black grow'>

        {messagesToRender}

      </section>

      <form className='flex flex-col sm:flex-row justify-evenly w-full bg-gray-500 h-min sm:h-12 shrink-0 py-3 px-1 sm:p-1 items-center' onSubmit={onSubmit} >
        <input type='text' className='p-2 grow outline-none w-full bg-white mb-4 sm:mb-0' placeholder='write a message' value={newMessage} onChange={e => setNewMessage(e.target.value)} disabled={!otherUser} />
        <button className='bg-blue-800 hover:bg-blue-900 transition-all text-white p-2 rounded-lg w-20 ml-2 font-medium'><SendIcon /></button>
      </form>
    </div>
  )
}
