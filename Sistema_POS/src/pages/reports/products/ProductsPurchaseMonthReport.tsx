import { useState } from "react";
import ModalMonthSales from "../../../section/reports/ModalMonthSales";
import Container from "../../../layout/Container";
import { getBestBuyingProductsMonth } from "../../../api/inventory/products";
import { BestBuyingProductsProps } from "../../../types/types";
import BestBuyingProducts from "../BestBuyingProducts";
import PDFContainer from "../../../layout/PDFContainer";

export default function ProductPurchaseMonthReport() {
  const [isShowModal, setIsShowModal] = useState(true);
  const [products, setProducts] = useState<BestBuyingProductsProps[] | null>(null);
  const [datesMonth, setDatesMonth] = useState({
    startDate: '',
    endDate: ''
  });

  async function onApplyMonthSales(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    setDatesMonth({ startDate: startDate.toLocaleDateString(), endDate: endDate.toLocaleDateString() });

    const { data } = await getBestBuyingProductsMonth(year, month);
    setProducts(data);
  }

  return (
    <Container>
      <div className="h-full">
        {isShowModal && <ModalMonthSales onClose={() => setIsShowModal(false)} onApply={onApplyMonthSales} />}
        {products && (
          <PDFContainer name="Productos mas comprandos mensualmente">
            <BestBuyingProducts
              products={products}
              startDate={datesMonth.startDate}
              endDate={datesMonth.endDate}
            />
          </PDFContainer>
        )}
      </div>
    </Container>
  );
}
