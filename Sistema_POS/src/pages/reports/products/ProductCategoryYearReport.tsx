import { useState } from "react";
import { getBestSellingCategoryProductsYear } from "../../../api/inventory/products";
import { SalesByCategoryProductsProps } from "../../../types/types";
import Container from "../../../layout/Container";
import ModalYearSales from "../../../section/reports/ModalYearSales";
import BestSellingCategoryProducts from "../BestSellingCategoryProducts";
import PDFContainer from "../../../layout/PDFContainer";

export default function ProductCategoryYearReport() {
  const [isShowModal, setIsShowModal] = useState(true);
  const [products, setProducts] = useState<SalesByCategoryProductsProps | null>(null);
  const [datesYear, setDatesYear] = useState({
    startDate: '',
    endDate: ''
  });

  async function onApplyYearCategoryProducts(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    setDatesYear({ startDate: startDate.toLocaleDateString(), endDate: endDate.toLocaleDateString() })

    const { data } = await getBestSellingCategoryProductsYear(year);

    setProducts(data);
  }

  return (
    <Container>
      <div className="h-full">
        {isShowModal && <ModalYearSales onApply={onApplyYearCategoryProducts} onClose={() => setIsShowModal(false)} />}
        {products && (
          <PDFContainer name="Reporte de categoria mas vendida anualmente">
            <BestSellingCategoryProducts
              name="Reporte de categoria mas vendida anualmente"
              products={products}
              startDate={datesYear.startDate}
              endDate={datesYear.endDate}
            />
          </PDFContainer>
        )}
      </div>
    </Container>
  );
}
