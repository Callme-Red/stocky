import { ChartData, Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface ChartPieProps {
  products: string[];
  quantity: number[];
  title: string;
  label: string;
  additionalData?: number[] | string[]; // Nueva propiedad opcional para datos adicionales
}

export default function ChartPie({ products, quantity, title, label, additionalData = [] }: ChartPieProps) {
  const data: ChartData<'doughnut'> = {
    labels: products,
    datasets: [{
      label: label,
      data: quantity,
      weight: 50,
      backgroundColor: [
        'rgb(64, 81, 137)',
        'rgb(10, 179, 156)',
        'rgb(247, 184, 75)',
        'rgb(240, 101, 72)',
        'rgb(41, 156, 219)'
      ],
      hoverOffset: 20
    }]
  };

  const options = {
    plugins: {
      datalabels: {
        color: '#fff',
        formatter: (value: number, context: any) => {
          const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1) + '%';
          return percentage;
        }
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: any) {
            const value = tooltipItem.raw;
            const additionalInfo = additionalData[tooltipItem.dataIndex] || '';
            // Usa una combinación de líneas separadas por espacios o caracteres especiales
            return `${tooltipItem.label}: ${value}\n${additionalInfo}`;
          },
          title: function (tooltipItems: any) {
            // Opcional: Personaliza el título del tooltip si es necesario
            return tooltipItems[0].label;
          }
        },
        // Opcional: Ajusta el diseño del tooltip si es necesario
        boxPadding: 5,
        caretPadding: 10
      }
    }
  };

  return (
    <div className="w-full rounded-lg bg-white shadow-lg p-5 flex-grow">
      <div className="flex flex-col mb-3">
        <h3 className="font-medium border-b border-secondary inline-block border-dashed text-sm text-primary">{title}</h3>
        <span className="font-semibold text-2xl text-secondary">C$ <span>{0.00}</span></span>
      </div>
      <div className="w-full flex justify-center h-full">
        <Doughnut className="w-full max-h-[290px]" data={data} options={options} />
      </div>
    </div>
  );
}
