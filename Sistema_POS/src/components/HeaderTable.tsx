import Button from './form/Button';

const HeaderTable = ({ children, name, primaryButtonOnClick, primaryButtonText, secondaryButtonOnClick }: { name: string; primaryButtonText: string; primaryButtonOnClick: () => void; secondaryButtonOnClick?: () => void, children?: JSX.Element }) => {
  return (
    <header className="flex md:flex-row flex-col md:items-center items-start justify-between mb-5">
      <h2 className="text-xl font-bold md:mb-0 mb-5 text-secondary">{name}</h2>
      <div className='flex items-center md:w-auto w-full'>
        {children}
        <Button onClick={secondaryButtonOnClick} name='Exportar' className='bg-[#e3e3e3] md:w-auto w-full shadow-sm hover:bg-[#d4d4d4] border border-gray-300 mr-3 text-primary' />
        <Button name={primaryButtonText} onClick={primaryButtonOnClick} className='bg-primary md:w-auto w-full text-white' />
      </div>
    </header>
  );
}

export default HeaderTable;
