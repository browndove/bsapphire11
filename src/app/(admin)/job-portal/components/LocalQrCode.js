'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function LocalQrCode({ value }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!value) {
      setSrc('');
      return undefined;
    }
    QRCode.toDataURL(value, { width: 180, margin: 1 })
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc('');
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!src) return null;

  return (
    <img
      src={src}
      alt="Scan this QR code with your authenticator app"
      width={180}
      height={180}
      style={{ border: '1px solid var(--border-color)', margin: '1rem 0' }}
    />
  );
}
