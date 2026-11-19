import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenPersonalize: () => void;
}

const NAV_LINKS = [
  { href: '#story', label: 'Story' },
  { href: '#special', label: 'Special' },
  { href: '#letter', label: 'Letter' },
  { href: '#garden', label: 'Garden' },
  { href: '#proposal', label: 'Proposal' },
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenPersonalize }) => {
  const [scrollPct, setScrollPct] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const pct = total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 0;
      setScrollPct(pct);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 z-40 border-b border-[#FFF4EA]/12 bg-[#10080C]">
      {/* Scroll progress hairline */}
      <div
        aria-hidden="true"
        className="h-[2px] w-full bg-transparent"
      >
        <div
          className="h-full bg-gradient-to-r from-[#A31336] via-[#F4A6B8] to-[#D8B46A] transition-[width] duration-100"
          style={{ width: `${scrollPct}%` }}
        />
      </div>

      {/* Strict 3-zone Top Bar Contract */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Single-line Brand wordmark */}
        <a
          href="#welcome"
          className="font-display text-xl font-semibold tracking-wide text-[#FFF4EA] whitespace-nowrap shrink-0 transition-colors hover:text-[#D8B46A]"
        >
          Forever Love
        </a>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-7 md:flex"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[#FFF4EA]/75 transition-colors duration-200 hover:text-[#D8B46A] hover:underline hover:underline-offset-8 whitespace-nowrap shrink-0"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary action (+ mobile menu toggle on small screens) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenPersonalize}
            className="rounded-lg border border-[#D8B46A]/50 bg-[#310714] px-4 py-2 text-xs font-medium tracking-wider text-[#FFF4EA] transition-colors duration-200 hover:border-[#D8B46A] hover:bg-[#A31336] focus-visible:outline-2 focus-visible:outline-[#D8B46A] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Personalize
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#FFF4EA]/15 text-[#FFF4EA] md:hidden cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-[#FFF4EA]/10 bg-[#10080C] px-6 py-4 md:hidden"
        >
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="py-2 text-sm font-medium text-[#FFF4EA]/85 transition-colors hover:text-[#D8B46A]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};
