import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UserInfo = { name: string; username: string; email: string };

type ProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userInfo: UserInfo;
  profileEdit: UserInfo;
  setProfileEdit: React.Dispatch<React.SetStateAction<UserInfo>>;
  profileError: string;
  profileLoading: boolean;
  onSave: (e: React.FormEvent) => void;
};

export function ProfileDialog({ open, onOpenChange, userInfo, profileEdit, setProfileEdit, profileError, profileLoading, onSave }: ProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[400px] mx-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-2xl">
              {userInfo?.name?.[0]?.toUpperCase() || userInfo?.username?.[0]?.toUpperCase() || '?'}
            </span>
            <DialogTitle>Profile</DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={onSave} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Name</span>
            <Input value={profileEdit.name} onChange={e => setProfileEdit({ ...profileEdit, name: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Username</span>
            <Input value={profileEdit.username} onChange={e => setProfileEdit({ ...profileEdit, username: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Email</span>
            <Input type="email" value={profileEdit.email} onChange={e => setProfileEdit({ ...profileEdit, email: e.target.value })} required />
          </label>
          {profileError && <span className="text-red-500 text-xs">{profileError}</span>}
          <DialogFooter>
            <Button type="submit" disabled={profileLoading} className="mt-2 cursor-pointer">
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 