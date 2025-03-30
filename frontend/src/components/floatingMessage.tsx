"use client"
import { useEffect, useState } from "react";

interface FloatingMessageProps {
  message: string;
  duration?: number;
}

export default function FloatingMessage({ message, duration = 3000 }: FloatingMessageProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="floating-message">
      {message}
      <style jsx>{`
        .floating-message {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(0, 235, 0, 0.8);
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          transition: opacity 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
