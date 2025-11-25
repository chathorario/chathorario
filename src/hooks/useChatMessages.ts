import { useState, useCallback } from "react";
import { Message } from "@/components/chat/MessageBubble";

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((content: string, role: "user" | "assistant") => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  const addUserMessage = useCallback((content: string) => {
    return addMessage(content, "user");
  }, [addMessage]);

  const addAssistantMessage = useCallback((content: string) => {
    return addMessage(content, "assistant");
  }, [addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    setIsLoading,
    addUserMessage,
    addAssistantMessage,
    clearMessages,
  };
};