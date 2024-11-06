import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import Container from '../../layout/Container'
import { Toaster } from 'react-hot-toast'
import { Delete, Search } from '../../icons/icons'
import Button from '../../components/form/Button';
import FieldInputWithElement from '../../components/form/FieldInputWithElement';
import FieldSelect from '../../components/form/FieldSelect';
import FieldInput from '../../components/form/FieldInput';
import ProductModal from '../../section/purchase/ProductModal';
import { getPaymentMethod } from '../../api/purchase/payment';
import { getVendors } from '../../api/purchase/vendor';
import { currencyFormatter, mapToSelectOptions } from '../../utils/function';
import { showToast } from '../../components/Toast';
import { createProductDetailsPurchase, createPurchase, deleteProductDetailsPurchase, getPurchasesId, updateProductDetailsPurchase, updatePurchase } from '../../api/purchase/purchase';
import DiscountModal from '../../section/purchase/DiscountModal';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductsProps, PurchaseProps, VendorProps } from '../../types/types';
import SubHeader from '../../components/SubHeader';
import { getProductByCode } from '../../api/inventory/products';

interface ProductActive {
  IDProduct: string;
  CodigoProducto: string;
  price: number;
  NombreProducto: string;
  quantity: number;
  discount: number;
  cost?: number;
}

