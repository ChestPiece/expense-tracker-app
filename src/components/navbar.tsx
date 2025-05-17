"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="pixel-text text-[#ff4500] text-xl font-bold"
            >
              EXPENSE TRACKER
            </Link>
          </div>
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <Link
              href="/dashboard"
              className="pixel-text text-gray-300 hover:text-[#ff4500]"
            >
              Dashboard
            </Link>
            {user ? (
              <>
                <span className="pixel-text text-gray-300">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <button
                  aria-label="Toggle Dark Mode"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="ml-2 p-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                  {theme === "dark" ? (
                    <Sun size={18} className="text-yellow-400" />
                  ) : (
                    <Moon size={18} className="text-gray-400" />
                  )}
                </button>
                <Button
                  variant="outline"
                  className="cyber-button pixel-text"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="pixel-text text-gray-300 hover:text-[#ff4500]"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="pixel-text text-gray-300 hover:text-[#ff4500]"
                >
                  Sign Up
                </Link>
                <button
                  aria-label="Toggle Dark Mode"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="ml-2 p-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                  {theme === "dark" ? (
                    <Sun size={18} className="text-yellow-400" />
                  ) : (
                    <Moon size={18} className="text-gray-400" />
                  )}
                </button>
              </>
            )}
          </div>
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-[#ff4500]"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/dashboard"
              className="block pixel-text text-gray-300 hover:text-[#ff4500] py-2"
            >
              Dashboard
            </Link>
            {user ? (
              <>
                <span className="block pixel-text text-gray-300 py-2">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <button
                  aria-label="Toggle Dark Mode"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="my-2 p-2 rounded-full hover:bg-gray-800 transition-colors w-full flex justify-center"
                >
                  {theme === "dark" ? (
                    <Sun size={18} className="text-yellow-400" />
                  ) : (
                    <Moon size={18} className="text-gray-400" />
                  )}
                </button>
                <Button
                  variant="outline"
                  className="cyber-button pixel-text w-full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block pixel-text text-gray-300 hover:text-[#ff4500] py-2"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block pixel-text text-gray-300 hover:text-[#ff4500] py-2"
                >
                  Sign Up
                </Link>
                <button
                  aria-label="Toggle Dark Mode"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="my-2 p-2 rounded-full hover:bg-gray-800 transition-colors w-full flex justify-center"
                >
                  {theme === "dark" ? (
                    <Sun size={18} className="text-yellow-400" />
                  ) : (
                    <Moon size={18} className="text-gray-400" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
