"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export const MaskContainer = ({
  children,
  revealText,
  size = 20,
  revealSize = 400,
  className,
}: {
  children?: React.ReactNode;
  revealText?: React.ReactNode;
  size?: number;
  revealSize?: number;
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const updateMousePosition = (e: MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useEffect(() => {
    const currentRef = containerRef.current;
    if (currentRef) {
        currentRef.addEventListener("mousemove", updateMousePosition);
        return () => {
            currentRef.removeEventListener("mousemove", updateMousePosition);
        };
    }
  }, []);

  let maskSize = isHovered ? revealSize : size;

  return (
    <motion.div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Base layer (revealed on hover). White BG, Black text */}
      <div className="absolute inset-0 bg-white text-black w-full h-full">
        {revealText}
      </div>

      {/* Top layer (default state). Black BG, White text. This is what gets masked. */}
      <motion.div
        className="w-full h-full absolute inset-0 bg-black text-white"
        style={{
          maskImage: "url(/mask.svg)",
          maskRepeat: "no-repeat",
          maskSize: `${size}px`, // Initial size
        }}
        animate={{
          WebkitMaskPosition: `${mousePosition.x - maskSize / 2}px ${
            mousePosition.y - maskSize / 2
          }px`,
          WebkitMaskSize: `${maskSize}px`,
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
