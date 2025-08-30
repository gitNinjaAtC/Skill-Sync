import React from "react";
import { motion } from "framer-motion";

const WavyText = ({ text = "Skill-Sync" }) => {
  const staggerDelay = 0.15;

  return (
    <span style={{ display: "inline-block" }}>
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          style={{ display: "inline-block" }}
          animate={{ y: [-15, 15  ] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: -staggerDelay * text.length + index * staggerDelay,
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
};

export default WavyText;
