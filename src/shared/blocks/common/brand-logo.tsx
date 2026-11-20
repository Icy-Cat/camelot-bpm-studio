import Image from 'next/image';

import { Link } from '@/core/i18n/navigation';
import { Brand as BrandType } from '@/shared/types/blocks/common';

export function BrandLogo({ brand }: { brand: BrandType }) {
  const isDefaultBrandMark =
    brand.logo?.src === '/logo.png' || brand.logo?.src === '/logo.svg';

  return (
    <Link
      href={brand.url || ''}
      target={brand.target || '_self'}
      className={`flex items-center space-x-2.5 ${brand.className || ''}`}
    >
      {brand.logo &&
        (isDefaultBrandMark ? (
          <>
            <img
              src="/logo.svg"
              alt={brand.title ? '' : brand.logo.alt || 'Camelot BPM Studio'}
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 dark:hidden"
            />
            <img
              src="/logo-dark.svg"
              alt={brand.title ? '' : brand.logo.alt || 'Camelot BPM Studio'}
              width={32}
              height={32}
              className="hidden h-8 w-8 shrink-0 dark:block"
            />
          </>
        ) : (
          <Image
            src={brand.logo.src}
            alt={brand.title ? '' : brand.logo.alt || ''}
            width={brand.logo.width || 80}
            height={brand.logo.height || 80}
            className="h-8 w-auto rounded-lg"
            unoptimized={brand.logo.src.startsWith('http')}
          />
        ))}
      {brand.title && (
        <span className="text-sm sm:text-base 2xl:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
          {brand.title}
        </span>
      )}
    </Link>
  );
}
