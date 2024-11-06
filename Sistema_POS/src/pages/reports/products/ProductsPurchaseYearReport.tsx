import { useState } from "react";
import { getBestBuyingProductsYear } from "../../../api/inventory/products";
import { BestBuyingProductsProps } from "../../../types/types";
import Container from "../../../layout/Container";
import BestBuyingProducts from "../BestBuyingProducts";
import ModalYearSales from "../../../section/reports/ModalYearSales";
import PDFContainer from "../../../layout/PDFContainer";

export default function ProductPurchaseYearReport() {
  const [isShowModal, setIsShowModal] = useState(true);
  const [products, setProducts] = useState<BestBuyingProductsProps[] | null>(null);
  const [datesYear, setDatesYear] = useState({
    startDate: '',
    endDate: ''
  });

  async function onApplyYearSales(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    setDatesYear({ startDate: startDate.toLocaleDateString(), endDate: endDate.toLocaleDateString() })

    const { data } = await getBestBuyingProductsYear(year);

    setProducts(data);
  }

  return (
    <Container>
      <div className="h-full">
        {isShowModal && <ModalYearSales onApply={onApplyYearSales} onClose={() => setIsShowModal(false)} />}
        {products && (
          <PDFContainer name="Reporte de productos mas comprados anualmente">
            <BestBuyingProducts
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
