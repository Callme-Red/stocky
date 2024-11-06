import { useState } from "react";
import { SalesByCustomerMonthProps } from "../../../types/types";
import { getSalesByCustomerYear } from "../../../api/sales/customers";
import Container from "../../../layout/Container";
import SalesByCustomerMonth from "../SalesByCustomerMonth";
import ModalYearSales from "../../../section/reports/ModalYearSales";
import PDFContainer from "../../../layout/PDFContainer";

export default function SalesByCustomerYearReport() {
  const [isShowModal, setIsShowModal] = useState(true);
  const [sales, setSales] = useState<SalesByCustomerMonthProps[] | null>(null);
  const [datesMonth, setDatesMonth] = useState({
    startDate: '',
    endDate: ''
  });

  async function onApplyYear(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    setDatesMonth({ startDate: startDate.toLocaleDateString(), endDate: endDate.toLocaleDateString() })

    const { data } = await getSalesByCustomerYear(year);

    setSales(data);
  }

  return (
    <Container>
      <div className="h-full">
        {isShowModal && <ModalYearSales onClose={() => setIsShowModal(false)} onApply={onApplyYear} />}
        {sales && (
          <PDFContainer name="Ventas por clientes anualmente">
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
