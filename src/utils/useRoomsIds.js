export const useRoomsIds = (user, otherUsersList, onlyOneUserRoom)=>{
	if (onlyOneUserRoom){
		return [user.uid, onlyOneUserRoom.uid].sort().join('room');
	} else {
		const roomsIds = otherUsersList?.map(otherUser =>	[user.uid, otherUser?.user?.uid].sort().join('room'));
		return roomsIds;
	}
};
