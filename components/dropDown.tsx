import { ChevronIcon } from '@/assets/icons';
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface CustomDropdownProps {
  trigger: React.ComponentType<{ isOpen: boolean }> | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  dropdownClassName?: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.FC | React.ReactNode;
  className?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  trigger: TriggerComponent,
  children,
  className = '',
  dropdownClassName,
  isOpen: controlledIsOpen,
  onOpenChange,
}) => {
  const [isOpenInternal, setIsOpenInternal] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  
  // Allow both controlled and uncontrolled usage
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : isOpenInternal;
  const setIsOpen = useCallback((newValue: boolean) => {
    setIsOpenInternal(newValue);
    onOpenChange?.(newValue);
  }, [onOpenChange]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  // Wrap children with click handler to close dropdown
  const wrappedChildren = React.Children.map(children, child => {
    if (!React.isValidElement(child)) return child;

    return React.cloneElement(child as React.ReactElement<any>, {
      onClick: () => {
        (child as any).props.onClick?.();
        setIsOpen(false);
      },
    });
  });

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {TriggerComponent ? (
          typeof TriggerComponent === 'function' ? (
            <TriggerComponent isOpen={isOpen} />
          ) : (
            TriggerComponent
          )
        ) : (
          <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md hover:bg-gray-50">
            Select Option
            <ChevronIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute left-0 z-50 w-full mt-2 bg-white border rounded-md shadow-lg ${dropdownClassName}`}>
          <div className="py-1 px-1">
            {wrappedChildren}
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownItem: React.FC<DropdownItemProps> = ({ children, onClick, icon: Icon, className = '' }) => (
  <div
    className={`flex items-center gap-2 px-4 py-2 text-gray-700 cursor-pointer hover:bg-[#F4F7F6] rounded-md ${className}`}
    onClick={onClick}
  >
    {Icon && (typeof Icon === 'function' ? <Icon /> : Icon)}
    {children}
  </div>
);

// Example usage component
const Example = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const customTrigger = ({ isOpen }: { isOpen: boolean }) => (
    <button className="flex items-center gap-2 px-6 py-3 text-white bg-green-500 rounded-md hover:bg-green-600">
      Review Chargeback
      <ChevronIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );

  return (
    <CustomDropdown 
      trigger={customTrigger}
      dropdownClassName="bg-gray-50"
    >
      <DropdownItem 
        icon={() => <span className="text-green-500">✓</span>}
        onClick={() => {
          setSelectedOption('approve');
          console.log('Approved');
        }}
      >
        Approve Refund
      </DropdownItem>
      <DropdownItem 
        icon={() => <span className="text-red-500">✕</span>}
        onClick={() => {
          setSelectedOption('dispute');
          console.log('Disputed');
        }}
      >
        Dispute Chargeback
      </DropdownItem>
    </CustomDropdown>
  );
};

export { CustomDropdown, DropdownItem, Example as default };