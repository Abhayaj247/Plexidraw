import React from "react";
import { Button } from "@/components/ui/button";

type UserInfo = { name: string; username: string; email: string };

type ProfileSectionProps = {
  userInfo: UserInfo;
  onViewProfile: () => void;
  onSignOut: () => void;
};

export function ProfileSection({ userInfo, onViewProfile, onSignOut }: ProfileSectionProps) {
  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-center gap-3 bg-muted/40 rounded-lg p-2 flex-wrap">
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-lg">
          {userInfo.name?.[0]?.toUpperCase() || userInfo.username?.[0]?.toUpperCase() || '?'}
        </span>
        <span className="font-bold text-lg text-white ml-1 min-w-0 flex-shrink">
          {userInfo.name}
        </span>
        <Button size="sm" variant="outline" className="rounded-full px-3 text-xs font-semibold mr-1 cursor-pointer" onClick={onViewProfile}>
          View Profile
        </Button>
      </div>
      <div className="flex justify-center mt-3">
        <Button size="sm" variant="destructive" className="w-full max-w-[180px] rounded-full px-3 text-xs font-semibold cursor-pointer" onClick={onSignOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
} 