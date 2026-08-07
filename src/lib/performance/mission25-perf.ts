const PREFIX = "[MISSION25-PERF]";

export function startMission25Perf(): number {
  return performance.now();
}

export function logMission25Perf(label: string, startedAt: number): void {
  const duration = Math.max(0, performance.now() - startedAt);
  console.info(`${PREFIX} ${label} duration=${duration.toFixed(1)}ms`);
}
