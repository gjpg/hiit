import { component$ } from '@builder.io/qwik';

export const HeartGraph = component$<RateTimeGraph>(({ plots, clip, rateThresholds }) => {
  // {maxHeartRate: {rate: 200, className: "Danger"}, fatBurning: {rate: 120, className: "FatBurning"}} -->
  // [["maxHeartRate", {rate: 200, className: "Danger"}], ...] -->
  // [<line x1 y1 x2 y2 className>, <line x1 y1 x2 y2 className>]
  const thresholds = Object.entries(rateThresholds).map(([name, { rate, className }]) => {
    console.log(name);
    return (
      <>
        <line x1={100} y1={rate} x2={550} y2={rate} className={className} />
        <g transform={`scale(1, -1) translate(0, -${2 * rate})`}>
          <text x={105} y={rate - 5}>
            {name}
          </text>
        </g>
      </>
    );
  });

  const polyLines = plots.map((plot, index) => {
    const { points, className } = plot;
    return <polyline key={index} points={points.map(({ x, y }) => `${x},${y}`).join(' ')} className={className} />;
  });

  const timeZones = plots.map((plot, index) => {
    const { timeZones } = plot;
    return timeZones.map((zone) => {
      const { className, start, end } = zone;
      return <rect x={start} y={50} width={end - start} height={300} className={className} />;
    });
  });

  return (
    <div>
      <svg width="600" height="400" id="graph" style={{ margin: 100 }}>
        <g transform="scale(1,-1) translate(0, -300)">
          {timeZones.flat()}
          {thresholds}
          {polyLines}

          <text x="95" y="370">
            X1
          </text>
          <text x="145" y="370">
            X2
          </text>
          <text x="195" y="370">
            X3
          </text>
          <text x="245" y="370">
            X4
          </text>
          <text x="295" y="370">
            X5
          </text>
          <text x="345" y="370">
            X6
          </text>
          <text x="395" y="370">
            X7
          </text>
          <text x="445" y="370">
            X8
          </text>
          <text x="495" y="370">
            X9
          </text>
          <text x="545" y="370">
            X10
          </text>

          <text x="40" y="55">
            Y1
          </text>
          <text x="40" y="105">
            Y2
          </text>
          <text x="40" y="155">
            Y3
          </text>
          <text x="40" y="205">
            Y4
          </text>
          <text x="40" y="255">
            Y5
          </text>
          <text x="40" y="305">
            Y6
          </text>
        </g>
      </svg>
    </div>
  );
});

export default component$(() => {
  const points = '-100,120 100,200 150,250 200,100 250,300 300,180 350,220 400,130 450,250 500,200 550,120'
    .split(' ')
    .map((xyPair) => xyPair.split(','))
    .map(([x, y]) => ({ x: +x, y: +y }));
  const className = 'colour-red';

  return (
    <HeartGraph
      plots={[
        { timeZones: [{ start: 100, end: 200, className: 'colour-white' }], points, className },
        {
          timeZones: [{ start: 200, end: 300, className: 'colour-grey' }],
          points: points.map(({ x, y }) => ({ x, y: y + 10 })),
          className: 'colour-green',
        },
      ]}
      clip={[1, 2, 3, 4]}
      rateThresholds={{
        maxHeartRate: { rate: 200, className: 'danger' },
        fatBurning: { rate: 120, className: 'fat-burning' },
      }}
    />
  );
});
