import { makeRequest } from "./";


export const getUnreadMessages = async () => {
  try {
    const unreadMessagesList = await makeRequest('get', '/api/chats');
    return unreadMessagesList;
  } catch (err) {
    console.log(err);
  }
};
