import { useState } from "react";
import { ExpensesMonthProps } from "../../../types/types";
import { getExpenseYearReport } from "../../../api/purchase/expense";
import Container from "../../../layout/Container";
import ModalYearSales from "../../../section/reports/ModalYearSales";
import ExpenseYear from "../ExpenseYear";
import PDFContainer from "../../../layout/PDFContainer";

export default function ExpenseYearReport() {
  const [isShowModal, setIsShowModal] = useState(true);
  const [expenses, setExpenses] = useState<ExpensesMonthProps | null>(null);
  const [datesYear, setDatesYear] = useState({
    startDate: '',
    endDate: ''
  });

  async function onApplyYear(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    setDatesYear({ startDate: startDate.toLocaleDateString(), endDate: endDate.toLocaleDateString() })

    const { data } = await getExpenseYearReport(year);

    setExpenses(data);
  }
  return (
    <Container>
      <div className="h-full">
        {isShowModal && <ModalYearSales onApply={onApplyYear} onClose={() => setIsShowModal(false)} />}
        {expenses && (
          <PDFContainer name="Reporte de gastos anuales">
            <ExpenseYear
              expense={expenses}
              startDate={datesYear.startDate}
              endDate={datesYear.endDate}
            />
          </PDFContainer>
        )}
      </div>
    </Container>
  );
}
