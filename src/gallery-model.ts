export function selectIndex(index: number, count: number): number {
  if (count < 1) throw new RangeError("A gallery needs at least one project.");
  return Math.max(0, Math.min(count - 1, Math.trunc(index)));
}

export function swipeDirection(dx: number, dy: number): number {
  return Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.25
    ? dx < 0
      ? 1
      : -1
    : 0;
}
