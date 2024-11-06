import { useState } from "react";
import { SalesByCategoryProductsProps } from "../../../types/types";
import { getBestBuyingCategoryProductsMonth } from "../../../api/inventory/products";
import ModalMonthSales from "../../../section/reports/ModalMonthSales";
import Container from "../../../layout/Container";
import BestSellingCategoryProducts from "../BestSellingCategoryProducts";
import PDFContainer from "../../../layout/PDFContainer";

export default function ProductCategoryPurchaseMonthReport() {
  const [isShowModal, setIsShowModal] = useState(true);
  const [products, setProducts] = useState<SalesByCategoryProductsProps | null>(null);
  const [datesMonth, setDatesMonth] = useState({
    startDate: '',
    endDate: ''
  });

  async function onApplyBuyingCategoryProductsMonth(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    setDatesMonth({ startDate: startDate.toLocaleDateString(), endDate: endDate.toLocaleDateString() });

    const { data } = await getBestBuyingCategoryProductsMonth(year, month);
    setProducts(data);
  }

  return (
    <Container>
      <div className="h-full">
        {isShowModal && <ModalMonthSales onClose={() => setIsShowModal(false)} onApply={onApplyBuyingCategoryProductsMonth} />}
        {products && (
          <PDFContainer name="Reporte de categorias mas compradas mensualmente">
            <BestSellingCategoryProducts
              name="Categorias mas compradas mensualmente"
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
