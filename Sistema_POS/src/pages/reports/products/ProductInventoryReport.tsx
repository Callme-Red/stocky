import { useEffect, useState } from "react";
import { ProductsProps } from "../../../types/types";
import Container from "../../../layout/Container";
import PDFContainer from "../../../layout/PDFContainer";
import InventoryProductReport from "../InventoryProductReport";
import { getProducts } from "../../../api/inventory/products";

export default function ProductInventoryReport() {
  const [inventory, setInventory] = useState<ProductsProps[] | null>(null);

  useEffect(() => {
    async function loadInventory() {
      const { data } = await getProducts();
      setInventory(data);
    }

    loadInventory();
  }, [])

  return (
    <Container>
      <div className="h-full">
        {inventory && (
          <PDFContainer name="Reporte de inventario por producto">
            <InventoryProductReport
              products={inventory}
            />
          </PDFContainer>
        )}
      </div>
    </Container>
  );
}
