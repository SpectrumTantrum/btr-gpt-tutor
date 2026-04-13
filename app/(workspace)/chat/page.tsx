import { ChatArea } from "@/components/chat/chat-area"
import { ModeSwitcher } from "@/components/chat/mode-switcher"

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-center px-4 pt-4">
        <ModeSwitcher />
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatArea />
      </div>
    </div>
  )
}
