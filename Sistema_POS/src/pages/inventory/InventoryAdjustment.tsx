import Container from "../../layout/Container";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import SubHeader from "../../components/SubHeader";
import FieldInput from "../../components/form/FieldInput";
import FieldInputWithElement from "../../components/form/FieldInputWithElement";
import { showToast } from "../../components/Toast";
import { createAdjustmentInventory } from "../../api/inventory/inventory";
import { ProductActive } from "../../types/types";
import ProductModal from "../../section/purchase/ProductModal";
import { Delete, Search } from "../../icons/icons";
import Button from "../../components/form/Button";

export default function InventoryAdjustment() {
  const [isModal, setIsModal] = useState<boolean>();
  const [inputText, setInputText] = useState("");
  const [productsActive, setProductsActive] = useState<ProductActive[]>([]);

  async function handleSubmit() {
    let allSuccess = true;

    productsActive.forEach(async ({ quantity, existencia, cost, IDProduct }) => {
      const adjustment = Number(existencia) - Number(quantity);
      const typeMoviment = Number(adjustment) < 0 ? '2' : '3';

      const formData = {
        movement_type: typeMoviment,
        quantity: Math.abs(adjustment),
        cost: cost,
        IDProduct: IDProduct
      };

      const { success, error } = await createAdjustmentInventory(formData);

      if (!success) {
        allSuccess = false;
        showToast(error.message, false);
      }
    })

    if (allSuccess) {
      showToast('Ajuste de inventario realizado exitosamente', true);
      setProductsActive([]);
    }
  }

  const handleDeleteProduct = (IDProduct: string) => {
    setProductsActive((prevProductsActive) =>
      prevProductsActive.filter((product) => product.IDProduct !== IDProduct)
    );
  }

  const handleQuantityChange = (IDProduct: string, newQuantity: number) => {
    setProductsActive((prevProductsActive) =>
      prevProductsActive.map((product) => {
        if (product.IDProduct === IDProduct) {
          return { ...product, quantity: newQuantity };
        }
        return product;
      })
    )
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputText(value);
    if (value) setIsModal(true)
  };


  return (
    <Container save text="Ajuste de inventario no guardado" onSaveClick={handleSubmit}>
      <>
        <Toaster />
        <section className="flex flex-col items-center h-full">
          <div className="max-w-screen-lg mt-5 w-full mx-auto">
            <SubHeader title='Ajuste de inventario' />
            <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-8">
              <div className="m-4">
                <h2 className={`font-semibold mb-3`}>Productos</h2>
                <div className="flex items-center">
                  <FieldInputWithElement
                    name=""
                    id="name"
                    appendChild={<Search />}
                    className="w-full"
                    placeholder="Buscar productos"
                    value={inputText}
                    onChange={handleInputChange}
                    required={false}
                  />
                  <Button
                    name="Buscar"
                    className="bg-[#f7f7f7] shadow-lg border border-gray-300 ml-2 h-10"
                  />
                </div>
              </div>

              {productsActive.length !== 0 && (
                <div className="relative overflow-x-auto">
                  <div className="md:hidden">
                    {productsActive.map((product) => (
                      <div key={product.IDProduct} className="bg-white rounded-lg p-4 mb-4">
                        <div className="flex flex-col">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col space-y-2">
                              <span role='button' className="text-[#005bd3] inline-block text-[15px] cursor-pointer font-medium hover:underline">
                                {product.NombreProducto}
                              </span>
                              <span role='button' className="text-[#005bd3] inline-block text-[15px] cursor-pointer font-medium hover:underline">
                                {product.CodigoProducto}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="hover:bg-gray-200 p-1 rounded-lg cursor-pointer"
                              onClick={() => handleDeleteProduct(product.IDProduct)}
                            >
                              <Delete className="w-5 h-5 text-gray-500" />
                            </button>
                          </div>
                          <div className="flex space-x-3 mt-3">
                            <div className="mt-2 flex flex-col">
                              <span className="font-medium mr-2">Cantidad</span>
                              <FieldInput
                                className="mb-0 w-full"
                                name=""
                                isNumber
                                id={`quantity-${product.IDProduct}`}
                                value={product.quantity}
                                onChange={(e) => handleQuantityChange(product.IDProduct, Number(e.target.value))}
                              />
                            </div>
                            <div className="mt-2 flex flex-col">
                              <span className="font-medium mr-2">Total</span>
                              <FieldInput
                                className="mb-0 w-full"
                                name=""
                                isNumber
                                id={`quantity-${product.IDProduct}`}
                                value={product.quantity}
                                onChange={(e) => handleQuantityChange(product.IDProduct, Number(e.target.value))}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <table className="w-full text-sm text-left rtl:text-right hidden md:table">
                    <thead className="[&>tr>th]:text-sm border-b border-gray-200 [&>tr>th]:text-primary [&>tr>th]:font-semibold">
                      <tr>
                        <th className="py-3 px-4">Producto</th>
                        <th className="py-3 px-4">Codigo</th>
                        <th className="px-4 py-3">Cantidad</th>
                        <th className="px-4 py-3">Ajuste</th>
                        <th className="px-4 py-3 w-24"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsActive.map((product) => (
                        <tr key={product.IDProduct}>
                          <td className="px-4 py-3 text-sm text-primary">
                            <span role='button' className="text-[#005bd3] text-[15px] cursor-pointer font-medium hover:underline">
                              {product.NombreProducto}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-primary">
                            <span role='button' className="text-[#005bd3] text-[15px] cursor-pointer font-medium hover:underline">
                              {product.CodigoProducto}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <FieldInput
                              className="mb-0 w-32"
                              name=""
                              isNumber
                              id={`quantity-${product.IDProduct}`}
                              readonly
                              value={product.existencia}
                            />
                          </td>

                          <td className="px-4 py-3">
                            <FieldInput
                              className="mb-0 w-32"
                              name=""
                              isNumber
                              id={`adjustment-${product.IDProduct}`}
                              value={product.quantity}
                              onChange={(e) => handleQuantityChange(product.IDProduct, Number(e.target.value))}
                            />
                          </td>
                          <td className="py-3 pr-4">
                            <button
                              type="button"
                              className="hover:bg-whiting2 p-1 rounded-lg cursor-pointer"
                              onClick={() => handleDeleteProduct(product.IDProduct)}
                            >
                              <Delete className="size-5 text-graying" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
              }

            </div>
          </div>
        </section>

        {isModal && <ProductModal isSales={2} onClose={() => setIsModal(false)} productsActive={productsActive} setProductsActive={setProductsActive} />}
      </>
    </Container>
  );
}
