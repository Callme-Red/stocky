import { useState, useEffect } from 'react';
import CheckBox from '../../components/form/CheckBox';
import StatusTags from '../../components/StatusTags';
import { ExpenseProps, SelectedExpensesProps } from '../../types/types';
import Button from '../../components/form/Button';
import { ThreeDots } from '../../icons/icons';
import ToolTip from '../../components/ToolTip';
import DropDownExpense from './DropDownExpense';
import { currencyFormatter } from '../../utils/function';
import { useNavigate } from 'react-router-dom';

interface ExpenseTableProps {
  expense: ExpenseProps[];
  showOptions: boolean;
  setShowOptions: (show: boolean) => void;
  onRefreshExpenses: (selectedExpenses: SelectedExpensesProps[]) => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ onRefreshExpenses, expense, showOptions, setShowOptions }) => {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExpenses, setselectedExpenses] = useState<SelectedExpensesProps[]>([]);

  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const headers = [
    { title: 'Fecha', className: 'px-2' },
    { title: 'Gasto', className: 'pl-2 w-[25%]' },
    { title: 'Estado', className: 'pl-2 xl:table-cell hidden' },
    { title: 'Categoria', className: 'px-2 md:table-cell hidden' },
  ];

  useEffect(() => {
    setShowOptions(selectedExpenses.length === 0);
  }, [selectedExpenses, setShowOptions]);


  useEffect(() => {
    const allSelected = expense.every(expense => selectedExpenses.some(selected => selected.IDExpense === expense.IDExpense));
    setIsChecked(allSelected);
  }, [selectedExpenses, expense]);

  const handleCheckBoxChange = (newValue: boolean) => {
    if (newValue) {
      setselectedExpenses(expense.map(expense => ({ IDExpense: expense.IDExpense, state: true })));
    } else {
      setselectedExpenses([]);
    }
  };

  const handleRowCheckBoxChange = (id: string, state: boolean, newValue: boolean) => {
    let updatedselectedExpenses = [...selectedExpenses];

    if (newValue) {
      updatedselectedExpenses.push({ IDExpense: id, state: state });
    } else {
      updatedselectedExpenses = updatedselectedExpenses.filter(expense => expense.IDExpense !== id);
    }

    setselectedExpenses(updatedselectedExpenses);
  };

  const refreshExpenses = async () => {
    onRefreshExpenses(selectedExpenses);
    setIsOpen(false)
    setselectedExpenses([])
  };

  return (
    <div className="relative min-h-[500px] overflow-x-auto shadow-sm border border-gray-300 border-b-0">
      <table className="w-full text-left">
        <thead className="bg-[whiting2] border-b border-gray-300">
          <tr className="[&>th]:font-medium [&>th]:text-[13px] [&>th]:text-secondary [&>th]:py-3 px-2">
            <th scope="col" className="p-2 w-10">
              <CheckBox
                onChange={handleCheckBoxChange}
                name=''
                initialValue={isChecked}
              />
            </th>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className={header.className}
                style={{ opacity: showOptions ? 1 : 0 }}
              >
                {header.title}
              </th>
            ))}
            <th scope="col" className="px-6 w-52 font-medium relative text-right">
              {showOptions ? (
                "Monto"
              ) : (
                <div className='flex items-center justify-end'>
                  <div className='absolute right-2 flex'>
                    <Button name='Editar' onClick={() => navigate(`/expense/add/${selectedExpenses[0].IDExpense}`)} className='bg-white shadow-md border border-gray-300' />
                    <div onClick={toggleDropdown} data-tooltip-id="options" className='bg-white cursor-pointer border border-gray-300 shadow-md size-8 ml-1 flex items-center justify-center rounded-md'>
                      <ThreeDots />
                      {isOpen && <ToolTip id='options' title='Más opciones' />}
                    </div>
                    <DropDownExpense refreshExpense={refreshExpenses} isOpen={isOpen} selectedExpenses={selectedExpenses} />
                  </div>
                </div>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {expense.map(({ IDExpense, name, category, amount, date, state }) => (
            <tr key={IDExpense} className="bg-white [&>td]:font-semibold [&>td]:text-[13px] [&>td]:text-secondary/90 border-b hover:bg-gray-50">
              <td className="w-4 p-2">
                <CheckBox
                  name=''
                  initialValue={selectedExpenses.some(expense => expense.IDExpense === IDExpense)}
                  onChange={(value) => handleRowCheckBoxChange(IDExpense, state, value)}
                />
              </td>
              <td className="px-2 py-2">
                {new Date(date).toLocaleDateString()}
              </td>
              <td className="pl-2 py-4">
                {name}
              </td>
              <td className="px-2 py-4 xl:table-cell hidden">
                <StatusTags text={state ? 'Activo' : 'Inactivo'} status={state} />
              </td>
              <td className="px-2 md:table-cell hidden py-4">
                <span>{category}</span>
              </td>
              <td className="px-6 py-4 text-right">
                {currencyFormatter(amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExpenseTable;
