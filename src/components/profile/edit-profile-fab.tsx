"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProfileEditForm from "@/components/dialogs/edit-profile-dialog";
import { UserProfile } from "@/types";

export default function EditProfileFab({
  profile,
  onProfileUpdate,
  className = "",
}: {
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`
            flex items-center gap-2
            px-3 py-1.5
            rounded-lg
            text-sm font-medium
            bg-muted/40 dark:bg-neutral-800/60
            border border-border/60
            text-foreground
            shadow-sm
            transition-all duration-200
            ${className}
          `}
        >
          <Pencil className="h-4 w-4" />
          <span>Edit</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide mx-1 md:mx-0">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit Your Profile
          </DialogTitle>
        </DialogHeader>

        <ProfileEditForm
          profile={profile}
          onUpdate={(updated) => {
            onProfileUpdate(updated);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
