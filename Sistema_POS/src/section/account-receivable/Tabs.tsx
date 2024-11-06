interface Tab {
  label: string;
  value: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabClick: (value: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabClick }) => (
  <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200">
    {tabs.map((tab) => (
      <li key={tab.value} className="me-2">
        <a
          href="#"
          onClick={() => onTabClick(tab.value)}
          className={`inline-block p-4 rounded-t-lg ${activeTab === tab.value
            ? 'text-blue-600 bg-gray-100'
            : 'hover:text-whiting hover:bg-gray-50'
            }`}
        >
          {tab.label}
        </a>
      </li>
    ))}
  </ul>
);

export default Tabs;
