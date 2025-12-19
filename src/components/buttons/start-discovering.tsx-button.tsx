import Link from "next/link";
import { ShineBorder } from "../ui/shine-border";

export function StartDiscovering() {
  return (
    <Link
      href="/discover"
      className="
    relative inline-flex items-center justify-center
    px-8 py-2 rounded-full mb-8
    text-white font-medium text-xl

    bg-gradient-to-r from-pink-500 via-red-500 to-orange-500
    overflow-hidden

    transition-all duration-300 ease-out
    hover:scale-105 hover:-translate-y-0.5
    hover:shadow-lg hover:shadow-pink-500/40
    active:scale-95
  "
    >
      <ShineBorder
        shineColor={[
          "rgba(255, 255, 255, 0.9)",
          "rgba(255, 80, 120, 0.9)",
        ]}
      />
      <span className="relative z-10">Start Discovering</span>
    </Link>
  );
}
