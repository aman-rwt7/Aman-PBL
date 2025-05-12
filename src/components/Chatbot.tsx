
"use client";

import * as React from "react";
import { Bot, Send, User, Loader2, MessageSquare } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { firstAidChatbot } from "@/ai/flows/first-aid-chatbot";
import type { FirstAidChatbotInput } from "@/ai/flows/first-aid-chatbot";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ChatbotProps {
  emergencyType: string;
  triggerButton?: React.ReactNode; // Optional custom trigger
}

export function Chatbot({ emergencyType, triggerButton }: ChatbotProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + "-user",
      sender: "user",
      text: input.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const chatbotInput: FirstAidChatbotInput = {
        emergencyType: emergencyType,
        userMessage: userMessage.text,
      };
      const response = await firstAidChatbot(chatbotInput);

      const botMessage: ChatMessage = {
        id: Date.now().toString() + "-bot",
        sender: "bot",
        text: response.chatbotResponse,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      toast({
        title: "Chatbot Error",
        description: "Could not get a response. Please try again.",
        variant: "destructive",
      });
       const errorMessage: ChatMessage = {
        id: Date.now().toString() + "-error",
        sender: "bot",
        text: "Sorry, I encountered an error. Please try again.",
      };
       setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

   // Scroll to bottom when messages update
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

   // Add initial message when sheet opens
   React.useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialBotMessage: ChatMessage = {
        id: Date.now().toString() + "-init",
        sender: "bot",
        text: `How can I help with the ${emergencyType} emergency? Ask me for first-aid advice. Remember, this is not a substitute for professional medical help. Always call emergency services if needed.`,
      };
      setMessages([initialBotMessage]);
    }
     // Reset input when sheet opens/closes
     setInput("");
   }, [isOpen, emergencyType]); // Rerun if emergencyType changes (though unlikely in this flow)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {triggerButton || (
           <Button variant="outline" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            First-Aid Chatbot
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
             <Bot className="w-6 h-6 text-primary" /> First-Aid Assistant
           </SheetTitle>
          <SheetDescription>
            Get quick first-aid tips for: {emergencyType}. Not a substitute for professional help.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.sender === "bot" && (
                  <Avatar className="h-8 w-8 border border-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                       <Bot className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-lg p-3 text-sm shadow-sm",
                    message.sender === "user"
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary"
                  )}
                >
                  {message.text}
                </div>
                 {message.sender === "user" && (
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback>
                      <User className="w-5 h-5" />
                      </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                   <Avatar className="h-8 w-8 border border-primary">
                     <AvatarFallback className="bg-primary text-primary-foreground">
                       <Bot className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[75%] rounded-lg p-3 text-sm shadow-sm bg-secondary flex items-center gap-2">
                     <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                   </div>
                </div>
              )}
          </div>
        </ScrollArea>

        <SheetFooter className="p-4 border-t bg-background">
          <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Ask for first-aid steps..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
