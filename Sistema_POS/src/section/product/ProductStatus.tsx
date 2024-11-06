import { ChangeEvent } from 'react';
import FieldInput from '../../components/form/FieldInput';
import FieldSelect from '../../components/form/FieldSelect';

type ProductStatusSelectProps = {
  status: string;
  minStock: number;
  onChange: (value: string) => void;
  onChangeStock: (e: ChangeEvent<HTMLInputElement>) => void;
};

export default function ProductStatus({ status, onChange, minStock, onChangeStock }: ProductStatusSelectProps) {
  return (
    <>
      <div className="bg-white rounded-lg mt-8 w-full px-3 py-5 lg:ml-8">
        <h2 className="font-semibold text-[15px] mb-3">Estado</h2>
        <FieldSelect
          name=""
          id="status"
          options={[
            { name: 'Activo', value: '1' },
            { name: 'Inactivo', value: '0' },
          ]}
          value={status}
          onChange={(value) => onChange(value.toString())}
        />
      </div>

      <div className="bg-white rounded-lg mt-4 w-full px-3 py-5 lg:ml-8">
        <h2 className="font-semibold text-[15px] mb-3">Inventario</h2>
        <FieldInput
          id='minStock'
          name='Cantidad minima'
          classNameInput='h-10'
          isNumber
          value={minStock.toFixed(0) || 0}
          onChange={onChangeStock}
        />
      </div>
    </>
  );
}
