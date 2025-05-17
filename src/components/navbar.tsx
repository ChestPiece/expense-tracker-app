"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "./confirm-dialog";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    setShowLogoutConfirm(false);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <nav className="bg-black/90 backdrop-blur-sm border-b border-[#ff4500]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="pixel-text text-[#ff4500] text-xl font-bold">
                  EXPENSE<span className="text-white">TRACKER</span>
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {loading ? null : user ? (
                <>
                  <span className="pixel-text text-[#ff4500] text-base">
                    Welcome, {user.user_metadata?.full_name || user.email}
                  </span>
                  <Button
                    variant="outline"
                    className="cyber-button pixel-text"
                    onClick={() => setShowLogoutConfirm(true)}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="cyber-button pixel-text"
                    onClick={() => router.push("/login")}
                  >
                    Login
                  </Button>
                  <Button
                    className="cyber-button pixel-text"
                    onClick={() => router.push("/signup")}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        onConfirm={handleSignOut}
        title="Confirm Logout"
        description="Are you sure you want to log out of your account?"
        confirmText="Logout"
      />
    </>
  );
}
