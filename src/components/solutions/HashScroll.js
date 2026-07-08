'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function scrollToHash() {
  const hash = window.location.hash;
  if (!hash) return;
  const id = hash.slice(1);
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export default function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    scrollToHash();
    const timer = window.setTimeout(scrollToHash, 100);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const onHashChange = () => scrollToHash();
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return null;
}
