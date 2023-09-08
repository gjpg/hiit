import { component$, useStore, useContext, useContextProvider, createContextId, $, QRL } from '@builder.io/qwik';
interface IntervalContext {
  labelSize: number;
  restColour: string;
  sprintColour: string;
  labelColour: string;
  radius: number;
  restDuration: number;
  sprintDuration: number;
  workoutDuration: number;
  intervalCount: number;
  warmupDuration: number;
  svgWidth: number;
  svgHeight: number;
  strokeWidth: number;
}

interface IndexProps {
  intervalIndex: number;
}
export const InputContext = createContextId<IntervalContext>('docs.theme-context');

export const Interval = component$(({ intervalIndex }: IndexProps) => {
  const {
    labelSize,
    restColour,
    sprintColour,
    restDuration,
    sprintDuration,
    radius,
    warmupDuration,
    intervalCount,
    labelColour,
    svgWidth,
    svgHeight,
    strokeWidth,
    circumference,
    degreesPerSecond,
    centreWidth,
    centreHeight,
    workoutDuration,
    warmupStartAngle,
  } = useHIITContext();

  const workoutDisplay = (1 - labelSize) * circumference;
  //^reused
  const intervalDegrees = degreesPerSecond * (restDuration + sprintDuration);
  const sprintSegment = workoutDisplay * (sprintDuration / workoutDuration);
  const restSegment = workoutDisplay * (restDuration / workoutDuration);
  const sprintStartAngle =
    warmupStartAngle + (360 * warmupDuration * (1 - labelSize)) / workoutDuration + intervalDegrees * intervalIndex;
  const restStartAngle = sprintStartAngle + (360 * sprintDuration * (1 - labelSize)) / workoutDuration;

  return (
    <>
      <circle
        cx="50%"
        cy="50%"
        r={radius}
        stroke={sprintColour}
        stroke-width={strokeWidth}
        fill="none"
        transform={`rotate(${sprintStartAngle}, ${centreWidth}, ${centreHeight})`}
        stroke-dasharray={[sprintSegment, circumference - sprintSegment]}
      />

      <circle
        cx="50%"
        cy="50%"
        r={radius}
        stroke={restColour}
        stroke-width={strokeWidth}
        fill="none"
        transform={`rotate(${restStartAngle}, ${centreWidth}, ${centreHeight})`}
        stroke-dasharray={[restSegment, circumference - restSegment]}
      />
    </>
  );
});

export const WarmupCooldown = component$(({ intervalIndex }: IndexProps) => {
  const {
    labelSize,
    restColour,
    radius,
    warmupDuration,
    strokeWidth,
    labelStartAngle,
    circumference,
    centreWidth,
    centreHeight,
    workoutDuration,
    warmupStartAngle,
  } = useHIITContext();

  const workoutDisplay = (1 - labelSize) * circumference;
  const warmupSegment = workoutDisplay * (warmupDuration / workoutDuration);
  const cooldownStartAngle = labelStartAngle - (warmupSegment / circumference) * 360;

  return (
    <>
      <circle
        cx="50%"
        cy="50%"
        r={radius}
        stroke={restColour}
        stroke-width={strokeWidth}
        fill="none"
        transform={`rotate(${warmupStartAngle}, ${centreWidth}, ${centreHeight})`}
        stroke-dasharray={[warmupSegment, circumference - warmupSegment]}
      />

      <circle
        cx="50%"
        cy="50%"
        r={radius}
        stroke={restColour}
        stroke-width={strokeWidth}
        fill="none"
        transform={`rotate(${cooldownStartAngle}, ${centreWidth}, ${centreHeight})`}
        stroke-dasharray={[warmupSegment, circumference - warmupSegment]}
      />
    </>
  );
});

