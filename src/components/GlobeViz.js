'use client';

import { useEffect, useRef, useState } from 'react';

export default function GlobeViz() {
  const globeRef = useRef(null);
  const globeInstance = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = globeRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || globeInstance.current) return;

    const el = globeRef.current;
    if (!el) return;

    import('globe.gl').then((module) => {
      const Globe = module.default;
      if (!el || globeInstance.current) return;

      const locations = [
        { lat: 49.2827, lng: -123.1207, label: 'Vancouver' },
        { lat: 42.3601, lng: -71.0589, label: 'Boston' },
        { lat: 5.6037, lng: -0.1870, label: 'Accra' },
        { lat: 52.5200, lng: 13.4050, label: 'Berlin' },
      ];

      const oceanCanvas = document.createElement('canvas');
      oceanCanvas.width = 2;
      oceanCanvas.height = 2;
      const oceanCtx = oceanCanvas.getContext('2d');
      oceanCtx.fillStyle = '#e8ecf0';
      oceanCtx.fillRect(0, 0, 2, 2);

      const myGlobe = Globe()(el)
        .globeImageUrl(oceanCanvas.toDataURL())
        .backgroundColor('rgba(0,0,0,0)')
        .width(220)
        .height(220)
        .showAtmosphere(true)
        .atmosphereColor('#0f52ba')
        .atmosphereAltitude(0.12)
        .ringsData(locations)
        .ringColor(() => '#0f52ba')
        .ringAltitude(0.015)
        .ringMaxRadius(4)
        .ringPropagationSpeed(2)
        .ringRepeatPeriod(800)
        .pointsData(locations)
        .pointColor(() => '#0f52ba')
        .pointAltitude(0.015)
        .pointRadius(0.5);

      fetch(
        'https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson'
      )
        .then((res) => res.json())
        .then((countries) => {
          myGlobe
            .polygonsData(countries.features)
            .polygonAltitude(0.01)
            .polygonCapColor(() => '#c5cdd6')
            .polygonSideColor(() => '#a8b0b9')
            .polygonStrokeColor(() => '#8b95a1');
        });

      myGlobe.controls().autoRotate = true;
      myGlobe.controls().autoRotateSpeed = 2.5;
      myGlobe.controls().enableZoom = false;

      globeInstance.current = myGlobe;
    });

    return () => {
      if (globeInstance.current && globeInstance.current._destructor) {
        globeInstance.current._destructor();
      }
      globeInstance.current = null;
    };
  }, [visible]);

  return (
    <div
      ref={globeRef}
      id="globeViz"
      style={{ width: '220px', height: '220px', outline: 'none', alignSelf: 'center', cursor: 'grab' }}
      onMouseDown={(e) => (e.currentTarget.style.cursor = 'grabbing')}
      onMouseUp={(e) => (e.currentTarget.style.cursor = 'grab')}
    />
  );
}
