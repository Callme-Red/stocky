import { PDFDownloadLink, PDFViewer, pdf } from "@react-pdf/renderer";
import Button from "../components/form/Button";

export default function PDFContainer({ children, name }: { children: JSX.Element, name: string }) {
  const handlePrint = async () => {
    const blob = await pdf(children).toBlob();
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url);
    if (newWindow) {
      newWindow.onload = () => {
        newWindow.print();
      };
    }
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full">
      <div className="flex flex-col h-full pt-10">
        <header className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-secondary">{name}</h2>
          <div className='flex items-center'>
            <PDFDownloadLink document={children} fileName={name}>
              <Button
                name='Descargar'
                className='bg-[#e3e3e3] shadow-sm hover:bg-[#d4d4d4] border border-gray-300 mr-3 text-primary' />
            </PDFDownloadLink>
            <Button
              name='Imprimir'
              className='bg-primary text-white'
              onClick={handlePrint}
            />
          </div>
        </header>
        <div className="w-full h-full flex justify-center">
          <PDFViewer showToolbar={false} className="w-full h-[500px] rounded-xl">
            {children}
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
