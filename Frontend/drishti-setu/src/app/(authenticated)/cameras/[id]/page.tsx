import { Metadata } from "next";
import { redirect } from "next/navigation";
import CameraDetailsClient from "./CameraDetailsClient";

export const metadata: Metadata = {
  title: "Camera Details | DRISHTI SETU",
  description: "Comprehensive CCTV camera asset details and live status",
};

export default async function CameraDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = decodeURIComponent(resolvedParams.id).trim();

  // Route safeguards so reserved sub-paths are never treated as camera IDs
  if (id === "import") {
    redirect("/cameras/import");
  }
  if (id === "history") {
    redirect("/cameras/history");
  }
  if (id === "new") {
    redirect("/cameras/new");
  }

  return <CameraDetailsClient id={id} />;
}
