import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Back, Delete, Search } from '../../icons/icons'
import Container from '../../layout/Container'
import { Toaster } from 'react-hot-toast';
import FieldInputWithElement from '../../components/form/FieldInputWithElement';
import Button from '../../components/form/Button';
import ProductModal from '../../section/purchase/ProductModal';
import FieldInput from '../../components/form/FieldInput';
import { showToast } from '../../components/Toast';
import DeliveryModal from '../sales/DeliveryModal';
import { getCustomers } from '../../api/sales/customers';
import DiscountModal from '../../section/purchase/DiscountModal';
import { createQuotation, getLastQuotationCode } from '../../api/sales/quotations';
import ClientSearch from '../../section/account-receivable/ClientSearch';
import { CustomerProps } from '../../types/types';
import { currencyFormatter } from '../../utils/function';
import ModalPreviewQuotation from '../../section/quoteation/ModalPreviewQuotation';
import { useNavigate } from 'react-router-dom';


interface ProductActive {
  IDProduct: string;
  CodigoProducto: string;
  price: number;
  NombreProducto: string;
  quantity: number;
  discount: number;
  existencia: number;
}

interface CategoryOption {
  label: string;
  value: string;
}

export default function AddQuoteation() {
  const INITIAL_FORM_STATE = {
    selectedClient: '',
    costDelivery: 0,
    codeQuotation: '',
  }

  const navigate = useNavigate();

  const formRef = useRef<HTMLFormElement | null>(null);
  const [inputText, setInputText] = useState("");
  const [productsActive, setProductsActive] = useState<ProductActive[]>([]);
  const [selectedProductForDiscount, setSelectedProductForDiscount] = useState<ProductActive | null>(null);
  const [customers, setCustomers] = useState([]);
  const [customerData, setCustomerData] = useState<CustomerProps[]>([]);

  const [formState, setFormState] = useState(INITIAL_FORM_STATE);

  const [isModalOpen, setIsModalOpen] = useState({
    ProductModal: false,
    DiscountProduct: false,
    DeliveryModal: false,
    QuotationModal: false
  });
  const [discounts, setDiscounts] = useState({
    discount: 0,
    typeDiscount: false,
    general: false,
  })

  const handleChangeFormDateState = useCallback((name: keyof typeof formState, value: string | number | boolean) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, [])

  async function loadCodeQuotation() {
    const { data } = await getLastQuotationCode();
    console.log(data)
    handleChangeFormDateState("codeQuotation", data.quotationCode);
  }

  useEffect(() => {
    async function loadCustomers() {
      const { data }: { data: CustomerProps[] } = await getCustomers();
      const customerOption: CategoryOption[] = data.filter(customer => customer.state)
        .map(customer => ({
          label: customer.name,
          value: customer.IDClient,
        }));

      setCustomerData(data);
      setCustomers(customerOption);
      handleChangeFormDateState("selectedClient", customerOption[0].value)
    }

    loadCustomers();
  }, [handleChangeFormDateState])

  const calculateSubtotal = () => {
    return productsActive.reduce(
      (acc, product) => acc + (product.price - product.discount) * product.quantity,
      0
    );
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const hasInvalidQuantity = productsActive.some(product => product.quantity <= 0);

    if (hasInvalidQuantity) {
      showToast('Todos los productos deben tener una cantidad mayor a 0.', false);
      return;
    }

    const products = productsActive.map((product) => ({
      IDProduct: product.IDProduct,
      discount: product.discount,
      tax: 0,
      quantity: product.quantity
    }));

    const subTotal = Number(calculateSubtotal());
    const discount = Number(discounts.discount);
    const total = Number(subTotal) - Number(discount) + Number(formState.costDelivery);

    const formData = {
      IDClient: formState.selectedClient ?? '',
      typeShipping: formState.costDelivery !== 0,
      shippingCost: formState.costDelivery.toFixed(2),
      discount: discount.toFixed(2),
      tax: 0,
      state: 1,
      details: products,
      subTotal: subTotal.toFixed(2),
      total: total.toFixed(2)
    }

    const { success, error } = await createQuotation(formData);

    if (success) {
      loadCodeQuotation();
      showToast('Cotización realizada exitosamente', true);
      handleChangeModal('QuotationModal', true)
      setDiscounts({ discount: 0, general: false, typeDiscount: false })
    } else {
      showToast(error.message, false)
    }
  }

  function handleFormSubmit() {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  }

  const handleChangeModal = (name: keyof typeof isModalOpen, value: boolean) => {
    setIsModalOpen({ ...isModalOpen, [name]: value });
    if (name === 'DiscountProduct') setInputText('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputText(value);
    if (value) handleChangeModal('ProductModal', true);
  };

  const handleQuantityChange = (IDProduct: string, newQuantity: number) => {
    setProductsActive((prevProductsActive) =>
      prevProductsActive.map((product) => {
        if (product.IDProduct === IDProduct) {
          return { ...product, quantity: newQuantity };
        }
        return product;
      })
    );
  };

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

  const handleDeleteProduct = (IDProduct: string) => {
    setProductsActive((prevProductsActive) =>
      prevProductsActive.filter((product) => product.IDProduct !== IDProduct)
    );
  };

  const handleOpenDiscountModal = (product: ProductActive) => {
    setSelectedProductForDiscount(product);
    handleChangeModal('DiscountProduct', true);
  };

  const handleApplyCostDelivery = (cost: number) => {
    handleChangeFormDateState('costDelivery', cost)
  }

  function onCloseQuotationModal() {
    handleChangeModal('QuotationModal', false)
    setDiscounts({ discount: 0, general: false, typeDiscount: false })
    setFormState(INITIAL_FORM_STATE);
    setSelectedProductForDiscount(null)
    setProductsActive([])
  }

  return (
    <Container text='cotización no guardada' save onClickSecondary={() => navigate('/quoteation/')} onSaveClick={handleFormSubmit}>
      <>
        <Toaster />
        <section className="flex flex-col items-center h-full">
          <div className="max-w-screen-lg mt-5 w-full mx-auto">
            <header className="flex items-center">
              <Back />
              <h2 className="ml-4 text-lg font-semibold text-secondary">Crear cotización</h2>
            </header>
            <form onSubmit={handleSubmit} ref={formRef} className="flex flex-col lg:flex-row items-start">
              <div className="flex-1 w-full lg:w-auto">
                <div className="bg-white rounded-lg mt-8 py-2 border border-gray-300 shadow-sm">
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
                              <div className="flex items-center mt-2">
                                <span
                                  onClick={() => handleOpenDiscountModal(product)}
                                  role="button"
                                  className="text-[#005bd3] text-[15px] cursor-pointer font-medium hover:underline"
                                >
                                  <span>{currencyFormatter(product.price - product.discount)}</span>
                                </span>
                                {product.discount !== 0 && (
                                  <span className="text-gray-400 ml-2 line-through text-sm font-medium">{`C$ ${Number(product.price).toFixed(2)}`}</span>
                                )}
                              </div>
                              <div className="flex">
                                <div className="mt-2 flex flex-col">
                                  <span className="font-medium mr-2">Cantidad</span>
                                  <FieldInput
                                    className="mb-0 w-32"
                                    name=""
                                    isNumber
                                    id={`quantity-${product.IDProduct}`}
                                    value={product.quantity}
                                    onChange={(e) => handleQuantityChange(product.IDProduct, Number(e.target.value))}
                                  />
                                </div>
                                <div className="mt-2 flex flex-col ml-3">
                                  <span className="font-medium mr-2">Total</span>
                                  <span className="text-right font-medium text-lg">
                                    {currencyFormatter((product.price - product.discount) * product.quantity)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <table className="w-full text-sm text-left rtl:text-right hidden md:table">
                        <thead className="[&>tr>th]:text-sm border-b border-gray-200 [&>tr>th]:text-primary [&>tr>th]:font-semibold">
                          <tr>
                            <th className="py-3 px-4 w-[80%]">Producto</th>
                            <th className="px-4 py-3">Cantidad</th>
                            <th className="px-4 py-3 w-1/3 text-right">Total</th>
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
                                  {product.discount !== 0 && (
                                    <span className="text-whiting text-[13px] font-medium">{`Descuento (-C$ ${product.discount.toFixed(2)}) NIO`}</span>
                                  )}
                                  <div className="flex items-center">
                                    <span
                                      onClick={() => handleOpenDiscountModal(product)}
                                      role="button"
                                      className="text-[#005bd3] w-auto text-[13px] cursor-pointer font-medium hover:underline mt-1"
                                    >
                                      <span>{currencyFormatter(product.price - product.discount)}</span>
                                    </span>
                                    {product.discount !== 0 && (
                                      <span className="text-whiting ml-2 line-through text-sm font-medium">{`C$ ${Number(product.price).toFixed(2)}`}</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <FieldInput
                                  className="mb-0 w-32"
                                  name=""
                                  isNumber
                                  id={`quantity-${product.IDProduct}`}
                                  value={product.quantity}
                                  onChange={(e) => handleQuantityChange(product.IDProduct, Number(e.target.value))}
                                />
                              </td>
                              <td className="py-3 pr-4 text-right">
                                <span>
                                  <span>{currencyFormatter((product.price - product.discount) * product.quantity)}</span>
                                </span>
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
                  )}

                </div>

                <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-8 px-4 py-5">
                  <h2 className={`font-semibold mb-3`}>Detalles</h2>
                  <div className="border border-gray-300 rounded-lg py-2 px-3">
                    <div className="md:grid md:grid-cols-3 flex items-center justify-between mt-4 w-full">
                      {window.innerWidth < 768 ? (
                        <div className="flex flex-col-reverse">
                          <span className="font-medium text-sm text-secondary">
                            Subtotal
                          </span>
                          <span className="text-sm text-whiting font-medium">
                            {productsActive.length !== 0 ? productsActive.length + ' items' : ''}
                          </span>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium text-sm text-secondary">
                            Subtotal
                          </span>
                          <span className="text-sm text-whiting font-medium">
                            {productsActive.length !== 0 ? productsActive.length + ' items' : ''}
                          </span>
                        </>
                      )}
                      <span className="font-medium text-sm text-secondary text-right">
                        C$ {calculateSubtotal().toFixed(2)}
                      </span>
                    </div>


                    <div className="flex items-center justify-between mt-4 w-full md:grid md:grid-cols-3">
                      {window.innerWidth < 768 ? (
                        <div className="flex flex-col-reverse">
                          <button
                            disabled={productsActive.length === 0}
                            onClick={() => {
                              handleChangeModal('DiscountProduct', true);
                              setDiscounts({ ...discounts, general: true });
                            }}
                            className={`font-medium text-left w-auto ${productsActive.length !== 0 ? 'text-[#005bd3] hover:underline' : 'text-[#bbb]'} text-sm `}
                          >
                            Agregar descuento
                          </button>
                          <span className="text-sm text-whiting font-medium">
                            {discounts.discount === 0 ? '—' : 'Descuento aplicado'}
                          </span>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled={productsActive.length === 0}
                            onClick={() => {
                              handleChangeModal('DiscountProduct', true);
                              setDiscounts({ ...discounts, general: true });
                            }}
                            className={`font-medium text-left w-auto ${productsActive.length !== 0 ? 'text-[#005bd3] hover:underline' : 'text-[#bbb]'} text-sm `}
                          >
                            Agregar descuento
                          </button>
                          <span className="text-sm text-whiting font-medium">
                            {discounts.discount === 0 ? '—' : 'Descuento aplicado'}
                          </span>
                        </>
                      )}
                      <span className="font-medium text-sm text-secondary text-right">
                        -C$ {discounts.discount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4 w-full md:grid md:grid-cols-3">
                      {window.innerWidth < 768 ? (
                        <div className="flex flex-col-reverse">
                          <button
                            disabled={productsActive.length === 0}
                            onClick={() => handleChangeModal('DeliveryModal', true)}
                            className={`font-medium text-left w-auto ${productsActive.length !== 0 ? 'text-[#005bd3] hover:underline' : 'text-[#bbb]'} text-sm `}
                          >
                            Agregar delivery
                          </button>
                          <span className="text-sm text-whiting font-medium">—</span>
                        </div>
                      ) : (
                        <>
                          <button
                            disabled={productsActive.length === 0}
                            type="button"
                            onClick={() => handleChangeModal('DeliveryModal', true)}
                            className={`font-medium w-auto text-left ${productsActive.length !== 0 ? 'text-[#005bd3] hover:underline' : 'text-[#bbb]'} text-sm `}
                          >
                            Agregar delivery
                          </button>
                          <span className="text-sm text-whiting font-medium">—</span>
                        </>
                      )}
                      <span className="font-medium text-sm text-secondary text-right">
                        C$ {formState.costDelivery.toFixed(2)}
                      </span>
                    </div>


                    <div className="flex items-center justify-between mt-4 w-full md:grid md:grid-cols-3">
                      {window.innerWidth < 768 ? (
                        <div className="flex flex-col-reverse">
                          <span className="font-medium text-sm text-[#bbb]">
                            Impuesto
                          </span>
                          <span className="text-sm text-whiting font-medium">
                            No calculado
                          </span>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium text-sm text-[#bbb]">
                            Impuesto
                          </span>
                          <span className="text-sm text-whiting font-medium">
                            No calculado
                          </span>
                        </>
                      )}
                      <span className="font-medium text-sm text-secondary text-right">
                        C$ 0.00
                      </span>
                    </div>


                    <div className="flex items-center mt-4 justify-between">
                      <span className="font-semibold text-sm text-primary">
                        Total
                      </span>
                      <span className="font-semibold text-sm text-primary">
                        C$ {(calculateSubtotal() - discounts.discount + formState.costDelivery).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>


              <div className="w-full lg:w-1/3">
                <div className="bg-white border border-gray-300 shadow-sm rounded-lg mt-8 w-full px-3 py-5 lg:ml-8">
                  <ClientSearch
                    customer={customers}
                    selectedClient={formState.selectedClient && { label: customers.find(c => c.value === formState.selectedClient)?.label ?? null, value: formState.selectedClient ?? null }}
                    onClientSelect={(value) => handleChangeFormDateState("selectedClient", value)}
                  />
                </div>
              </div>
            </form>
          </div>
        </section>
        {isModalOpen.ProductModal && <ProductModal isSales={3} onClose={() => handleChangeModal('ProductModal', false)} productsActive={productsActive} setProductsActive={setProductsActive} />}
        {
          isModalOpen.DiscountProduct &&
          <DiscountModal
            onClose={() => handleChangeModal('DiscountProduct', false)}
            productActive={selectedProductForDiscount}
            onApplyDiscount={handleApplyDiscount}
          />
        }
        {isModalOpen.DeliveryModal && <DeliveryModal onApplyCostDelivery={handleApplyCostDelivery} onClose={() => handleChangeModal("DeliveryModal", false)} />}
        {isModalOpen.QuotationModal && (
          <ModalPreviewQuotation
            phone={customerData.find((customer) => customer.IDClient === formState.selectedClient).phone}
            address={customerData.find((customer) => customer.IDClient === formState.selectedClient).address}
            deliveryCost={formState.costDelivery}
            department={customerData.find((customer) => customer.IDClient === formState.selectedClient).department}
            municipality={customerData.find((customer) => customer.IDClient === formState.selectedClient).municipality_name}
            onClose={onCloseQuotationModal}
            customer={customerData.find((customer) => customer.IDClient === formState.selectedClient).name}
            quotationCode={formState.codeQuotation}
            discount={discounts.discount}
            shippingCost={formState.costDelivery}
            subTotal={calculateSubtotal()}
            total={Number(calculateSubtotal()) - Number(discounts.discount) + Number(formState.costDelivery)}
            date={new Date()}
            products={productsActive.map(({ price, quantity, discount, NombreProducto }) => ({
              name: NombreProducto,
              price: price,
              quantity: quantity,
              discount: discount,
              subtotal: (price - discount),
              total: ((price - discount) * quantity),
            }))}
          />
        )}
      </>
    </Container>
  )
}
