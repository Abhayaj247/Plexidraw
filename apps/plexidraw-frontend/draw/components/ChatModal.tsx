import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

type ChatMessage = { username: string; message: string; timestamp: number };

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  chatMessages: ChatMessage[];
  handleSendChat: (e: React.FormEvent) => void;
  chatInputRef: React.RefObject<HTMLInputElement | null>;
  isConnected: boolean;
  inRoom: boolean;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  open,
  onClose,
  chatMessages,
  handleSendChat,
  chatInputRef,
  isConnected,
  inRoom,
}) => {
  const { resolvedTheme } = useTheme();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-[400px] max-h-[80vh] flex flex-col">
        <CardHeader>
          <CardTitle>Chats</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-y-auto mb-2">
          <div className="flex-1 overflow-y-auto mb-2">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={
                  resolvedTheme === "light"
                    ? "text-gray-800 text-sm mb-1"
                    : "text-white text-sm mb-1"
                }
              >
                <span className="font-bold">{msg.username}:</span>{" "}
                <span>{msg.message}</span>{" "}
                <span
                  className={
                    resolvedTheme === "light"
                      ? "text-gray-500 text-xs"
                      : "text-gray-400 text-xs"
                  }
                >
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ""}
                </span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendChat} className="flex gap-2 mt-2">
            <Input
              ref={chatInputRef}
              className="flex-1 p-2 rounded border-none outline-none bg-gray-700 text-white"
              placeholder="Type a message..."
              disabled={!isConnected || !inRoom}
            />
            <Button
              type="submit"
              className={`px-4 py-2 rounded ${!isConnected || !inRoom ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"}`}
              disabled={!isConnected || !inRoom}
            >
              Send
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="secondary" onClick={onClose} className="cursor-pointer">
            Close
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}; 