export default function Purchase() {
  const navigate = useNavigate();
  const [barcode, setBarcode] = useState<string>('');
  const formRef = useRef<HTMLFormElement | null>(null);
  const purchaseRef = useRef<PurchaseProps>(null);
  const [inputText, setInputText] = useState("");
  const { id } = useParams() ?? { id: '' };
  const [productsActive, setProductsActive] = useState<ProductActive[]>([]);
  const [paymentMethod, setPaymentMethod] = useState([]);
  const [vendor, setVendor] = useState([]);
  const [information, setInformation] = useState({
    paymentMethod: '',
    vendor: ''
  })

  const [discount, setDiscount] = useState({
    discount: 0,
    discountType: false
  });

  const loadPurchaseById = useCallback(async (IDPurchase: string) => {
    const { data } = await getPurchasesId(IDPurchase);
    const purchaseData: PurchaseProps = data;
    purchaseRef.current = purchaseData;

    const activeProducts = purchaseData.details.map((product) => ({
      IDProduct: product.IDProduct,
      CodigoProducto: product.productCode,
      price: 0,
      NombreProducto: product.productName,
      quantity: product.quantity,
      discount: Number(product.discount),
      cost: Number(parseFloat(product.cost.toString()).toFixed(2)),
    }));

    setProductsActive(activeProducts);
    setInformation({
      paymentMethod: purchaseData.IDPaymentMethod,
      vendor: purchaseData.IDSupplier
    })

    setDiscount({ ...discount, discount: Number(purchaseData.discount) });
  }, []);

  useEffect(() => {
    if (id) loadPurchaseById(id);
  }, [id, loadPurchaseById]);

  const [isModalOpen, setIsModalOpen] = useState({
    ProductModal: false,
    DiscountModal: false
  });


  const handleApplyDiscount = (discount: number, discountType: boolean) => {
    setDiscount({ discount, discountType })
  };

  useEffect(() => {
    async function loadData() {
      try {
        const { data: paymentData } = await getPaymentMethod();
        const paymentOptions = mapToSelectOptions(paymentData, 'IDPaymentMethod', 'name');
        setPaymentMethod(paymentOptions);

        const { data: vendorData }: { data: VendorProps[] } = await getVendors();
        const vendorOptions = mapToSelectOptions(vendorData.filter(vendor => vendor.state), 'IDSupplier', 'name');
        setVendor(vendorOptions);
        if (!id) setInformation({ paymentMethod: paymentOptions[0].value, vendor: vendorOptions[0].value })

      } catch (error) {
        console.error("Error loading data:", error);
      }
    }

    loadData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputText(value);
    if (value) handleShowModals('ProductModal', true);
  };

  const handleShowModals = (name: keyof typeof isModalOpen, value: boolean) => {
    setIsModalOpen({ ...isModalOpen, [name]: value })
  }

  const handleDeleteProduct = (IDProduct: string) => {
    setProductsActive((prevProductsActive) =>
      prevProductsActive.filter((product) => product.IDProduct !== IDProduct)
    );
  };

  const handleQuantityChange = (IDProduct: string, value: string | number, name: keyof ProductActive) => {
    setProductsActive((prevProductsActive) =>
      prevProductsActive.map((product) =>
        product.IDProduct === IDProduct
          ? { ...product, [name]: value }
          : product
      )
    );
  };

  const calculateSubtotal = () => {
    return productsActive.reduce(
      (acc, product) => acc + (product.cost ?? 0 - product.discount) * product.quantity,
      0
    );
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (productsActive.length === 0) {
      showToast('Debe agregar al menos un producto', false);
      return;
    }

    const subTotal = calculateSubtotal().toFixed(2)

    const products = productsActive.map((product) => ({
      IDProduct: product.IDProduct,
      quantity: product.quantity,
      cost: product.cost,
      subTotal: (product.quantity * product.cost).toFixed(2),
      discount: 0,
      tax: 0,
      total: (product.quantity * product.cost).toFixed(2),
      status: true
    }));

    const validateCostProduct = products.find(product => Number(product.cost.toFixed(0)) === 0)
    const validateQuantityProduct = products.find(product => Number(product.quantity.toFixed(0)) === 0)

    if (validateCostProduct) {
      showToast('No puedes agregar productos sin costo', false);
      return;
    }

    if (validateQuantityProduct) {
      showToast('No puedes agregar productos sin cantidad', false);
      return;
    }

    const formData = {
      IDSupplier: information.vendor,
      IDPaymentMethod: information.paymentMethod,
      subTotal: subTotal,
      discount: discount.discount,
      tax: 0,
      total: Number(subTotal) - Number(discount.discount),
      status: true,
      details: products
    }

    if (id) {
      const successDate = await updatePurchaseProduct(formData);
      if (!successDate) return;

      const { success, error } = await updatePurchase(id, formData)

      if (success) {
        showToast('Compra actualizada exitosamente', true);

        setTimeout(() => {
          loadPurchaseById(id);
        }, 1500)
      } else {
        showToast(error.message, false)
      }

      return;
    }

    const { success, error } = await createPurchase(formData);
    if (success) {
      showToast('Compra guardada exitosamente', true);
      clearForm()
    } else {
      showToast(error.message, false)
    }
  }

  function clearForm() {
    formRef.current?.reset();
    setProductsActive([]);
  }

  function updatePurchaseProduct(purchase: any): boolean {
    let result = true;

    purchase.details.forEach(async (product) => {
      const originalProduct = purchaseRef.current?.details.find(
        (p) => p.IDProduct === product.IDProduct
      );

      if (
        originalProduct &&
        (originalProduct.quantity !== product.quantity ||
          originalProduct.cost !== product.cost)
      ) {
        const { success, error } = await updateProductDetailsPurchase(originalProduct.IDPurchaseDetail, product);

        if (!success) {
          showToast(error.message, false)
          result = false;
        }
      }
    });

    const deletedProducts = purchaseRef.current?.details.filter(
      (originalProduct) =>
        !purchase.details.some((p) => p.IDProduct === originalProduct.IDProduct)
    );

    if (deletedProducts?.length) {
      deletedProducts.forEach(async (deletedProduct) => {
        const { success, error } = await deleteProductDetailsPurchase(deletedProduct.IDPurchaseDetail);
        if (!success) {
          showToast(error.message, false)
          result = false;
        }
      });
    }

    const newProducts = purchase.details.filter(
      (product) =>
        !purchaseRef.current?.details.some(
          (originalProduct) => originalProduct.IDProduct === product.IDProduct
        )
    );

    if (newProducts.length) {
      newProducts.forEach(async (newProduct) => {
        const product = { ...newProduct, IDPurchase: id }
        const { success, error } = await createProductDetailsPurchase(product);

        if (!success) {
          showToast(error.message, false)
          result = false;
        }
      });
    }

    return result;
  }

  const handleBarcodeScan = useCallback(async (scannedCode: string) => {
    const { data, success, error } = await getProductByCode(scannedCode)

    if (!success) {
      showToast(error.message, false);
      return;
    }

    const productByCode: ProductsProps = data

    const isProductAlreadyActive = productsActive.some(product => product.IDProduct === productByCode.IDProducto);

    if (isProductAlreadyActive) {
      showToast('El producto ya esta incluido en la compra.', false);
      return;
    }

    setProductsActive([...productsActive, {
      IDProduct: data.IDProducto,
      discount: 0,
      price: data.precio_producto.Precio,
      NombreProducto: data.NombreProducto,
      quantity: 1,
      CodigoProducto: data.CodigoProducto,
    }])
  }, [productsActive]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isInteractiveElement =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLButtonElement ||
        (event.target as HTMLElement).hasAttribute('contenteditable');

      if (isInteractiveElement) return;

      if (event.key === 'Tab') {
        event.preventDefault();
        if (barcode) {
          handleBarcodeScan(barcode);
        }
        setBarcode('');
      } else if (event.key.length === 1) {
        setBarcode((prev) => prev + event.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [barcode, handleBarcodeScan]);


  function handleFormSubmit() {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  }

  return (
    <Container text='Compra no guardada' onClickSecondary={() => navigate('/purchases/')} save onSaveClick={handleFormSubmit}>
      <>
        <Toaster />
        <section className="flex flex-col items-center h-full">
          <div className="max-w-screen-lg mt-5 w-full mx-auto">
            <SubHeader title='Registrar compra' />
            <form onSubmit={handleSubmit} ref={formRef} className="flex flex-col md:flex-row items-start">
              <div className="flex-1 md:w-auto w-full">
                <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-8">
                  <div className="m-4">
                    <h2 className={`font-semibold mb-3`}>Detalles</h2>
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
                  {productsActive.length !== 0 &&
                    <div className="relative overflow-x-auto">
                      <div className="md:hidden">
                        {productsActive.map((product) => (
                          <div key={product.IDProduct} className="bg-white rounded-lg p-4 mb-4">
                            <div className="flex flex-col">
                              <div className="flex justify-between">
                                <span className="text-[#005bd3] text-[15px] cursor-pointer font-medium hover:underline">
                                  {product.NombreProducto}
                                </span>
                                <button
                                  type="button"
                                  className="hover:bg-gray-200 p-1 rounded-lg cursor-pointer"
                                  onClick={() => handleDeleteProduct(product.IDProduct)}
                                >
                                  <Delete className="w-5 h-5 text-gray-500" />
                                </button>
                              </div>
                              {product.discount !== 0 && (
                                <span className="text-gray-500 text-[13px] font-medium">{`Descuento (-C$ ${product.discount.toFixed(2)}) NIO`}</span>
                              )}
                              <div className="flex">
                                <div className="mt-2 flex flex-col">
                                  <span className="font-medium mr-2">Cantidad</span>
                                  <FieldInput
                                    className="mb-0 w-24"
                                    name=""
                                    isNumber
                                    id={`quantity-${product.IDProduct}`}
                                    value={product.quantity}
                                    onChange={(e) => handleQuantityChange(product.IDProduct, Number(e.target.value), 'quantity')}
                                  />
                                </div>
                                <div className="mt-2 flex flex-col ml-3">
                                  <span className="font-medium mr-2">Costo</span>
                                  <FieldInput
                                    className="mb-0 w-24"
                                    name=''
                                    isNumber
                                    id={`cost-${product.IDProduct}`}
                                    value={product.cost ?? 0}
                                    onChange={(e) => handleQuantityChange(product.IDProduct, Number(e.target.value), 'cost')}
                                  />
                                </div>
                                <div className="mt-2 flex flex-col ml-3">
                                  <span className="font-medium text-right">Total</span>
                                  <span className="text-right font-medium text-lg">
                                    {currencyFormatter((product.cost ?? 0 - product.discount) * product.quantity)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <table className="w-full hidden md:table text-sm text-left rtl:text-right">
                        <thead className="[&>tr>th]:text-sm border-b border-gray-200 [&>tr>th]:text-primary [&>tr>th]:font-semibold">
                          <tr>
                            <th className="py-3 px-4 w-[80%]">
                              Producto
                            </th>
                            <th className="px-4 py-3">
                              Cantidad
                            </th>
                            <th className="px-4 py-3">
                              Costo
                            </th>
                            <th className="px-4 py-3 w-1/3 text-right">
                              Total
                            </th>
                            <th className="px-4 py-3 w-24"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {productsActive.map((product) => (
                            <tr key={product.IDProduct}>
                              <td className="px-4 py-3 w-[80%] text-sm text-primary">
                                <div className="w-full flex flex-col">
                                  <span className="text-[#005bd3] text-[15px] cursor-pointer font-medium hover:underline">
                                    {product.NombreProducto}
                                  </span>
                                  <span className="text-[#005bd3] text-[15px] cursor-pointer font-medium hover:underline mt-1">
                                    {product.CodigoProducto}
                                  </span>
                                </div>
                              </td>

                              <td className="px-4 py-3">
                                <FieldInput
                                  className="mb-0 w-32"
                                  name=""
                                  isNumber
                                  id={`quantity-${product.IDProduct}`}
                                  value={product.quantity}
                                  onChange={(e) => handleQuantityChange(product.IDProduct, Number(e.target.value), 'quantity')}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <FieldInput
                                  className="mb-0 w-32"
                                  name=''
                                  isNumber
                                  id={`cost-${product.IDProduct}`}
                                  value={product.cost ?? 0}
                                  onChange={(e) => handleQuantityChange(product.IDProduct, Number(e.target.value), 'cost')}
                                />
                              </td>
                              <td className="py-3 pr-4 text-right">
                                <span>{currencyFormatter((product.cost ?? 0 - product.discount) * product.quantity)}</span>
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
                  }
                </div>
                <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-8 px-4 py-5">
                  <h2 className={`font-semibold mb-3`}>Productos</h2>
                  <div className="border border-gray-300 rounded-lg py-2 px-3">
                    <div className="grid grid-cols-3 mt-4 w-full">
                      <span className="font-medium text-sm text-secondary">
                        Subtotal
                      </span>
                      <span className="text-sm text-whiting font-medium">
                        {productsActive.length !== 0 ? productsActive.length + ' items' : ''}
                      </span>
                      <span className="font-medium text-sm text-secondary text-right">
                        C$ {calculateSubtotal().toFixed(2)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 mt-4 w-full">
                      <span role='button' onClick={() => id !== '' && handleShowModals('DiscountModal', true)} className={`font-medium w-auto ${productsActive.length !== 0 ? 'text-[#005bd3] hover:underline' : 'text-[#bbb]'} text-sm `}>
                        Agregar descuento
                      </span>
                      <span className="text-sm text-whiting font-medium">{discount.discount === 0 ? '—' : 'Descuento aplicado'}</span>
                      <span className="font-medium text-sm text-secondary text-right">
                        -C$ {discount.discountType ? (Number(calculateSubtotal().toFixed(2)) * (Number(discount.discount) / 100)).toFixed(2) : discount.discount.toFixed(2)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 mt-4 w-full">
                      <span className="font-medium text-sm text-[#bbb]">
                        Impuesto
                      </span>
                      <span className="text-sm text-whiting font-medium">
                        No calculado
                      </span>
                      <span className="font-medium text-sm text-secondary text-right">
                        C$ 0.00
                      </span>
                    </div>

                    <div className="flex items-center mt-4 justify-between">
                      <span className="font-semibold text-sm text-primary">
                        Total
                      </span>
                      <span className="font-semibold text-sm text-primary">
                        C$ {discount.discountType ? (Number(calculateSubtotal().toFixed(2)) - (Number(calculateSubtotal().toFixed(2)) * (Number(discount.discount) / 100))).toFixed(2) : (Number(calculateSubtotal().toFixed(2)) - discount.discount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/3">
                <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-8 w-full px-3 py-5 md:ml-8">
                  <h2 className={`font-semibold text-[15px] mb-3`}>Proveedor</h2>
                  <FieldSelect
                    name=""
                    id="IDSupplier"
                    options={vendor}
                    value={information.vendor}
                    onChange={(value) => setInformation({ ...information, vendor: value.toString() })}
                  />
                </div>

                <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-4 w-full px-3 py-5 md:ml-8">
                  <h2 className={`font-semibold text-[15px] mb-3`}>
                    Información de pago
                  </h2>
                  <FieldSelect
                    name="Metodo de pago"
                    className="mb-5"
                    id="IDPaymentMethod"
                    options={paymentMethod}
                    value={information.paymentMethod}
                    onChange={(value) => setInformation({ ...information, paymentMethod: value.toString() })}
                  />
                </div>
              </div>
            </form>
          </div>
        </section>
        {isModalOpen.ProductModal && <ProductModal isSales={1} onClose={() => { handleShowModals('ProductModal', false); setInputText('') }} productsActive={productsActive} setProductsActive={setProductsActive} />}
        {isModalOpen.DiscountModal && <DiscountModal onApplyDiscount={handleApplyDiscount} onClose={() => handleShowModals('DiscountModal', false)} />}
      </>
    </Container>
  )
}
