import { actions } from "./actions";

export const chatReducer = (state, action) =>{
  switch (action.type){
    case actions.setAllUsers:
      return {
        ...state,
        allusers: action.payload
      }
    case actions.setAllMessages:
      return {
        ...state,
        allMessages: action.payload
      }
    case actions.setOtherUser:
      return {
        ...state,
        otherUser: action.payload
      }
    case actions.setRoom:
      return {
        ...state,
        room: action.payload
      }
    case actions.setToggleSeen:
      return {
        ...state,
        toggleSeen: !state.toggleSeen
      }
    case actions.setIsMenuOpen:
      return {
        ...state,
        isMenuOpen: action.payload
      }
    case actions.setUnreadMessages:
      return {
        ...state,
        unreadMessages: action.payload
      }
    default:
      return state
  }
}