import { useState } from "react";
import FieldInput from "../../components/form/FieldInput";
import { currencyFormatter } from "../../utils/function";
import ModalSalesVoucher from "./ModalSalesVoucher";

interface Products {
  name: string;
  price: number;
  discount: number;
  quantity: number;
  subtotal: number;
  total: number;
}

interface Props {
  products: Products[],
  onClose: () => void;
  customer: string;
  userName: string;
  paymentMethod: string;
  voucher: string;
  dateExpiration: string;
  codeSale: string;
  typeSale: string;
  isVoucher: string;
  subTotal: number;
  discount: number;
  deliveryCost: number;
  total: number;
  department: string;
  municipality: string;
  address: string;
  date: Date;
}

export default function ModalPreviewSale({ address, date, department, municipality, onClose, products = [], deliveryCost, discount, subTotal, total, isVoucher, typeSale, codeSale, customer, dateExpiration, paymentMethod, voucher, userName }: Props) {
  const [isShowModal, setIsShowModal] = useState<boolean>(false);

  return (
    <>
      <div
        id="default-modal"
        tabIndex={-1}
        aria-hidden="true"
        className="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50"
      >
        <div className="relative w-full max-w-[1000px] h-[95%] flex flex-col bg-white rounded-xl">
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between bg-[#f3f3f3] p-4 md:px-5 md:py-2 border-b rounded-t-xl border-gray-200">
              <h3 className="text-base font-semibold text-secondary">Detalles de venta {codeSale}</h3>
              <button
                onClick={onClose}
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-grow py-5 overflow-y-auto px-4">
              <div className="flex items-center space-x-3 mb-5">
                <FieldInput name="Cliente" value={customer} id="customer" className="w-full" classNameInput="h-10" readonly />
                <FieldInput name="Tipo venta" value={typeSale} id="typeSale" className="w-full" classNameInput="h-10" readonly />
                <FieldInput name="Fecha de expiracion" value={dateExpiration} id="dateExpiration" className="w-full" classNameInput="h-10" readonly />
              </div>

              <div className="flex items-center space-x-3 mb-5">
                <FieldInput name="Metodo de pago" value={paymentMethod} id="customer" className="w-full" classNameInput="h-10" readonly />
                <FieldInput name="Voucher" id="voucher" value={voucher} className="w-full" classNameInput="h-10" readonly />
                <FieldInput name="Tipo factura" id="typeSale" value={isVoucher} className="w-full" classNameInput="h-10" readonly />
              </div>


              <div className="relative overflow-y-auto h-[250px] rounded-lg border overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                  <thead className="text-xs border-b text-gray-700 uppercase bg-whiting2">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        Cantidad
                      </th>
                      <th scope="col" className="px-2 py-3">
                        Producto
                      </th>
                      <th scope="col" className="px-2 py-3 text-right">
                        Precio
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">
                        Subtotal
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">
                        Descuento
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(({ name, quantity, discount, price, subtotal, total }, index) => (
                      <tr key={index} className={`bg-white`}>
                        <th scope="row" className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {quantity}
                        </th>
                        <td className="px-2 py-4">
                          {name}
                        </td>
                        <td className="px-2 py-4 text-right">
                          {currencyFormatter(price)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {currencyFormatter(subtotal)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {currencyFormatter(discount)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {currencyFormatter(total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="w-full mt-5 flex flex-col items-end">
                <div className="text-base text-secondary/85">
                  <div className="grid grid-cols-2">
                    <span className="text-left">Subtotal</span>
                    <span>{currencyFormatter(subTotal)}</span>
                  </div>

                  <div className="grid grid-cols-2">
                    <span className="text-left">Descuento</span>
                    <span>{currencyFormatter(discount)}</span>
                  </div>

                  <div className="grid grid-cols-2">
                    <span className="text-left">Delivery</span>
                    <span>{currencyFormatter(deliveryCost)}</span>
                  </div>

                  <div className="grid grid-cols-2">
                    <span className="text-left text-primary text-lg font-semibold">Total</span>
                    <span className="text-primary font-semibold text-lg">{currencyFormatter(total)}</span>
                  </div>
                </div>
              </div>
            </div>
            <footer className="flex items-center p-4 md:px-5 border-t border-gray-200 rounded-b">
              <button
                type="button"
                onClick={() => setIsShowModal(true)}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Ver voucher
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
              >
                Cerrar
              </button>
            </footer>
          </div>
        </div>
      </div>

      {isShowModal &&
        <ModalSalesVoucher
          userName={userName}
          date={date}
          customer={customer}
          deliveryCost={deliveryCost}
          department={department}
          address={address}
          discount={discount}
          municipality={municipality}
          products={products}
          codeSale={codeSale}
          subTotal={subTotal}
          total={total}
          onClose={onClose}
          paymentMethod={paymentMethod}
        />}
    </>
  );
}
