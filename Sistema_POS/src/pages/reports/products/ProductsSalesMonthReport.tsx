import { useState } from "react";
import ModalMonthSales from "../../../section/reports/ModalMonthSales";
import Container from "../../../layout/Container";
import { getBestSellingProductsMonth } from "../../../api/inventory/products";
import BestSellingProducts from "../BestSellingProducts";
import { BestSellingProductsProps } from "../../../types/types";
import PDFContainer from "../../../layout/PDFContainer";

export default function ProductSalesMonthReport() {
  const [isShowModal, setIsShowModal] = useState(true);
  const [products, setProducts] = useState<BestSellingProductsProps[] | null>(null);
  const [datesMonth, setDatesMonth] = useState({
    startDate: '',
    endDate: ''
  });

  async function onApply(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    setDatesMonth({ startDate: startDate.toLocaleDateString(), endDate: endDate.toLocaleDateString() });

    const { data } = await getBestSellingProductsMonth(year, month);
    setProducts(data);
  }

  return (
    <Container>
      <div className="h-full">
        {isShowModal && <ModalMonthSales onClose={() => setIsShowModal(false)} onApply={onApply} />}
        {products && (
          <PDFContainer name="Productos de ventas mensualmente">
            <BestSellingProducts
              products={products ?? []}
              startDate={datesMonth.startDate}
              endDate={datesMonth.endDate}
            />
          </PDFContainer>
        )}
      </div>
    </Container>
  );
}
