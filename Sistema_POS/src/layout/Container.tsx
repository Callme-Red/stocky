import { useState } from 'react';
import Aside from '../section/container/Aside';
import Header from '../section/container/Header';

export default function Container({
  text,
  save = false,
  children,
  onSaveClick,
  onClickSecondary
}: {
  text?: string;
  save?: boolean;
  children?: JSX.Element;
  onSaveClick?: () => void;
  onClickSecondary?: () => void;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [settingsMenu, setSettingsMenu] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div id='app' className='flex flex-col h-screen overflow-hidden'>
      <Header
        setSettingsMenu={setSettingsMenu}
        settingsMenu={settingsMenu}
        save={save}
        onClickAside={toggleSidebar}
        text={text}
        onClick={onSaveClick}
        onClickSecondary={onClickSecondary}
      />
      <Aside setSettingsMenu={setSettingsMenu} settingsMenu={settingsMenu} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <main className='overflow-y-auto bg-[#f1f1f1]'>
        <div className='pb-10 w-full md:px-4 px-0'>
          {children}
        </div>
      </main>
    </div>
  );
}
