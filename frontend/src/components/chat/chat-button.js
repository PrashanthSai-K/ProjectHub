import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ChatButton({ onClick }) {
  return (
    <Button onClick={onClick} className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg" size="icon">
      <MessageCircle className="h-6 w-6" />
      <span className="sr-only">Open chat</span>
    </Button>
  )
}

