import { component$, useContext, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Chart, ChartDataset, Filler, registerables } from 'chart.js';
import { InputContext, useHIITContext } from '~/routes/hiit/contexts';

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
