import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Room = { id: number; slug: string; adminId: string };

interface RoomModalProps {
  open: boolean;
  onClose: () => void;
  roomName: string;
  setRoomName: (name: string) => void;
  error: string;
  loadingRooms: boolean;
  rooms: Room[];
  currentUserId: string;
  onSubmit: (e: React.FormEvent) => void;
  onJoinRoom: (roomId: number) => void;
  onDeleteRoom: (roomId: number) => void;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  open,
  onClose,
  roomName,
  setRoomName,
  error,
  loadingRooms,
  rooms,
  currentUserId,
  onSubmit,
  onJoinRoom,
  onDeleteRoom,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Create or Join Room</CardTitle>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="flex flex-col gap-4">
            <Input
              placeholder="Room name"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              required
            />
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <div className="border-t border-gray-700 my-2" />
            <div className="text-sm font-semibold mb-1">Your Rooms</div>
            {loadingRooms ? (
              <div className="text-gray-400 text-sm">Loading rooms...</div>
            ) : (
              <div className="flex flex-col gap-3 max-h-40 overflow-y-auto">
                {rooms.length === 0 && (
                  <div className="text-gray-400 text-sm">No rooms found.</div>
                )}
                {rooms.map(room => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between bg-gray-900 rounded-lg p-3 shadow-sm hover:bg-gray-800 transition-colors"
                  >
                    <span className="truncate font-medium text-white">{room.slug}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        type="button"
                        onClick={() => onJoinRoom(room.id)}
                        className="cursor-pointer"
                      >
                        Join
                      </Button>
                      {room.adminId === currentUserId && (
                        <Button
                          size="sm"
                          variant="destructive"
                          type="button"
                          onClick={() => onDeleteRoom(room.id)}
                          className="cursor-pointer"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" variant="default" className="cursor-pointer">
              Create / Join
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}; 