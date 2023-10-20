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

// given start and end angle, render an arc. Angles start at 3:00 O'Clock and are in degrees

const Workout = component$<{ workout: WorkoutContext; editMode: boolean; tagState: {} }>(
  ({ workout, editMode, tagState }) => {
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
            {!editMode && <PlayPauseButton onClick={onPlayPause} />}
            {!editMode && <ResetButton />}
            <BackButton onClick={onBack} />
            <ForwardButton onClick={onForward} />
            {editMode && <Plus5Button />}
            {editMode && <Minus5Button />}
            {editMode && <DuplicateButton />}
            {editMode && <DeleteButton />}
          </div>
        </div>
        <br />
        <br />
        <ToggleMode />
        <SaveButton />
        <SaveAsButton />
        {editMode && <WorkoutTitleEntry />}
        <br />

        {editMode && <TagsList tagState={tagState} />}
      </>
    );
  },
);

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

  const previous = $(() => {
    if (workouts.currentWorkoutIndex > 0) {
      workouts.currentWorkoutIndex--;
    }
  });

  const next = $(() => {
    if (workouts.currentWorkoutIndex < workouts.allWorkouts.length - 1) {
      workouts.currentWorkoutIndex++;
    }
  });
  return (
    <>
      {workouts.editMode && (
        <>
          <button onClick$={previous}>Previous</button>
          <button onClick$={next}>Next</button>
        </>
      )}
      {workouts.allWorkouts[workouts.currentWorkoutIndex] && (
        <Workout
          key={workouts.currentWorkoutIndex}
          workout={workouts.allWorkouts[workouts.currentWorkoutIndex]}
          editMode={workouts.editMode}
          tagState={tagState}
        />
      )}
    </>
  );
});
