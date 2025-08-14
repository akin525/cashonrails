// components/NavLinkLayout.tsx
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { RouteLiteral } from 'nextjs-routes';

interface NavLinkLayoutProps {
  links: { label: string; href?: string; content?: React.ReactNode }[];
  linkClassName?: string;
  linkActiveClassName?: string;
  linkInactiveClassName?: string;
  contentClassName?: string;
  hideScrollbar?: boolean;
  scrollbarThumbColor?: string;
  scrollbarThumbHoverColor?: string;
}

const defaultLinkClassName = 'py-4 px-6 font-medium text-sm transition-colors whitespace-nowrap';
const defaultLinkActiveClassName = 'border-b-2 border-emerald-500 text-emerald-500';
const defaultLinkInactiveClassName = 'text-gray-500 hover:text-gray-700';
const defaultContentClassName = 'p-6';

const NavLinkLayout = ({
  links,
  linkClassName = defaultLinkClassName,
  linkActiveClassName = defaultLinkActiveClassName,
  linkInactiveClassName = defaultLinkInactiveClassName,
  contentClassName = defaultContentClassName,
  hideScrollbar = false,
  scrollbarThumbColor = 'bg-gray-400',
  scrollbarThumbHoverColor = 'bg-gray-500'
}: NavLinkLayoutProps) => {
  const pathname = usePathname();

  return (
    <div className="w-full mb-3">
      <div
        className={clsx('flex overflow-x-auto whitespace-nowrap border-b border-gray-300', {
          'scrollbar-hide': hideScrollbar,
          'scrollbar-thumb-rounded': !hideScrollbar,
          [`scrollbar-thumb-${scrollbarThumbColor} scrollbar-thumb-hover-${scrollbarThumbHoverColor}`]: !hideScrollbar
        })}
      >
        <div className="flex flex-wrap w-full gap-3 md:gap-3">
          {links.map((link, index) => (
            <Link href={link.href as RouteLiteral} key={index} passHref>
              <p
                className={clsx(
                  defaultLinkClassName,
                  linkClassName,
                  {
                    [defaultLinkActiveClassName]: pathname.startsWith(link.href || ''),
                    [linkActiveClassName]: pathname.startsWith(link.href || ''),
                    [defaultLinkInactiveClassName]: !pathname.startsWith(link.href || ''),
                    [linkInactiveClassName]: !pathname.startsWith(link.href || '')
                  }
                )}
              >
                {link.label}
              </p>
            </Link>
          ))}
        </div>
      </div>
      {/* <div className={clsx(defaultContentClassName, contentClassName)}> */}
        {/* Render content based on the current route or nested layout structure */}
      {/* </div> */}
    </div>
  );
};

export default NavLinkLayout;
