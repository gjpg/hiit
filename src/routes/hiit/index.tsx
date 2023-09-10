import { component$, useStore, useContext, useContextProvider, createContextId, $, QRL } from '@builder.io/qwik';

interface IntervalContext {
  restColour: string;
  sprintColour: string;
  labelColour: string;
  radius: number;
  restDuration: number[];
  sprintDuration: number;
  warmupDuration: number;
  cooldownDuration: number;
  svgWidth: number;
  svgHeight: number;
  strokeWidth: number;
  cx: string;
  cy: string;
}

interface IntervalProps {
  intervalIndex: number;
}
export const InputContext = createContextId<IntervalContext>('docs.theme-context');

interface ArcProps {
  startAngle: number; // 0 -> 360
  endAngle: number; // 0 -> 360
  width: number;
  colour: string;
}
export const Arc = component$<ArcProps>(({colour, endAngle, startAngle, width}) => {
  const {
    radius,
    circumference,
    centreWidth,
    centreHeight,
    cx,
    cy,
  } = useHIITContext();
  const arcLength = circumference * (endAngle - startAngle) / 360;

  return (
      <circle
        onMouseover$={() => console.log('Hello')}
        cx={cx}
        cy={cy}
        r={radius}
        stroke={colour}
        stroke-width={width}
        fill="none"
        transform={`rotate(${startAngle}, ${centreWidth}, ${centreHeight})`}
        stroke-dasharray={[arcLength, circumference - arcLength]}
      />
  )
});


interface DurationProps {
  startTime: number;
  duration: number;
  width: number;
  colour: string;
}

export const Duration = component$<DurationProps>(({startTime, duration, colour, width}) => {
  const {degreesPerSecond, labelSize} = useHIITContext();
  const labelEndAngle = 90 + 360 * labelSize / 2
  const startAngle = labelEndAngle + startTime * degreesPerSecond;

  return <Arc startAngle={startAngle} endAngle={startAngle + duration * degreesPerSecond} width={width} colour={colour} />
});

export const Warmup = component$(() => {
  const { warmupDuration, restColour, strokeWidth} = useHIITContext();

  return <Duration startTime={0} duration={warmupDuration} colour={restColour} width={strokeWidth}/>
});

export const CoolDown = component$(() => {
  const { cooldownDuration, restColour, strokeWidth, restDuration, sprintDuration, warmupDuration} = useHIITContext();
  const intervalsSoFar = restDuration.reduce((tally, current) => tally + current + sprintDuration, 0);
  const startTime = warmupDuration + intervalsSoFar;

  return <Duration startTime={startTime} duration={cooldownDuration} colour={restColour} width={strokeWidth}/>
});


export const Interval = component$(({index}: {index: number}) => {
  const {sprintColour, restColour, sprintDuration, strokeWidth, restDuration, warmupDuration} = useHIITContext();
  const intervalsSoFar = restDuration.slice(0, index).reduce((tally, current) => tally + current + sprintDuration, 0);
  const startTime = warmupDuration + intervalsSoFar;

  return (
    <>
      <Duration startTime={startTime} duration={sprintDuration} width={strokeWidth} colour={sprintColour} />
      <Duration startTime={startTime + sprintDuration} duration={restDuration[index]} width={strokeWidth} colour={restColour} />
    </>
  )
})

// export const Interval = component$(({ intervalIndex }: IntervalProps) => {
//   const {
//     labelSize,
//     restColour,
//     sprintColour,
//     restDuration,
//     sprintDuration,
//     radius,
//     warmupDuration,
//     strokeWidth,
//     circumference,
//     degreesPerSecond,
//     centreWidth,
//     centreHeight,
//     workoutDuration,
//     warmupStartAngle,
//     cx,
//     cy,
//   } = useHIITContext();
//
//   const workoutDisplay = (1 - labelSize) * circumference;
//   //^reused
//   const intervalDegrees = degreesPerSecond * (restDuration[intervalIndex] + sprintDuration);
//   // const sprintSegment = workoutDisplay * (sprintDuration / workoutDuration);
//   const sprintSegment = sprintDuration * degreesPerSecond;
//   // const restSegment = workoutDisplay * (restDuration[intervalIndex] / workoutDuration);
//   const restSegment = restDuration[intervalIndex] * degreesPerSecond;
//   const completedRests = restDuration.slice(0, intervalIndex);
//   const sprintStartTime =
//     warmupDuration +
//     intervalIndex * sprintDuration +
//     completedRests.reduce((tally, current) => tally + current + sprintDuration, 0);
//
//   //const sprintStartAngle =
//   //  warmupStartAngle + (360 * warmupDuration * (1 - labelSize)) / workoutDuration + intervalDegrees * intervalIndex;
//   const sprintStartAngle = warmupStartAngle + sprintStartTime * degreesPerSecond;
//
//   //const restStartAngle = sprintStartAngle + (360 * sprintDuration * (1 - labelSize)) / workoutDuration;
//   const restStartAngle = sprintStartAngle + sprintDuration * degreesPerSecond;
//
//   return (
//     <>
//       <circle
//         cx={cx}
//         cy={cy}
//         r={radius}
//         stroke={sprintColour}
//         stroke-width={strokeWidth - 5}
//         fill="none"
//         transform={`rotate(${sprintStartAngle}, ${centreWidth}, ${centreHeight})`}
//         stroke-dasharray={[sprintSegment, circumference - sprintSegment]}
//       />
//
//       <circle
//         cx={cx}
//         cy={cy}
//         r={radius}
//         // stroke={restColour}
//         stroke="yellow"
//         stroke-width={strokeWidth - 15}
//         fill="none"
//         transform={`rotate(${restStartAngle}, ${centreWidth}, ${centreHeight})`}
//         stroke-dasharray={[restSegment, circumference - restSegment]}
//       />
//     </>
//   );
// });

