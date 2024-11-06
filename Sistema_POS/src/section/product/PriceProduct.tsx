import PrependChildInput from '../../components/form/PrependChildInput';
import Line from '../../components/form/Line';
import FieldInputWithElement from '../../components/form/FieldInputWithElement';
import FieldInput from '../../components/form/FieldInput';

interface PriceProductProps {
  price: number;
  cost: number;
  onPriceChange: (value: number) => void;
  onCostChange: (value: number) => void;
}

const PriceProduct: React.FC<PriceProductProps> = ({ price, cost, onPriceChange, onCostChange }) => {
  return (
    <div className="bg-white rounded-lg mt-8 py-5">
      <div className="mx-4">
        <h2 className={`font-semibold mb-3`}>Precios</h2>
        <div className="mb-8">
          <div className="flex flex-col md:flex-row mb-5">
            <FieldInput
              isNumber
              className="w-full"
              name="Precio"
              id="price"
              classNameInput='h-10'
              placeholder="C$ 0.00"
              value={price}
              onChange={(e) => onPriceChange(Number(e.target.value) || 0)}
            />
            <FieldInputWithElement
              name="Costo"
              id="cost"
              readOnly
              placeholder="C$ 0.00"
              className="w-full ml-2"
              isNumber
              prependChild={<PrependChildInput message="Costo del producto a la hora de comprarlo" id="cost" />}
              value={cost.toFixed(2)}
              onChange={(e) => onCostChange(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      <Line />

      <div className="flex mt-5 flex-col md:flex-row mx-3">
        <FieldInput
          isNumber
          readonly
          className="w-full mt-4 md:mt-0 md:ml-2"
          classNameInput='h-10'
          name='Ganancia'
          id="profit"
          placeholder="C$ 0.00"
          value={(price - cost).toFixed(2)} // Asegúrate de que el valor sea una cadena decimal
        />
        <FieldInput
          isNumber
          readonly
          className="w-full mt-4 md:mt-0 md:ml-2"
          classNameInput='h-10'
          name={"Margen"}
          id="margin"
          placeholder="C$ 0.00"
          value={price > 1 ? (((price - cost) / price) * 100).toFixed(2) : ''}
        />
      </div>
    </div>
  );
};

export default PriceProduct;
