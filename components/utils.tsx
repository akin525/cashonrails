import React, { ReactNode, useEffect, useState, useCallback } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { Route, RouteLiteral } from 'nextjs-routes';
import Image from 'next/image';
import { useUI } from '@/contexts/uiContext';
import { useTheme } from 'next-themes';

interface LinkPreviewButtonProps {
  href: RouteLiteral | Route["pathname"] | string;
  label?: string;
  iconComponent?: React.ReactNode;
  buttonClassName?: string;
  buttonActiveClassName?: string;
  buttonDisabledClassName?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const LinkPreviewButton = ({
                                    href,
                                    label = 'View',
                                    iconComponent,
                                    buttonClassName = 'inline-flex gap-2 items-center px-4 py-2 border border-[#D0D5DD] text-sm font-medium rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D0D5DD] hover:bg-[#D0D5DD]/10',
                                    buttonActiveClassName = 'bg-white',
                                    buttonDisabledClassName = 'opacity-50 cursor-not-allowed',
                                    onClick,
                                    disabled = false
                                  }: LinkPreviewButtonProps) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
      <Link
          href={href as RouteLiteral}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(buttonClassName, {
            [buttonActiveClassName]: !disabled,
            [buttonDisabledClassName]: disabled
          })}
          onClick={handleClick}
      >
        {iconComponent ?? <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.24897 2.5C6.20816 2.50548 4.61582 2.58014 3.59819 3.59793C2.5 4.6963 2.5 6.4641 2.5 9.99965C2.5 13.5352 2.5 15.3031 3.59819 16.4014C4.69638 17.4998 6.46389 17.4998 9.99897 17.4998C13.5339 17.4998 15.3015 17.4998 16.3996 16.4014C17.4172 15.3837 17.4919 13.791 17.4974 10.7497" stroke="black" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17.1308 2.91512L9.20801 10.8839M17.1308 2.91512C16.7191 2.50295 13.946 2.54136 13.3598 2.54971M17.1308 2.91512C17.5424 3.32731 17.504 6.10396 17.4957 6.69097" stroke="black" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        }
        {label ?? "View"}
      </Link>
  );
};


interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const ToggleSwitch = ({ enabled, onToggle }: ToggleSwitchProps) => {
  return (
      <div
          className={`relative w-10 h-6 rounded-full cursor-pointer transition-colors duration-300 ${enabled ? 'bg-[#01AB79]' : 'bg-gray-300'
          }`}
          onClick={() => onToggle(!enabled)}
      >
        <div
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${enabled ? 'transform translate-x-4' : ''
            }`}
        />
      </div>
  );
};

interface TooltipProps {
  text: string;
  children: ReactNode;
}

export const Tooltip = ({ text, children }: TooltipProps) => {
  const [visible, setVisible] = useState(false);

  return (
      <div
          className="relative inline-block"
          onMouseEnter={() => setVisible(true)}
          onMouseLeave={() => setVisible(false)}
      >
        {children}
        {visible && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-40 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
              {text}
            </div>
        )}
      </div>
  );
};


interface InfoItemProps {
  label: string;
  file: {
    name: string;
    url: string;
    id: number | string
  };
  merchantId: string
}
const PreviewDocumentModal = ({ isOpen, onClose, file }: { isOpen: boolean; onClose: () => void; file: { name: string; url: string } }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isPDF = true;

  if (!isOpen) return null;

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setError('Failed to load PDF');
    setIsLoading(false);
  };

  return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[80vh] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-medium">{file.name}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 relative">
            {isPDF ? (
                <>
                  {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#01AB79] border-t-transparent"></div>
                      </div>
                  )}
                  {error ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8v4M12 16h.01" />
                        </svg>
                        <p className="mt-2">{error}</p>
                        <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 text-[#01AB79] hover:underline"
                        >
                          Download PDF
                        </a>
                      </div>
                  ) : (
                      <object
                          data={file.url}
                          type="application/pdf"
                          className="w-full h-full"
                          onLoad={handleIframeLoad}
                          onError={handleIframeError}
                      >
                        <embed
                            src={file.url}
                            type="application/pdf"
                            className="w-full h-full"
                        />
                      </object>
                  )}
                </>
            ) : (
                <div className="relative w-full h-full">
                  <Image
                      src={file.url}
                      alt={file.name}
                      fill
                      className="object-contain"
                      onLoadingComplete={() => setIsLoading(false)}
                      onError={() => setError('Failed to load image')}
                  />
                  {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#01AB79] border-t-transparent"></div>
                      </div>
                  )}
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export const DocumentNode: React.FC<InfoItemProps> = ({ label, file, merchantId }) => {
  const { addFlaggedDocument, removeFlaggedDocument, flaggedDocuments } = useUI();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);

  useEffect(() => {
    // Accessing flagged documents for a specific merchant
    const merchantDocs = flaggedDocuments[merchantId] || [];
    console.log("flaggedDocuments", flaggedDocuments)
    // Check if the document is already flagged
    const flagged = merchantDocs.some(doc => doc.id === file.url);
    setIsFlagged(flagged);
  }, [flaggedDocuments, file.url, merchantId]); // Added merchantId to dependencies

  const handleFlagDocument = (event: React.MouseEvent) => {
    event.stopPropagation();
    console.log("merchantId", merchantId)
    addFlaggedDocument({ name: file.name, id: file.url }, merchantId);
    setIsFlagged(true);
  };

  const handleUnflagDocument = (event: React.MouseEvent) => {
    event.stopPropagation();
    removeFlaggedDocument(file.url, merchantId);
    setIsFlagged(false);
  };

  return (
      <div>
        <p className="text-[#00000066] text-sm">{label}</p>

        <div
            onClick={() => setIsPreviewOpen(true)}
            className="font-medium bg-[#F9FCFB] p-2 border border-[#DBE0EA] rounded-lg flex items-center justify-between cursor-pointer hover:bg-[#F1FDF6] transition-colors"
        >
          <div className="flex items-center">
            {/* <span>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="32" height="32" rx="16" fill="#F1FDF6" />
              <rect x="2" y="2" width="32" height="32" rx="16" stroke="#F1FDF6" strokeWidth="4" />
              <path d="M24.3757 16.875V16.5C24.3757 13.6716 24.3757 12.2574 23.497 11.3787C22.6183 10.5 21.2041 10.5 18.3757 10.5H17.6257C14.7974 10.5 13.3832 10.5 12.5045 11.3787C11.6258 12.2573 11.6258 13.6715 11.6258 16.4999L11.6257 19.875C11.6257 22.3405 11.6257 23.5734 12.3066 24.4031C12.4313 24.5551 12.5706 24.6943 12.7225 24.8191C13.5523 25.5 14.7851 25.5 17.2507 25.5" stroke="#01AB79" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14.625 14.25H21.375" stroke="#01AB79" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14.625 18H19.125" stroke="#01AB79" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M24.3735 24V21.75C24.3735 20.6779 23.3662 19.5 22.1235 19.5C20.8809 19.5 19.8735 20.6779 19.8735 21.75V24.375C19.8735 24.9963 20.3772 25.5 20.9985 25.5C21.6198 25.5 22.1235 24.9963 22.1235 24.375V21.75" stroke="#01AB79" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span> */}
            <div className='flex items-center gap-1 p-1'>
              {isFlagged ? (
                  <button className='text-amber-600' onClick={handleUnflagDocument}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                  </button>
              ) : (
                  <button className='text-green-600' onClick={handleFlagDocument}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-badge-check"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" /><path d="m9 12 2 2 4-4" /></svg>

                  </button>
              )}
            </div>
            <span className="truncate ml-2">{file.name}</span>
          </div>

        </div>

        <PreviewDocumentModal
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            file={file}
        />
      </div>
  );
};


const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 80 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    setDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setOffset({ x: clientX - position.x, y: clientY - position.y });
  };

  // Wrap onDrag in useCallback to make it stable
  const onDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setPosition({ x: clientX - offset.x, y: clientY - offset.y });
  }, [dragging, offset]);

  const stopDrag = () => setDragging(false);

  useEffect(() => {
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchmove", onDrag);
    document.addEventListener("touchend", stopDrag);
    return () => {
      document.removeEventListener("mousemove", onDrag);
      document.removeEventListener("mouseup", stopDrag);
      document.removeEventListener("touchmove", onDrag);
      document.removeEventListener("touchend", stopDrag);
    };
  }, [onDrag]); // Added onDrag to dependencies

  return (
      <button
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full fixed z-50 transition-all duration-300 bg-gray-800 dark:bg-gray-200 hover:bg-gray-700 dark:hover:bg-gray-300"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            position: "fixed",
            cursor: "grab",
            display: mounted ? "block" : "none", // ✅ FIX: Hide instead of returning null
          }}
      >
        {theme === "dark" ? (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-yellow-400 transition-all duration-300"
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1.5M12 19.5V21M4.22 4.22l1.06 1.06M18.72 18.72l1.06 1.06M3 12h1.5M19.5 12H21M4.22 19.78l1.06-1.06M18.72 5.28l1.06-1.06M12 6a6 6 0 100 12 6 6 0 000-12z"
              />
            </svg>
        ) : (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-gray-200 transition-all duration-300"
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12.79A9 9 0 0111.21 3a7.5 7.5 0 1010.58 9.79z"
              />
            </svg>
        )}
      </button>
  );
};

export default ThemeSwitcher;
