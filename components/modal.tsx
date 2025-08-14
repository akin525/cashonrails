"use client";

import { cn } from '@/helpers/extras';
import { useTheme } from 'next-themes';
import React, { useEffect } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  scrollableContent?: boolean;
};

export default function Modal({
  isOpen,
  onClose,
  children,
  className,
  title,
  description,
  header,
  footer,
  scrollableContent = false
}: ModalProps) {
  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Modal Container */}
      <div
          className="fixed inset-0 flex items-start justify-center p-4 min-h-screen overflow-y-scroll"
          onClick={handleBackdropClick}
      >
        {/* Modal Content */}
        <div
            className={cn(
                "relative w-full max-w-4xl p-6 rounded-lg shadow-lg", // Increased max width
                "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100",
                "border border-gray-200 dark:border-gray-700",
                "transform transition-all duration-300 ease-in-out",
                isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95",
                className
            )}
            style={{marginTop: '2%'}}
            onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            &times;
          </button>

          {/* Header */}
          {header || title || description ? (
              <div className="mb-4 p-4 border-b border-gray-200 dark:border-gray-700">
                {header ?? (
                    <>
                      {title && <h2 className="text-xl font-semibold">{title}</h2>}
                      {description && <p className="mt-2 text-gray-500 dark:text-gray-400">{description}</p>}
                    </>
                )}
              </div>
          ) : null}

          {/* Scrollable Content */}
          <div className={scrollableContent ? "max-h-[60vh] overflow-y-auto p-4" : "p-4"}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
              <div className="mt-4 p-4 border-t border-gray-200 dark:border-gray-700">
                {footer}
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
