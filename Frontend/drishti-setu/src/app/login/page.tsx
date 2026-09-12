import { Metadata } from "next";
import { Suspense } from "react";
import { LoginBrandPanel } from "@/components/auth/LoginBrandPanel";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Secure Login | DRISHTI SETU",
  description: "Secure government command access for DRISHTI SETU.",
};

export default function LoginPage() {
  return (
    <main
      data-page-container
      className="flex min-h-screen bg-slate-50 relative overflow-hidden animate-page-enter"
    >
      <LoginBrandPanel />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-screen">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
