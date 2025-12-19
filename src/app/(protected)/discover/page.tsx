"use client";

import FiltersPanel from "@/components/discover/filters";
import { TinderCard } from "@/components/discover/tinder-card";
import { TinderSearchLoader } from "@/components/loader/tinder-search-loader";
import { useSessionLocation } from "@/hooks/use-session-location";
import gqlClient from "@/services/graphql";
import {
  LastInteraction,
  LiveLocation,
  UserPreferencesMeta,
  UserProfile,
} from "@/types";
import { getDistanceKm } from "@/utils/calculate-distance";
import { handleSwipeHelper } from "@/utils/handleSwipe";
import { REWIND_USER } from "@/utils/mutations";
import { GET_CURRENT_USER, GET_PREFERRED_USERS } from "@/utils/queries";
import { useUser } from "@clerk/nextjs";
import { AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface UILastInteraction extends LastInteraction {
  user: UserProfile;
}

export default function DiscoverPage() {
  const { user: clerkUser } = useUser();

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [originalUsers, setOriginalUsers] = useState<UserProfile[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [lastInteraction, setLastInteraction] =
    useState<UILastInteraction | null>(null);

  const [distanceKm, setDistanceKm] = useState(50);
  const [onlyOnline, setOnlyOnline] = useState(false);
  const [maxEmptyDistance, setMaxEmptyDistance] = useState<number | null>(null);

  const [storedPrefs, setStoredPrefs] = useState<UserPreferencesMeta | null>(
    null
  );
  const [isDistanceChanged, setIsDistanceChanged] = useState(false);
  const prevDistanceRef = useRef<number>(distanceKm);

  const liveCoords = useSessionLocation() as LiveLocation | null;

  const isRewinding = useRef(false);

  useEffect(() => {
    if (!clerkUser?.id) return;

    const load = async () => {
      try {
        const res = (await gqlClient.request(GET_CURRENT_USER, {
          clerkId: clerkUser.id,
        })) as { getCurrentUser: UserProfile | null };

        if (!res.getCurrentUser) return;

        const me = res.getCurrentUser;
        setCurrentUser(me);

        if (me.preferences) {
          setDistanceKm(me.preferences.distanceKm);
          setStoredPrefs(me.preferences);
        }
      } catch (err) {
        console.error("User load failed:", err);
      }
    };

    load();
  }, [clerkUser]);

const fetchUsers = useCallback(
  async (force = false) => {
    if (!currentUser) return;

    if (
      !force &&
      isDistanceChanged &&
      distanceKm < prevDistanceRef.current &&
      liveCoords
    ) {
      setUsers((prev) => {
        const filtered = prev.filter((u) => {
          if (!u.location) return false;
          const calcDistance = getDistanceKm(liveCoords, u.location);
          return calcDistance <= distanceKm;
        });

        return onlyOnline ? filtered.filter(u => u.isOnline) : filtered;
      });

      prevDistanceRef.current = distanceKm; 
      setIsDistanceChanged(false);
      return;
    }

    setLoading(true);

    try {
      const coords = liveCoords
        ? { lat: liveCoords.lat, lng: liveCoords.lng }
        : undefined;

      const res = (await gqlClient.request(GET_PREFERRED_USERS, {
        clerkId: currentUser.clerkId,
        limit: 12,
        distanceKm,
        currentLocation: coords,
      })) as { getPreferredUsers: UserProfile[] };

      setOriginalUsers(res.getPreferredUsers);
      setUsers(
        onlyOnline
          ? res.getPreferredUsers.filter(u => u.isOnline)
          : res.getPreferredUsers
      );

      prevDistanceRef.current = distanceKm;
    } catch (err) {
      console.error("Fetch users failed:", err);
    } finally {
      setLoading(false);
      setIsDistanceChanged(false);
    }
  },
  [
    currentUser,
    distanceKm,
    isDistanceChanged,
    onlyOnline,
    liveCoords,
  ]
);



  useEffect(() => {
    if (currentUser) fetchUsers(true);
  }, [currentUser]);

  useEffect(() => {
    if (liveCoords) {
      setMaxEmptyDistance(null);
      setCursor(null);
      fetchUsers(true);
    }
  }, [liveCoords]);

  const filteredUsers = useMemo(() => {
    if (!onlyOnline) return originalUsers;
    return originalUsers.filter((u) => u.isOnline);
  }, [onlyOnline, originalUsers]);

  useEffect(() => {
    setUsers(filteredUsers);
  }, [filteredUsers]);

  const handleSwipe = async (
    dir: "left" | "right",
    swipedUser: UserProfile
  ) => {
    if (!currentUser?.clerkId) return;

    setUsers((prev) => prev.filter((u) => u.id !== swipedUser.id));
    setOriginalUsers((prev) => prev.filter((u) => u.id !== swipedUser.id));

    try {
      const resp = await handleSwipeHelper({
        dir,
        swipedUser,
        currentUserId: currentUser.clerkId,
      });

      if (resp?.type && resp?.id) {
        setLastInteraction({ type: resp.type, id: resp.id, user: swipedUser });
      }
    } catch (err) {
      console.error("Swipe failed:", err);
      setUsers((prev) => [swipedUser, ...prev]);
      setOriginalUsers((prev) => [swipedUser, ...prev]);
    }
  };

  const handleRewind = async () => {
    if (!lastInteraction || isRewinding.current) return;

    isRewinding.current = true;

    const restoredUser = lastInteraction.user;

    setOriginalUsers((prev) => {
      if (prev.some((u) => u.id === restoredUser.id)) return prev;
      return [restoredUser, ...prev];
    });

    setUsers((prev) => {
      if (prev.some((u) => u.id === restoredUser.id)) return prev;
      return [restoredUser, ...prev];
    });

    setLastInteraction(null);

    try {
      const res = (await gqlClient.request(REWIND_USER, {
        lastInteraction: { type: lastInteraction.type, id: lastInteraction.id },
      })) as { rewindUser: boolean };

      if (!res.rewindUser) {
        console.error("Server rewind failed");
        setOriginalUsers((prev) =>
          prev.filter((u) => u.id !== restoredUser.id)
        );
        setUsers((prev) => prev.filter((u) => u.id !== restoredUser.id));
        setLastInteraction(lastInteraction);
      }
    } catch (err) {
      console.error("Rewind failed:", err);
      setOriginalUsers((prev) => prev.filter((u) => u.id !== restoredUser.id));
      setUsers((prev) => prev.filter((u) => u.id !== restoredUser.id));
      setLastInteraction(lastInteraction);
    } finally {
      setTimeout(() => {
        isRewinding.current = false;
      }, 500);
    }
  };

const applyFilters = async () => {
  setShowFilters(false);

  if (!isDistanceChanged) return;

  await fetchUsers();
};


  const resetFilters = async () => {
    if (!storedPrefs) return;

    const resetDistance = storedPrefs.distanceKm ?? 50;

    setDistanceKm(resetDistance);
    setOnlyOnline(false);
    setCursor(null);
    // setShowFilters(false);
    setIsDistanceChanged(false);

    // if (!isDistanceChanged) return;

    // await fetchUsers(true, { distanceKm: resetDistance });
    // setIsDistanceChanged(false);
  };

  return (
    <main
      className="relative w-full min-h-[calc(100vh-125px)] md:min-h-[calc(100vh-64px)]
                     flex flex-col items-center overflow-hidden"
    >
      <FiltersPanel
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        distanceKm={distanceKm}
        onlyOnline={onlyOnline}
        setDistanceKm={setDistanceKm}
        setOnlyOnline={setOnlyOnline}
        resetFilters={resetFilters}
        applyFilters={applyFilters}
        isDistanceChanged={isDistanceChanged}
        setIsDistanceChanged={setIsDistanceChanged}
      />

      <div className="flex-1 w-full flex flex-col justify-center items-center relative py-6 -mt-4">
        {loading ? (
        <TinderSearchLoader />
        ) : users.length === 0 ? (
          <div className="text-center space-y-4 max-w-md px-6">
            <h3 className="text-2xl font-bold">No one new around you</h3>
            <p className="text-muted-foreground">
              {onlyOnline
                ? "No online users found. Try turning off the online filter."
                : "Try adjusting your preferences to see more people."}
            </p>
            <div
              onClick={() => fetchUsers(true)}
              className="cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-5 w-5" />
              <span className="underline underline-offset-1">
                {" "}
                Refresh Suggestions
              </span>
            </div>
          </div>
        ) : (
          <div
            className="relative w-full max-w-[420px] h-[70vh] sm:h-[75vh] md:h-[80vh]
                          flex items-center justify-center"
          >
            <AnimatePresence mode="popLayout">
              {users
                .slice(0, 3)
                .reverse()
                .map((u, i) => (
                  <div
                    key={u.id}
                    className="absolute inset-0 flex justify-center items-center"
                    style={{ zIndex: i + 1 }}
                  >
                    <TinderCard
                      user={u}
                      isTop={i === users.slice(0, 3).length - 1}
                      onSwipe={(dir) => handleSwipe(dir, u)}
                      onRewind={handleRewind}
                      lastInteraction={lastInteraction}
                      onOpen={() => console.log("open profile")}
                      styleIndex={users.slice(0, 3).length - 1 - i}
                    />
                  </div>
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
