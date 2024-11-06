import Select, { StylesConfig } from 'react-select';
import { COLORS } from '../../constants/constants';

interface CategoryOption {
  label: string;
  value: string;
}

interface ClientSearchProps {
  onClientSelect: (selectedClientID: string) => void;
  customer: CategoryOption[];
  selectedClient?: CategoryOption;
}

const ClientSearch = ({ onClientSelect, customer, selectedClient }: ClientSearchProps) => {
  const customStyles: StylesConfig<CategoryOption, false> = {
    option: (provided) => ({
      ...provided,
      fontWeight: '500',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: COLORS.primary,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: COLORS.primary,
    }),
  };

  const handleChange = (selectedOption: CategoryOption | null) => {
    if (selectedOption) {
      onClientSelect(selectedOption.value);
    }
  };

  return (
    <div>
      <label htmlFor='customer' className="block mb-2 text-[15px] font-semibold">Clientes</label>
      <Select
        className='text-sm font-medium'
        styles={customStyles}
        placeholder='Busca a tus clientes'
        id='customer'
        options={customer}
        onChange={handleChange}
        value={selectedClient || null}
        menuPlacement="auto"
        required
      />
    </div>
  );
};

export default ClientSearch;
