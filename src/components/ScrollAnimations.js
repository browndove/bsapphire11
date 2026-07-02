'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };
    
    const elementObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    // Slight delay to ensure DOM elements are rendered
    const timeout = setTimeout(() => {
      const animatedElements = document.querySelectorAll('.fade-in-up, .slide-up, .reveal');
      animatedElements.forEach(el => elementObserver.observe(el));
    }, 100);

    return () => {
      clearTimeout(timeout);
      elementObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
