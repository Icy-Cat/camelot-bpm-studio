'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

import { Link, usePathname } from '@/core/i18n/navigation';
import {
  BrandLogo,
  LocaleSelector,
  SignUser,
  SmartIcon,
  ThemeToggler,
} from '@/shared/blocks/common';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/shared/components/ui/navigation-menu';
import { useMedia } from '@/shared/hooks/use-media';
import { NavItem } from '@/shared/types/blocks/common';
import { Header as HeaderType } from '@/shared/types/blocks/landing';

export function Header({ header }: { header: HeaderType }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isLarge = useMedia('(min-width: 64rem)');
  const pathname = usePathname();

  // Desktop Navigation Menu
  const NavMenu = () => {
    return (
      <NavigationMenu viewport={false} className="max-lg:hidden">
        <NavigationMenuList className="gap-1 flex-nowrap">
          {header.nav?.items?.map((item, idx) => {
            const isActive =
              item.is_active ||
              (item.url !== '/' && pathname.includes(item.url as string)) ||
              (item.url === '/' && (pathname === '/' || pathname === '/en' || pathname === '/zh'));

            return (
              <NavigationMenuItem key={idx}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.url || ''}
                    target={item.target || '_self'}
                    className={`flex flex-row items-center gap-1.5 px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-800/90 text-orange-400 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {item.icon && (
                      <SmartIcon
                        name={item.icon as string}
                        className={`size-3.5 ${isActive ? 'text-orange-400' : 'text-slate-400'}`}
                      />
                    )}
                    <span>{item.title}</span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    );
  };

  // Mobile navigation menu
  const MobileMenu = ({ closeMenu }: { closeMenu: () => void }) => {
    return (
      <div className="w-full py-4 space-y-3">
        <div className="flex flex-col space-y-1">
          {header.nav?.items?.map((item, idx) => {
            const isActive =
              item.is_active ||
              (item.url !== '/' && pathname.includes(item.url as string));

            return (
              <Link
                key={idx}
                href={item.url || ''}
                onClick={closeMenu}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-orange-400 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                {item.icon && (
                  <SmartIcon
                    name={item.icon as string}
                    className={`size-4 ${isActive ? 'text-orange-400' : 'text-slate-400'}`}
                  />
                )}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile quick actions */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            {header.show_theme ? <ThemeToggler /> : null}
            {header.show_locale ? <LocaleSelector /> : null}
          </div>
          {header.show_sign ? (
            <SignUser userNav={header.user_nav} />
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-md bg-slate-950/85 border-b border-slate-800/80 transition-all duration-200">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Brand Logo */}
          <div className="flex items-center shrink-0">
            {header.brand && <BrandLogo brand={header.brand} />}
          </div>

          {/* Center: Desktop Navigation Menu */}
          {isLarge && (
            <div className="hidden lg:flex items-center justify-center flex-1 px-2">
              <NavMenu />
            </div>
          )}

          {/* Right: Actions on Desktop */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              {header.show_theme ? <ThemeToggler /> : null}
              {header.show_locale ? <LocaleSelector /> : null}
            </div>

            {header.show_sign ? (
              <SignUser userNav={header.user_nav} />
            ) : null}

            {/* Hamburger menu button for mobile navigation */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              className="p-2 text-slate-300 hover:text-white lg:hidden rounded-lg hover:bg-slate-900"
            >
              {isMobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {!isLarge && isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-lg">
            <MobileMenu closeMenu={() => setIsMobileMenuOpen(false)} />
          </div>
        )}
      </div>
    </header>
  );
}
