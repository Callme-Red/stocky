import { useEffect, useState } from "react";
import { Calendar } from "../../icons/icons";
import ModalMonthSales from "../reports/ModalMonthSales";
import ModalYearSales from "../reports/ModalYearSales";
import { SalesByCustomerMonthProps } from "../../types/types";
import { getSalesByCustomerMonth, getSalesByCustomerYear } from "../../api/sales/customers";
import { pdf } from "@react-pdf/renderer";
import SalesByCustomerMonth from "../../pages/reports/SalesByCustomerMonth";

export default function DropDownSalesByCustomersMonth({ isOpen }: { isOpen: boolean }) {
  const [salesByCustomersMonth, setSalesByCustomersMonth] = useState<SalesByCustomerMonthProps[]>();
  const [salesByCustomersYear, setSalesByCustomersMYear] = useState<SalesByCustomerMonthProps[]>();

  const [isShowModal, setIsShowModal] = useState({
    ModalMonth: false,
    ModalYear: false
  });

  const [datesYear, setDatesYear] = useState({
    startDate: '',
    endDate: ''
  });

  const [datesMonth, setDatesMonth] = useState({
    startDate: '',
    endDate: ''
  });

  function handleChangeModal(name: keyof typeof isShowModal, value: boolean) {
    setIsShowModal({ ...isShowModal, [name]: value })
  }

  async function onApply(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    setDatesMonth({ startDate: startDate.toLocaleDateString(), endDate: endDate.toLocaleDateString() });

    const { data } = await getSalesByCustomerMonth(year, month);
    setSalesByCustomersMonth(data);
  }

  async function onApplyYear(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    setDatesYear({ startDate: startDate.toLocaleDateString(), endDate: endDate.toLocaleDateString() })

    const { data } = await getSalesByCustomerYear(year);

    setSalesByCustomersMYear(data);
  }

  useEffect(() => {
    if (salesByCustomersMonth) {
      const generateAndDownloadPDF = async () => {
        const pdfBlob = await pdf(
          <SalesByCustomerMonth sales={salesByCustomersMonth} startDate={datesMonth.startDate} endDate={datesMonth.endDate} />
        ).toBlob();
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Ventas por clientes mensuales (${datesMonth.startDate} - ${datesMonth.endDate}).pdf`;
        a.click();
        URL.revokeObjectURL(url);
      };
      generateAndDownloadPDF();
    }
  }, [salesByCustomersMonth, datesMonth.startDate, datesMonth.endDate]);

  useEffect(() => {
    if (salesByCustomersYear) {
      const generateAndDownloadPDF = async () => {
        const pdfBlob = await pdf(
          <SalesByCustomerMonth sales={salesByCustomersYear} startDate={datesYear.startDate} endDate={datesYear.endDate} />
        ).toBlob();
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Ventas por clientes anuales (${datesYear.startDate} - ${datesYear.endDate}).pdf`;
        a.click();
        URL.revokeObjectURL(url);
      };
      generateAndDownloadPDF();
    }
  }, [salesByCustomersYear, datesYear.startDate, datesYear.endDate]);

  return (
    <>
      <div
        id="dropdown"
        className={`absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl w-72 z-10 ${isOpen ? 'block' : 'hidden'}`}
      >
        <ul className="py-2 [&>li>button>PDFDownloadLink]:font-semibold text-sm text-gray-700" aria-labelledby="dropdownDefaultButton">
          <li className='flex items-center pl-2 hover:bg-gray-100'>
            <Calendar />
            <button
              onClick={() => handleChangeModal('ModalMonth', true)}
              className="block text-gray-700 font-semibold px-2 py-2"
            >
              Ventas por clientes mensuales
            </button>
          </li>
          <li className='flex items-center pl-2 hover:bg-gray-100'>
            <Calendar />
            <button
              onClick={() => handleChangeModal('ModalYear', true)}
              className="block text-gray-700 font-semibold px-2 py-2"
            >
              Ventas por clientes anuales
            </button>
          </li>
        </ul>
      </div>
      {isShowModal.ModalMonth && <ModalMonthSales onApply={onApply} onClose={() => handleChangeModal('ModalMonth', false)} />}
      {isShowModal.ModalYear && <ModalYearSales onApply={onApplyYear} onClose={() => handleChangeModal("ModalYear", false)
      } />}
    </>
  );
}
