import { useEffect, useState } from 'react';
import Select, { StylesConfig } from 'react-select';
import { COLORS } from '../../constants/constants';


interface CategoryOption {
  label: string;
  value: string;
}

interface Props {
  onProductSelect?: (selectedProductID: string) => void;
  initialProductId?: string;
  products: CategoryOption[]
}

const ProductSearch = ({ onProductSelect, initialProductId, products }: Props) => {
  const [selectedOption, setSelectedOption] = useState<CategoryOption | null>(null);

  useEffect(() => {
    if (initialProductId) {
      const initialProduct = products.find(product => product.value.startsWith(initialProductId.split('/')[0]));
      setSelectedOption(initialProduct || null);
    }
  }, [initialProductId, products]);

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
      setSelectedOption(selectedOption);
      onProductSelect?.(selectedOption.value);
    }
  };

  return (
    <div>
      <label htmlFor='products' className="block mb-2 text-[15px] font-semibold">Productos</label>
      <Select
        className='text-sm font-medium'
        styles={customStyles}
        placeholder='Busca tus productos por su nombre...'
        id='products'
        options={products}
        onChange={handleChange}
        menuPlacement="auto"
        value={selectedOption}
        required
      />
    </div>
  );
};

export default ProductSearch;
