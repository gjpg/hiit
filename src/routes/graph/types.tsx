// The x-axis (horizontal) is "time" and the y-axis (vertical) is "rate" (a.k.a "heart rate")
// *UNLIKE SVG* increasing rate moves upward from the bottom (not the top)

interface Plot {
  // vertical bands behind the line
  timeZones: { start: number; end: number; className: string }[];

  // a continuous line
  points: { x: number; y: number }[];

  // the class name to apply to the line
  className: string;
}

// the internal coordinate system of the graph
type ViewPort = [minX: number, minY: number, width: number, height: number];

// a horizontal line used for drawing heart rate zones
interface Threshold {
  rate: number;
  className: string;
}

interface RateTimeGraph {
  clip: ViewPort;
  rateThresholds: Record<string, Threshold>;
  plots: Plot[];
}
