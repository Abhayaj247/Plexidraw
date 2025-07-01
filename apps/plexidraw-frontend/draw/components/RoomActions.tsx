import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

type RoomActionsProps = {
  inRoom: boolean;
  toolsDisabled?: boolean;
  onCreateRoom: () => void;
  onExitRoom: () => void;
  onShowChat: () => void;
  chatDisabled?: boolean;
  isAuthenticated: boolean;
};

export function RoomActions({ inRoom, toolsDisabled, onCreateRoom, onExitRoom, onShowChat, chatDisabled, isAuthenticated }: RoomActionsProps) {
  return (
    <div className="px-4 py-2 border-b border-gray-700 flex flex-col gap-2">
      <Button onClick={onCreateRoom} variant="default" className="w-full text-xs cursor-pointer" disabled={toolsDisabled} style={toolsDisabled ? { cursor: 'not-allowed', opacity: 0.6 } : {}}>
        Create / Join Room
      </Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              onClick={onExitRoom}
              variant="outline"
              className="w-full text-xs"
              disabled={!inRoom || toolsDisabled}
              style={(!inRoom || toolsDisabled)
                ? { cursor: 'not-allowed', opacity: 0.6 }
                : { cursor: 'pointer' }}
            >
              Exit Room
            </Button>
          </span>
        </TooltipTrigger>
        {isAuthenticated && chatDisabled && (
          <TooltipContent side="right" className="border border-gray-300 dark:border-gray-700 shadow-lg">
            You are in the default room (roomId=1)
          </TooltipContent>
        )}
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              onClick={onShowChat}
              variant="secondary"
              className="w-full text-xs"
              disabled={toolsDisabled || chatDisabled}
              style={(toolsDisabled || chatDisabled)
                ? { cursor: 'not-allowed', opacity: 0.6 }
                : { cursor: 'pointer' }}
            >
              Chat
            </Button>
          </span>
        </TooltipTrigger>
        {isAuthenticated && chatDisabled && (
          <TooltipContent side="right" className="border border-gray-300 dark:border-gray-700 shadow-lg">
            Chat is disabled in the default room (i.e roomId=1). Please join or create another room to use chat.
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  );
} 