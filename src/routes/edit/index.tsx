import { $, component$, useContextProvider, useStore, useTask$ } from '@builder.io/qwik';
import {
  GlobalContext,
  GlobalStore,
  InputContext,
  IntervalContext,
  TimeContext,
  TimerStore,
  WorkoutContext,
} from '~/routes/hiit/contexts';
import { supabase } from '~/utils/supabase';
import {
  BackButton,
  DeleteButton,
  DigitalTimer,
  DuplicateButton,
  ForwardButton,
  Interval,
  Label,
  Minus5Button,
  PhaseProgress,
  PlayPauseButton,
  Plus5Button,
  ResetButton,
  SaveAsButton,
  SaveButton,
  TagsList,
  TimePointer,
  ToggleMode,
  Warmup,
  WorkoutTitleEntry,
} from '~/components/ui/stuff';

const EditWorkout = component$<{ workout: WorkoutContext; tagState: {} }>(({ workout, tagState }) => {
  const state = useStore<IntervalContext>({
    restColour: 'green',
    sprintColour: 'red',
    restDurations: [90, 75, 60, 80],
    sprintDuration: 30,
    radius: 110,
    warmupDuration: 300,
    labelColour: 'blue',
    svgWidth: 400,
    svgHeight: 400,
    strokeWidth: 30,
    cx: '50%',
    cy: '50%',
    now: 0,
    currentRest: -1,
    workoutID: crypto.randomUUID(),
    title: 'name',
    created_at: new Date(),
    tags: [],
    ...workout,
  });

  //todo-lastTime isn't DRY
  const phaseStartTimes = $(() => {
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
  });

  useTask$(({ track }) => {
    track(workout);
    Object.values(tagState).forEach((tag) => (tag.selected = false));
    workout?.tags.forEach((tag) => (tagState[tag].selected = true));
  });

  const timeState = useStore<TimerStore>({
    timer: undefined,
  });

  const phaseHeartRates = useStore<{ allPhases: number[][] }>({
    allPhases: [[1, 2, 3, 4, 5, 6], [6, 5, 4, 3, 4], []],
  });

  useContextProvider(InputContext, state);
  useContextProvider(TimeContext, timeState);

  const onPlayPause = $(() => {
    //const { workoutDuration } = useHIITContext();
    if (timeState.timer) {
      clearInterval(timeState.timer);
      timeState.timer = undefined;
    } else {
      timeState.timer = setInterval(() => {
        state.now += 1;
        const lastPhase = phaseHeartRates.allPhases[phaseHeartRates.allPhases.length - 1];

        lastPhase.push(5);

        // console.log(phaseHeartRates);
      }, 1000);
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

  // across all of my workouts, I've used 3 different tags.
  const ts = useStore({
    running: { count: 3, selected: false },
    rowing: { count: 5, selected: false },
    'weight-lifting': { count: 1, selected: true },
    advanced: { count: 1, selected: true },
  });

  const ts2 = {
    running: { count: 3, selected: false },
    rowing: { count: 5, selected: true },
    'weight-lifting': { count: 1, selected: false },
    advanced: { count: 1, selected: true },
  };

  return (
    <>
      <h1>{state.title}</h1>
      <div class="workout">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0, 0, ${state.svgWidth}, ${state.svgHeight}`}
          width={state.svgWidth}
          height={state.svgHeight}
        >
          <Label />

          <Warmup />
          {new Array(state.restDurations.length).fill(0).map((_, index) => (
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
          <BackButton onClick={onBack} />
          <ForwardButton onClick={onForward} />
          <Plus5Button />
          <Minus5Button />
          <DuplicateButton />
          <DeleteButton />
        </div>
      </div>
      <br />
      <br />
      <ToggleMode />
      <SaveButton />
      <SaveAsButton />
      <WorkoutTitleEntry />
      <br />

      <TagsList tagState={tagState} />
    </>
  );
});

export default component$(() => {
  const workouts = useStore<GlobalStore>({
    allWorkouts: [] as WorkoutContext[],
    currentWorkoutIndex: 0,
    editMode: false,
  });
  const tagState = useStore<Record<string, { count: number; selected: boolean }>>({});

  useContextProvider(GlobalContext, workouts);

  // load all workouts on initial render
  useTask$(async () => {
    const { data, error, count } = await supabase.from('workouts').select();
    console.log('Data returned from Supabase', data, error, count);
    if (!error && data && data.length > 0) {
      workouts.allWorkouts = data;
      workouts.currentWorkoutIndex = 0;
    }

    // const ts: Record<string, { count: number; selected: boolean }> = {};

    data
      ?.map((w) => {
        return w.tags;
      })
      .flat()
      .forEach((tag) => {
        if (!tagState[tag]) tagState[tag] = { count: 0, selected: false };

        tagState[tag].count++;
      });
  });

  return (
    <>
      {workouts.allWorkouts[workouts.currentWorkoutIndex] && (
        <EditWorkout
          key={workouts.currentWorkoutIndex}
          workout={workouts.allWorkouts[workouts.currentWorkoutIndex]}
          tagState={tagState}
        />
      )}
    </>
  );
});
