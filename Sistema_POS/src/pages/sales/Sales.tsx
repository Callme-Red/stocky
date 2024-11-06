import { useState, useRef, useEffect, FormEvent, useCallback } from "react";
import { Toaster } from "react-hot-toast";
import { Search } from "../../icons/icons";
import { getPaymentMethod } from "../../api/purchase/payment";
import { decryptName, getFormData, mapToSelectOptions } from "../../utils/function";
import { showToast } from "../../components/Toast";
import { createProductDetailsSale, createSale, deleteProductDetailsSale, getLastCodeSales, getSaleById, updateProductDetailsSale, updateSale } from "../../api/sales/sales";
import { CustomerProps, Discount, ProductActive, ProductsProps, Quotation, SalesProps } from "../../types/types";
import { updateQuotation } from "../../api/sales/quotations";
import { useNavigate, useParams } from "react-router-dom";
import { getCustomers } from "../../api/sales/customers";
import Container from "../../layout/Container";
import FieldInputWithElement from "../../components/form/FieldInputWithElement";
import Button from "../../components/form/Button";
import FieldSelect from "../../components/form/FieldSelect";
import ProductModal from "../../section/purchase/ProductModal";
import DiscountModal from "../../section/purchase/DiscountModal";
import DeliveryModal from "./DeliveryModal";
import QuotationModal from "../quoteation/QuotationModal";
import SubHeader from "../../components/SubHeader";
import SaleListProduct from "../../section/sales/SaleListProduct";
import SaleAccount from "./SaleAccount";
import DateTimePicker from "../../components/form/DateTimePicker";
import ClientSearch from "../../section/account-receivable/ClientSearch";
import FieldInput from "../../components/form/FieldInput";
import StatusTags from "../../components/StatusTags";
import CheckBox from "../../components/form/CheckBox";
import ModalSalesVoucher from "../../section/sales/ModalSalesVoucher";
import { getProductByCode } from "../../api/inventory/products";

interface FormData {
  IDCustomer: string;
  IDPaymentMethod: string;
  SubTotal: number;
  Discount: number;
  Tax: number;
  Total: number;
  status: boolean;
  details: ProductActive[],
  state: string;
  dateExpirated: Date;
  voucher: string;
}

interface CategoryOption {
  label: string;
  value: string;
}

