"use client";

import { useEffect, useState } from "react";

export type DemoUser = {
  id: string;
  email: string;
  user_metadata?: { full_name?: string };
};

const DEMO_USER_KEY = "mm_demo_user";

function createDemoUser(): DemoUser {
  return {
    id: "demo_" + Date.now().toString(36),
    email: "demo@manhwamotion.ai",
    user_metadata: { full_name: "Manhwa Creator" },
  };
}

export function useDemoUser() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    function load() {
      try {
        const stored = localStorage.getItem(DEMO_USER_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as DemoUser;
          if (active) setUser(parsed);
        } else {
          // Auto-provision a demo user for instant experience
          const newUser = createDemoUser();
          localStorage.setItem(DEMO_USER_KEY, JSON.stringify(newUser));
          if (active) setUser(newUser);
        }
      } catch (e) {
        // Corrupted storage -> reset
        const newUser = createDemoUser();
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(newUser));
        if (active) setUser(newUser);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    // No real auth listeners needed in pure local demo mode
    return () => {
      active = false;
    };
  }, []);

  return { user, loading };
}

export function signInWithGoogle() {
  // Pure local demo "Google sign-in"
  const user = createDemoUser();
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
  // Simulate redirect behavior of real OAuth
  if (typeof window !== "undefined") {
    window.location.href = "/dashboard";
  }
  return Promise.resolve({ user });
}

export function signOut() {
  try {
    localStorage.removeItem(DEMO_USER_KEY);
  } catch {}
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
  return Promise.resolve();
}
