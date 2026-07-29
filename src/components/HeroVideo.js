'use client';

import { useEffect, useState } from 'react';

export default function HeroVideo() {
  const [ready, setReady] = useState(false);
  const [useStaticPoster, setUseStaticPoster] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const fallback = window.setTimeout(() => setReady(true), 2000);
    return () => window.clearTimeout(fallback);
  }, []);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateMode = () => {
      setUseStaticPoster(reducedMotionQuery.matches);
    };

    updateMode();
    reducedMotionQuery.addEventListener('change', updateMode);

    return () => {
      reducedMotionQuery.removeEventListener('change', updateMode);
    };
  }, []);

  if (useStaticPoster || videoFailed) {
    return (
      <div className="hero-video-wrapper is-ready">
        <img
          src="/request_demo_bg.png"
          alt="Blvck Sapphire platform preview"
          className="hero-video hero-video-poster"
          loading="eager"
        />
      </div>
    );
  }

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
        onError={() => setVideoFailed(true)}
      />
    </div>
  );
}
