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
export const TimeContext = createContextId<TimerStore>('time.stuff');

interface ArcProps {
  startAngle: number; // 0 -> 360
  endAngle: number; // 0 -> 360
  width: number;
  colour: string;
  radius?: number;
}

// given start and end angle, render an arc. Angles start at 3:00 O'Clock and are in degrees
export const Arc = component$<ArcProps>(({ colour, endAngle, startAngle, width, radius }) => {
  const { radius: r, centreWidth, centreHeight, cx, cy } = useHIITContext();
  const circumference = 2 * Math.PI * (radius || r);
  const arcLength = (circumference * (endAngle - startAngle)) / 360;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius || r}
      stroke={colour}
      stroke-width={width}
      fill="none"
      transform={`rotate(${startAngle}, ${centreWidth}, ${centreHeight})`}
      stroke-dasharray={[arcLength, circumference - arcLength]}
    />
  );
});

export const MinuteRing = component$<{ radius: number; colour: string }>(({ radius, colour }) => {
  return <Arc startAngle={0} endAngle={360} width={10} colour={colour} radius={radius} />;
});

export const MinuteRings = component$<{ radius: number; remaining: number; stillToDo: number; colour: string }>(
  ({ radius, remaining, stillToDo, colour }) => {
    const wholeMinutesRemaining = Math.floor(remaining / 60);

    if (remaining < 60) {
      const minutesStillToDo = Math.floor(stillToDo / 60);
      // return <Arc startAngle={-90} endAngle={360 - 90 - remaining * 6} width={10} colour={'purple'} radius={radius} />;
      return (
        <Arc
          startAngle={-90}
          endAngle={remaining * 6 - 90}
          width={10}
          colour={colour}
          radius={radius - (25 + minutesStillToDo * 15)}
        />
      );
    }

    return (
      <>
        <MinuteRing radius={radius - (25 + (wholeMinutesRemaining - 1) * 15)} colour={colour} />
        <MinuteRings radius={radius} remaining={remaining - 60} stillToDo={stillToDo} colour={colour} />
      </>
    );
  },
);

export const PhaseProgress = component$(() => {
  const { now, centreHeight, centreWidth, workoutDuration, radius } = useHIITContext();
  const state = useContext(InputContext);
  const phaseStartTimes = () => {
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
  };

  const startTimes = phaseStartTimes();
  const nextStartTime = startTimes.find((start) => state.now < start) || workoutDuration;
  const reverseStartTimes = startTimes.reverse();
  const previousStartTime = reverseStartTimes.find((start) => start < state.now) || 0;
  const duration = nextStartTime - previousStartTime;
  const stillToDo = nextStartTime - now;
  const minuteRemainder = stillToDo % 60;
  const wholeMinutesRemaining = Math.floor(stillToDo / 60);
  const phaseNumber = startTimes.filter((t) => t < now);
  const colour = phaseNumber.length % 2 ? 'green' : 'red';

  return (
    <>
      <MinuteRings radius={radius} remaining={stillToDo} stillToDo={stillToDo} colour={colour} />
      {/*<MinuteRing radius={radius - 25} />*/}
      {/*<MinuteRing radius={radius - 40} />*/}
      {/*<MinuteRing radius={radius - 55} />*/}
      {/*<MinuteRing radius={radius - 70} />*/}
      <text x={centreWidth - 150} y={centreWidth} fill="white" font-size="5px">
        previousStartTime={previousStartTime},nextStartTime={nextStartTime},duration={duration},now={now},minutes=
        {wholeMinutesRemaining},remainder={minuteRemainder / 60}
      </text>
    </>
  );
});

interface PointerProps {
  angle: number;
}

export const Pointer = component$<PointerProps>(({ angle }) => {
  const { centreWidth, centreHeight, radius, strokeWidth } = useHIITContext();
  const poly = `
      ${centreWidth + radius + strokeWidth}, ${centreHeight} 
      ${centreWidth + 10 + radius + strokeWidth}, ${centreHeight - 5} 
      ${centreWidth + 10 + radius + strokeWidth}, ${centreHeight + 5}`;

  console.log(poly);
  return <polygon points={poly} fill="white" transform={`rotate(${angle}, ${centreWidth}, ${centreHeight})`} />;
});
export const ResetButton = component$(() => {
  // const ctx = useHIITContext();
  const ctx = useContext(InputContext);
  return <button onClick$={() => (ctx.now = 0)}>↺</button>;
});

export const PlayPauseButton = component$<{ onClick: QRL<() => {}> }>(({ onClick }) => {
  const { timer } = useContext(TimeContext);

  return <button onClick$={onClick}>{timer ? '⏸' : '⏵'}</button>;
});
// get it to pause (clearInterval)
//stop at the end
//swap between pause and play icons
export const ForwardButton = component$<{ onClick: QRL<() => {}> }>(({ onClick }) => {
  return <button onClick$={onClick}>⏭</button>;
});

export const BackButton = component$<{ onClick: QRL<() => {}> }>(({ onClick }) => {
  return <button onClick$={onClick}>⏮</button>;
});

export const TimePointer = component$<{ time: number }>(({ time }) => {
  const { degreesPerSecond, labelSize } = useHIITContext();
  const labelEndAngle = 90 + (360 * labelSize) / 2;
  const startAngle = labelEndAngle + time * degreesPerSecond;

  return <Pointer angle={startAngle} />;
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
    radius: 110,
    warmupDuration: 300,
    cooldownDuration: 180,
    labelColour: 'blue',
    svgWidth: 400,
    svgHeight: 400,
    strokeWidth: 30,
    cx: '50%',
    cy: '50%',
    now: 0,
  });

  const phaseStartTimes = $(() => {
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

  const timeState = useStore<TimerStore>({
    timer: undefined,
  });

  useContextProvider(InputContext, state);
  useContextProvider(TimeContext, timeState);

  const onPlayPause = $(() => {
    if (timeState.timer) {
      clearInterval(timeState.timer);
      timeState.timer = undefined;
    } else {
      timeState.timer = setInterval(() => (state.now += 3), 1000);
    }
  });

  const onForward = $(async () => {
    const startTimes = await phaseStartTimes();
    console.log('Forward', startTimes);
    const nextStartTime = startTimes.find((start) => state.now < start);

    console.log(nextStartTime);

    if (nextStartTime) {
      state.now = nextStartTime;
    }
  });

  const onBack = $(async () => {
    const startTimes = await phaseStartTimes();
    const reverseStartTimes = startTimes.reverse();
    const previousStartTime = reverseStartTimes.find((start) => start < state.now);
    console.log(previousStartTime);
    if (previousStartTime) {
      state.now = previousStartTime;
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
        <PhaseProgress />
      </svg>

      <p>{state.now}</p>
      <PlayPauseButton onClick={onPlayPause} />
      <ResetButton />
      <BackButton onClick={onBack} />
      <ForwardButton onClick={onForward} />
    </>
  );
});