export const WarmupCooldown = component$(() => {
  const {
    labelSize,
    restColour,
    radius,
    warmupDuration,
    cooldownDuration,
    strokeWidth,
    labelStartAngle,
    circumference,
    centreWidth,
    centreHeight,
    workoutDuration,
    warmupStartAngle,
    degreesPerSecond,
    cx,
    cy,
  } = useHIITContext();

  const workoutDisplay = (1 - labelSize) * circumference;
  // const warmupSegment = (workoutDisplay * (warmupDuration / workoutDuration)) / 0.7;
  const warmupSegment = warmupStartAngle + warmupDuration * degreesPerSecond;
  const cooldownSegment = (workoutDisplay * (cooldownDuration / workoutDuration)) / 0.7;
  const cooldownStartAngle = labelStartAngle - (warmupSegment / circumference) * 360;

  return (
    <>
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke={restColour}
        stroke-width={strokeWidth}
        fill="none"
        transform={`rotate(${warmupStartAngle}, ${centreWidth}, ${centreHeight})`}
        stroke-dasharray={[warmupSegment, circumference - warmupSegment]}
      />

      <circle
        cx={cx}
        cy={cy}
        r={radius}
        // stroke={restColour}
        stroke="purple"
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
  const { radius, warmupDuration, cooldownDuration, restDuration, sprintDuration, svgWidth, svgHeight } = ctx;
  const labelSize = 0.3;
  const workoutDuration =
    warmupDuration +
    cooldownDuration +
    restDuration.reduce((tally, current) => tally + current + sprintDuration, 0);
  const exerciseProgramAngle = (1 - labelSize) * 360;
  const degreesPerSecond = exerciseProgramAngle / workoutDuration;
  const centreWidth = svgWidth / 2;
  const centreHeight = svgHeight / 2;
  const labelStartAngle = 90 - (labelSize / 2) * 360;
  const warmupStartAngle = 90 + (labelSize / 2) * 360;

  console.log({workoutDuration});

  return {
    ...ctx,
    labelSize,
    circumference: radius * Math.PI * 2,
    workoutDuration,
    degreesPerSecond,
    centreWidth,
    centreHeight,
    labelStartAngle,
    warmupStartAngle, // a.k.a. programStartAngle
  };
}

export const Label = component$(({}) => {
  const {
    radius,
    labelColour,
    strokeWidth,
    labelSize,
    circumference,
    centreWidth,
    centreHeight,
    labelStartAngle,
    cx,
    cy,
  } = useHIITContext();

  return (
    <circle
      cx={cx}
      cy={cy}
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
  const state = useStore<IntervalContext>({
    restColour: 'green',
    sprintColour: 'red',
    restDuration: [90, 75, 60, 45, 35, 30, 30, 30, 30, 40, 0],
    sprintDuration: 30,
    radius: 90,
    warmupDuration: 5 * 60,
    cooldownDuration: 3 * 60,
    labelColour: 'blue',
    svgWidth: 300,
    svgHeight: 300,
    strokeWidth: 20,
    cx: '50%',
    cy: '50%',
  });

  useContextProvider(InputContext, state);

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <Label />
      <Warmup />
      {new Array(state.restDuration.length).fill(0).map((_, index) => (
          <Interval index={index} />
      ))}
      <CoolDown />
      {/*<Duration startTime={0} duration={state.cooldownDuration} width={state.strokeWidth} colour="green" />*/}
      {/*<WarmupCooldown />*/}

      {/*/!*<>*!/*/}
      {/*/!*  {new Array(state.restDuration.length + 1).fill(0).map((_, index) => (*!/*/}
      {/*/!*    <Interval intervalIndex={index} />*!/*/}
      {/*/!*  ))}*!/*/}
      {/*/!*</>*!/*/}
      {/*<Interval intervalIndex={0} />*/}

      {/*/!*<WarmupCooldown time={0} />*!/*/}
    </svg>
  );
});

// TO DO
// Put all reused variables in useHIITContext
// Sort out labelSize and intervalCount so that everything can be DRYed
// Maybe find a way to give all circles the same cx and cy variable, so that they don't necessarily need to be centred
// Time
