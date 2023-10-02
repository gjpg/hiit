import { component$, useContext, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Chart, ChartDataset, Filler, registerables } from 'chart.js';
import { InputContext, useHIITContext } from '~/routes/hiit/contexts';

interface PhaseHeartRateProps {
  dataset: number[];
  phaseColour: string;
}
export const PhaseHeartRates = component$<PhaseHeartRateProps>(({ dataset, phaseColour }) => {
  const chart = useSignal<HTMLCanvasElement>();

  useVisibleTask$(() => {
    if (chart?.value) {
      const allLabels = dataset.map((d) => `${d}`);
      Chart.register(Filler, ...registerables);
      new Chart(chart.value, {
        type: 'line',
        data: {
          labels: allLabels,
          datasets: [
            {
              label: 'Combined Dataset',
              data: dataset,
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2,
              fill: false,
            },
          ],
        },
        options: {
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
            y: { beginAtZero: true, display: false },
          },
        },
      });
    }
  });

  return (
    <div style={{ backgroundColor: phaseColour }}>
      <canvas style={{ height: '100%' }} ref={chart}></canvas>
    </div>
  );
});

export const BarChart = component$(() => {
  const dataset = [10, 15, 7, 12, 8, 11, 9, 14, 0, 10];
  const dataset1 = [...dataset, ...dataset, ...dataset, ...dataset];
  const dataset2 = [...dataset, ...dataset];
  const dataset3 = [1, 5, 6, 3, 2];
  const allPhases = [dataset1, dataset3, dataset2];
  const totalDataPoints = allPhases.reduce((tally, current) => tally + current.length, 0);

  return (
    <div
      class="charts"
      style={{ gridTemplateColumns: `${allPhases.map((ds) => (ds.length * 100) / totalDataPoints + '%').join(' ')}` }}
    >
      {allPhases.map((p, i) => (
        <PhaseHeartRates dataset={p} phaseColour={i % 2 ? 'red' : 'green'} />
      ))}
    </div>
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
  // console.log(datasets);

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
      <canvas ref={myChart} id="myChart"></canvas>
    </div>
  );
});
