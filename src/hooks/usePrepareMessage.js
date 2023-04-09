import { v4 as uuid } from 'uuid';

/**
 * 
 * @param {String} message - (String) Content of the message.
 * @param {{}} fromUser - (Object) User writing the message.
 * @param {{}} toUser - (Object) User receiving the message.
 * @param {String} room - (String) Room id.
 * @returns {} (Object) new message
 */

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