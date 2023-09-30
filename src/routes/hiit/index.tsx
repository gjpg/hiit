import {
  $,
  component$,
  createContextId,
  QRL,
  useContext,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from '@builder.io/qwik';
import { BarChart, HeartChart } from '~/routes/hiit/heartchart';
import { useHIITContext, InputContext, TimeContext, TimerStore, IntervalContext } from '~/routes/hiit/contexts';

//https://codepen.io/jordanwillis/pen/BWxErp
//https://www.chartjs.org/docs/latest/samples/area/line-datasets.html

// make to do list (todo-x)
// make note glossary of terminology
// write down some UI ideas

//todo- bug where cant use back button when at end of warmup/start of 1st sprint

//todo- smooth animation

//todo- dry

//todo- check bugfixes

//now
//starts at 0, increments with each second elapsed

//stillToDo
//subtracts 'now' from 'nextStartTime', to find seconds left within 'phase'

//wholeMinutesRemaining
//calculates number of whole minutes from 'stillToDo'

//duration
//length in seconds of current 'phase', calculated from the start time of current segment and next segment

//phaseNumber
//returns which number phase we're on currently, used to determine the colour of the inner rings

//exerciseProgramAngle
//constant that makes sure the geometry of the program stays consistent with any adjustments to labelSize

//phaseStartTimes
//using information from 'state', creates a 'times' array of the start times of each phase

//some stuff that I couldn't really understand
//minutesStillToDo
//intervalsSoFar

//bugs
//Inner rings start red when now is 0
//FIXED- phaseNumber was undefined because 0 isn't less than 0. Changed the check to less or equal to 0

//Time doesn't stop when run is over
//UNFIXED- found general solution but not implemented. can't bring in workout duration without freezing the timer permanently

//phaseNumber not seeming to work properly at all.
//UNFIXED- doesn't seem to have any negative effect (yet)

//todo-buttons
//+5
//-5
//duplicate
//delete
//undo

// export const Plus5Button = component$<{ onClick: QRL<() => {}> }>((onClick) => {
//   const ctx = useContext(InputContext);
//   // const currentPhase = ;
//   return <button onClick$={() => {onClick}}>+20</button>;
// });

export const Plus5Button = component$((onClick) => {
  const ctx = useContext(InputContext);
  const { currentRest } = ctx;

  // const currentPhase = ;
  return (
    <button
      onClick$={() => {
        if (currentRest && currentRest >= 0) {
          ctx.restDuration[currentRest] += 20;
        }
      }}
    >
      +20
    </button>
  );
});

export const Minus5Button = component$((onClick) => {
  const ctx = useContext(InputContext);
  // const currentPhase = ;
  const { currentRest } = ctx;

  return (
    <button
      onClick$={() => {
        if (currentRest && currentRest >= 0) {
          ctx.restDuration[currentRest] >= 20
            ? (ctx.restDuration[currentRest] -= 20)
            : (ctx.restDuration[currentRest] = 0);
        }
      }}
    >
      -20
    </button>
  );
});

export const DuplicateButton = component$(() => {
  const ctx = useContext(InputContext);
  const { currentRest, restDuration } = ctx;

  return (
    <button
      onClick$={() => {
        if (currentRest && currentRest >= 0) {
          restDuration.splice(currentRest + 1, 0, restDuration[currentRest]);
        }
      }}
    >
      Duplicate
    </button>
  );
});

export const DeleteButton = component$(() => {
  const ctx = useContext(InputContext);
  const { currentRest, restDuration } = ctx;

  return (
    <button
      onClick$={() => {
        if (currentRest && currentRest >= 0) {
          restDuration.splice(currentRest, 1);
        }
      }}
    >
      Delete
    </button>
  );
});

interface ArcProps {
  startAngle: number; // 0 -> 360
  endAngle: number; // 0 -> 360
  width: number;
  colour: string;
  radius?: number;
}

// given start and end angle, render an arc. Angles start at 3:00 O'Clock and are in degrees

//todo-two different things called radius here
//todo-circumference is redefined within this component
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

export const OneRing = component$<{ radius: number; colour: string }>(({ radius, colour }) => {
  return <Arc startAngle={0} endAngle={360} width={10} colour={colour} radius={radius} />;
});

interface RingProps {
  stillToDo: number;
  remaining: number;
  colour: string;
  radius: number;
}

export const CountdownRing = component$<RingProps>(({ stillToDo, colour, radius, remaining }) => {
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
});

//todo-minutesStillToDo does exact same thing as wholeMinutesRemaining but is redefined within function
export const RecursiveRings = component$<RingProps>(({ radius, remaining, stillToDo, colour }) => {
  const wholeMinutesRemaining = Math.floor(remaining / 60);

  if (remaining < 60) {
    return <CountdownRing stillToDo={stillToDo} colour={colour} radius={radius} remaining={remaining} />;
  }

  return (
    <>
      <OneRing radius={radius - (25 + (wholeMinutesRemaining - 1) * 15)} colour={colour} />
      <RecursiveRings radius={radius} remaining={remaining - 60} stillToDo={stillToDo} colour={colour} />
    </>
  );
});

//todo-duration is redefined here
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

    // console.log(times);

    return times;
  };

  const startTimes = phaseStartTimes();
  const nextStartTime = startTimes.find((start) => state.now < start) || workoutDuration;

  const stillToDo = nextStartTime - now;

  const phaseNumber = startTimes.filter((t) => t <= now);
  const colour = phaseNumber.length % 2 ? 'green' : 'red';

  return (
    <>
      <RecursiveRings radius={radius} remaining={stillToDo} stillToDo={stillToDo} colour={colour} />
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

  // console.log(poly);
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
export const DigitalTimer = component$(() => {
  const { now, workoutDuration } = useHIITContext();
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

    // console.log(times);

    return times;
  };

  const startTimes = phaseStartTimes();
  const nextStartTime = startTimes.find((start) => state.now < start) || workoutDuration;
  const stillToDo = nextStartTime - now;
  const minutes = Math.floor(stillToDo / 60);
  const seconds = stillToDo - minutes * 60;
  const secondsString = seconds.toString();

  return (
    <p>
      {minutes}:{secondsString.padStart(2, '0')}
    </p>
  );
});
// converts from time domain to the angle domain
export const Phase = component$<DurationProps>(({ startTime, duration, colour, width }) => {
  const { degreesPerSecond, labelSize } = useHIITContext();

  const labelEndAngle = 90 + (360 * labelSize) / 2;
  const startAngle = labelEndAngle + startTime * degreesPerSecond;

  return (
    //<svg className={activePhase ? 'glow' : ''}>
    <Arc startAngle={startAngle} endAngle={startAngle + duration * degreesPerSecond} width={width} colour={colour} />
    //</svg>
  );
});

