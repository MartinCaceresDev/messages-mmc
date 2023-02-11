import { v4 as uuid } from 'uuid';

export const usePrepareMessage = (message, fromUser, toUser, room)=>{
  const time = new Date();
  const newMessage = {
    time,
    messageId: time.getTime() + uuid(),
    message,
    from: fromUser,
    to: toUser,
    room,
    read: false
  };
  return newMessage;
};