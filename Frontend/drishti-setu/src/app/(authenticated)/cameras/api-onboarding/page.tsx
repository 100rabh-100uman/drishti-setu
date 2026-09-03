import { Metadata } from "next";
import ApiOnboardingPageClient from "./ApiOnboardingPageClient";

export const metadata: Metadata = {
  title: "API Onboarding | DRISHTI SETU",
  description: "Synchronize external department and vendor CCTV registry metadata via API",
};

export default function ApiOnboardingPage() {
  return <ApiOnboardingPageClient />;
}
