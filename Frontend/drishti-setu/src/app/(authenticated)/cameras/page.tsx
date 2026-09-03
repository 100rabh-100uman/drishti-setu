import { Metadata } from "next";
import CameraListClient from "./CameraListClient";

export const metadata: Metadata = {
  title: "CCTV Camera Registry | DRISHTI SETU",
  description: "Browse and inspect all registered CCTV camera assets",
};

export default function CameraListPage() {
  return <CameraListClient />;
}
