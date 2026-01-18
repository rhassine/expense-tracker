'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * ScrollIndicator - A visual hint that encourages users to scroll down
 *
 * Features:
 * - Respects prefers-reduced-motion for accessibility
 * - Smooth fade-in/fade-out transitions
 * - Click/tap to scroll to content
 * - Auto-hides after scrolling or timeout
 * - Dark mode compatible with subtle glow effect
 */
export function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle visibility with proper fade-out timing
  const hideIndicator = useCallback(() => {
    setIsVisible(false);
    // Keep component mounted during fade-out animation
    fadeTimeoutRef.current = setTimeout(() => {
      setShouldRender(false);
    }, 300); // Match transition duration
  }, []);

  const showIndicator = useCallback(() => {
    setShouldRender(true);
    // Small delay to ensure DOM is ready for transition
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  useEffect(() => {
    // Check if the page has scrollable content
    const checkScrollable = () => {
      const isScrollable = document.documentElement.scrollHeight > window.innerHeight;
      const isAtTop = window.scrollY < 50;

      if (isScrollable && isAtTop) {
        showIndicator();
      }
    };

    // Check after content has loaded
    const initTimer = setTimeout(checkScrollable, 150);

    const handleScroll = () => {
      if (window.scrollY > 50) {
        hideIndicator();
        // Clear auto-hide timer since user has scrolled
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      }
    };

    // Auto-hide after 6 seconds if user hasn't scrolled
    hideTimeoutRef.current = setTimeout(() => {
      hideIndicator();
    }, 6000);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkScrollable, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollable);
      clearTimeout(initTimer);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, [hideIndicator, showIndicator]);

  // Handle click to scroll down
  const handleClick = useCallback(() => {
    const scrollTarget = Math.min(
      window.innerHeight * 0.8,
      document.documentElement.scrollHeight - window.innerHeight
    );

    window.scrollTo({
      top: scrollTarget,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });

    hideIndicator();
  }, [prefersReducedMotion, hideIndicator]);

  // Handle keyboard interaction
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  if (!shouldRender) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label="Scroll down to see more content"
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        cursor-pointer select-none
        transition-all duration-300 ease-out
        sm:bottom-8
        ${isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2 pointer-events-none'
        }
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
        focus-visible:ring-offset-2 focus-visible:ring-offset-background
        rounded-full
      `}
    >
      <div
        className={`
          relative
          bg-content1/90 dark:bg-content2/90
          backdrop-blur-md backdrop-saturate-150
          rounded-full p-2.5 sm:p-3
          shadow-lg shadow-black/10 dark:shadow-black/30
          border border-divider/50
          group
          hover:bg-content2/95 dark:hover:bg-content3/95
          hover:scale-105
          active:scale-95
          transition-all duration-200 ease-out
          ${!prefersReducedMotion ? 'animate-subtle-bounce' : ''}
        `}
      >
        {/* Subtle glow effect for dark mode */}
        <div
          className="
            absolute inset-0 rounded-full
            bg-primary/0 dark:bg-primary/10
            blur-md
            group-hover:bg-primary/10 dark:group-hover:bg-primary/20
            transition-all duration-300
            -z-10
          "
          aria-hidden="true"
        />

        {/* Pulse ring effect */}
        {!prefersReducedMotion && (
          <div
            className="
              absolute inset-0 rounded-full
              border-2 border-primary/30
              animate-pulse-ring
            "
            aria-hidden="true"
          />
        )}

        <ChevronDown
          className="
            w-5 h-5 sm:w-6 sm:h-6
            text-foreground/70 dark:text-foreground/80
            group-hover:text-primary
            transition-colors duration-200
          "
          aria-hidden="true"
          strokeWidth={2.5}
        />
      </div>

      {/* Screen reader hint */}
      <span className="sr-only">
        Press Enter or Space to scroll down, or continue scrolling manually
      </span>
    </div>
  );
}
