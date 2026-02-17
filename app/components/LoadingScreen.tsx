'use client';

import { useState, useRef, useEffect } from 'react';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Fallback: hide after 3 seconds if video doesn't load/play
    const fallbackTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, []);

  const handleVideoEnd = () => {
    setFadeOut(true);
  };

  const handleError = () => {
    // If video fails to load, fade out immediately
    setFadeOut(true);
  };

  const handleTransitionEnd = () => {
    if (fadeOut) {
      setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      className={`loading-overlay ${fadeOut ? 'fade-out' : ''}`}
      onTransitionEnd={handleTransitionEnd}
    >
      <video
        ref={videoRef}
        className="loading-video"
        src="/loading.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleVideoEnd}
        onError={handleError}
      />
    </div>
  );
}
