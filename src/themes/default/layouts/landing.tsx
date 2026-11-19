import { ReactNode } from 'react';

import { getThemeBlock } from '@/core/theme';
import {
  Footer as FooterType,
  Header as HeaderType,
} from '@/shared/types/blocks/landing';

export default async function LandingLayout({
  children,
  header,
  footer,
}: {
  children: ReactNode;
  header: HeaderType;
  footer: FooterType;
}) {
  const Header = await getThemeBlock('header');
  const Footer = await getThemeBlock('footer');

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden">
      <Header header={header} />
      <main className="flex-1 w-full">{children}</main>
      <Footer footer={footer} />
    </div>
  );
}
