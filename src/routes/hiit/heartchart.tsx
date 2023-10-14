import {
  component$,
  type NoSerialize,
  noSerialize,
  useContext,
  useSignal,
  useTask$,
  useVisibleTask$,
} from '@builder.io/qwik';
import { Chart, ChartDataset, Filler, registerables } from 'chart.js';
import { InputContext, useHIITContext } from '~/routes/hiit/contexts';

interface PhaseHeartRateProps {
  dataset: number[][];
  phaseColour: string;
}
export const PhaseHeartRates = component$<PhaseHeartRateProps>(({ dataset, phaseColour }) => {
  const canvas = useSignal<HTMLCanvasElement>();
  const chart = useSignal<NoSerialize<Chart>>();

  if (chart?.value) {
    const { labels, datasets } = chart.value?.data;
    const lastDs = dataset[dataset.length - 1];
    const lastDatum = lastDs[lastDs.length - 1];

    console.log('PhaseHeartRates component updates chart', lastDatum);

    labels?.push('New measurement');
    datasets?.[datasets.length - 1].data.push(lastDatum);
    chart.value?.update();
  }

  useVisibleTask$(() => {
    if (canvas?.value) {
      const allLabels = dataset.flat().map((d) => `${d}`);
      Chart.register(Filler, ...registerables);
      chart.value = noSerialize(
        new Chart(canvas.value, {
          type: 'line',
          data: {
            labels: allLabels,
            datasets: [
              {
                label: 'Combined Dataset',
                data: dataset.flat(),
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
              },
            ],
          },
          options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            elements: { point: { radius: 0 } },
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
            },
            scales: {
              x: {
                display: false, // Hide the x-axis labels
              },
              y: { beginAtZero: true, max: 16, display: false },
            },
          },
        }),
      );
    }
  });

  const maxHeight = 150;

  //
  return (
    <div class="chartjs-container">
      <style
        dangerouslySetInnerHTML={`
        .chartjs-canvas {
        max-height: ${maxHeight}px;
      }
      `}
      />
      <canvas class="chartjs-canvas" style={{ width: '100%' }} ref={canvas}></canvas>
      <pre>{JSON.stringify(dataset)}</pre>
    </div>
  );
});
interface ChartProps {
  phaseHeartRates: number[][];
}
export const BarChart = component$<ChartProps>(({ phaseHeartRates }) => {
  // const dataset = [10, 15, 7, 12, 8, 11, 9, 14, 0, 10];
  // const dataset1 = [...dataset, ...dataset, ...dataset, ...dataset];
  // const dataset2 = [...dataset, ...dataset, ...dataset];
  // const dataset3 = [10, 5, 6, 3, 2, 10];
  // const allPhases = [dataset1, dataset3, dataset2];
  const allPhases = phaseHeartRates;
  const totalDataPoints = allPhases.reduce((tally, current) => tally + current.length, 0);

  return (
    <>
      <br />
      <div
        class="hrchart"
        style={{ gridTemplateColumns: `${allPhases.map((ds) => (ds.length * 100) / totalDataPoints + '%').join(' ')}` }}
      >
        {allPhases.map((p, i) => (
          <div key={i} class="hrbackground" style={{ backgroundColor: i % 2 ? 'red' : 'green' }}>
            &nbsp;
          </div>
        ))}
        <div class="heartrate">
          <PhaseHeartRates dataset={phaseHeartRates} phaseColour="" />
        </div>
      </div>
    </>
  );
});

export const HeartChart = component$(() => {
  const myChart = useSignal<HTMLCanvasElement>();
  const { workoutDuration, now, centreHeight, centreWidth, radius } = useHIITContext();
  const state = useContext(InputContext);
  const phaseStartTimes = () => {
    const times = [0, state.warmupDuration];

    state.restDuration.forEach((rest) => {
      const lastTime = times[times.length - 1];
      times.push(lastTime + state.sprintDuration);
      times.push(lastTime + state.sprintDuration + rest);
    });
    const lastTime = times[times.length - 1];
    times.push(lastTime + state.cooldownDuration);

    return times;
  };
  const times = phaseStartTimes();
  const heartData = new Array(workoutDuration).fill(60);

  const datasets: ChartDataset[] = [];

  // ex. times = [0, 300, 360, 450, 670, ...., 1000, 1100]
  for (let i = 0; i < times.length - 1; i++) {
    const padding = new Array(times[i]).fill(undefined);
    const data = padding.concat(heartData.slice(times[i], times[i + 1])).map((hr) => hr * (1 + i / 10));
    const working = i % 2;
    const phaseColour = `${working ? 'red' : 'green'}`;

    datasets.push({
      label: `${working ? 'Sprint' : 'Rest'} period ${i}`,
      data,
      fill: { above: phaseColour, target: { value: 200 } },
      backgroundColor: phaseColour,
      // borderColor: `${working ? 'red' : 'green'}`,
      borderColor: `white`,
      tension: 0,
    });
    datasets.push({
      label: `${working ? 'Sprint' : 'Rest'} period ${i}`,
      data,
      fill: { below: phaseColour, target: true },
      backgroundColor: phaseColour,
      // borderColor: `${working ? 'red' : 'green'}`,
      borderColor: `white`,
      tension: 0,
    });
  }

  useVisibleTask$(() => {
    if (myChart?.value) {
      const labels = [...Array(workoutDuration).keys()];
      const data = { labels, datasets };

      Chart.register(Filler, ...registerables);
      new Chart(myChart.value, {
        type: 'line',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          elements: { point: { radius: 0 } },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  });

  return (
    <div>
      <canvas ref={myChart} class="myChart"></canvas>
    </div>
  );
});
