"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import { PageTransition } from "@/components/navigation/PageTransition";
import { DangerAlertListener } from "@/components/alerts/DangerAlertListener";

import { ThemeProvider } from "@/context/ThemeContext";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <ThemeProvider>
      <div className="flex h-screen bg-[#f8fafc] dark:bg-[#060b17] overflow-hidden font-sans transition-colors duration-200">
        <DangerAlertListener />
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopHeader />
          <main className="flex-1 overflow-y-auto">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
