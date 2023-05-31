import { actions, useAuthContext, useChatContext } from "../context";
import { SingleUser } from './';

export const UsersBar = () => {

  const { logout, user } = useAuthContext();
  const { allUsers, isMenuOpen, dispatch } = useChatContext();

  const onLogout = () => {
    dispatch({ type: actions.setOtherUser, payload: null });
    dispatch({ type: actions.setRoom, payload: null });
    dispatch({ type: actions.setAllMessages, payload: [] });
    dispatch({ type: actions.setUnreadMessages, payload: [] });
    logout(allUsers);
  };

  return (
    <div className={`w-7/12 min-w-[240px] sm:w-2/6 flex-col absolute bottom-16 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full invisible'} sm:visible sm:translate-x-0 transition-all top-16 sm:static sm:flex`}>

      <div className='flex justify-between items-center px-2 sm:px-3 md:px-4 basis-16 shrink-0 bg-blue-900'>

        {/* Logged user name */}
        <span className='text-yellow-400 text-lg font-semibold capitalize'>
          {user.displayName}
        </span>

        {/* Sign out button */}
        <button
          className='bg-gray-500 scale-75 sm:scale-100 cursor-pointer hover:bg-gray-600 transition-all text-white rounded-lg px-3 py-1'
          onClick={onLogout}
        >
          Sign out
        </button>
      </div>

      {/* Other users list */}
      <div className='bg-zinc-800 h-full sm:h-auto sm:grow py-4 flex flex-col overflow-auto'>
        {allUsers.length > 0
          ? allUsers.map(({ user: item }) => <SingleUser otherUser={item} key={item.uid} />)
          : <span className='text-white self-center mt-5'>There are no other users</span>
        }
      </div>
    </div>
  );
};
