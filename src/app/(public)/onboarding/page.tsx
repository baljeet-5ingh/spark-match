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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
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
      
      // User data loaded, hide initial loading
      setIsInitialLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Scroll window to top when step changes
    window.scrollTo({
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

  // Helper function to validate birthday age (18-80 years)
  const validateBirthdayAge = (): boolean => {
    if (!form.birthday) {
      toast.error("Please enter your birthday");
      return false;
    }

    const birthdayDate = new Date(form.birthday);
    
    // Check if the date is valid
    if (isNaN(birthdayDate.getTime())) {
      toast.error("Please enter a valid birthday");
      return false;
    }

    const today = new Date();
    const age = today.getFullYear() - birthdayDate.getFullYear();
    const monthDiff = today.getMonth() - birthdayDate.getMonth();
    const dayDiff = today.getDate() - birthdayDate.getDate();
    
    // Adjust age if birthday hasn't occurred yet this year
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    if (actualAge < 18) {
      toast.error("You must be at least 18 years old to use this app");
      return false;
    }
    
    if (actualAge > 80) {
      toast.error("Age must be 80 years or younger");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    // Validate birthday age before submitting
    if (!validateBirthdayAge()) {
      return;
    }

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

      await user?.reload();

      const redirectPath = sessionStorage.getItem("redirectAfterOnboarding");
      if (redirectPath) {
        sessionStorage.removeItem("redirectAfterOnboarding");
        router.push(redirectPath);
      } else {
        router.push("/discover");
        router.refresh();
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong while saving profile");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Validate age on step 1 before proceeding
    if (currentStep === 1 && !validateBirthdayAge()) {
      return;
    }
    
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

  // Show loading skeleton while user data is being fetched
  if (isInitialLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-background dark:via-card/50 dark:to-background flex items-center justify-center px-4 py-4 sm:py-8">
        <div className="w-full max-w-2xl bg-card rounded-2xl sm:rounded-3xl shadow-2xl border border-border/50 p-4 sm:p-6 md:p-8">
          {/* Loading Skeleton */}
          <div className="space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full" />
              <div className="h-8 w-64 bg-muted rounded" />
              <div className="h-4 w-40 bg-muted rounded" />
            </div>
            
            {/* Step Indicators Skeleton */}
            <div className="flex justify-center items-center space-x-4">
              <div className="w-12 h-12 bg-muted rounded-full" />
              <div className="w-8 h-0.5 bg-muted" />
              <div className="w-12 h-12 bg-muted rounded-full" />
              <div className="w-8 h-0.5 bg-muted" />
              <div className="w-12 h-12 bg-muted rounded-full" />
            </div>
            
            {/* Form Fields Skeleton */}
            <div className="space-y-6">
              <div>
                <div className="h-4 w-24 bg-muted rounded mb-3" />
                <div className="h-12 bg-muted rounded-xl" />
              </div>
              <div>
                <div className="h-4 w-32 bg-muted rounded mb-3" />
                <div className="h-32 bg-muted rounded-xl" />
              </div>
              <div>
                <div className="h-4 w-20 bg-muted rounded mb-3" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-12 bg-muted rounded-xl" />
                  <div className="h-12 bg-muted rounded-xl" />
                  <div className="h-12 bg-muted rounded-xl" />
                </div>
              </div>
            </div>
            
            {/* Button Skeleton */}
            <div className="flex justify-end">
              <div className="h-12 w-32 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-background dark:via-card/50 dark:to-background flex items-center justify-center px-4 py-4 sm:py-8">
      <div
        ref={containerRef}
        className="
    w-full max-w-2xl
    bg-card
    rounded-2xl sm:rounded-3xl
    shadow-2xl
    border border-border/50
    my-auto
  "
      >
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
              Complete Your Profile
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Step {currentStep} of 3 • {getStepTitle()}
            </p>
          </div>

          {/* Step Icons */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {[1, 2, 3].map((step) => {
                const Icon = getStepIcon(step);
                return (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        step <= currentStep
                          ? "bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 border-transparent text-white shadow-lg"
                          : "bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    {step < 3 && (
                      <div
                        className={`w-6 sm:w-8 h-0.5 mx-1 sm:mx-2 transition-colors duration-300 ${
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
            <div className="mb-4 sm:mb-6">
              <Alert type="error">{error}</Alert>
            </div>
          )}

          <div className="space-y-4 sm:space-y-6">
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
            <div className="flex justify-between pt-4 sm:pt-6">
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
