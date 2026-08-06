import Sidebar from "../../components/chat/Sidebar";
import ChatWindow from "../../components/chat/ChatWindow";

function Chat() {
  return (
    <div className="flex h-screen bg-slate-950 text-white">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}

export default Chat;