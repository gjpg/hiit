import { component$, $ } from '@builder.io/qwik';

interface CircleProps {
  labelSegment: number; // 0 -> 1
}

interface Arc {
  radius: number;
  start: number; // 0 -> 1, 0 == 6 O'Clock
  end: number;
  width: number;
  colour: string;
}

export default component$(({ labelSegment = 0.4}: CircleProps) => {
  const radius = 90;
  const pathLength = radius * 2 * Math.PI;

  //user defined run parameters
  const warmup = 200;
  const sprint = 40;
  const rest = 60;
  const sprintCount = 5;

  console.log('pathLength', pathLength);

  //tally up how many seconds the run will last
  const sumSeconds = (2 * warmup) + (sprintCount * (sprint + rest)) - rest;
  console.log('sumSeconds', sumSeconds);

  const labelAngle = 90 - (labelSegment / 2) * 360;
  const warmupAngle = 90 + ((labelSegment / 2) * 360);
  const warmupLength = (pathLength * (warmup / sumSeconds));
  console.log("warmupLength", warmupLength);
  const winddownAngle = (labelAngle - ((warmupLength / pathLength) * 360))


  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <circle cx="50%" cy="50%" r={radius} stroke="none" stroke-width="20" fill="none" />

      <circle
      cx="50%"
      cy="50%"
      r={radius}
      stroke="green"
      stroke-width= "20"
      fill="none"
      transform={`rotate(${warmupAngle}, 150, 150)`}
      stroke-dasharray={[warmupLength, pathLength - warmupLength]}
      />
      
      <circle
      cx="50%"
      cy="50%"
      r={radius}
      stroke="green"
      stroke-width= "20"
      fill="none"
      transform={`rotate(${winddownAngle}, 150, 150)`}
      stroke-dasharray={[warmupLength, pathLength - warmupLength]}
      />

      <circle
      cx="50%"
      cy="50%"
      r={radius}
      stroke="blue"
      stroke-width="20"
      fill="none"
      transform={`rotate(${labelAngle}, 150, 150)`}
      stroke-dasharray={[labelSegment, 1 - labelSegment].map((l) => l * pathLength)}
      />

    </svg>
  );
});