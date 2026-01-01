import type { ChatMessage, OrderWithDetails } from "@repo/shared-types";
import { X, Send, Minimize2, Loader2, MessageCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-provider";
import { api } from "@/lib/api-layer";
import { cn } from "@/lib/utils";

interface OrderChatPopupProps {
  order: OrderWithDetails;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderChatPopup({
  order,
  isOpen,
  onClose,
}: OrderChatPopupProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      // Don't show loading spinner on subsequent polls if we already have messages
      if (messages.length === 0) setIsLoading(true);

      const response = await api.chat.getHistory(order.id);
      if (response.success) {
        const items = response.data;

        // Sort by date ascending (oldest first)
        const sortedMessages = Array.isArray(items)
          ? [...items].sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
          : [];

        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, order.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Mark unread messages as read
  useEffect(() => {
    if (!isOpen || !user || messages.length === 0) return;

    const unreadMessages = messages.filter(
      (msg) => msg.senderId !== user.id && !msg.isRead
    );

    if (unreadMessages.length > 0) {
      // Backend expects orderId in the route param to find the order context
      // even though the route is named /messages/:id/read
      api.chat.markMessageRead(order.id).then(() => {
        // Optimistically update local state
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId !== user.id && !msg.isRead
              ? { ...msg, isRead: true }
              : msg
          )
        );
      });
    }
  }, [messages, isOpen, user, order.id]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setIsSending(true);
      const response = await api.chat.sendMessage(order.id, {
        content: newMessage,
      });
      if (response.success) {
        setMessages((prev) => [...prev, response.data]);
        setNewMessage("");
      }
    } catch (error) {
      toast.error("Gửi tin nhắn thất bại");
    } finally {
      setIsSending(false);
    }
  };

  if (!user || !isOpen) return null;

  const isBuyer = user.id === order.winnerId;
  const otherParty = isBuyer ? order.seller : order.winner;
  const otherPartyRole = isBuyer ? "Người bán" : "Người mua";

  // Find the last message sent by me to show status
  const lastSentMessage = [...messages]
    .reverse()
    .find((m) => m.senderId === user.id);

  return (
    <Card className="border-primary/20 animate-in slide-in-from-bottom-10 fixed right-6 bottom-6 z-50 flex h-[500px] w-80 flex-col overflow-hidden shadow-xl duration-300 sm:w-96">
      <CardHeader className="bg-primary/5 flex flex-row items-center justify-between space-y-0 border-b p-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border">
            <AvatarFallback>
              {otherParty.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="max-w-[150px] truncate text-sm leading-none font-medium">
              {otherParty.fullName}
            </p>
            <p className="text-muted-foreground text-xs">{otherPartyRole}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative flex-1 overflow-hidden bg-slate-50/50 p-0">
        <div
          className="absolute inset-0 space-y-1 overflow-y-auto p-4"
          ref={scrollRef}
        >
          {isLoading && messages.length === 0 ? (
            <div className="flex justify-center py-10">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center p-4 text-center">
              <MessageCircle className="mb-2 h-10 w-10 opacity-20" />
              <p className="text-sm">Chưa có tin nhắn nào.</p>
              <p className="text-xs">
                Hãy bắt đầu trò chuyện với {otherPartyRole.toLowerCase()}!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === user.id;
              const isLastSent = lastSentMessage?.id === msg.id;

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex w-full flex-col",
                    isMe ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "text-foreground rounded-bl-none border bg-white"
                    )}
                  >
                    {msg.content}
                  </div>
                  {isMe && isLastSent && (
                    <span className="text-muted-foreground mt-1 mr-1 text-[10px]">
                      {msg.isRead ? "Đã xem" : "Đã gửi"}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-background border-t p-3">
        <form
          onSubmit={handleSendMessage}
          className="flex w-full items-center gap-2"
        >
          <Input
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 focus-visible:ring-1"
            disabled={isSending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSending || !newMessage.trim()}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
