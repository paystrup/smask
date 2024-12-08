import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getRandomFoodEmoji } from "~/utils/client/getRandomFoodEmoji";

export function HoverImage({ src, alt }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (ev) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      style={{
        position: "fixed",
        left: mousePosition.x + 15,
        top: mousePosition.y + 15,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            maxWidth: "200px",
            maxHeight: "200px",
            objectFit: "cover",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        />
      ) : (
        <p className="text-4xl">{getRandomFoodEmoji()}</p>
      )}
    </motion.div>
  );
}