export default function Sales() {
  const navigate = useNavigate();

  const INITIAL_FORM_STATE = {
    selectedClient: '',
    selectedPaymentMethod: '',
    namePaymentMethod: '',
    expirationDate: '',
    voucher: null,
    typeSale: '1',
    costDelivery: 0,
    isVoucher: false,
    noSales: null,
    codeSale: ''
  }

  const [barcode, setBarcode] = useState<string>('');
  const { id } = useParams() ?? { id: '' };
  const formRef = useRef<HTMLFormElement | null>(null);
  const [inputText, setInputText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState({
    ProductModal: false,
    DiscountProduct: false,
    DeliveryModal: false,
    QuotationModal: false,
    TotalModal: false
  });

  const [discounts, setDiscounts] = useState<Discount>({
    discount: 0,
    typeDiscount: false,
    general: false,
  })
  const salesRef = useRef<SalesProps>(null);
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [customersData, setCustomersData] = useState<CustomerProps[]>([])
  const [paymentMethod, setPaymentMethod] = useState([]);
  const [customers, setCustomers] = useState([])
  const [productsActive, setProductsActive] = useState<ProductActive[]>([]);
  const [selectedProductForDiscount, setSelectedProductForDiscount] = useState<ProductActive | null>(null);
  const [quotations, setQuotations] = useState<Quotation>();

  const PAYMENT_METHOD_NAME = 'transferencia';

  const handleChangeFormDateState = (name: keyof typeof formState, value: string | number | boolean) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  const loadSaleById = useCallback(async (saleId: string) => {
    const { data }: { data: SalesProps } = await getSaleById(saleId);

    salesRef.current = data;
    const products: ProductActive[] = data.details.map(({ productCode, IDProduct, productName, productPrice, quantity, discount, }) => ({
      IDProduct,
      price: Number(productPrice),
      NombreProducto: productName,
      CodigoProducto: productCode,
      quantity,
      discount: Number(discount),
    }));

    setProductsActive(products);
    setDiscounts((prev) => ({ ...prev, discount: data.discount ?? 0 }));

    const expirationDate = data.expirationDate ? data.expirationDate.toString() : '';

    setFormState((prevState) => ({
      ...prevState,
      isVoucher: data.isVoucher,
      namePaymentMethod: data.PaymentMethod,
      costDelivery: data.shippingCost,
      expirationDate,
      selectedClient: data.IDClient,
      voucher: data.voucher,
      selectedPaymentMethod: data.IDPaymentMethod,
      typeSale: data.typeSale ? '2' : '1',
      noSales: data.salesCode
    }));
  }, []);

  useEffect(() => {
    async function loadPaymentMethod() {
      const { data } = await getPaymentMethod();
      const options = mapToSelectOptions(data, 'IDPaymentMethod', 'name').reverse();

      if (!id) {
        options.forEach((payment) => {
          if (payment.name.toLocaleLowerCase() === 'efectivo') {
            setFormState({ ...formState, selectedPaymentMethod: payment.value, namePaymentMethod: payment.name })
          }
        })
      }
      setPaymentMethod(options);
    }

    async function loadCustomers() {
      const { data }: { data: CustomerProps[] } = await getCustomers();
      const customerOption: CategoryOption[] = data.filter(customer => customer.state)
        .map(customer => ({
          label: customer.name,
          value: customer.IDClient,
        }));
      setCustomersData(data);

      if (!id) handleChangeFormDateState("selectedClient", customerOption[0].value)
      setCustomers(customerOption);
    }

    loadPaymentMethod();
    loadCustomers();
    if (id) loadSaleById(id);
  }, [id, loadSaleById])

  const handleBarcodeScan = useCallback(async (scannedCode: string) => {
    const { data, success, error } = await getProductByCode(scannedCode)

    if (!success) {
      showToast(error.message, false);
      return;
    }

    const productByCode: ProductsProps = data
    const price = Number(productByCode.precio_producto.Precio)


    if (Number(productByCode.existencias.toFixed(0)) === 0) {
      showToast('El producto no tiene existencias.', false);
      return;
    }

    if (Number(price.toFixed(0)) === 0) {
      showToast('El producto no tiene precio.', false);
      return;
    }

    const isProductAlreadyActive = productsActive.some(product => product.IDProduct === productByCode.IDProducto);

    if (isProductAlreadyActive) {
      showToast('El producto ya esta incluido en la venta.', false);
      return;
    }

    setProductsActive([...productsActive, {
      IDProduct: data.IDProducto,
      discount: 0,
      price: data.precio_producto.Precio,
      NombreProducto: data.NombreProducto,
      quantity: 1,
      CodigoProducto: data.CodigoProducto,
      existencia: data.existencias
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


  async function loadCodeSales() {
    const { data } = await getLastCodeSales();
    handleChangeFormDateState("codeSale", data.last_sales_code);
  }

  const handleSelectQuotation = (quotation: Quotation) => {
    setQuotations(quotation);
    setDiscounts({ ...discounts, discount: Number(quotation.discount) });
    setFormState({ ...formState, selectedClient: quotation.IDClient, costDelivery: Number(quotation.shippingCost) })

    const products = quotation.details.map((product) => ({
      IDProduct: product.IDProduct,
      price: product.price,
      NombreProducto: product.name,
      quantity: product.quantity,
      discount: Number(product.discount),
      existencia: product.stock
    }));

    setProductsActive(products);
  };

  const saveSale = async () => {
    const hasInvalidQuantity = productsActive.some(product => product.quantity <= 0);
    const hasInvalidStock = productsActive.some(product => product.quantity > product.existencia);

    if (productsActive.length === 0) {
      showToast('Debe agregar al menos un producto', false);
      return;
    }

    if (hasInvalidQuantity) {
      showToast('Todos los productos deben tener una cantidad mayor a 0.', false);
      return;
    }

    if (hasInvalidStock) {
      showToast('No se puede tener una cantidad mayor a la existencia del producto.', false);
      return;
    }

    const data: FormData = getFormData(formRef);

    const products = productsActive.map((product) => ({
      IDProduct: product.IDProduct,
      discount: product.discount,
      tax: 0,
      quantity: product.quantity,
      productPrice: product.price,
      subTotal: Number(product.price) * Number(product.quantity),
      total: (Number(product.price) * Number(product.quantity)) - Number(product.discount),
      state: true
    }));

    const subTotal = Number(calculateSubtotal()).toFixed(2);
    const discount = Number(discounts.discount).toFixed(2);
    const costDelivery = Number(formState.costDelivery).toFixed(2);
    const total = Number(subTotal) - Number(discount) + Number(costDelivery)
    const userId = decryptName(localStorage.getItem('userId'));

    const formData = {
      IDClient: formState.selectedClient,
      IDUser: userId,
      IDPaymentMethod: formState.selectedPaymentMethod,
      typeSale: formState.typeSale === "2" ? true : false,
      typeShipping: formState.costDelivery !== 0,
      shippingCost: formState.costDelivery ?? 0,
      discount: discount,
      expirationDate: formState.typeSale === "2" ? formState.expirationDate : null,
      tax: 0,
      salesCode: formState.noSales,
      isVoucher: formState.isVoucher,
      voucher: formState.namePaymentMethod.toLocaleLowerCase() === PAYMENT_METHOD_NAME ? formState.voucher : null,
      state: data.state,
      details: products,
      subTotal: subTotal,
      total: total.toFixed(2)
    }

    if (id) {
      const successDate = await updateSaleProduct(formData);

      if (!successDate) return;
      const { success, error } = await updateSale(formData, id)

      if (success) {
        showToast('Venta actualizada exitosamente', true);

        setTimeout(() => {
          loadSaleById(id);
        }, 1500)
      } else {
        showToast(error.message, false)
      }

      return;
    }

    const { success, error } = await createSale(formData);

    if (success) {
      loadCodeSales();
      showToast(`Venta realizada exitosamente`, true);
      if (quotations) changeStatusQuotation();
      if (!id && !formData.isVoucher) { handleChangeModal('TotalModal', true); return; }
      if (formData.isVoucher) cleanInputs();
    } else {
      showToast(error.message, false)
    }
  }

  function cleanInputs() {
    setProductsActive([])
    setInputText('');
    setDiscounts({ discount: 0, typeDiscount: false, general: false, })
    setFormState({ ...formState, costDelivery: 0, expirationDate: '', voucher: null, typeSale: '1', isVoucher: false, noSales: null });
  }

  function onApply() {
    cleanInputs();
    handleChangeModal("TotalModal", false)
  }

  async function updateSaleProduct(sale: any): Promise<boolean> {
    let result = true;

    for (const product of sale.details) {
      const originalProduct = salesRef.current?.details.find(
        (p) => p.IDProduct === product.IDProduct
      );

      if (originalProduct && originalProduct.quantity !== product.quantity) {
        const existencia = originalProduct.stock + originalProduct.quantity;
        const newQuantity = product.quantity;

        if (newQuantity <= existencia) {
          const { success, error } = await updateProductDetailsSale(originalProduct.IDSaleDetail, product);
          if (!success) {
            showToast(error.message, false)
            result = false;
          }
        } else {
          showToast("No hay suficiente existencias para agregar la cantidad ingresada.", false);
          result = false;
        }
      }
    }

    const deletedProducts = salesRef.current?.details.filter(
      (originalProduct) =>
        !sale.details.some((p) => p.IDProduct === originalProduct.IDProduct)
    );

    if (deletedProducts?.length) {
      for (const deletedProduct of deletedProducts) {
        const { success, error } = await deleteProductDetailsSale(deletedProduct.IDSaleDetail);
        if (!success) {
          showToast(error.message, false)
          result = false;
        }
      }
    }

    const newProducts = sale.details.filter(
      (product) =>
        !salesRef.current?.details.some(
          (originalProduct) => originalProduct.IDProduct === product.IDProduct
        )
    );

    if (newProducts.length) {
      for (const newProduct of newProducts) {
        const productToAdd = { ...newProduct, IDSale: id };
        const { success, error } = await createProductDetailsSale(productToAdd);
        if (!success) {
          showToast(error.message, false)
          result = false;
        }
      }
    }

    return result;
  }
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    saveSale();
  }
  async function changeStatusQuotation() {
    const quotation = {
      state: '2',
    }

    const { success, error } = await updateQuotation(quotations.IDQuotation, quotation)

    if (!success) {
      showToast(error.message[0], false)
    }
  }

  function handleFormSubmit() {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputText(value);
    if (value) handleChangeModal('ProductModal', true);
  };

  const handleChangeModal = (name: keyof typeof isModalOpen, value: boolean) => {
    setIsModalOpen({ ...isModalOpen, [name]: value });
    if (name === 'DiscountProduct') setInputText('');
  };

  const handleApplyCostDelivery = (cost: number) => {
    handleChangeFormDateState('costDelivery', cost)
  }

  const handleApplyDiscount = (discount: number, typeDiscount: boolean) => {
    if (discounts.general) {
      const costDiscount = typeDiscount ? (calculateSubtotal() * Number(discount / 100)) : discount
      setDiscounts({ discount: costDiscount, typeDiscount: typeDiscount, general: false });
      return;
    }

    if (selectedProductForDiscount) {
      setProductsActive((prevProductsActive) =>
        prevProductsActive.map((product) =>
          product.IDProduct === selectedProductForDiscount.IDProduct
            ? { ...product, discount: !typeDiscount ? discount : (discount / 100) * product.price }
            : product
        )
      );
      setSelectedProductForDiscount(null);
      handleChangeModal('DiscountProduct', false);
    }
  };

  const calculateSubtotal = () => {
    return productsActive.reduce(
      (acc, product) => acc + (product.price - product.discount) * product.quantity,
      0
    );
  };

  const handleClientSelect = (selectedClientID: string) => {
    handleChangeFormDateState('selectedClient', selectedClientID);
  }

  const handleStatusTagClick = (days: number) => {
    const today = new Date();
    const newDate = new Date(today.setDate(today.getDate() + days));
    const date = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;
    handleChangeFormDateState('expirationDate', date);
  };

  return (
    <Container text={`Venta no ${id ? 'actualizada' : 'guardada'}`} save onClickSecondary={() => navigate('/sales/')} onSaveClick={handleFormSubmit}>
      <>
        <Toaster />
        <section className="flex flex-col items-center h-full">
          <div className="max-w-screen-lg mt-5 w-full mx-auto">
            <SubHeader title="Registrar venta" />
            <form onSubmit={handleSubmit} ref={formRef} className="flex flex-col lg:flex-row items-start">
              <div className="flex-1 lg:w-auto w-full">
                <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-8">
                  <div className="m-4">
                    <div className="flex items-center justify-between">
                      <h2 className={`font-semibold mb-3`}>Productos</h2>
                      {!id && <button onClick={() => handleChangeModal('QuotationModal', true)} type="button" className="text-[#005bd3] hover:underline cursor-pointer font-semibold  text-sm">Agregar cotización</button>}
                    </div>
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

                  <SaleListProduct handleChangeModal={handleChangeModal} productsActive={productsActive} setProductsActive={setProductsActive} setSelectedProductForDiscount={setSelectedProductForDiscount} />

                </div>

                <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-6 px-4 py-5">
                  <h2 className={`font-semibold mb-3`}>Detalles</h2>
                  <SaleAccount calculateSubtotal={calculateSubtotal} costDelivery={formState.costDelivery} discounts={discounts} setDiscounts={setDiscounts} handleChangeModal={handleChangeModal} productsActive={productsActive} />
                </div>
              </div>

              <div className="w-full lg:w-1/3">
                <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-8 w-full px-3 py-5 lg:ml-8">
                  <ClientSearch
                    selectedClient={formState.selectedClient && { label: customers.find(c => c.value === formState.selectedClient)?.label ?? null, value: formState.selectedClient ?? null }}
                    customer={customers}
                    onClientSelect={handleClientSelect}
                  />
                </div>

                <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-4 w-full px-3 py-5 lg:ml-8">
                  <h2 className={`font-semibold text-[15px] mb-3`}>Tipo venta</h2>
                  <FieldSelect
                    id="state"
                    options={[{ name: 'Contado', value: 1 }, { name: 'Credito', value: 2 }]}
                    value={formState.typeSale}
                    onChange={(value) => handleChangeFormDateState("typeSale", value.toString())}
                  />

                  {formState.typeSale === "2" && (
                    <>
                      <DateTimePicker value={formState.expirationDate} required={formState.typeSale === '2'} id="dateExpirated" name="Fecha de expiración" classNameInput="h-10" className="mt-5" onChange={(e) => handleChangeFormDateState('expirationDate', e.target.value)} />
                      <div className="flex items-center mt-5 space-x-2">
                        <button type="button" onClick={() => handleStatusTagClick(15)}><StatusTags className="px-3 cursor-pointer hover:bg-green-300 py-2" text='15 días' status /></button>
                        <button type="button" onClick={() => handleStatusTagClick(30)}><StatusTags className="px-3 cursor-pointer hover:bg-green-300 py-2" text='1 mes' status /></button>
                        <button type="button" onClick={() => handleStatusTagClick(90)}><StatusTags className="px-3 cursor-pointer hover:bg-green-300 py-2" text='3 meses' status /></button>
                        <button type="button" onClick={() => handleStatusTagClick(150)}><StatusTags className="px-2 cursor-pointer hover:bg-green-300 py-2" text='5 meses' status /></button>
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-4 w-full px-3 py-5 lg:ml-8">
                  <h2 className={`font-semibold text-[15px] mb-3`}>
                    Información de pago
                  </h2>
                  <FieldSelect
                    className="mb-3"
                    id="IDPaymentMethod"
                    options={paymentMethod}
                    value={formState.selectedPaymentMethod}
                    onChangeValue={(value, name) => setFormState({ ...formState, selectedPaymentMethod: value.toString(), namePaymentMethod: name })}
                  />
                  {formState.namePaymentMethod.toLocaleLowerCase() === PAYMENT_METHOD_NAME && <FieldInput name="No. Voucher" id="voucher" value={formState.voucher ?? ''} onChange={(e) => handleChangeFormDateState('voucher', e.target.value)} classNameInput="h-10" className="mb-3" />}
                </div>
                <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-4 w-full px-3 py-5 lg:ml-8">
                  <h2 className={`font-semibold text-[15px] mb-3`}>
                    Tipo de factura
                  </h2>

                  <CheckBox disabled={id ? true : false} name="Membretada" initialValue={formState.isVoucher} onChange={(value) => !id && handleChangeFormDateState("isVoucher", value)} />
                  {formState.isVoucher &&
                    <FieldInput className="mt-3" classNameInput="h-9" name="No Venta" id="noSales" value={formState.noSales} onChange={(e) => handleChangeFormDateState("noSales", e.target.value)} />
                  }
                </div>
              </div>
            </form>
          </div>
        </section>

        {isModalOpen.ProductModal && <ProductModal isSales={0} onClose={() => { handleChangeModal('ProductModal', false); setInputText('') }} productsActive={productsActive} setProductsActive={setProductsActive} />}
        {
          isModalOpen.DiscountProduct &&
          <DiscountModal
            onClose={() => handleChangeModal('DiscountProduct', false)}
            productActive={selectedProductForDiscount}
            onApplyDiscount={handleApplyDiscount}
          />
        }
        {isModalOpen.DeliveryModal && <DeliveryModal onApplyCostDelivery={handleApplyCostDelivery} onClose={() => handleChangeModal("DeliveryModal", false)} />}
        {isModalOpen.QuotationModal && <QuotationModal onApply={handleSelectQuotation} onClose={() => handleChangeModal("QuotationModal", false)} />}
        {isModalOpen.TotalModal && (
          <ModalSalesVoucher
            userName={decryptName(localStorage.getItem('name'))}
            products={productsActive.map((product) => ({
              name: product.NombreProducto,
              price: Number(product.price),
              discount: Number(product.discount),
              quantity: Number(product.quantity),
              subtotal: Number(product.quantity * product.price),
              total: Number((product.quantity * product.price) - product.discount),
            }))}
            isSales
            address={customersData.find((customer) => customer.IDClient === formState.selectedClient).address}
            codeSale={formState.codeSale}
            customer={customersData.find((customer) => customer.IDClient === formState.selectedClient).name}
            phone={customersData.find((customer) => customer.IDClient === formState.selectedClient).phone}
            municipality={customersData.find((customer) => customer.IDClient === formState.selectedClient).municipality_name}
            department={customersData.find((customer) => customer.IDClient === formState.selectedClient).department}
            date={new Date()}
            deliveryCost={formState.costDelivery}
            discount={Number(discounts.discount.toFixed(2))}
            paymentMethod={formState.namePaymentMethod}
            subTotal={Number(calculateSubtotal().toFixed(2))}
            total={Number((Number(calculateSubtotal()) - Number(discounts.discount) + Number(formState.costDelivery)).toFixed(2))}
            onClose={onApply}
          />
        )}
      </>
    </Container >
  );
}
