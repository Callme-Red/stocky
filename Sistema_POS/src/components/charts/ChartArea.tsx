import { ChartData, ChartOptions } from 'chart.js';
import LineChart from "./LineChart";

type Point = { x: number, y: number };

interface Props {
  dataX: unknown[];
  dataY: (number | Point)[];
  title: string;
  value: number;
}

export default function ChartArea({ dataX, dataY, title, value }: Props) {
  const data: ChartData<'line'> = {
    labels: dataX,
    datasets: [
      {
        data: dataY,
        tension: 0.5,
        fill: true,
        borderColor: '#005bd3',
        backgroundColor: '#005bd350',
        pointRadius: 5,
        pointBorderColor: '#005bd3',
        pointBackgroundColor: '#005bd3',
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: false
      }
    },
  };

  return (
    <div className="w-full rounded-lg bg-white shadow-lg p-5">
      <div className="flex flex-col mb-3">
        <div className="flex items-center mb-2">
          <h3 className="font-medium border-b border-secondary inline-block border-dashed text-sm text-primary">{title}</h3>
        </div>
        <span className="font-semibold text-2xl text-secondary">C$ <span>{value.toFixed(2)}</span></span>
      </div>
      <LineChart data={data} options={options} />
    </div>
  )
}
