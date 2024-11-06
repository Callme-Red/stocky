import { useEffect, useState } from "react";
import { CategoryExpenseReportProps } from "../../../types/types";
import { getCategoryExpenseReport } from "../../../api/purchase/expense";
import Container from "../../../layout/Container";
import CategoryExpenseReport from "../CategoryExpense";
import PDFContainer from "../../../layout/PDFContainer";

export default function ExpenseCategoryReport() {
  const [expenses, setExpenses] = useState<CategoryExpenseReportProps | null>(null);

  function getFirstAndLastDayOfMonth() {
    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const formattedFirstDay = `${firstDay.getDate().toString().padStart(2, '0')}/${(firstDay.getMonth() + 1).toString().padStart(2, '0')}/${firstDay.getFullYear()}`;
    const formattedLastDay = `${lastDay.getDate().toString().padStart(2, '0')}/${(lastDay.getMonth() + 1).toString().padStart(2, '0')}/${lastDay.getFullYear()}`;

    return { formattedFirstDay, formattedLastDay };
  }

  const { formattedFirstDay, formattedLastDay } = getFirstAndLastDayOfMonth();

  useEffect(() => {
    async function loadCategoryExpense() {
      const { data } = await getCategoryExpenseReport();
      setExpenses(data);
    }

    loadCategoryExpense();
  }, [])

  return (
    <Container>
      <div className="h-full">
        {expenses && (
          <PDFContainer name="Reportes de categoria de gastos">
            <CategoryExpenseReport
              category={expenses}
              startDate={formattedFirstDay}
              endDate={formattedLastDay}
            />
          </PDFContainer>
        )}
      </div>
    </Container>
  );
}
