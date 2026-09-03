import { Metadata } from 'next';
import AddCameraPageClient from './AddCameraPageClient';

export const metadata: Metadata = {
  title: 'Add Camera | DRISHTI SETU',
  description: 'Register a new CCTV camera asset into the DRISHTI SETU system',
};

export default function AddCameraPage() {
  return <AddCameraPageClient />;
}
