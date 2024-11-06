import { pdf, PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import Bill from "../../components/reports/Bill";
import { useState } from "react";
import { Edit } from "../../icons/icons";
import SalesFormatPDF from "../../components/reports/SalesFormatPDF";
import FieldInput from "../../components/form/FieldInput";

interface Products {
  name: string;
  price: number;
  discount: number;
  quantity: number;
  subtotal: number;
  total: number;
}

interface Props {
  codeSale: string;
  customer: string;
  address: string;
  department: string;
  municipality: string;
  total: number;
  userName: string;
  products: Products[];
  subTotal: number;
  discount: number;
  deliveryCost: number;
  paymentMethod: string;
  phone?: string;
  date: Date;
  isSales?: boolean;
  onClose: () => void;
}

export default function ModalSalesVoucher({ userName, isSales = false, onClose, phone, codeSale, customer, address, department, municipality, deliveryCost, discount, subTotal, paymentMethod, products, total, date }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>();
  const [payment, setPayment] = useState<number>();

  const handleDownload = async () => {
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handlePrint = async () => {
    const blob = await pdf(<Bill
      userName={userName}
      saleCode={codeSale}
      customer={customer}
      deliveryCost={deliveryCost}
      department={department}
      municipality={municipality}
      direction={address}
      discount={discount}
      product={products}
      subTotal={subTotal}
      total={total}
    />).toBlob();
    const url = URL.createObjectURL(blob);

    const printWindow = window.open(url);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  };

  return (
    <div
      id="default-modal"
      tabIndex={-1}
      aria-hidden="true"
      className="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50"
    >
      <div className="relative w-full max-w-[800px] h-[90%] flex flex-col bg-white rounded-xl">
        <div className="relative flex flex-col h-full">
          <div className="flex items-center justify-between bg-[#f3f3f3] p-4 md:px-5 md:py-2 border-b rounded-t-xl border-gray-200">
            <h3 className="text-base font-semibold text-secondary">Voucher de venta {codeSale}</h3>
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
            <PDFViewer showToolbar={false} className="size-full rounded-xl">
              <Bill
                userName={userName}
                saleCode={codeSale}
                customer={customer}
                date={date}
                deliveryCost={deliveryCost}
                department={department}
                municipality={municipality}
                direction={address}
                discount={discount}
                product={products}
                subTotal={subTotal}
                total={total}
              />
            </PDFViewer>
          </div>
          <footer className="flex items-center p-4 md:px-5 border-t border-gray-200 rounded-b relative">
            <button
              onClick={handlePrint}
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Imprimir
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="text-primary font-semibold ml-3 bg-[#e3e3e3] shadow-sm border border-gray-300 hover:bg-[#d4d4d4] focus:outline-none rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Descargar
            </button>

            <div id="dropdownAvatar" className={`absolute ${isOpen ? 'block' : 'hidden'} z-20 top-[-100px] left-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-64`}>
              <ul className="py-2 text-sm text-primary font-semibold" aria-labelledby="dropdownUserAvatarButton">
                <li className='flex items-center pl-2 hover:bg-gray-100'>
                  <Edit />
                  <PDFDownloadLink
                    document={<Bill
                      userName={userName}
                      date={date}
                      saleCode={codeSale}
                      customer={customer}
                      deliveryCost={deliveryCost}
                      department={department}
                      municipality={municipality}
                      direction={address}
                      discount={discount}
                      product={products}
                      subTotal={subTotal}
                      total={total}
                    />}
                    fileName={`Voucher de venta ${codeSale}.pdf`}
                  >
                    <button onClick={handleDownload} className="block w-full text-left text-primary px-2 py-2">Voucher</button>
                  </PDFDownloadLink>
                </li>
                <li className='flex items-center pl-2 hover:bg-gray-100'>
                  <Edit />
                  <PDFDownloadLink
                    fileName={`Venta Formato PDF ${codeSale}`}
                    document={<SalesFormatPDF
                      department={department}
                      deliveryCost={deliveryCost}
                      discount={discount}
                      municipality={municipality}
                      paymentMethod={paymentMethod}
                      phone={phone}
                      products={products}
                      subTotal={subTotal}
                      total={total}
                      address={address}
                      codeSale={codeSale}
                      customer={customer}
                      date={date}
                    />}
                  >
                    <button onClick={handleDownload} className="block w-full text-left text-primary px-2 py-2">Formato PDF</button>
                  </PDFDownloadLink>
                </li>
              </ul>
            </div>

            <form onSubmit={onClose} className="flex">
              <button
                type="submit"
                onClick={onClose}
                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
              >
                Cerrar
              </button>

              {isSales &&
                <div className="flex items-center space-x-2 ml-3">
                  <FieldInput id="payment" isNumber className="w-full" placeholder="Pagado. Ej: C$1000.00" classNameInput="h-10" value={payment} onChange={(e) => setPayment(Number(e.target.value))} />
                  <FieldInput id="change" className="w-full" classNameInput="h-10" value={(payment - total) > 0 ? (payment - total).toFixed(2) : 0} />
                </div>
              }
            </form>
          </footer>
        </div>
      </div>
    </div>
  );
}
