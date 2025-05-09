const getColourByAlertPriority = (priority, max = 10) => {
  const inverted = Math.max(0, Math.min(priority - 1, max - 1)) / (max - 1); // normalize 0–1
  const gb = Math.floor(255 * inverted); // lower priority = redder (less green/blue)
  return [255, gb, gb]; // red channel always max
};

export default getColourByAlertPriority;
