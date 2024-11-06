import { useEffect, useState } from 'react';
import ChartArea from "../../components/charts/ChartArea";
import Container from "../../layout/Container";
import { getSalesByDates, getSalesByMonthReport } from '../../api/sales/sales';
import { SalesProps } from '../../types/types';
import ChartPie from '../../components/charts/ChartPie';
import { getTopProducts } from '../../api/inventory/products';

interface TopProductsProps {
  ProductID: string;
  ProductName: string;
  totalSales: string;
}

interface sales {
  date: string;
  total_sales: number;
}

interface SalesMonth {
  total: number;
  sales: sales[];
}

export default function SalesReport() {
  const [monthlySales, setMonthlySales] = useState<{ x: string[]; y: number[] }>({ x: [], y: [] });
  const [weeklySales, setWeeklySales] = useState<{ x: string[]; y: number[] }>({ x: [], y: [] });
  const [todaySales, setTodaySales] = useState<{ x: string[]; y: number[] }>({ x: [], y: [] });
  const [topProducts, setTopProducts] = useState<{ productNames: string[]; totalSales: number[] }>({
    productNames: [],
    totalSales: []
  });

  useEffect(() => {
    const loadTopsProducts = async () => {
      const { data } = await getTopProducts();
      const productNames = data.map((product: TopProductsProps) => product.ProductName);
      const totalSales = data.map((product: TopProductsProps) => parseFloat(product.totalSales));
      setTopProducts({ productNames, totalSales });
    };

    const loadMonthSales = async () => {
      const { data }: { data: SalesMonth } = await getSalesByMonthReport();

      const salesMonth = data.sales.map((sale) => ({
        x: sale.date,
        y: Number(sale.total_sales)
      }));

      setMonthlySales({ x: salesMonth.map(sale => sale.x), y: salesMonth.map(sale => sale.y) });
    }

    const fetchData = async () => {
      const { startDate: weeklyStartDate, endDate: weeklyEndDate } = getWeeklyDates();
      const weeklyResponse = await getSalesByDates(weeklyStartDate, weeklyEndDate);
      processSalesData(weeklyResponse.data, setWeeklySales);

      const { startDate: todayStartDate, endDate: todayEndDate } = getTodayDates();
      const todayResponse = await getSalesByDates(todayStartDate, todayEndDate);
      processSalesData(todayResponse.data, setTodaySales);
    };

    fetchData();
    loadMonthSales();
    loadTopsProducts();
  }, []);

  const getTodayDates = () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const startDate = todayStart.toISOString().split('T')[0];
    const endDate = todayEnd.toISOString().split('T')[0];
    return { startDate, endDate };
  };

  const getWeeklyDates = () => {
    const today = new Date();
    const firstDayOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const lastDayOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 6);
    const startDate = firstDayOfWeek.toISOString().split('T')[0];
    const endDate = lastDayOfWeek.toISOString().split('T')[0];
    return { startDate, endDate };
  };

  const processSalesData = (salesData: SalesProps[], setData: (data: { x: string[]; y: number[] }) => void) => {
    const sortedSales = salesData
      .map(sale => ({
        total: parseFloat(sale.total.toString()),
        date: new Date(sale.date)
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const salesDates = sortedSales.map(sale => sale.date.toISOString().split('T')[0]);
    const salesTotals = sortedSales.map(sale => sale.total);

    setData({ x: salesDates, y: salesTotals });
  };

  return (
    <Container>
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-secondary">Informes y estadísticas</h2>

        <div className="flex space-y-5 lg:space-y-0 mt-5 space-x-0 lg:space-x-2 flex-col lg:flex-row items-stretch w-full">
          <div className="w-full lg:w-1/2">
            <ChartArea
              dataY={todaySales.y}
              dataX={todaySales.x}
              title="Ventas de hoy"
              value={todaySales.y.reduce((a, b) => a + b, 0)}
            />
          </div>
          <div className="w-full lg:w-1/2">
            <ChartArea
              dataY={weeklySales.y}
              dataX={weeklySales.x}
              title="Ventas semanales"
              value={weeklySales.y.reduce((a, b) => a + b, 0)}
            />
          </div>
        </div>

        <div className="flex mt-5 space-y-5 lg:space-y-0 lg:space-x-2 flex-col lg:flex-row items-center w-full">
          <ChartArea
            dataY={monthlySales.y}
            dataX={monthlySales.x}
            title="Ventas mensuales"
            value={monthlySales.y.reduce((a, b) => a + b, 0)}
          />
          <ChartPie
            label='Cantidad'
            title='Top mas vendidos'
            products={topProducts.productNames}
            quantity={topProducts.totalSales}
          />
        </div>
      </section>
    </Container>
  );
}
