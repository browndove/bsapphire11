'use client';

import { useEffect, useRef, useState } from 'react';

export default function BgCanvas() {
  const canvasRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setEnabled(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width;
    let height;
    let particles = [];
    let animationFrameId;
    let paused = false;

    function init() {
      const parent = canvas.parentElement;
      width = canvas.width = parent ? parent.clientWidth : window.innerWidth;
      height = canvas.height = parent ? parent.clientHeight : window.innerHeight;
      particles = [];
      const pCount = Math.min(Math.floor((width * height) / 18000), 80);

      for (let i = 0; i < pCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
        });
      }
    }

    function animate() {
      if (paused) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = 'rgba(15, 82, 186, 0.18)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            ctx.beginPath();
            ctx.lineWidth = 0.5;
            let alpha = 0.06 - dist / 2800;
            ctx.strokeStyle = `rgba(15, 82, 186, ${Math.max(alpha, 0.015)})`;

            if (i % 8 === 0 && j % 8 === 0) {
              ctx.strokeStyle = `rgba(15, 82, 186, ${Math.max(alpha * 2, 0.03)})`;
            }

            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = window.requestAnimationFrame(animate);
    }

    function onVisChange() {
      if (document.hidden) {
        paused = true;
        window.cancelAnimationFrame(animationFrameId);
      } else {
        paused = false;
        animationFrameId = window.requestAnimationFrame(animate);
      }
    }

    document.addEventListener('visibilitychange', onVisChange);
    window.addEventListener('resize', init);
    init();
    animate();

    return () => {
      document.removeEventListener('visibilitychange', onVisChange);
      window.removeEventListener('resize', init);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return <canvas id="bg-canvas" ref={canvasRef} aria-hidden="true" />;
}
