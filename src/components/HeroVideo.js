'use client';

import { useEffect, useState } from 'react';

export default function HeroVideo() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fallback = window.setTimeout(() => setReady(true), 2000);
    return () => window.clearTimeout(fallback);
  }, []);

  return (
    <div className={`hero-video-wrapper ${ready ? 'is-ready' : 'is-loading'}`}>
      <video
        src="/hero-video.mp4"
        poster="/request_demo_bg.png"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="hero-video"
        onLoadedData={() => setReady(true)}
        onCanPlay={() => setReady(true)}
      />
    </div>
  );
}
