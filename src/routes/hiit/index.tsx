import { component$ } from '@builder.io/qwik';

interface CircleProps {
  labelSegment: number; // 0 -> 1
}

interface IntervalProps {
  labelsize: number;
  restcolour: string;
  sprintcolour: string;
  labelcolour: string;
  radius: number;
  restduration: number;
  sprintduration: number;
  intervalcount: number;
  warmupduration: number;
  svgwidth: number;
  svgheight: number;
  strokewidth: number;
}

export const Interval = component$(
  ({
    labelsize = 0.3,
    restcolour = 'green',
    sprintcolour = 'red',
    restduration = 40,
    sprintduration = 60,
    radius = 90,
    intervalcount = 5,
    warmupduration = 150,
    labelcolour = 'blue',
    svgwidth = 300,
    svgheight = 300,
    strokewidth = 20,
  }: IntervalProps) => {
    const workoutduration = 2 * warmupduration + intervalcount * (sprintduration + restduration) - restduration;
    const circumference = radius * Math.PI * 2;
    const workoutdisplay = (1 - labelsize) * circumference;
    const warmupsegment = workoutdisplay * (warmupduration / workoutduration);
    const sprintsegment = workoutdisplay * (sprintduration / workoutduration);
    const restsegment = workoutdisplay * (sprintduration / workoutduration);
    const centrewidth = svgwidth / 2;
    const centreheight = svgheight / 2;
    const labelstartangle = 90 - (labelsize / 2) * 360;
    const warmupstartangle = 90 + (labelsize / 2) * 360;
    const cooldownstartangle = labelstartangle - (warmupsegment / circumference) * 360;

    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={svgwidth} height={svgheight}>
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke={labelcolour}
          stroke-width={strokewidth}
          fill="none"
          transform={`rotate(${labelstartangle}, ${centrewidth}, ${centreheight}`}
        />

        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke={restcolour}
          stroke-width={strokewidth}
          fill="none"
          transform={`rotate(${warmupstartangle}, ${centrewidth}, ${centreheight}`}
          stroke-dasharray={[warmupsegment, circumference - warmupsegment]}
        />

        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke={restcolour}
          stroke-width={strokewidth}
          fill="none"
          transform={`rotate(${cooldownstartangle}, ${centrewidth}, ${centreheight}`}
          stroke-dasharray={[warmupsegment, circumference - warmupsegment]}
        />
      </svg>
    );
  },
);

export default component$(({ labelSegment = 0.25 }: CircleProps) => {
  const radius = 90;
  const circumference = radius * 2 * Math.PI;
  const workoutPathLength = (1 - labelSegment) * circumference;

  //user defined run parameters
  const warmup = 120;
  const sprint = 40;
  const rest = 60;
  const sprintCount = 5;

  console.log('circumference', circumference);

  //tally up how many seconds the run will last
  const sumSeconds = 2 * warmup + sprintCount * (sprint + rest) - rest;
  // const sumSeconds = 400;
  console.log('sumSeconds', sumSeconds);

  const labelAngle = 90 - (labelSegment / 2) * 360;
  const warmupAngle = 90 + (labelSegment / 2) * 360;
  const warmupLength = workoutPathLength * (warmup / sumSeconds);
  console.log('warmupLength', warmupLength);
  const winddownAngle = labelAngle - (warmupLength / circumference) * 360;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <circle cx="50%" cy="50%" r={radius} stroke="none" stroke-width="20" fill="none" />

      <circle
        cx="50%"
        cy="50%"
        r={radius}
        stroke="green"
        stroke-width="20"
        fill="none"
        transform={`rotate(${warmupAngle}, 150, 150)`}
        stroke-dasharray={[warmupLength, circumference - warmupLength]}
      />

      <circle
        cx="50%"
        cy="50%"
        r={radius}
        stroke="yellow"
        stroke-width="20"
        fill="none"
        transform={`rotate(${winddownAngle}, 150, 150)`}
        stroke-dasharray={[warmupLength, circumference - warmupLength]}
      />

      <circle
        cx="50%"
        cy="50%"
        r={radius}
        stroke="blue"
        stroke-width="10"
        fill="none"
        transform={`rotate(${labelAngle}, 150, 150)`}
        stroke-dasharray={[labelSegment, 1 - labelSegment].map((l) => l * circumference)}
      />
    </svg>
  );
});
