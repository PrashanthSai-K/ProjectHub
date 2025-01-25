"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X } from "lucide-react"

export default function ChatOption({ projectId, initialMessages, onClose }) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        user: "Current User", // In a real app, this would be the logged-in user
        message: newMessage,
        timestamp: new Date().toISOString(),
      }
      setMessages([...messages, message])
      setNewMessage("")
    }
  }

  return (
    <Card className="h-full flex flex-col shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Project Chat</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col pt-2">
        <ScrollArea className="flex-grow mb-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start space-x-2 mb-4">
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${msg.user}`} />
                <AvatarFallback>{msg.user.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className="font-semibold mr-2">{msg.user}</span>
                  <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-sm mt-1">{msg.message}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
          />
          <Button type="submit">Send</Button>
        </form>
      </CardContent>
    </Card>
  )
}

