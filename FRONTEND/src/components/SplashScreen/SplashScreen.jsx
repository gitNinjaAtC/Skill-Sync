import React, { useEffect, useState } from "react";
import "./SplashScreen.scss";

const SplashScreen = ({ onFinish }) => {
  const [phase, setPhase] = useState("enter"); // enter → logo → tagline → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("logo"), 300);
    const t2 = setTimeout(() => setPhase("tagline"), 1200);
    const t3 = setTimeout(() => setPhase("exit"), 2600);
    const t4 = setTimeout(() => onFinish?.(), 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

  return (
    <div className={`splash-screen splash-${phase}`}>
      {/* Animated background blobs */}
      <div className="splash-blob blob-1" />
      <div className="splash-blob blob-2" />
      <div className="splash-blob blob-3" />

      {/* Particle dots */}
      <div className="splash-particles">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="particle" style={{ "--i": i }} />
        ))}
      </div>

      {/* Center content */}
      <div className="splash-content">
        {/* Logo ring */}
        <div className="logo-ring">
          <svg className="ring-svg" viewBox="0 0 120 120" fill="none">
            <circle
              cx="60" cy="60" r="54"
              stroke="url(#ringGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="339.3"
              strokeDashoffset="339.3"
              className="ring-circle"
            />
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#5271ff" />
                <stop offset="100%" stopColor="#279AF1" />
              </linearGradient>
            </defs>
          </svg>

          <div className="logo-inner">
            <img
              src="/SISTec_Logo.png"
              alt="SISTec Alumni"
              className="splash-logo-img"
            />
          </div>
        </div>

        {/* App name */}
        <div className="splash-title">
          <span className="title-word t1">Alumni</span>
          <span className="title-dot">·</span>
          <span className="title-word t2">Connect</span>
        </div>

        {/* Tagline */}
        <p className="splash-tagline">Connect. Collaborate. Grow.</p>

        {/* Loading bar */}
        <div className="splash-loader">
          <div className="loader-track">
            <div className="loader-fill" />
          </div>
        </div>
      </div>

      {/* Bottom institution name */}
      <div className="splash-footer">
        <span>SISTec Alumni Portal</span>
      </div>
    </div>
  );
};

export default SplashScreen;
