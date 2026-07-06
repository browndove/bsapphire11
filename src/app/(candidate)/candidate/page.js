'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCandidate } from './CandidateContext';

export default function CandidateIndex() {
  const router = useRouter();
  const { isReady, isAuthed } = useCandidate();

  useEffect(() => {
    if (!isReady) return;
    router.replace(isAuthed ? '/candidate/applications' : '/candidate/login');
  }, [isReady, isAuthed, router]);

  return null;
}
