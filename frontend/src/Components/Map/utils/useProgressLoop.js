

import { useEffect, useState } from "react";

const useProgressLoop = ({ duration = 10 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame;
    const startTime = performance.now();

    const loop = (now) => {
      const elapsed = (now - startTime) / 1000; // in seconds
      const newProgress = (elapsed % duration) / duration;
      setProgress(newProgress);
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [duration]);

  return progress;
};

export default useProgressLoop;

