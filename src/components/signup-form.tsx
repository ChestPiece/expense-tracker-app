"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoadingSpinner } from "./loading-spinner";
import { GoogleIcon, GithubIcon } from "./social-icons";

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Check if user already exists with any provider
      const {
        data: { users },
      } = await supabase.auth.admin.listUsers();
      const existingUser = users?.find((user) => user.email === email);

      if (existingUser) {
        if (existingUser.app_metadata.provider) {
          setError(
            `This email is already registered with ${existingUser.app_metadata.provider}. Please use ${existingUser.app_metadata.provider} login.`
          );
        } else {
          setError(
            "This email is already registered. Please use email/password login."
          );
        }
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("User already registered")) {
          setError(
            "This email is already registered. Please use login instead."
          );
        } else {
        setError(signUpError.message);
        }
        return;
      }

      // Show success message
      setError(null);
      setLoading(false);
      return (
        <div className="text-center">
          <h2 className="text-lg font-bold mb-4">Check your email</h2>
          <p className="text-muted-foreground mb-4">
            We&apos;ve sent you a confirmation email. Please check your inbox
            and click the confirmation link to complete your registration.
          </p>
          <Button variant="outline" onClick={() => router.push("/login")}>
            Go to Login
          </Button>
        </div>
      );
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      // Check if user already exists with any provider
      const {
        data: { users },
      } = await supabase.auth.admin.listUsers();
      const existingUser = users?.find((user) => user.email === email);

      if (existingUser) {
        if (existingUser.app_metadata.provider === "google") {
          setError(
            "This email is already registered with Google. Please use Google login."
          );
        } else if (existingUser.app_metadata.provider) {
          setError(
            `This email is already registered with ${existingUser.app_metadata.provider}. Please use ${existingUser.app_metadata.provider} login.`
          );
        } else {
          setError(
            "This email is already registered with password. Please use email/password login."
          );
        }
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGithubSignUp = async () => {
    setGithubLoading(true);
    setError(null);

    try {
      // Check if user already exists with any provider
      const {
        data: { users },
      } = await supabase.auth.admin.listUsers();
      const existingUser = users?.find((user) => user.email === email);

      if (existingUser) {
        if (existingUser.app_metadata.provider === "github") {
          setError(
            "This email is already registered with GitHub. Please use GitHub login."
          );
        } else if (existingUser.app_metadata.provider) {
          setError(
            `This email is already registered with ${existingUser.app_metadata.provider}. Please use ${existingUser.app_metadata.provider} login.`
          );
        } else {
          setError(
            "This email is already registered with password. Please use email/password login."
          );
        }
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setGithubLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="welcome-message text-center mb-8">
        <h1 className="pixel-text text-xl mb-2 text-[#ff4500]">
          Welcome to Expense Tracker
        </h1>
        <p className="text-lg text-muted-foreground">
          Sign up to see the real action
        </p>
      </div>
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="pixel-text text-lg text-[#ff4500]">
            Create an account
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              {error && (
                <div className="text-sm text-red-500 text-center glitch">
                  {error}
                </div>
              )}
              <div className="grid gap-3">
                <Label htmlFor="name" className="pixel-text text-sm">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading || googleLoading || githubLoading}
                  className="cyber-input"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email" className="pixel-text text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || googleLoading || githubLoading}
                  className="cyber-input"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password" className="pixel-text text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || googleLoading || githubLoading}
                  className="cyber-input"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword" className="pixel-text text-sm">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading || googleLoading || githubLoading}
                  className="cyber-input"
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full cyber-button pixel-text"
                  disabled={loading || googleLoading || githubLoading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full cyber-button pixel-text"
                  onClick={handleGoogleSignUp}
                  disabled={loading || googleLoading || githubLoading}
                >
                  {googleLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner />
                      <span>Connecting to Google...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <GoogleIcon />
                      <span>Sign up with Google</span>
                    </div>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full cyber-button pixel-text"
                  onClick={handleGithubSignUp}
                  disabled={loading || googleLoading || githubLoading}
                >
                  {githubLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner />
                      <span>Connecting to GitHub...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <GithubIcon />
                      <span>Sign up with GitHub</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a
                href="/login"
                className="underline underline-offset-4 text-[#ff4500]"
              >
                Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
