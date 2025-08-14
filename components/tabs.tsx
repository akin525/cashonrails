import React, { useState } from 'react';
import clsx from 'clsx';

// NOTE: This component assumes the tabs are controlled by external state
// NOTE: The scrollbar customisation and visibility toggle is experimental and may change in the future, P.S Scott Lexium

interface TabsProps {
  tabs: { label: string; content: React.ReactNode }[];
  defaultActiveTab?: number;
  tabClassName?: string;
  tabActiveClassName?: string;
  tabInactiveClassName?: string;
  contentClassName?: string;
  hideScrollbar?: boolean;
  scrollbarThumbColor?: string;
  scrollbarThumbHoverColor?: string;
}

const defaultTabClassName = 'py-4 px-6 font-medium text-sm transition-colors whitespace-nowrap';
const defaultTabActiveClassName = 'border-b-2 border-emerald-500 text-emerald-500';
const defaultTabInactiveClassName = 'text-gray-500 hover:text-gray-700';
const defaultContentClassName = 'p-6';

const Tabs = ({
  tabs,
  defaultActiveTab = 0,
  tabClassName = defaultTabClassName,
  tabActiveClassName = defaultTabActiveClassName,
  tabInactiveClassName = defaultTabInactiveClassName,
  contentClassName = defaultContentClassName,
  hideScrollbar = false,
  scrollbarThumbColor = 'bg-gray-400',
  scrollbarThumbHoverColor = 'bg-gray-500'
}: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  return (
    <div className="w-full">
      <div
        className={clsx('flex border-b border-gray-200 overflow-x-auto', {
          'scrollbar-hide': hideScrollbar,
          'scrollbar-thumb-rounded': !hideScrollbar,
          [`scrollbar-thumb-${scrollbarThumbColor} scrollbar-thumb-hover-${scrollbarThumbHoverColor}`]: !hideScrollbar
        })}
      >
        <div className="flex">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={clsx(
                defaultTabClassName,
                tabClassName,
                {
                  [defaultTabActiveClassName]: index === activeTab,
                  [tabActiveClassName]: index === activeTab,
                  [defaultTabInactiveClassName]: index !== activeTab,
                  [tabInactiveClassName]: index !== activeTab
                }
              )}
              onClick={() => setActiveTab(index)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className={clsx(defaultContentClassName, contentClassName)}>
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default Tabs;