import { useState } from "react";
import { getBestSellingProductsYear } from "../../../api/inventory/products";
import { BestSellingProductsProps } from "../../../types/types";
import Container from "../../../layout/Container";
import BestSellingProducts from "../BestSellingProducts";
import ModalYearSales from "../../../section/reports/ModalYearSales";
import PDFContainer from "../../../layout/PDFContainer";

export default function ProductSalesYearReport() {
  const [isShowModal, setIsShowModal] = useState(true);
  const [products, setProducts] = useState<BestSellingProductsProps[] | null>(null);
  const [datesYear, setDatesYear] = useState({
    startDate: '',
    endDate: ''
  });

  async function onApplyYear(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    setDatesYear({ startDate: startDate.toLocaleDateString(), endDate: endDate.toLocaleDateString() })

    const { data } = await getBestSellingProductsYear(year);

    setProducts(data);
  }

  return (
    <Container>
      <div className="h-full">
        {isShowModal && <ModalYearSales onApply={onApplyYear} onClose={() => setIsShowModal(false)} />}
        {products && (
          <PDFContainer name="Reporte de productos mas vendidos anualmente">
            <BestSellingProducts
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
