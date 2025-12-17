import { Card } from "@/components/ui/card";
import { LightBulbIcon } from "@heroicons/react/24/solid";
import { Heart, Lightbulb, MapPin, Settings, User, Zap } from "lucide-react";
import Link from "next/link";
import { StartDiscovering } from "../buttons/start-discovering.tsx-button";

export default function HeroSection() {
  const features = [
    {
      icon: <User className="w-6 h-6 text-rose-500" />,
      title: "Create Profile",
      desc: "Set up your profile with photos and a bio to show your personality.",
    },
    {
      icon: <Heart className="w-6 h-6 text-rose-500" />,
      title: "Swipe & Match",
      desc: "Swipe right to like, left to pass, and find your perfect match.",
    },
    {
      icon: <MapPin className="w-6 h-6 text-rose-500" />,
      title: "Location-Based Discovery",
      desc: "Discover people nearby using GPS or by searching your city manually.",
    },
    {
      icon: <Lightbulb className="w-6 h-6 text-rose-500" />,
      title: "Smart Matching",
      desc: "Find better matches using filters like age, distance, and preferences.",
    },
    {
      icon: <Settings className="w-6 h-6 text-rose-500" />,
      title: "Profile Customization",
      desc: "Edit your photos, bio, and preferences anytime to refine your presence.",
    },
    {
      icon: <Zap className="w-6 h-6 text-rose-500" />,
      title: "Fast Connections",
      desc: "Quickly discover and match with people near you effortlessly.",
    },
  ];

  return (
    <main className="relative flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 text-center text-foreground overflow-hidden py-5">
      <h1 className="text-4xl sm:text-6xl font-bold mb-4 text-foreground mt-8">
        SparkMatch
      </h1>

      <p className="text-lg sm:text-xl mb-8 max-w-2xl text-muted-foreground">
        Your Perfect destination to find connections, swipe, and match.
      </p>

      <StartDiscovering />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl w-full">
        {features.map((feature, idx) => (
          <Card
            key={idx}
            className="
    flex flex-col p-6 
    bg-card/40 backdrop-blur-md 
    border border-border/50 rounded-2xl
    shadow-none 
  "
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
            </div>

            <p className="text-sm text-muted-foreground text-left">
              {feature.desc}
            </p>
          </Card>
        ))}
      </div>
    </main>
  );
}
