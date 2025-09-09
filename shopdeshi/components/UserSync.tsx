"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

const API_BASE = "http://localhost:4000";

export default function UserSync() {
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    const sync = async () => {
      if (!isLoaded || !isSignedIn || !user) return;
      const email = user.primaryEmailAddress?.emailAddress;
      if (!email) return;
      try {
        await fetch(`${API_BASE}/users/upsert`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkId: user.id,
            email,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            imageUrl: user.imageUrl || "",
          }),
        });
      } catch {
        // ignore
      }
    };
    sync();
  }, [isLoaded, isSignedIn, user]);

  return null;
}
