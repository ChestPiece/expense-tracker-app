"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (password) {
      // Check password strength
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const isLongEnough = password.length >= 8;

      let score = 0;
      const feedback = [];

      if (hasUpperCase) score++;
      if (hasLowerCase) score++;
      if (hasNumbers) score++;
      if (hasSpecialChar) score++;
      if (isLongEnough) score++;

      if (!isLongEnough) feedback.push("At least 8 characters");
      if (!hasUpperCase) feedback.push("One uppercase letter");
      if (!hasLowerCase) feedback.push("One lowercase letter");
      if (!hasNumbers) feedback.push("One number");
      if (!hasSpecialChar) feedback.push("One special character");

      setPasswordStrength({
        score,
        feedback: feedback.join(", "),
      });
    }
  }, [password]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordStrength.score < 4) {
      setError("Please meet all password requirements");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      router.push("/login?message=Check your email to confirm your account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-16">
        <div className="cyber-card p-8">
          <h1 className="pixel-text text-2xl text-[#ff4500] font-bold mb-6 text-center">
            CREATE ACCOUNT
          </h1>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="pixel-text text-sm text-gray-400"
              >
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="cyber-input pixel-text mt-1"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="pixel-text text-sm text-gray-400"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cyber-input pixel-text mt-1"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="pixel-text text-sm text-gray-400"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cyber-input pixel-text mt-1"
                required
              />
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full ${
                          i < passwordStrength.score
                            ? "bg-[#ff4500]"
                            : "bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  {passwordStrength.feedback && (
                    <p className="pixel-text text-xs text-gray-400 mt-1">
                      Requirements: {passwordStrength.feedback}
                    </p>
                  )}
                </div>
              )}
            </div>
            {error && (
              <div className="pixel-text text-red-500 text-sm">{error}</div>
            )}
            <Button
              type="submit"
              className="cyber-button pixel-text w-full"
              disabled={loading || passwordStrength.score < 4}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              className="cyber-button pixel-text"
              onClick={() => handleSocialLogin("google")}
            >
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="cyber-button pixel-text"
              onClick={() => handleSocialLogin("github")}
            >
              GitHub
            </Button>
          </div>

          <div className="mt-4 text-center">
            <span className="pixel-text text-sm text-gray-400">
              Already have an account?{" "}
            </span>
            <Link
              href="/login"
              className="pixel-text text-[#ff4500] hover:underline"
            >
              Login
            </Link>
          </div>
      </div>
      </main>
    </div>
  );
}
