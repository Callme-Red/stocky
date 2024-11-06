import Select, { StylesConfig } from 'react-select';
import { COLORS } from '../../constants/constants';
import { CategoryProps } from '../../types/types';

interface CategoryOption {
  label: string;
  value: string;
}

interface SearchSelectProps {
  onChange: (selectedOption: CategoryOption | null) => void;
  value: CategoryOption | null;
  categorys: CategoryProps[];
}

const SearchSelect: React.FC<SearchSelectProps> = ({ onChange, value, categorys }) => {
  const categoryOptions: CategoryOption[] = categorys.map(category => ({
    label: category.NombreCategoria,
    value: category.IDCategoria,
  }));

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

  return (
    <div className='mt-5'>
      <label htmlFor='category' className="block mb-2 text-sm font-medium text-primary">Categorias</label>
      <Select
        className='text-sm font-medium'
        styles={customStyles}
        placeholder='Categorias de los productos...'
        id='category'
        options={categoryOptions}
        value={value}
        onChange={onChange}
        menuPlacement="auto"
        required
      />
    </div>
  );
};

export default SearchSelect;