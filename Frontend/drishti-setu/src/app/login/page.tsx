import { Metadata } from "next";
import { LoginBrandPanel } from "@/components/auth/LoginBrandPanel";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Secure Login | DRISHTI SETU",
  description: "Secure government command access for DRISHTI SETU.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-slate-50 relative overflow-hidden">
      <LoginBrandPanel />
      <LoginForm />
    </main>
  );
}
