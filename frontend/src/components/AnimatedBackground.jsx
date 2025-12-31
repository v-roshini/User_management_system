// src/components/AnimatedBackground.jsx
import React from "react";
import "./styles/animated-bg.css";

// Floating 3D shapes component
const FloatingShape = ({ children, delay = 100, x, y, rotate = 12 }) => (
  <div
    className="floating-shape"
    style={{
      left: x,
      top: y,
      animationDelay: `${delay}s`,
      "--rotate-start": `${rotate}deg`,
      "--rotate-end": `${rotate + 10}deg`,
    }}
  >
    {children}
  </div>
);

// 3D Isometric cube
const IsometricCube = ({ color, size = 90 }) => (
  <div className="isometric-cube" style={{ width: size, height: size }}>
    <div
      className="cube-face"
      style={{
        background: color,
        width: size,
        height: size,
      }}
    />
  </div>
);

// Arrow shape
const ArrowShape = ({ color, direction = "right" }) => (
  <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
    <path
      d={
        direction === "right"
          ? "M20 0 L60 0 L100 40 L60 80 L20 80 L50 40 Z"
          : "M100 0 L60 0 L20 40 L60 80 L100 80 L70 40 Z"
      }
      fill={color}
      style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.3))" }}
    />
  </svg>
);

// Pyramid
const Pyramid = ({ color }) => (
  <svg width="60" height="70" viewBox="0 0 60 70" fill="none">
    <path
      d="M30 0 L60 70 L0 70 Z"
      fill={color}
      style={{ filter: "drop-shadow(0 5px 15px rgba(0,0,0,0.3))" }}
    />
  </svg>
);

// Ring
const Ring = ({ color }) => (
  <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
    <circle
      cx="25"
      cy="25"
      r="20"
      stroke={color}
      strokeWidth="6"
      fill="none"
      style={{ filter: "drop-shadow(0 5px 15px rgba(0,0,0,0.3))" }}
    />
  </svg>
);

export default function AnimatedBackground() {
  return (
    <div className="animated-background">
      {/* Animated gradient overlay */}
      <div className="gradient-overlay" />

      {/* Floating geometric shapes */}
      <FloatingShape x="5%" y="10%" delay={0}>
        <ArrowShape color="#FF1493" direction="right" />
      </FloatingShape>

      <FloatingShape x="85%" y="50%" delay={0.2}>
        <ArrowShape color="#FF69B4" direction="left" />
      </FloatingShape>

      <FloatingShape x="10%" y="60%" delay={0.4}>
        <ArrowShape color="#00FF00" direction="right" />
      </FloatingShape>

      <FloatingShape x="15%" y="30%" delay={0.6} rotate={45}>
        <IsometricCube color="#FF69B4" size={50} />
      </FloatingShape>

      <FloatingShape x="80%" y="20%" delay={0.3} rotate={-30}>
        <IsometricCube color="rgba(255, 105, 180, 0.6)" size={40} />
      </FloatingShape>

      <FloatingShape x="75%" y="75%" delay={0.5} rotate={20}>
        <IsometricCube color="#FF1493" size={35} />
      </FloatingShape>

      <FloatingShape x="20%" y="80%" delay={0.7}>
        <Pyramid color="#FFD700" />
      </FloatingShape>

      <FloatingShape x="85%" y="85%" delay={0.8}>
        <Pyramid color="#FFA500" />
      </FloatingShape>

      <FloatingShape x="90%" y="10%" delay={0.4}>
        <Pyramid color="#FFFF00" />
      </FloatingShape>

      <FloatingShape x="8%" y="45%" delay={0.9}>
        <Ring color="#FFD700" />
      </FloatingShape>

      <FloatingShape x="25%" y="15%" delay={0.6}>
        <Ring color="rgba(255, 255, 255, 0.5)" />
      </FloatingShape>

      {/* Small decorative dots */}
      {[...Array(25)].map((_, i) => (
        <FloatingShape
          key={i}
          x={`${Math.random() * 90 + 5}%`}
          y={`${Math.random() * 90 + 5}%`}
          delay={Math.random()}
        >
          <div
            className="decorative-dot"
            style={{
              width: Math.random() * 15 + 5,
              height: Math.random() * 15 + 5,
              background: ["#FFD700", "#FF69B4", "#00FF00", "#FFA500"][
                Math.floor(Math.random() * 4)
              ],
            }}
          />
        </FloatingShape>
      ))}
    </div>
  );
}
