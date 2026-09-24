import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Kóter Gym & Crossfight Aréna — Hatvan';

/**
 * The social card. Built from type on the brand's own ground rather than a
 * photograph, so it stays legible at thumbnail size in a feed.
 */
export default function OpengraphImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#060607',
          color: '#F2F0ED',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', width: 96, height: 6, background: '#D7141A' }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>GYERE.</div>
          <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
            TARTOZZ KÖZÉNK.
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26, color: '#9A9AA2' }}>
          <span>KÓTER GYM &amp; CROSSFIGHT ARÉNA</span>
          <span>HATVAN — 2015</span>
        </div>
      </div>
    ),
    size,
  );
}
