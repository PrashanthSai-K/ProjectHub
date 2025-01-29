"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X } from "lucide-react"
import { parseCookies } from "nookies"
import chatService from "@/services/chat-service"
import { io } from "socket.io-client"

export default function ChatOption({ projectId, initialMessages, onClose }) {
  const [messages, setMessages] = useState(initialMessages || [])
  const [newMessage, setNewMessage] = useState("")
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(false)
  const socket = useRef(null)
  const scrollAreaRef = useRef(null)

  const cookies = parseCookies()
  const token = cookies?.token

  useEffect(() => {
    const userData = cookies?.user ? JSON.parse(cookies.user) : null
    setUserId(userData?.id)
  }, [cookies?.user]) // Added cookies?.user as a dependency

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const data = await chatService.getProjectChats(projectId, token)
      setMessages(data)
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (projectId) {
      fetchMessages()

      socket.current = io("http://localhost:4500")
      socket.current.emit("joinRoom", projectId)
      socket.current.on("newMessage", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
        scrollToBottom();
      });

      return () => {
        if (socket.current) {
          socket.current.disconnect()
        }
      }
    }
  }, [projectId])
    const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
    };
     useEffect(() => {
      scrollToBottom();
    }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !userId) return

    try {
      const message = await chatService.sendMessage(projectId, userId, newMessage, token)
      socket.current.emit("sendMessage", message)
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  return ( 
    <Card className="min-h-96 max-h-96 flex flex-col shadow-xl max-w-md mx-auto rounded-lg overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <CardTitle>Project Chat</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-scroll p-0 scroll-bar-none" ref={scrollAreaRef}>
        <ScrollArea className="h-full p-4" >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading Messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex items-start space-x-2 mb-4">
                <Avatar style={{width:"25px", height:"25px",borderRadius:"100%", marginTop: "0.08rem"}}>
                  <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${msg.user_name}`} />
                  <AvatarFallback>{msg.user_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col w-full text-justify">
                  <div className="flex items-baseline justify-around w-full ">
                    <span className="font-semibold mr-2">{msg.user_name}</span>
                    <span style={{fontSize:"0.6rem"}} className=" text-muted-foreground">{new Date(msg.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm mt-1 max-w-56">{msg.message}</p>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 bg-background">
        <form onSubmit={handleSendMessage} className="flex space-x-2 w-full">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
          />
          <Button type="submit">Send</Button>
        </form>
      </CardFooter>
    </Card>
  )
}