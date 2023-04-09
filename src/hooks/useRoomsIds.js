/**
 * 
 * @param {{}} user - (Object) Logged user.
 * @param {{}[]} otherUsersList - (Array) List of other users.
 * @param {{}} onlyOneUserRoom - (Object) (optional) Other user. 
 * @returns An array of room ids. If onlyOneUserRoom is received, returns a string with one room id.
 */

export const useRoomsIds = (user, otherUsersList, onlyOneUserRoom=null)=>{
	if (onlyOneUserRoom){
		return [user.uid, onlyOneUserRoom.uid].sort().join('room');
	} else {
		const roomsIds = otherUsersList?.map(otherUser =>	[user.uid, otherUser?.user?.uid].sort().join('room'));
		return roomsIds;
	}
};
