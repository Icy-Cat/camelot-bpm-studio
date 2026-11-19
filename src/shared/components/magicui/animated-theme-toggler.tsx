'use client';

import { useEffect, useRef, useState } from 'react';
import { Moon, SunDim } from 'lucide-react';
import { useTheme } from 'next-themes';
import { flushSync } from 'react-dom';

import { cn } from '@/shared/lib/utils';

type AnimatedThemeTogglerProps = {
  className?: string;
};

export const AnimatedThemeToggler = ({
  className,
}: AnimatedThemeTogglerProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = resolvedTheme === 'dark';
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const changeTheme = async () => {
    const nextTheme = isDarkMode ? 'light' : 'dark';

    const applyTheme = () => {
      flushSync(() => {
        setTheme(nextTheme);
      });
    };

    if (
      !buttonRef.current ||
      typeof document.startViewTransition !== 'function'
    ) {
      applyTheme();
      return;
    }

    try {
      const transition = document.startViewTransition(() => {
        applyTheme();
      });

      await transition.ready;

      const { top, left, width, height } =
        buttonRef.current.getBoundingClientRect();
      const y = top + height / 2;
      const x = left + width / 2;

      const right = window.innerWidth - left;
      const bottom = window.innerHeight - top;
      const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRad}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    } catch {
      applyTheme();
    }
  };

  if (!mounted) {
    return (
      <span
        aria-hidden="true"
        className={cn('inline-flex size-8 items-center justify-center', className)}
      />
    );
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={changeTheme}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors',
        className
      )}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? <SunDim className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
};
