import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble, Message } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { QuickReplies } from "./QuickReplies";
import { Loader2 } from "lucide-react";

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  quickReplies?: string[];
  onQuickReply?: (reply: string) => void;
  title?: string;
}

export const ChatInterface = ({
  messages,
  onSendMessage,
  isLoading = false,
  quickReplies = [],
  onQuickReply,
  title = "Chat de Configuração"
}: ChatInterfaceProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-scroll-viewport]') as HTMLElement | null;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <Card className="h-[calc(100vh-12rem)] flex min-h-0 flex-col shadow-medium">
      <CardHeader className="border-b bg-card/50 backdrop-blur-sm">
        <CardTitle className="text-lg flex items-center gap-2">
          {title}
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 min-h-0 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              <p>Envie uma mensagem para começar...</p>
            </div>
          ) : (
            <div>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t bg-card/50 p-4 space-y-3">
          {quickReplies.length > 0 && onQuickReply && (
            <QuickReplies 
              options={quickReplies} 
              onSelect={onQuickReply}
              disabled={isLoading}
            />
          )}
          <ChatInput 
            onSend={onSendMessage} 
            disabled={isLoading}
            placeholder="Digite sua resposta..."
          />
        </div>
      </CardContent>
    </Card>
  );
};