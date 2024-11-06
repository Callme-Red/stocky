import { useState } from "react";

interface Props {
  onClose: () => void;
  onApply: (year: number) => void;
}

export default function ModalYearSales({ onApply, onClose }: Props) {
  const [year, setYear] = useState<number>(new Date().getFullYear());

  function handleMonthChange(event: React.ChangeEvent<HTMLInputElement>) {
    const dateValue = event.target.value;
    const [yearValue] = dateValue.split('-').map(Number);
    if (!yearValue) return;

    setYear(yearValue);
  }

  function applyDates() {
    onApply(year);
    onClose();
  }

  return (
    <div
      id="default-modal"
      tabIndex={-1}
      aria-hidden="true"
      className="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50"
    >
      <div className="relative w-full max-w-[500px] flex flex-col bg-white rounded-xl">
        <div className="relative flex flex-col h-full">
          <div className="flex items-center justify-between bg-[#f3f3f3] p-4 md:px-5 md:py-2 border-b rounded-t-xl border-gray-200">
            <h3 className="text-base font-semibold text-secondary">Reporte de ventas</h3>
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
            <div>
              <label htmlFor='monthDate' className="block mb-2 text-sm font-medium text-primary">Año del periodo</label>
              <input
                type="month"
                id='yearDate'
                className={`bg-gray-50 outline-none border placeholder-primary border-gray-600 text-primary text-sm font-medium rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-1`}
                onChange={handleMonthChange}
                defaultValue={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
              />
            </div>
          </div>
          <footer className="flex items-center p-4 md:px-5 border-t border-gray-200 rounded-b">
            <button
              onClick={applyDates}
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Aceptar
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
  );
}
