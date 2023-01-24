import { Messages, UsersBar } from "../components"
import { useAppContext } from "../context/ChatProvider"

export const ChatsPage = () => {

  const { otherUser, messagesAreSeen } = useAppContext();

  const handleSeen = () => otherUser && messagesAreSeen();

  return (
    <div
      className='bg-gray-900 h-screen flex justify-center overflow-x-hidden items-center p-1'
      onMouseOver={handleSeen}
      onTouchStart={handleSeen}
    >
      <main className='flex rounded-lg w-full sm:w-5/6 lg:w-2/3 h-full sm:h-2/3 relative'>
        <UsersBar />
        <Messages />
      </main>
    </div>
  )
}
