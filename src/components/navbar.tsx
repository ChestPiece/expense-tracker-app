"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "./confirm-dialog";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();

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
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <nav className="border-b bg-white dark:bg-zinc-900">
        <div className="flex h-16 items-center px-4 container mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-xl pixel-text text-[#ff4500]">
              Expense Tracker
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button
              className={cn(
                "rounded-full p-2 hover:bg-muted transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-[#ff4500]"
              )}
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-[#ff4500]" />
              ) : (
                <Moon className="w-5 h-5 text-[#ff4500]" />
              )}
            </button>
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm pixel-text text-[#ff4500]">
                      Welcome, {user.user_metadata?.full_name || user.email}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setShowLogoutConfirm(true)}
                      className="cyber-button pixel-text"
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/login")}
                      className="cyber-button pixel-text"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => router.push("/signup")}
                      className="cyber-button pixel-text"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </>
            )}
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
