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
  now: number;
}
export const InputContext = createContextId<IntervalContext>('docs.theme-context');

interface PointerProps {
  angle: number;
}
export const Pointer = component$<PointerProps>(({ angle }) => {
  const { cx, cy, centreWidth, centreHeight, radius } = useHIITContext();
  return (
    <line
      x1={cx}
      y1={cy}
      x2={radius}
      y2={cy}
      stroke-width="5"
      stroke="white"
      transform={`rotate(${angle - 180}, ${centreWidth}, ${centreHeight})`}
      fill="white"
    />
  );
});
export const ResetButton = component$(() => {
  // const ctx = useHIITContext();
  const ctx = useContext(InputContext);
  return <button onClick$={() => (ctx.now = 0)}>↺</button>;
});

export const PlayPauseButton = component$<{ onClick: QRL<() => {}> }>(({ onClick }) => {
  return <button onClick$={onClick}>⏸⏵</button>;
});
// get it to pause (clearInterval)
//stop at the end
//swap between pause and play icons
export const ForwardButton = component$<{ onClick: QRL<() => {}> }>(({ onClick }) => {
  return <button onClick$={onClick}>⏭</button>;
});

export const BackButton = component$(() => {
  return <button>⏮</button>;
});

export const TimePointer = component$<{ time: number }>(({ time }) => {
  const { degreesPerSecond, labelSize } = useHIITContext();
  const labelEndAngle = 90 + (360 * labelSize) / 2;
  const startAngle = labelEndAngle + time * degreesPerSecond;

  return <Pointer angle={startAngle} />;
});

interface ArcProps {
  startAngle: number; // 0 -> 360
  endAngle: number; // 0 -> 360
  width: number;
  colour: string;
}

// given start and end angle, render an arc. Angles start at 3:00 O'Clock and are in degrees
export const Arc = component$<ArcProps>(({ colour, endAngle, startAngle, width }) => {
  const { radius, circumference, centreWidth, centreHeight, cx, cy } = useHIITContext();
  const arcLength = (circumference * (endAngle - startAngle)) / 360;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      stroke={colour}
      stroke-width={width}
      fill="none"
      transform={`rotate(${startAngle}, ${centreWidth}, ${centreHeight})`}
      stroke-dasharray={[arcLength, circumference - arcLength]}
    />
  );
});

interface DurationProps {
  startTime: number;
  duration: number;
  width: number;
  colour: string;
}

// converts from time domain to the angle domain
export const Duration = component$<DurationProps>(({ startTime, duration, colour, width }) => {
  const { degreesPerSecond, labelSize } = useHIITContext();
  const labelEndAngle = 90 + (360 * labelSize) / 2;
  const startAngle = labelEndAngle + startTime * degreesPerSecond;

  return (
    <Arc startAngle={startAngle} endAngle={startAngle + duration * degreesPerSecond} width={width} colour={colour} />
  );
});

export const Warmup = component$(() => {
  const { warmupDuration, restColour, strokeWidth } = useHIITContext();

  return <Duration startTime={0} duration={warmupDuration} colour={restColour} width={strokeWidth} />;
});

export const CoolDown = component$(() => {
  const { cooldownDuration, restColour, strokeWidth, restDuration, sprintDuration, warmupDuration } = useHIITContext();
  const intervalsSoFar = restDuration.reduce((tally, current) => tally + current + sprintDuration, 0);
  const startTime = warmupDuration + intervalsSoFar;

  return <Duration startTime={startTime} duration={cooldownDuration} colour={restColour} width={strokeWidth} />;
});

export const Interval = component$(({ index }: { index: number }) => {
  const { sprintColour, restColour, sprintDuration, strokeWidth, restDuration, warmupDuration } = useHIITContext();
  const intervalsSoFar = restDuration.slice(0, index).reduce((tally, current) => tally + current + sprintDuration, 0);
  const startTime = warmupDuration + intervalsSoFar;

  return (
    <>
      <Duration startTime={startTime} duration={sprintDuration} width={strokeWidth} colour={sprintColour} />
      <Duration
        startTime={startTime + sprintDuration}
        duration={restDuration[index]}
        width={strokeWidth}
        colour={restColour}
      />
    </>
  );
});

function useHIITContext() {
  const ctx = useContext(InputContext);
  const { radius, warmupDuration, cooldownDuration, restDuration, sprintDuration, svgWidth, svgHeight } = ctx;
  const labelSize = 0.3;
  const workoutDuration =
    warmupDuration + cooldownDuration + restDuration.reduce((tally, current) => tally + current + sprintDuration, 0);
  const exerciseProgramAngle = (1 - labelSize) * 360;
  const degreesPerSecond = exerciseProgramAngle / workoutDuration;
  const centreWidth = svgWidth / 2;
  const centreHeight = svgHeight / 2;
  const labelStartAngle = 90 - (labelSize / 2) * 360;
  const warmupStartAngle = 90 + (labelSize / 2) * 360;

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

interface TimerStore {
  timer?: NodeJS.Timeout;
}

export default component$(() => {
  const state = useStore<IntervalContext>({
    restColour: 'green',
    sprintColour: 'red',
    restDuration: [90, 75, 60, 45, 35, 30, 30, 30, 30, 40, 0],
    sprintDuration: 30,
    radius: 90,
    warmupDuration: 300,
    cooldownDuration: 180,
    labelColour: 'blue',
    svgWidth: 300,
    svgHeight: 300,
    strokeWidth: 20,
    cx: '50%',
    cy: '50%',
    now: 300,
  });

  const nextIntervalStart = $(() => {
    const times = [0];

    times.push(state.warmupDuration);
    state.restDuration.forEach((rest) => {
      const lastTime = times[times.length - 1];
      times.push(lastTime + state.sprintDuration);
      times.push(lastTime + state.sprintDuration + rest);
    });
    const lastTime = times[times.length - 1];
    times.push(lastTime + state.cooldownDuration);

    console.log(times);

    return times;
  });

  const timeStuff = useStore<TimerStore>({
    timer: undefined,
  });

  useContextProvider(InputContext, state);

  const onPlayPause = $(() => {
    if (timeStuff.timer) {
      clearInterval(timeStuff.timer);
      timeStuff.timer = undefined;
    } else {
      timeStuff.timer = setInterval(() => (state.now += 10), 1000);
    }
  });

  const onForward = $(async () => {
    const startTimes = await nextIntervalStart();
    console.log('Forward', startTimes);
    const nextStartTime = startTimes.find((element) => state.now < element);

    console.log(nextStartTime);

    if (nextStartTime) {
      state.now = nextStartTime;
    }
  });

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0, 0, ${state.svgWidth}, ${state.svgHeight}`}
        width={state.svgWidth}
        height={state.svgHeight}
      >
        <Label />
        <Warmup />
        {new Array(state.restDuration.length).fill(0).map((_, index) => (
          <Interval index={index} />
        ))}
        <CoolDown />
        <TimePointer time={state.now} />
      </svg>

      <p>{state.now}</p>
      <PlayPauseButton onClick={onPlayPause} />
      <ResetButton />
      <BackButton />
      <ForwardButton onClick={onForward} />
    </>
  );
});