function useHIITContext() {
  const ctx = useContext(InputContext);
  const { radius, warmupDuration, intervalCount, restDuration, sprintDuration, labelSize, svgWidth, svgHeight } = ctx;
  const workoutDuration = 2 * warmupDuration + intervalCount * (restDuration + sprintDuration) - restDuration;
  const exerciseProgramAngle = (1 - labelSize) * 360;
  const degreesPerSecond = exerciseProgramAngle / workoutDuration;
  const centreWidth = svgWidth / 2;
  const centreHeight = svgHeight / 2;
  const labelStartAngle = 90 - (labelSize / 2) * 360;
  const warmupStartAngle = 90 + (labelSize / 2) * 360;

  return {
    ...ctx,
    circumference: radius * Math.PI * 2,
    workoutDuration,
    degreesPerSecond,
    centreWidth,
    centreHeight,
    labelStartAngle,
    warmupStartAngle,
  };
}

export const Label = component$(({}) => {
  const { radius, labelColour, strokeWidth, labelSize, circumference, centreWidth, centreHeight, labelStartAngle } =
    useHIITContext();

  return (
    <circle
      cx="50%"
      cy="50%"
      r={radius}
      stroke={labelColour}
      stroke-width={strokeWidth}
      fill="none"
      transform={`rotate(${labelStartAngle}, ${centreWidth}, ${centreHeight})`}
      stroke-dasharray={[labelSize, 1 - labelSize].map((l) => l * circumference)}
    />
  );
});

export default component$(() => {
  const labelSize = 0.3;
  const radius = 90;
  const circumference = radius * 2 * Math.PI;
  const workoutPathLength = (1 - labelSize) * circumference;
  const warmupDuration = 150;
  const sprintDuration = 60;
  const restDuration = 40;
  const intervalCount = 5;
  const workoutDuration = 2 * warmupDuration + intervalCount * (sprintDuration + restDuration) - restDuration;
  const labelStartAngle = 90 - (labelSize / 2) * 360;
  const warmupStartAngle = 90 + (labelSize / 2) * 360;
  const warmupSegment = workoutPathLength * (warmupDuration / workoutDuration);
  const cooldownStartAngle = labelStartAngle - (warmupSegment / circumference) * 360;

  const state = useStore<IntervalContext>({
    labelSize: labelSize,
    restColour: 'green',
    sprintColour: 'red',
    restDuration: 40,
    sprintDuration: 60,
    radius: 90,
    warmupDuration: 150,
    intervalCount: 5,
    labelColour: 'blue',
    svgWidth: 300,
    svgHeight: 300,
    strokeWidth: 20,
    workoutDuration: 2 * warmupDuration + intervalCount * (restDuration + sprintDuration) - restDuration,
  });

  useContextProvider(InputContext, state);

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <Rest time={0} />
      <circle
        cx="50%"
        cy="50%"
        r={state.radius}
        stroke={state.restColour}
        stroke-width={state.strokeWidth}
        fill="none"
        transform={`rotate(${warmupStartAngle}, 150, 150)`}
        stroke-dasharray={[warmupSegment, circumference - warmupSegment]}
      />

      <circle
        cx="50%"
        cy="50%"
        r={state.radius}
        stroke={state.restColour}
        stroke-width={state.strokeWidth}
        fill="none"
        transform={`rotate(${cooldownStartAngle}, 150, 150)`}
        stroke-dasharray={[warmupSegment, circumference - warmupSegment]}
      />

      <circle
        cx="50%"
        cy="50%"
        r={state.radius}
        stroke={state.labelColour}
        stroke-width={state.strokeWidth}
        fill="none"
        transform={`rotate(${labelStartAngle}, 150, 150)`}
        stroke-dasharray={[state.labelSize, 1 - state.labelSize].map((l) => l * circumference)}
      />

      <>
        {new Array(intervalCount).fill(0).map((_, index) => (
          <Interval intervalIndex={index} />
        ))}
      </>
    </svg>
  );
});

// TO DO
// Put all reused variables in useHIITContext
// Sort out labelSize and intervalCount so that everything can be DRYed
// Maybe find a way to give all circles the same cx and cy variable, so that they don't necessarily need to be centred
// Time
