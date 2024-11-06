import { useEffect, useRef, useState } from "react";
import Button from "../../components/form/Button";
import CheckBox from "../../components/form/CheckBox";
import FieldInputWithElement from "../../components/form/FieldInputWithElement";
import { Search } from "../../icons/icons";
import { getProducts } from "../../api/inventory/products";
import { CategoryProps, ProductActive, ProductsProps } from "../../types/types";
import { showToast } from "../../components/Toast";
import { Toaster } from "react-hot-toast";
import DropDownFilterProductByCategory from "../product/DropDownFilterProductByCategory";
import { getCategorys } from "../../api/inventory/category";

interface ProductModalProps {
  onClose: () => void;
  productsActive: ProductActive[];
  setProductsActive: React.Dispatch<React.SetStateAction<ProductActive[]>>;
  isSales: number;
}

export default function ProductModal({
  onClose,
  productsActive,
  setProductsActive,
  isSales,
}: ProductModalProps) {
  const [products, setProducts] = useState<ProductsProps[]>([]);
  const productsRef = useRef<ProductsProps[]>([]);
  const [category, setCategory] = useState<CategoryProps[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [isDropDownOpen, setIsDropDownOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    async function loadProduct() {
      const { data } = await getProducts();
      let productData: ProductsProps[] = data;
      productData = productData.filter((product) => product.estado === true);
      if (isSales === 0) productData.filter((product) => product.existencias > 0);
      setProducts(productData);
      productsRef.current = productData;
    }

    loadProduct();
  }, [isSales]);

  useEffect(() => {
    async function loadCategory() {
      const { data } = await getCategorys();
      setCategory(data);
    }

    loadCategory();
  }, []);

  const handleButtonClick = (IDProduct: string, price: number, NombreProducto: string, CodigoProducto: string, existencia: number, cost: number) => {
    const priceProduct = Number(price);
    const costProduct = Number(cost);
    if (costProduct.toFixed(0) === "0" && isSales === 2) {
      showToast("El costo del producto no puede ser 0.", false);
      return;
    }

    if (existencia === 0 && isSales === 0) {
      showToast("Este producto no tiene stock.", false);
      return;
    }

    if (priceProduct.toFixed(0) === "0" && isSales === 0) {
      showToast("El precio del producto no puede ser 0.", false);
      return;
    }

    setProductsActive((prevProductsActive) => {
      const isProductActive = prevProductsActive.some((product) => product.IDProduct === IDProduct);

      if (isProductActive) {
        return prevProductsActive.filter((product) => product.IDProduct !== IDProduct);
      } else {
        return [
          ...prevProductsActive,
          {
            IDProduct,
            CodigoProducto,
            price,
            NombreProducto,
            quantity: 1,
            discount: 0,
            existencia,
            cost: isSales === 2 ? cost : 0,
          },
        ];
      }
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const filteredProducts = products.filter((product) => {
    const searchKeywords = searchText.toLowerCase().split(" ");
    return searchKeywords.every((keyword) =>
      product.NombreProducto.toLowerCase().includes(keyword) ||
      product.CodigoProducto.toLowerCase().includes(keyword)
    );
  });

  function onSelected(categoryId: string) {
    setSelectedCategory(categoryId);

    if (categoryId === null) {
      setProducts(productsRef.current);
    } else {
      setProducts(productsRef.current.filter((product) => product.IDCategoria === categoryId))
    }
  }

  return (
    <>
      <Toaster />
      <div
        id="default-modal"
        tabIndex={-1}
        aria-hidden="true"
        className="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50"
      >
        <div className="relative w-full max-w-[750px] h-[650px] flex flex-col bg-white rounded-xl">
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between bg-[#f3f3f3] p-4 md:px-5 md:py-2 border-b rounded-t-xl border-gray-200">
              <h3 className="text-base font-semibold text-secondary">Selecciona un producto</h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                onClick={onClose}
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
                    placeholder="Buscar productos"
                    focus
                  />
                  <Button
                    name="Filtrar"
                    className="bg-[#f7f7f7] shadow-lg border border-gray-300 ml-2 h-10"
                    onClick={() => setIsDropDownOpen(!isDropDownOpen)}
                  />
                </div>
                {isDropDownOpen &&
                  <div className="relative">
                    <DropDownFilterProductByCategory selectedCategory={selectedCategory} onSelected={onSelected} category={category} />
                  </div>
                }
              </div>
              <div>
                {filteredProducts.map(({ existencias, NombreProducto, precio_producto, IDProducto, CodigoProducto }, key) => (
                  <div
                    role="button"
                    key={key}
                    className={`py-4 hover:bg-[#f3f3f3] ${productsActive.some(product => product.IDProduct === IDProducto) && 'bg-[#f3f3f3]'
                      } w-full px-5 border-t ${products.length === 1 && 'border-b'} flex items-center justify-between border-gray-300`}
                    onClick={() => handleButtonClick(IDProducto, precio_producto.Precio, NombreProducto, CodigoProducto, existencias, precio_producto.Costo)}
                  >
                    <div className="flex items-center">
                      <CheckBox
                        name=""
                        disabled={(
                          (existencias === 0 ||
                            Number(precio_producto?.Precio || 0).toFixed(0) === '0') &&
                          isSales === 0) || (isSales === 2 && Number(precio_producto?.Costo || 0).toFixed(0) === '0')}
                        initialValue={productsActive.some(product => product.IDProduct === IDProducto)}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm text-primary ml-3 font-medium">{NombreProducto}</span>
                      </div>
                    </div>
                    <div>
                      <span className={`font-semibold ${Number(existencias) <= 10 ? 'text-red-900' : 'text-primary'} text-sm mr-2`}>
                        {existencias} en existencias
                      </span>
                      <span className="font-medium text-primary text-sm">
                        C$ <span>{isSales === 0 ? parseFloat(precio_producto.Precio.toString()).toFixed(2) : precio_producto.Costo.toFixed(2)}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <footer className="flex items-center p-4 md:px-5 border-t border-gray-200 rounded-b">
              <button
                onClick={onClose}
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Aceptar
              </button>
              <button
                onClick={onClose}
                type="button"
                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
              >
                Cerrar
              </button>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
