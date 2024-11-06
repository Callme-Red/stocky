import { pdf, PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import QuotationFormatPDF from '../../components/reports/QuotationFormatPDF';

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
  quotationCode: string;
  shippingCost: number;
  subTotal: number;
  discount: number;
  deliveryCost: number;
  total: number;
  department: string;
  municipality: string;
  address: string;
  date: Date;
  phone: string;
}

export default function ModalPreviewQuotation({ address, phone, date, department, municipality, onClose, products = [], deliveryCost, discount, subTotal, total, quotationCode, customer }: Props) {
  const handlePrint = async () => {
    const blob = await pdf(<QuotationFormatPDF
      quotationCode={quotationCode}
      customer={customer}
      date={new Date(date)}
      deliveryCost={Number(deliveryCost)}
      department={department}
      municipality={municipality}
      address={address}
      phone={phone}
      discount={Number(discount)}
      products={products.map(({ name, price, discount, quantity, subtotal, total }) => ({
        name,
        price: Number(price),
        discount: Number(discount),
        quantity: Number(quantity),
        subtotal: Number(subtotal),
        total: Number(total)
      }))}
      subTotal={Number(subTotal)}
      total={Number(total)}
    />).toBlob();
    const url = URL.createObjectURL(blob);

    const printWindow = window.open(url);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }

    setTimeout(() => {
      onClose();
    }, 300)
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
            <h3 className="text-base font-semibold text-secondary">Cotización {quotationCode}</h3>
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
              <QuotationFormatPDF
                quotationCode={quotationCode}
                customer={customer}
                date={new Date(date)}
                deliveryCost={Number(deliveryCost)}
                department={department}
                municipality={municipality}
                address={address}
                phone={phone}
                discount={Number(discount)}
                products={products.map(({ name, price, discount, quantity, subtotal, total }) => ({
                  name,
                  price: Number(price),
                  discount: Number(discount),
                  quantity: Number(quantity),
                  subtotal: Number(subtotal),
                  total: Number(total)
                }))}
                subTotal={Number(subTotal)}
                total={Number(total)}
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

            <PDFDownloadLink fileName={`Cotizacion - ${quotationCode}`} document={
              <QuotationFormatPDF
                quotationCode={quotationCode}
                customer={customer}
                date={new Date(date)}
                deliveryCost={Number(deliveryCost)}
                department={department}
                municipality={municipality}
                address={address}
                phone={phone}
                discount={Number(discount)}
                products={products.map(({ name, price, discount, quantity, subtotal, total }) => ({
                  name,
                  price: Number(price),
                  discount: Number(discount),
                  quantity: Number(quantity),
                  subtotal: Number(subtotal),
                  total: Number(total)
                }))}
                subTotal={Number(subTotal)}
                total={Number(total)}
              />
            }>
              <button
                type="button"
                className="text-primary font-semibold ml-3 bg-[#e3e3e3] shadow-sm border border-gray-300 hover:bg-[#d4d4d4] focus:outline-none rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Descargar
              </button>
            </PDFDownloadLink>

            <form onSubmit={onClose} className="flex">
              <button
                type="submit"
                onClick={onClose}
                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
              >
                Cerrar
              </button>
            </form>
          </footer>
        </div>
      </div>
    </div>
  );
}