export const Warmup = component$(() => {
  const { warmupDuration, restColour, strokeWidth } = useHIITContext();
  const ctx = useContext(InputContext);
  const { now } = ctx;
  const activeWarmup = 0 <= now && now < warmupDuration;

  useVisibleTask$(() => {
    if (activeWarmup) {
      ctx.currentRest = -1;
    }
  });

  return (
    <svg class={activeWarmup ? 'glow' : ''}>
      <Phase startTime={0} duration={warmupDuration} colour={restColour} width={strokeWidth} />
    </svg>
  );
});

//todo-intervalsSoFar redefined
export const CoolDown = component$(() => {
  const { cooldownDuration, restColour, strokeWidth, restDuration, sprintDuration, warmupDuration } = useHIITContext();
  const intervalsSoFar = restDuration.reduce((tally, current) => tally + current + sprintDuration, 0);
  const startTime = warmupDuration + intervalsSoFar;

  return <Phase startTime={startTime} duration={cooldownDuration} colour={restColour} width={strokeWidth} />;
});

export const Interval = component$(({ index }: { index: number }) => {
  const { sprintColour, restColour, sprintDuration, strokeWidth, restDuration, warmupDuration } = useHIITContext();
  const { now } = useContext(InputContext);
  const ctx = useContext(InputContext);

  const intervalsSoFar = restDuration.slice(0, index).reduce((tally, current) => tally + current + sprintDuration, 0);
  const startTime = warmupDuration + intervalsSoFar;

  // const sprintOrRest = intervalsSoFar % 2;
  const activeInterval = startTime <= now && now < startTime + sprintDuration + restDuration[index];

  if (activeInterval) {
    ctx.currentRest = index;
  }
  return (
    <>
      <svg class={activeInterval ? 'glow' : ''}>
        <Phase startTime={startTime} duration={sprintDuration} width={strokeWidth} colour={sprintColour} />
        <Phase
          startTime={startTime + sprintDuration}
          duration={restDuration[index]}
          width={strokeWidth}
          colour={restColour}
        />
      </svg>
    </>
  );
});

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
    restDuration: [90, 75, 60, 45, 35, 30, 30, 30, 30, 40, 180],
    sprintDuration: 30,
    radius: 110,
    warmupDuration: 300,
    cooldownDuration: 0,
    labelColour: 'blue',
    svgWidth: 400,
    svgHeight: 400,
    strokeWidth: 30,
    cx: '50%',
    cy: '50%',
    now: 0,
    currentRest: -1,
  });

  //todo-lastTime isn't DRY
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

    // console.log(times);

    return times;
  });

  const timeState = useStore<TimerStore>({
    timer: undefined,
  });

  useContextProvider(InputContext, state);
  useContextProvider(TimeContext, timeState);

  const onPlayPause = $(() => {
    //const { workoutDuration } = useHIITContext();
    if (timeState.timer) {
      clearInterval(timeState.timer);
      timeState.timer = undefined;
    } else {
      timeState.timer = setInterval(() => (state.now += 1), 1000);
    }

    //todo- set bounds 0 <= now <= workoutDuration.
    // when now < 0, set now to 0, stop incrementing and set icon to play button.
    // when workoutDuration =< now, stop incrementing, set now = workoutDuration, set icon to play icon
    // right now, icon is determined only by clicking, it should instead be related to whether the timer is active
    // current attempt at fixing is below, but const { workoutDuration } = useHIITContext(); freezes the timer entirely

    // if (state.now < 0) {
    //   clearInterval(timeState.timer);
    //   state.now = 0;
    // }
    //
    // if (state.now >= workoutDuration) {
    //   clearInterval(timeState.timer);
    //   state.now = workoutDuration;
    // }
  });

  const onForward = $(async () => {
    const startTimes = await phaseStartTimes();
    // console.log('Forward', startTimes);
    const nextStartTime = startTimes.find((start) => state.now < start);

    // console.log(nextStartTime);

    if (nextStartTime) {
      state.now = nextStartTime;
    }
  });

  const onBack = $(async () => {
    const startTimes = await phaseStartTimes();
    const reverseStartTimes = startTimes.reverse();
    const previousStartTime = reverseStartTimes.find((start) => start < state.now);

    if (previousStartTime !== undefined) {
      state.now = previousStartTime;
    }
  });

  return (
    <>
      <div class="workout">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0, 0, ${state.svgWidth}, ${state.svgHeight}`}
          width={state.svgWidth}
          height={state.svgHeight}
        >
          <Label />

          <Warmup />
          {new Array(state.restDuration.length).fill(0).map((_, index) => (
            <Interval key={index} index={index} />
          ))}

          {/*<CoolDown />*/}
          <TimePointer time={state.now} />
          <PhaseProgress />
        </svg>
        <div class="timer">
          <DigitalTimer />
        </div>
      </div>
      <div class="under">
        <div>
          <PlayPauseButton onClick={onPlayPause} />
          <ResetButton />
          <BackButton onClick={onBack} />
          <ForwardButton onClick={onForward} />
          <Plus5Button />
          <Minus5Button />
          <DuplicateButton />
          <DeleteButton />
        </div>
      </div>
      <div>
        {/*<HeartChart />*/}
        <BarChart />
      </div>
    </>
  );
});
