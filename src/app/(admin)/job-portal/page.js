'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePortal } from './PortalContext';

export default function JobPortalIndex() {
  const router = useRouter();
  const { isReady, isAuthed } = usePortal();

  useEffect(() => {
    if (isReady) {
      if (isAuthed) {
        router.replace('/job-portal/dashboard');
      } else {
        router.replace('/job-portal/login');
      }
    }
  }, [isReady, isAuthed, router]);

  return null;
}
