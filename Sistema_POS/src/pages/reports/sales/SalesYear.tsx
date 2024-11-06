import { useState } from "react";
import Container from "../../../layout/Container";
import PDFContainer from "../../../layout/PDFContainer";
import { getSalesByYear } from "../../../api/sales/sales";
import ModalTypeSales from "../../../section/reports/ModalTypeSales";
import SalesYearReport from "../SalesYearReport";

export default function SalesYear() {
  const [isShowModal, setIsShowModal] = useState(true);
  const [sales, setSales] = useState(null);
  const [datesMonth, setDatesMonth] = useState({
    startDate: '',
    endDate: ''
  });

  async function onApply(year: number, month: number, voucher: boolean, letterhead: boolean) {
    const startDate = new Date(year, 0, 1);
    console.log(month)
    const endDate = new Date(year, 11, 31);
    setDatesMonth({ startDate: startDate.toLocaleDateString(), endDate: endDate.toLocaleDateString() })

    const { data } = await getSalesByYear(year, voucher, letterhead);

    const salesArray = Object.entries(data)
      .filter(([key]) => key)
      .map(([key, value]: [key: string, value: number]) => ({
        month: key,
        sales: `C$ ${parseFloat(value.toString()).toFixed(2)}`
      }));

    setSales(salesArray);
  }

  return (
    <Container>
      <div className="h-full">
        {isShowModal && <ModalTypeSales onClose={() => setIsShowModal(false)} onApply={onApply} visible />}
        {sales && (
          <PDFContainer name="Reporte de ventas anuales">
            <SalesYearReport
              sales={sales}
              startDate={datesMonth.startDate}
              endDate={datesMonth.endDate}
            />
          </PDFContainer>
        )}
      </div>
    </Container>
  );
}
