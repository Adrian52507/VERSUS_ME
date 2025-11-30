"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function HoverCard({ children, content }) {
  const anchorRef = useRef(null);
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleEnter = () => {
    if (isMobile) return;
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 10,
      });
    }
    setShow(true);
  };

  const handleLeave = () => {
    if (isMobile) return;
    setShow(false);
  };

  const handleMobileToggle = () => {
    if (!isMobile) return;
    setCoords({
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.4,
    });
    setShow(!show);
  };

  return (
    <>
      <div
        ref={anchorRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onClick={handleMobileToggle}
        className="inline-block"
      >
        {children}
      </div>

      {show &&
        createPortal(
          <div
            className={`
              fixed z-[9999] p-4 rounded-xl shadow-2xl border border-gray-200
              bg-white text-black 
              transition-all duration-200
              ${isMobile ? "w-[80vw]" : "w-64"}
            `}
            style={{
              left: coords.x,
              top: coords.y,
              transform: isMobile
                ? "translate(-50%, -15%)"
                : "translate(3%, 0%)",
            }}
            onMouseEnter={!isMobile ? () => setShow(true) : undefined}
            onMouseLeave={!isMobile ? handleLeave : undefined}
          >
            {content}

            {isMobile && (
              <button
                onClick={() => setShow(false)}
                className="mt-3 w-full py-2 bg-black text-white rounded-lg"
              >
                Cerrar
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
