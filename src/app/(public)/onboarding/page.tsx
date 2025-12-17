"use client";
import { Alert } from "@/components/alerts/alert";
import LocationPicker from "@/components/location/location-picker";
import PhotoManager from "@/components/photos/photo-manager";
import { BasicInfoForm } from "@/components/profile/basic-info-form";
import { PreferencesFormSection } from "@/components/profile/preferences-form-section";
import { GradientButton } from "@/components/sliders/gradient-button";
import gqlClient from "@/services/graphql";
import { RegisterUserArgs } from "@/types";
import { REGISTER_USER } from "@/utils/mutations";
import { useUser } from "@clerk/nextjs";
import { Camera, Heart, MapPin, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState({
    name: "",
    birthday: "",
    bio: "",
    gender: "MALE" as "MALE" | "FEMALE" | "OTHER",
    location: { lat: 0, lng: 0 },
    photos: [] as string[],
    preferences: {
      minAge: 18,
      maxAge: 50,
      distanceKm: 50,
      gender: "FEMALE" as "MALE" | "FEMALE" | "OTHER",
    },
  });

  const [email, setEmail] = useState("");
  const [locationFetched, setLocationFetched] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.fullName ?? "",
      }));
      setEmail(user.primaryEmailAddress?.emailAddress ?? "");

      if (user.imageUrl) {
        setForm((prev) => ({
          ...prev,
          photos: [user.imageUrl],
        }));
      }
    }
  }, [user]);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentStep]);

  const updateBasicInfo = <K extends "name" | "bio" | "gender" | "birthday">(
    key: K,
    value: string | typeof form.gender
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const updatePhotos = (photos: string[]) => {
    setForm((prev) => ({ ...prev, photos }));
  };

  const updateLocation = (location: { lat: number; lng: number }) => {
    setForm((prev) => ({ ...prev, location }));
    setLocationFetched(true);
  };

  const updatePreferences = <K extends keyof typeof form.preferences>(
    key: K,
    value: (typeof form.preferences)[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    if (!form.location.lat || !form.location.lng) {
      setError("Please provide your location to continue.");
      return;
    }

    if (form.photos.length === 0) {
      setError("Please add at least one photo.");
      return;
    }

    const input: RegisterUserArgs = {
      clerkId: user.id,
      name: form.name,
      email,
      birthday: form.birthday || new Date().toISOString(),
      bio: form.bio,
      gender: form.gender,
      preferences: form.preferences,
      photos: form.photos.map((url, index) => ({
        url,
        publicId: `user-${user.id}-${index}`,
        order: index,
      })),
      location: form.location,
    };

    try {
      setLoading(true);
      setError(null);
      await gqlClient.request(REGISTER_USER, { input });

      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        console.log("Onboarding completion recorded successfully.");
        toast.success("Onboarding completed successfully!");
      } else {
        toast.error("Failed to record onboarding completion.");
        console.error("Error recording onboarding completion:", data.error);
      }

      const redirectPath = sessionStorage.getItem("redirectAfterOnboarding");
      if (redirectPath) {
        sessionStorage.removeItem("redirectAfterOnboarding");
        router.push(redirectPath);
      } else {
        router.push("/discover");
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong while saving profile");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return form.name && form.birthday && form.gender;
      case 2:
        return form.photos.length > 0 && form.location.lat && form.location.lng;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return User;
      case 2:
        return Camera;
      case 3:
        return Settings;
      default:
        return User;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "About You";
      case 2:
        return "Photos & Location";
      case 3:
        return "Preferences";
      default:
        return "";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-background dark:via-card/50 dark:to-background flex items-center justify-center px-4 py-8">
      <div
        ref={containerRef}
        className="
    w-full max-w-2xl
    bg-card
    rounded-3xl
    shadow-2xl
    border border-border/50
    max-h-[85vh]
    overflow-y-auto
    scrollbar-hide
  "
      >
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Complete Your Profile
            </h1>
            <p className="text-muted-foreground">
              Step {currentStep} of 3 • {getStepTitle()}
            </p>
          </div>

          {/* Step Icons */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => {
                const Icon = getStepIcon(step);
                return (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        step <= currentStep
                          ? "bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 border-transparent text-white shadow-lg"
                          : "bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {step < 3 && (
                      <div
                        className={`w-8 h-0.5 mx-2 transition-colors duration-300 ${
                          step < currentStep
                            ? "bg-gradient-to-r from-pink-500 to-orange-500"
                            : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6">
              <Alert type="error">{error}</Alert>
            </div>
          )}

          <div className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <BasicInfoForm
                name={form.name}
                bio={form.bio}
                gender={form.gender}
                birthday={form.birthday}
                onChange={updateBasicInfo}
                saving={loading}
              />
            )}

            {/* Step 2: Photos & Location */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-pink-500" />
                    Your Location
                  </h3>
                  <LocationPicker
                    location={form.location}
                    onChange={updateLocation}
                    onLocationFetch={() => setLocationFetched(true)}
                    saving={loading}
                  />
                  {/* Reserve space to prevent layout jump */}
                  <div className="min-h-[56px]">
                    {locationFetched && form.location.lat !== 0 ? (
                      <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <p className="text-green-800 dark:text-green-400 text-sm font-medium">
                          ✓ Location saved
                        </p>
                      </div>
                    ) : (
                      // invisible placeholder same height
                      <div className="mt-4 p-3 rounded-xl opacity-0 select-none">
                        placeholder
                      </div>
                    )}
                  </div>
                </div>
                <PhotoManager
                  photos={form.photos}
                  onChange={updatePhotos}
                  maxPhotos={6}
                  saving={loading}
                />
              </div>
            )}

            {/* Step 3: Preferences */}
            {currentStep === 3 && (
              <PreferencesFormSection
                preferences={form.preferences}
                onChange={updatePreferences}
                saving={loading}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8">
              {currentStep > 1 && (
                <GradientButton
                  variant="secondary"
                  onClick={prevStep}
                  disabled={loading}
                >
                  Back
                </GradientButton>
              )}

              {currentStep < 3 ? (
                <GradientButton
                  onClick={nextStep}
                  disabled={!canProceedToNextStep() || loading}
                  className={currentStep === 1 ? "ml-auto" : ""}
                >
                  Continue
                </GradientButton>
              ) : (
                <GradientButton
                  onClick={handleSubmit}
                  disabled={loading}
                  loading={loading}
                  className="ml-auto"
                >
                  <Heart className="h-4 w-4" />
                  {loading ? "Creating Profile..." : "Complete Profile"}
                </GradientButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
