import { component$, useContext, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Chart, ChartDataset, Filler, registerables } from 'chart.js';
import { InputContext, useHIITContext } from '~/routes/hiit/contexts';

export const BarChart = component$(() => {
  const myChart1 = useSignal<HTMLCanvasElement>();
  const myChart2 = useSignal<HTMLCanvasElement>();
  // const dataset1 = [10, 15, 7, 12];
  // const dataset2 = [8, 11, 9, 14];
  // const barWidth = 10;

  // Define your data for each dataset
  const dataset = [10, 15, 7, 12, 8, 11, 9, 14, 6, 18, 5, 13, 11, 10];
  const allLabels = dataset.map((d) => `${d}`);

  // // Determine the total number of data points
  // const totalDataPoints = datasets.reduce((total, dataset) => total + dataset.length, 0);
  //
  // // Create an array to hold all labels for all datasets
  // const allLabels = Array.from({ length: totalDataPoints }, (_, i) => `Label ${i + 1}`);
  //
  // // Create an array to hold the combined data for all datasets
  // const allData = datasets.reduce((combinedData, dataset) => combinedData.concat(dataset), []);

  // const ctx = document.getElementById('myChart').getContext('2d');

  useVisibleTask$(() => {
    if (myChart1?.value) {
      const phaseColour = 'green';
      Chart.register(Filler, ...registerables);
      new Chart(myChart1.value, {
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
    if (myChart2?.value) {
      new Chart(myChart2.value, {
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
          backgroundColor: 'red',
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
    <div class="charts">
      <div style={{ backgroundColor: 'green' }}>
        <canvas ref={myChart1}></canvas>
      </div>
      <div style={{ backgroundColor: 'red' }}>
        <canvas ref={myChart2}></canvas>
      </div>
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
