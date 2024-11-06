import { useState } from "react";
import ModalMonthSales from "../../../section/reports/ModalMonthSales";
import { ExpensesMonthProps } from "../../../types/types";
import { getExpenseMonthyReport } from "../../../api/purchase/expense";
import ExpenseMonth from "../ExpenseMonth";
import Container from "../../../layout/Container";
import PDFContainer from "../../../layout/PDFContainer";

export default function ExpenseReport() {
  const [isShowModal, setIsShowModal] = useState(true);
  const [expenses, setExpenses] = useState<ExpensesMonthProps | null>(null);
  const [datesMonth, setDatesMonth] = useState({
    startDate: '',
    endDate: ''
  });

  async function onApply(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    setDatesMonth({ startDate: startDate.toLocaleDateString(), endDate: endDate.toLocaleDateString() });

    const { data } = await getExpenseMonthyReport(year, month);
    setExpenses(data);
  }

  return (
    <Container>
      <div className="h-full">
        {isShowModal && <ModalMonthSales onClose={() => setIsShowModal(false)} onApply={onApply} />}
        {expenses && (
          <PDFContainer name="Reporte de gastos mensuales">
            <ExpenseMonth
              data={expenses}
              startDate={datesMonth.startDate}
              endDate={datesMonth.endDate}
            />
          </PDFContainer>
        )}
      </div>
    </Container>
  );
}
