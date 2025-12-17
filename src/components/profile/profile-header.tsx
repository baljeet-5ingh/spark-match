"use client";

import type { UserProfile } from "@/types";
import EditProfileFab from "./edit-profile-fab";

interface ProfileHeaderProps {
  profile: UserProfile;
  onProfileUpdate?: (profile: UserProfile) => void; // optional, like before
  readonly?: boolean;
}

export default function ProfileHeader({
  profile,
  onProfileUpdate,
  readonly = false,
}: ProfileHeaderProps) {
  const age = Math.floor(
    (Date.now() - new Date(profile.birthday).getTime()) /
      (1000 * 60 * 60 * 24 * 365.25)
  );

  return (
    <div className="relative space-y-8 animate-fade-in">

      {/* NAME + AGE */}
      <div className="space-y-2">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground flex items-center gap-3">
          {profile.name}
          <span className="text-3xl sm:text-4xl text-muted-foreground font-normal">
            {age}
          </span>
        </h1>
      </div>

      {/* ✨ EDIT FAB — SAME BEHAVIOR AS BEFORE */}
      {!readonly && onProfileUpdate && (
        <div className="absolute top-0 right-0 z-30">
          <EditProfileFab profile={profile} onProfileUpdate={onProfileUpdate} />
        </div>
      )}

      {/* BIO */}
      {profile.bio && (
        <section className="space-y-4">
          <div className="relative pl-4 border-l-2 border-border/50">
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line break-words">
              {profile.bio}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
