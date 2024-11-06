import ModalMonthSales from "../../../section/reports/ModalMonthSales";
import Container from "../../../layout/Container";
import { useState } from "react";
import { getBestSellingCategoryProducts } from "../../../api/inventory/products";
import { SalesByCategoryProductsProps } from "../../../types/types";
import BestSellingCategoryProducts from "../BestSellingCategoryProducts";
import PDFContainer from "../../../layout/PDFContainer";

export default function ProductCategorySalesMonthReport() {
  const [isShowModal, setIsShowModal] = useState(true);
  const [products, setProducts] = useState<SalesByCategoryProductsProps | null>(null);
  const [datesMonth, setDatesMonth] = useState({
    startDate: '',
    endDate: ''
  });

  async function onApplyCategoryProductsMonth(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    setDatesMonth({ startDate: startDate.toLocaleDateString(), endDate: endDate.toLocaleDateString() });

    const { data } = await getBestSellingCategoryProducts(year, month);
    setProducts(data);
  }

  return (
    <Container>
      <div className="h-full">
        {isShowModal && <ModalMonthSales onClose={() => setIsShowModal(false)} onApply={onApplyCategoryProductsMonth} />}
        {products && (
          <PDFContainer name="Reporte de categorias mas vendida mensualmente">
            <BestSellingCategoryProducts
              name="Reporte de categorias mas vendida mensualmente"
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
