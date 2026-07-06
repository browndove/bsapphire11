'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function revealAll() {
  document.querySelectorAll('.fade-in-up, .slide-up, .reveal').forEach((el) => {
    el.classList.add('active');
  });
}

export default function ScrollAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    revealAll();

    const onResize = () => revealAll();
    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, [pathname]);

  return null;
}
