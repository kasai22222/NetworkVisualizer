import { useEffect, useRef } from "react";

const useProgressLoop = ({ duration = 10 }) => {
  const progressRef = useRef(0);

  useEffect(() => {
    let frame;
    const startTime = performance.now();

    const loop = (now) => {
      const elapsed = (now - startTime) / 1000; // in seconds
      progressRef.current = (elapsed % duration) / duration;
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [duration]);

  return progressRef;
};

export default useProgressLoop;

