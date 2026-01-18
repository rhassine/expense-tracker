'use client';

import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Application providers wrapper
 * Combines HeroUI and next-themes for consistent theming
 */
export function Providers({ children }: ProvidersProps) {
  const router = useRouter();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <HeroUIProvider navigate={router.push}>
        {children}
      </HeroUIProvider>
    </NextThemesProvider>
  );
}
