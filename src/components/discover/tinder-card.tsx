// components/discover/tinder-card.tsx
"use client";

import React from "react";
import { motion, PanInfo } from "framer-motion";
import { LastInteraction, UserProfile } from "@/types";
import Image from "next/image";
import { Heart, RotateCcw, X } from "lucide-react";
import Link from "next/link";

export type OnSwipeDir = "left" | "right";

interface TinderCardProps {
  user: UserProfile;
  isTop?: boolean;
  onRewind: () => void;
  onSwipe: (dir: OnSwipeDir) => Promise<void> | void;
  lastInteraction: LastInteraction | null | undefined;
  onOpen: () => void;
  styleIndex?: number; // 0 = top, 1 = next, 2 = next
}

export const TinderCard: React.FC<TinderCardProps> = ({
  user,
  isTop = false,
  onRewind,
  onSwipe,
  onOpen,
  lastInteraction,
  styleIndex = 0,
}) => {
  // Visual offsets for stacked look
  const scaleMap = [1, 0.98, 0.96];
  const translateYMap = [0, 16, 32];

  const handleDragEnd = async (
    _: PointerEvent | TouchEvent | MouseEvent,
    info: PanInfo
  ) => {
    const offsetX = info.offset.x;
    const velocityX = info.velocity.x;
    const THRESH = 120; // px
    const VEL = 700; // px/s

    if (offsetX > THRESH || velocityX > VEL) {
      await onSwipe("right");
      return;
    }
    if (offsetX < -THRESH || velocityX < -VEL) {
      await onSwipe("left");
      return;
    }
    // return to center (framer-motion handles snapping with no explicit code here)
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: scaleMap[styleIndex] }}
      animate={{
        opacity: 1,
        scale: scaleMap[styleIndex],
        y: translateYMap[styleIndex],
      }}
      exit={{ opacity: 0 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={isTop ? handleDragEnd : undefined}
      dragElastic={0.18}
      whileTap={{ cursor: "grabbing" }}
      className="relative w-[90vw] max-w-[400px] h-[70vh] sm:h-[75vh] md:h-[75vh] rounded-3xl bg-card shadow-2xl overflow-hidden touch-pan-y select-none"
      style={{
        boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
        cursor: "default",
      }}
    >
      {/* Full Height Image Button */}
      <button
        type="button"
        aria-label={`Open ${user.name}'s profile`}
        onClick={onOpen}
        className="w-full h-full block focus:outline-none relative group"
      >
        {/* Image */}
        <Image
          src={user.photos?.[0] ?? "/placeholder.jpg"}
          alt={`${user.name} photo`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
        />

        {/* Subtle highlight */}
        <div
          className="
    absolute inset-0
    bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.15),transparent_60%)]
    dark:bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.05),transparent_60%)]
  "
        />

        {/* Readability gradient (THIS WAS MISSING) */}
        <div
          className="
    absolute inset-0
    bg-gradient-to-b
    from-black/0
    via-black/30
    to-black/75
    dark:from-black/10
    dark:via-black/45
    dark:to-black/85
  "
        />

        {/* Online Indicator */}
        {user.isOnline && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <span className="text-xs font-medium text-white/90">Online</span>
          </div>
        )}

        {/* Info Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-24 text-left">
          <div className="flex items-end gap-3 mb-2">
            <h3 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">
              {user.name}
            </h3>
            <span className="text-2xl font-medium text-white/80 mb-0.5 drop-shadow-md">
              {user.age}
            </span>
          </div>

          {user.bio && (
            <p className="text-white/90 text-base leading-relaxed line-clamp-2 drop-shadow-sm max-w-[90%]">
              {user.bio}
            </p>
          )}

          {/* View Profile Hint */}
          <Link
            href={`/profile/${user.id}`}
            className="mt-4 flex items-center gap-2 text-white/60 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0"
          >
            <span>View Profile</span>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </button>

      {/* Floating Action Bar */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 z-20">
        {/* Rewind Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRewind();
          }}
          disabled={!lastInteraction}
          className="
            flex items-center justify-center 
            w-14 h-14 rounded-full 
            bg-black/20 backdrop-blur-xl border border-white/10
            text-yellow-400 
            hover:bg-yellow-400 hover:text-white hover:border-yellow-400
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black/20 disabled:hover:text-yellow-400
            transition-all duration-300 hover:scale-110 active:scale-95
            shadow-lg
            cursor-pointer
          "
        >
          <RotateCcw className="w-7 h-7" />
        </button>

        {/* Pass Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSwipe("left");
          }}
          className="
            flex items-center justify-center 
            w-14 h-14 rounded-full 
            bg-black/20 backdrop-blur-xl border border-white/10
            text-rose-500 
            hover:bg-rose-500 hover:text-white hover:border-rose-500
            transition-all duration-300 hover:scale-110 active:scale-95
            shadow-lg
            cursor-pointer
          "
        >
          <X className="w-7 h-7" strokeWidth={2.5} />
        </button>

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSwipe("right");
          }}
          className="
            flex items-center justify-center 
            w-14 h-14 rounded-full 
            bg-black/20 backdrop-blur-xl border border-white/10
            text-emerald-500 
            hover:bg-emerald-500 hover:text-white hover:border-emerald-500
            transition-all duration-300 hover:scale-110 active:scale-95
            shadow-lg
            cursor-pointer
          "
        >
          <Heart className="w-7 h-7" strokeWidth={2.5} />
        </button>
      </div>

      {/* Swipe Indicators (Stamps) */}
      <motion.div
        className="absolute top-8 right-8 pointer-events-none z-30 border-4 border-rose-500 rounded-lg px-4 py-1"
        style={{ opacity: 0, rotate: 12 }}
      >
        <span className="text-4xl font-black text-rose-500 tracking-widest uppercase">
          NOPE
        </span>
      </motion.div>

      <motion.div
        className="absolute top-8 left-8 pointer-events-none z-30 border-4 border-emerald-500 rounded-lg px-4 py-1"
        style={{ opacity: 0, rotate: -12 }}
      >
        <span className="text-4xl font-black text-emerald-500 tracking-widest uppercase">
          LIKE
        </span>
      </motion.div>
    </motion.div>
  );
};
