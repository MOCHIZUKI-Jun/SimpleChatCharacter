export type ConditionFunction = () => boolean;

export const waitUntil = (
  condFunc: ConditionFunction,
  checkIntervalMs = 22,
): Promise<void> => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (condFunc()) {
        clearInterval(interval);
        resolve();
      }
    }, checkIntervalMs);
  });
};

export const waitMilliSeconds = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
