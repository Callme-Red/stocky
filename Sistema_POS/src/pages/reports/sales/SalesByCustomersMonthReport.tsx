import { useState } from "react";
import ModalMonthSales from "../../../section/reports/ModalMonthSales";
import { SalesByCustomerMonthProps } from "../../../types/types";
import Container from "../../../layout/Container";
import SalesByCustomerMonth from "../SalesByCustomerMonth";
import { getSalesByCustomerMonth } from "../../../api/sales/customers";
import PDFContainer from "../../../layout/PDFContainer";

export default function SalesByCustomerMonthReport() {
  const [isShowModal, setIsShowModal] = useState(true);
  const [sales, setSales] = useState<SalesByCustomerMonthProps[] | null>(null);
  const [datesMonth, setDatesMonth] = useState({
    startDate: '',
    endDate: ''
  });

  async function onApply(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    setDatesMonth({ startDate: startDate.toLocaleDateString(), endDate: endDate.toLocaleDateString() });

    const { data } = await getSalesByCustomerMonth(year, month);
    setSales(data);
  }

  return (
    <Container>
      <div className="h-full">
        {isShowModal && <ModalMonthSales onClose={() => setIsShowModal(false)} onApply={onApply} />}
        {sales && (
          <PDFContainer name="Reporte de ventas por clientes mensualmente">
            <SalesByCustomerMonth
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
