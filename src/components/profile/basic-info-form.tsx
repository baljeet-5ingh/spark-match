"use client";
import { User } from "lucide-react";
import { SectionHeader } from "../cards/card";
import { useState } from "react";

export interface BasicInfoProps {
  name: string;
  bio: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  birthday: string;
  saving?: boolean;

  onChange: <K extends "name" | "bio" | "gender" | "birthday">(
    key: K,
    value: string | BasicInfoProps["gender"]
  ) => void;
}

export function BasicInfoForm({
  name,
  bio,
  gender,
  birthday,
  onChange,
  saving,
}: BasicInfoProps) {
  const maxBirthday = new Date();
  maxBirthday.setFullYear(maxBirthday.getFullYear() - 18);
  const maxDate = maxBirthday.toISOString().split("T")[0];

  const minBirthday = new Date();
  minBirthday.setFullYear(minBirthday.getFullYear() - 80);
  const minDate = minBirthday.toISOString().split("T")[0];
  const [birthdayError, setBirthdayError] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Basic Information"
        icon={<User className="h-4 w-4" />}
        subtitle="Update your personal details"
      />

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">
            Full Name
          </label>
          <input
            value={name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Enter your full name"
            className="w-full bg-background border border-border rounded-xl px-4 py-3 
                       focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 
                       transition-all duration-200 text-foreground"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">
            About You
          </label>
          <textarea
            value={bio}
            onChange={(e) => onChange("bio", e.target.value)}
            placeholder="Tell others about yourself..."
            className="w-full bg-background border border-border rounded-xl px-4 py-3 
                       focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 
                       transition-all duration-200 text-foreground 
                       min-h-[120px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right mt-2">
            {bio.length}/500
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">
            Gender
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(["MALE", "FEMALE", "OTHER"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onChange("gender", option)}
                className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                  gender === option
                    ? "bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {option.charAt(0) + option.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">
            Birthday
          </label>

          <input
            type="date"
            value={birthday}
            disabled={saving}
            max={maxDate}
            min={minDate}
            onChange={(e) => {
              const typed = e.target.value;

              if (!typed) {
                setBirthdayError(null);
                return;
              }

              const typedDate = new Date(typed);
              const maxAllowedDate = new Date(maxDate);
              if (typedDate > maxAllowedDate) {
                setBirthdayError("Did your parents even know you are here?");
                return;
              }
              if (typedDate < new Date(minDate)) {
                setBirthdayError("Are you sure you are that old?");
                return;
              }
              setBirthdayError(null);
              onChange("birthday", typed);
            }}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 
             focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 
             transition-all duration-200 text-foreground"
          />
          {birthdayError && (
            <p className="text-xs text-red-500 mt-2">{birthdayError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
