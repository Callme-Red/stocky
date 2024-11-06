import { pdf, PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import VoucherPDF from "../../components/reports/VoucherPDF";

interface Props {
  codeSale: string;
  customer: string;
  codePayment: string;
  phone: string;
  address: string;
  department: string;
  municipality: string;
  amount: number;
  paymentMethod: string;
  onClose: () => void;
}

export default function ModalVoucherPayment({ onClose, codeSale, customer, codePayment, phone, address, department, municipality, amount, paymentMethod }: Props) {

  const handleDownload = async () => {
    setTimeout(() => {
      onClose();
    }, 300)
  };

  const handlePrint = async () => {
    const blob = await pdf(<VoucherPDF
      codeSale={codeSale}
      codePayment={codePayment}
      address={address}
      amount={amount}
      customer={customer}
      department={department}
      municipality={municipality}
      paymentMethod={paymentMethod}
      phone={phone}
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
      <div className="relative w-full max-w-[1000px] h-[90%] flex flex-col bg-white rounded-xl">
        <div className="relative flex flex-col h-full">
          <div className="flex items-center justify-between bg-[#f3f3f3] p-4 md:px-5 md:py-2 border-b rounded-t-xl border-gray-200">
            <h3 className="text-base font-semibold text-secondary">Comprobante de pago</h3>
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
              <VoucherPDF
                codeSale={codeSale}
                codePayment={codePayment}
                address={address}
                amount={amount}
                customer={customer}
                department={department}
                municipality={municipality}
                paymentMethod={paymentMethod}
                phone={phone}
              />
            </PDFViewer>
          </div>
          <footer className="flex items-center p-4 md:px-5 border-t border-gray-200 rounded-b">
            <button
              onClick={handlePrint}
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Imprimir
            </button>
            <PDFDownloadLink
              document={<VoucherPDF
                codeSale={codeSale}
                codePayment={codePayment}
                address={address}
                amount={amount}
                customer={customer}
                department={department}
                municipality={municipality}
                paymentMethod={paymentMethod}
                phone={phone}
              />
              }
              fileName={`Comprobante de pago ${codePayment}.pdf`}
            >
              <button
                type="button"
                onClick={handleDownload}
                className="text-primary font-semibold ml-3 bg-[#e3e3e3] shadow-sm border border-gray-300 hover:bg-[#d4d4d4] focus:outline-none rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Descargar
              </button>
            </PDFDownloadLink>
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
  );
}
