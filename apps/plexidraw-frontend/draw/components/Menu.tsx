import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Menu as MenuIcon, User } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProfileSection } from './ProfileSection';
import { ProfileDialog } from './ProfileDialog';
import { RoomActions } from './RoomActions';
import { ThemeSection } from './ThemeSection';
import { GitHubSection } from './GitHubSection';
import { RoomModal } from './RoomModal';
import { ChatModal } from './ChatModal';

type UserInfo = { name: string; username: string; email: string };

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
}

interface Room {
  id: number;
  slug: string;
  adminId: string;
}

interface ChatMessage {
  username: string;
  message: string;
  timestamp: number;
}

interface MenuProps {
  chatMessages: ChatMessage[];
  handleSendChat: (e: React.FormEvent) => void;
  chatInputRef: React.RefObject<HTMLInputElement | null>;
  isConnected: () => boolean;
  toolsDisabled?: boolean;
}

const Menu = forwardRef<any, MenuProps>(
  (
    {
      chatMessages,
      handleSendChat,
      chatInputRef,
      isConnected,
      toolsDisabled = false,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [showJoinRoom, setShowJoinRoom] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [joinRoomId, setJoinRoomId] = useState("");
    const [error, setError] = useState("");
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [currentUserId, setCurrentUserId] = useState("");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const inRoom = pathname === "/draw" && !!searchParams.get("roomId");
    const roomId = Number(searchParams.get("roomId")) || 1;
    const chatDisabled = roomId === 1;
    const [showChat, setShowChat] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileEdit, setProfileEdit] = useState<UserInfo>({ name: "", username: "", email: "" });
    const [profileError, setProfileError] = useState("");
    const [profileLoading, setProfileLoading] = useState(false);

    useEffect(() => {
      if (typeof window !== "undefined") {
        setIsAuthenticated(!!sessionStorage.getItem("plexidraw_token"));
        const token = sessionStorage.getItem("plexidraw_token");
        if (token) {
          const payload = parseJwt(token);
          setCurrentUserId(payload?.userId || "");
        }
      }
    }, [isOpen]);

    useEffect(() => {
      if (showCreateRoom) {
        setLoadingRooms(true);
        fetch("http://localhost:3001/rooms")
          .then((res) => res.json())
          .then((data) => {
            setRooms(data.rooms || []);
            setLoadingRooms(false);
          })
          .catch(() => setLoadingRooms(false));
      }
    }, [showCreateRoom]);

    useEffect(() => {
      if (isAuthenticated && currentUserId) {
        const token = sessionStorage.getItem("plexidraw_token");
        fetch(`http://localhost:3001/user/${currentUserId}`, {
          headers: { Authorization: token || "" },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.user) {
              setUserInfo(data.user);
              setProfileEdit({
                name: data.user.name,
                username: data.user.username,
                email: data.user.email,
              });
            }
          });
      }
    }, [isAuthenticated, currentUserId]);

    const handleSignOut = () => {
      sessionStorage.removeItem("plexidraw_token");
      setIsAuthenticated(false);
      setIsOpen(false);
      router.push("/");
    };

    const handleDeleteRoom = async (roomId: number) => {
      // TODO: Implement backend endpoint for deleting a room
      alert("Delete room not implemented yet.");
    };

    useImperativeHandle(ref, () => ({
      openChatModal: () => setShowChat(true),
    }));

    return (
      <div className="fixed top-4 left-4 z-20">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="secondary"
          className="p-2 rounded-lg shadow-lg"
          title="Menu"
        >
          <MenuIcon size={20} />
        </Button>

        {isOpen && (
          <div className="absolute top-12 left-0 bg-gray-800 rounded-xl shadow-lg border border-gray-700 py-2 w-72">
            {isAuthenticated && userInfo && (
              <ProfileSection userInfo={userInfo} onViewProfile={() => setShowProfileModal(true)} onSignOut={handleSignOut} />
            )}
            {/* Authentication (remove signout here) */}
            <div className="px-4 py-2 border-b border-gray-700">
              {!isAuthenticated && (
                <Link
                  href="/signin"
                  className="w-full flex items-center gap-3 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={16} />
                  Sign in / Sign up
                </Link>
              )}
            </div>
            <RoomActions inRoom={inRoom} toolsDisabled={toolsDisabled} onCreateRoom={() => setShowCreateRoom(true)} onExitRoom={() => { setIsOpen(false); router.push('/draw'); }} onShowChat={() => { if (!chatDisabled) setShowChat(true); }} chatDisabled={chatDisabled} isAuthenticated={isAuthenticated} />
            <ThemeSection />
            <GitHubSection />
          </div>
        )}

        {/* Create/Join Room Modal */}
        <RoomModal
          open={showCreateRoom}
          onClose={() => setShowCreateRoom(false)}
          roomName={roomName}
          setRoomName={setRoomName}
          error={error}
          loadingRooms={loadingRooms}
          rooms={rooms}
          currentUserId={currentUserId}
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            // Try to join room first
            try {
              setLoadingRooms(true);
              const res = await fetch(
                `http://localhost:3001/room/${roomName}`
              );
              const data = await res.json();
              if (data.room) {
                setShowCreateRoom(false);
                setRoomName("");
                setIsOpen(false);
                router.push(`/draw?roomId=${data.room.id}`);
                return;
              }
            } catch {}
            // If not found, create room
            try {
              const token = sessionStorage.getItem("plexidraw_token");
              const res = await fetch("http://localhost:3001/room", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: token || "",
                },
                body: JSON.stringify({ name: roomName }),
              });
              const data = await res.json();
              if (res.ok && data.roomId) {
                setShowCreateRoom(false);
                setRoomName("");
                setIsOpen(false);
                router.push(`/draw?roomId=${data.roomId}`);
              } else {
                setError(data.message || "Failed to create room");
              }
            } catch (err) {
              setError("Failed to create or join room");
            } finally {
              setLoadingRooms(false);
            }
          }}
          onJoinRoom={(roomId) => {
            setShowCreateRoom(false);
            setIsOpen(false);
            router.push(`/draw?roomId=${roomId}`);
          }}
          onDeleteRoom={handleDeleteRoom}
        />
        {/* Chat Modal */}
        <ChatModal
          open={showChat}
          onClose={() => setShowChat(false)}
          chatMessages={chatMessages}
          handleSendChat={handleSendChat}
          chatInputRef={chatInputRef}
          isConnected={isConnected()}
          inRoom={inRoom}
        />

        {/* Profile Modal */}
        {showProfileModal && userInfo && (
          <ProfileDialog open={showProfileModal} onOpenChange={setShowProfileModal} userInfo={userInfo} profileEdit={profileEdit} setProfileEdit={setProfileEdit} profileError={profileError} profileLoading={profileLoading} onSave={async e => {
            e.preventDefault();
            setProfileLoading(true);
            setProfileError('');
            const token = sessionStorage.getItem('plexidraw_token');
            const res = await fetch(`http://localhost:3001/user/${currentUserId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: token || '',
              },
              body: JSON.stringify(profileEdit),
            });
            const data = await res.json();
            setProfileLoading(false);
            if (res.ok && data.user) {
              setUserInfo(data.user);
              setShowProfileModal(false);
            } else {
              setProfileError(data.message || 'Failed to update profile');
            }
          }} />
        )}

        {isOpen && (
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }
);

export default Menu;
