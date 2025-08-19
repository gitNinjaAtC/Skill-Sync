import React from "react";
import Particles from "@tsparticles/react";
import { loadAll } from "@tsparticles/all";

const Particle = () => {
  const particlesInit = async (engine) => {
    await loadAll(engine); // ✅ correct loader function
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: false },
        particles: {
          number: {
            value: 80,
            density: { enable: true, area: 800 },
          },
          color: { value: "#ffffff" },
          shape: { type: "circle" },
          opacity: { value: 0.5 },
          size: { value: 2 },
          move: {
            enable: true,
            speed: 0.3,
            direction: "right",
            outModes: { default: "out" },
          },
        },
        interactivity: {
          events: {
            onClick: { enable: true, mode: "push" },
          },
          modes: {
            push: { quantity: 1 },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default Particle;
