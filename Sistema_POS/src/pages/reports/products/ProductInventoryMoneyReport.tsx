import { useEffect, useState } from "react";
import { ProductInventoryMoneyProps } from "../../../types/types";
import Container from "../../../layout/Container";
import PDFContainer from "../../../layout/PDFContainer";
import ProductInventoryMoneyReport from "../ProductInventoryMoneyReport";
import { getInventoryMoney } from "../../../api/inventory/inventory";

export default function ProductInventoryMoneyReports() {
  const [inventory, setInventory] = useState<ProductInventoryMoneyProps[] | null>(null);

  useEffect(() => {
    async function loadInventory() {
      const { data } = await getInventoryMoney();
      setInventory(data);
    }

    loadInventory();
  }, [])

  return (
    <Container>
      <div className="h-full">
        {inventory && (
          <PDFContainer name="Reporte de inventario por producto monetario">
            <ProductInventoryMoneyReport
              products={inventory}
            />
          </PDFContainer>
        )}
      </div>
    </Container>
  );
}
