import { useEffect, useState } from "react";
import Button from "../../components/form/Button";
import FieldInputWithElement from "../../components/form/FieldInputWithElement";
import { Search } from "../../icons/icons";
import { getQuotation } from "../../api/sales/quotations";
import StatusTags from "../../components/StatusTags";
import { Quotation } from "../../types/types";
import CheckBox from "../../components/form/CheckBox";

interface Props {
  onClose: () => void;
  onApply: (quotation: Quotation) => void;
}

export default function QuotationModal({ onClose, onApply }: Props) {
  const [searchText, setSearchText] = useState<string>("");
  const [quotation, setQuotation] = useState<Quotation[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([]); // Cotizaciones filtradas
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleSelectQuotation = (quotation: Quotation) => {
    if (selectedQuotation?.IDQuotation === quotation.IDQuotation) {
      setSelectedQuotation(null);
    } else {
      setSelectedQuotation(quotation);
    }
  };

  // Cargar cotizaciones una sola vez
  useEffect(() => {
    async function loadQuotations() {
      const { data } = await getQuotation();
      const allQuotations: Quotation[] = data;
      const activeQuotations = allQuotations.filter((q) => q.state === '1');
      setQuotation(activeQuotations); // Guardamos las cotizaciones activas en el estado
      setFilteredQuotations(activeQuotations); // Inicialmente, todas las cotizaciones están en el filtrado
    }

    loadQuotations();
  }, []);

  // Efecto para filtrar las cotizaciones localmente según el texto de búsqueda
  useEffect(() => {
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const results = quotation.filter((q) =>
        q.quotationCode.toLowerCase().includes(searchLower) ||
        q.Client.toLowerCase().includes(searchLower)
      );
      setFilteredQuotations(results); // Actualizamos las cotizaciones filtradas
    } else {
      setFilteredQuotations(quotation); // Si no hay búsqueda, mostrar todas las cotizaciones
    }
  }, [searchText, quotation]); // Filtramos cada vez que cambie searchText o se actualicen las cotizaciones

  return (
    <div
      id="default-modal"
      tabIndex={-1}
      className="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50"
    >
      <div className="relative w-full max-w-[650px] h-[450px] flex flex-col bg-white rounded-xl">
        <div className="relative flex flex-col h-full">
          <div className="flex items-center justify-between bg-[#f3f3f3] p-4 md:px-5 md:py-2 border-b rounded-t-xl border-gray-200">
            <h3 className="text-base font-semibold text-secondary">Seleccionar cotización</h3>
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
          <div className="flex-grow overflow-y-auto">
            <div className="px-4 py-3">
              <div className="flex items-center">
                <FieldInputWithElement
                  name=""
                  id="name"
                  value={searchText}
                  onChange={handleSearchChange}
                  appendChild={<Search />}
                  className="w-full"
                  placeholder="Buscar cotizaciones"
                />
                <Button
                  name="Filtrar"
                  className="bg-[#f7f7f7] shadow-lg border border-gray-300 ml-2 h-10"
                />
              </div>
            </div>
            {filteredQuotations.map((element) => (
              <div
                role="button"
                onClick={() => handleSelectQuotation(element)}
                key={element.IDQuotation}
                className={`flex border-t ${filteredQuotations.length === 1 && 'border-b'} border-gray-300 py-2 px-6 cursor-pointer items-center hover:bg-[#f3f3f3] justify-between`}
              >
                <div className="flex items-center">
                  <CheckBox name="" initialValue={selectedQuotation?.IDQuotation === element.IDQuotation} />
                  <div className="flex flex-col ml-3">
                    <span className="text-primary font-medium text-sm">{element.quotationCode}</span>
                    <span className="text-[#005bd3] mt-1 font-medium text-sm hover:underline cursor-pointer">{element.Client}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  {element.typeShipping && <StatusTags status={element.typeShipping} text="Delivery" />}
                  <span className="text-primary font-semibold ml-2 text-sm">C$ {parseFloat(element.total).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          <footer className="flex items-center p-4 md:px-5 border-t border-gray-200 rounded-b">
            <button
              type="button"
              onClick={() => {
                if (selectedQuotation) {
                  onApply(selectedQuotation);
                  onClose();
                }
              }}
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
