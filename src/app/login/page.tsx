export const dynamic = "force-dynamic";
import { Navbar } from "@/components/navbar";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <LoginForm />
    </div>
  );
}
