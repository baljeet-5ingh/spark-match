"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "../buttons/mode-toggle-btn";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 left-0 right-0 h-15 w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-border/40 bg-background/0 backdrop-blur-xl z-50 transition-all duration-300">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <Link href={"/"} className="flex items-end gap-2 group">
          <div className="relative w-8 h-8 transition-transform duration-300 group-hover:scale-110">
            <Image
              src={"/tinder_logo.png"}
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-lg sm:text-xl -ml-2 font-bold bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent tracking-tight">
            SparkMatch
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { href: "/discover", label: "Discover" },
            { href: "/matches", label: "Matches" },
            { href: "/likes", label: "Likes" },
            { href: "/profile", label: "Profile" },
          ].map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 hover:scale-105 ${
                  isActive
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          <ModeToggle />

          {/* ❤️ AUTH HANDLING */}
          <SignedOut>
            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <SignInButton>
                <button className="px-4 py-2 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton>
                <button className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-md hover:shadow-lg">
                  Sign Up
                </button>
              </SignUpButton>
            </div>

            {/* Mobile Dropdown */}
            {/* Mobile Login Dropdown */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="
          py-2 rounded-full
          outline-none ring-0
          hover:bg-transparent active:bg-transparent
          focus:bg-transparent focus-visible:bg-transparent
          focus:ring-0 focus-visible:ring-0
          transition-none
        "
                  >
                    <User className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="
        w-40 
        rounded-xl 
        border border-border/50
        bg-card/80 backdrop-blur-xl
        shadow-lg shadow-black/5
        p-1
      "
                >
                  <DropdownMenuItem
                    className="
          cursor-pointer rounded-md 
          px-3 py-2 text-sm
          hover:bg-muted/40 
          transition-colors
        "
                    asChild
                  >
                    <SignInButton>
                      <span>Sign In</span>
                    </SignInButton>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="
          cursor-pointer rounded-md 
          px-3 py-2 text-sm
          hover:bg-muted/40 
          transition-colors
        "
                    asChild
                  >
                    <SignUpButton>
                      <span>Sign Up</span>
                    </SignUpButton>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SignedOut>

          {/* User Avatar (signed in) */}
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    "w-9 h-9 border-2 border-primary/20 hover:border-primary/50 transition-colors",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
