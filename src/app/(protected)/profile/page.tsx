"use client";

import gqlClient from "@/services/graphql";
import { UserProfile } from "@/types";
import { GET_CURRENT_USER } from "@/utils/queries";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

import { Card } from "@/components/cards/card";
import { LoadingSpinner } from "@/components/loader/loading-spinner";
import { GradientButton } from "@/components/sliders/gradient-button";

import ProfileAvatar from "@/components/profile/profile-avatar";
import ProfileHeader from "@/components/profile/profile-header";
import ProfilePreferences from "@/components/profile/profile-preferences";
import EditProfileFab from "@/components/profile/edit-profile-fab";

export default function ProfilePage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await gqlClient.request<{
          getCurrentUser: UserProfile | null;
        }>(GET_CURRENT_USER, { clerkId: user.id });
        setProfile(data.getCurrentUser);
      } catch {
        setError("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-150px)] md:h-[calc(100vh-100px)] flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center space-y-4">
          <p className="text-destructive text-lg">{error}</p>
          <GradientButton onClick={() => window.location.reload()}>
            Try Again
          </GradientButton>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-lg">Profile not found.</p>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto md:pt-8">
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/50 shadow-lg overflow-hidden">
          
          <div className="p-6 sm:p-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <ProfileAvatar
                  profile={profile}
                />
              </div>

              <div className="flex-grow space-y-8 w-full">
                <div>
                   <ProfileHeader profile={profile} onProfileUpdate={setProfile} />
                   <div className="mt-6 flex flex-wrap gap-4">
                   </div>
                </div>

                <div className="h-px bg-border/50 w-full" />

                <div className="space-y-8">
                   <ProfilePreferences preferences={profile.preferences} />
                   <div className="pt-4 text-xs text-muted-foreground text-center md:text-left">
                      Member since {new Date(profile.createdAt).toLocaleDateString()}
                   </div>
                </div>
              </div>
            </div>
          </div>
          
      {profile && (
  <div className="fixed top-6 right-2 sm:hidden z-50">
    <EditProfileFab
          profile={profile}
      onProfileUpdate={setProfile}
    />
  </div>
)}
        </div>
      </div>
    </main>
  );
}
