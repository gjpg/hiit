import { $, component$, QRL, useContext, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { GlobalContext, InputContext, TimeContext, useHIITContext } from '~/routes/hiit/contexts';
import { supabase } from '~/utils/supabase';

export const Plus5Button = component$((onClick) => {
  const ctx = useContext(InputContext);

  const { currentRest } = ctx;

  return (
    <button
      onClick$={() => {
        if (currentRest && currentRest >= 0) {
          ctx.restDurations[currentRest] += 20;
        }
      }}
    >
      +20
    </button>
  );
});
export const Minus5Button = component$((onClick) => {
  const ctx = useContext(InputContext);
  const { currentRest } = ctx;

  return (
    <button
      onClick$={() => {
        if (currentRest && currentRest >= 0) {
          ctx.restDurations[currentRest] >= 20
            ? (ctx.restDurations[currentRest] -= 20)
            : (ctx.restDurations[currentRest] = 0);
        }
      }}
    >
      -20
    </button>
  );
});
export const DuplicateButton = component$(() => {
  const ctx = useContext(InputContext);

  const { currentRest, restDurations } = ctx;

  return (
    <button
      onClick$={() => {
        if (currentRest && currentRest >= 0) {
          restDurations.splice(currentRest + 1, 0, restDurations[currentRest]);
        }
      }}
    >
      Duplicate
    </button>
  );
});
export const DeleteButton = component$(() => {
  const ctx = useContext(InputContext);
  const { currentRest, restDurations } = ctx;

  return (
    <button
      onClick$={() => {
        if (currentRest && currentRest >= 0) {
          restDurations.splice(currentRest, 1);
        }
      }}
    >
      Delete
    </button>
  );
});
export const SaveButton = component$(() => {
  const state = useContext(InputContext);

  const handleSaveEvent = $(async (event: any) => {
    const { workoutID, sprintColour, sprintDuration, restDurations, restColour, warmupDuration, labelColour, title } =
      state;
    const { error } = await supabase
      .from('workouts')
      .update({ sprintColour, sprintDuration, restDurations, restColour, warmupDuration, labelColour, title })
      .eq('workoutID', workoutID);

    console.log('Save error:', error);
  });
  return <button onClick$={handleSaveEvent}> Save </button>;
});
export const SaveAsButton = component$(() => {
  const state = useContext(InputContext);

  const handleSaveAsEvent = $(async (event: any) => {
    const { sprintColour, sprintDuration, restDurations, restColour, warmupDuration, labelColour, title } = state;
    const workoutID = crypto.randomUUID();
    const { error } = await supabase.from('workouts').insert({
      sprintColour,
      sprintDuration,
      restDurations,
      restColour,
      warmupDuration,
      labelColour,
      title,
      workoutID,
    });

    state.workoutID = workoutID;
    console.log('Save error:', error);
  });
  return <button onClick$={handleSaveAsEvent}> Save As </button>;
});
export const WorkoutTitleEntry = component$(() => {
  const ctx = useContext(InputContext);
  const handleChangeEvent = $(async (event: any) => {
    ctx.title = event.target.value;
  });

  return (
    <label>
      Workout Name
      <input name="title" type="text" value={ctx.title} onChange$={handleChangeEvent} />
    </label>
  );
});

interface ArcProps {
  startAngle: number; // 0 -> 360
  endAngle: number; // 0 -> 360
  width: number;
  colour: string;
  radius?: number;
}

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
    state.restDurations.forEach((rest) => {
      const lastTime = times[times.length - 1];
      times.push(lastTime + state.sprintDuration);
      times.push(lastTime + state.sprintDuration + rest);
    });
    const lastTime = times[times.length - 1];
    times.push(lastTime);

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
    state.restDurations.forEach((rest) => {
      const lastTime = times[times.length - 1];
      times.push(lastTime + state.sprintDuration);
      times.push(lastTime + state.sprintDuration + rest);
    });
    const lastTime = times[times.length - 1];
    times.push(lastTime);

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
export const Interval = component$(({ index }: { index: number }) => {
  const { restColour } = useContext(InputContext);
  const { sprintColour, sprintDuration, strokeWidth, restDurations, warmupDuration } = useHIITContext();
  const { now } = useContext(InputContext);
  const ctx = useContext(InputContext);

  const intervalsSoFar = restDurations.slice(0, index).reduce((tally, current) => tally + current + sprintDuration, 0);
  const startTime = warmupDuration + intervalsSoFar;

  // const sprintOrRest = intervalsSoFar % 2;
  const activeInterval = startTime <= now && now < startTime + sprintDuration + restDurations[index];

  if (activeInterval) {
    ctx.currentRest = index;
  }
  return (
    <>
      <svg class={activeInterval ? 'glow' : ''}>
        <Phase startTime={startTime} duration={sprintDuration} width={strokeWidth} colour={sprintColour} />
        <Phase
          startTime={startTime + sprintDuration}
          duration={restDurations[index]}
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

export interface TagProps {
  label: string;
  count: number;
  selected: boolean;
  onClick: QRL<() => void>;
}

export const Tag = component$<TagProps>(({ label, count, selected, onClick }) => {
  return (
    <button onClick$={onClick} class={selected ? 'selected-tag' : 'unselected-tag'}>
      {label} ({count})
    </button>
  );
});
// example tagState
const ts2 = {
  running: { count: 3, selected: false },
  rowing: { count: 5, selected: true },
  'weight-lifting': { count: 1, selected: false },
  advanced: { count: 1, selected: true },
};
export const TagsList = component$<{ tagState: Record<string, { count: number; selected: boolean }> }>(
  ({ tagState }) => {
    const ctx = useContext(InputContext);
    const { workoutID, tags } = ctx;

    const flat = useStore(Object.entries(tagState).sort(([, lhs], [, rhs]) => rhs.count - lhs.count));
    const handleTagEvent = $(async (label: string) => {
      const tag = tagState[label];
      tag.selected = !tag.selected;
      tag.count = tag.count + (tag.selected ? +1 : -1);

      // [['running', { count: 3, selected: false }], ['rowing', { count: 5, selected: true }], ...]
      const blah = Object.entries(tagState).filter(([, { selected }]) => selected);

      const labels = blah.map(([label, { selected }]) => label);

      const { error } = await supabase.from('workouts').update({ tags: labels }).eq('workoutID', workoutID);
    });
    const isInputVisible = useSignal(false);
    const newTag = $(() => {
      isInputVisible.value = !isInputVisible.value;
    });

    const saveNewTag = $(async (event: any) => {
      const tag = event.target.value.trim();
      isInputVisible.value = false;

      if (!tag) return;

      const { error } = await supabase
        .from('workouts')
        .update({ tags: [tag, ...tags] })
        .eq('workoutID', workoutID);
      console.log({ error });

      if (!error) {
        flat.unshift([tag, { count: 1, selected: true }]);
      }
    });
    return (
      <>
        <button onClick$={newTag}>+</button>
        {isInputVisible.value && <input onChange$={saveNewTag} />}
        {flat.map(([label, { count, selected }]) => (
          <Tag
            key={label}
            label={label}
            count={count}
            selected={selected}
            onClick={$(async () => {
              await handleTagEvent(label);
            })}
          />
        ))}
      </>
    );
  },
);
export const ToggleMode = component$(() => {
  const ctx = useContext(GlobalContext);

  return (
    <button
      onClick$={() => {
        ctx.editMode = !ctx.editMode;
      }}
    >
      {ctx.editMode ? 'Finish Editing' : 'Edit Workout'}
    </button>
  );
});
