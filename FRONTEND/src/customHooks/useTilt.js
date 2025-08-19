import { useEffect } from "react";

const useTilt = (ref) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;

      const rotateX = (y - 0.5) * 15; // max 15deg tilt
      const rotateY = (x - 0.5) * 15;

      el.style.transform = `perspective(600px) rotateX(${ -rotateX }deg) rotateY(${ rotateY }deg)`;
    };

    const reset = () => {
      el.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg)";
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", reset);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", reset);
    };
  }, [ref]);
};

export default useTilt;
