// Lets a screen close every open chart tooltip when the user touches anywhere else,
// without re-rendering the screen on each touch: charts subscribe, the screen calls
// dismissChartTooltips() from an onTouchStart around its content.
const listeners = new Set<() => void>();

export function subscribeToChartTooltipDismiss(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function dismissChartTooltips() {
  for (const listener of listeners) listener();
}
