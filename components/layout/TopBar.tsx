'use client';

import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import GlowingSearchBar from '@/components/ui/GlowingSearchBar';
import DeveloperModeToggle from '../DeveloperModeToggle';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMenuClick: () => void;
}

export default function TopBar({ searchQuery, onSearchChange, onMenuClick }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md">
      <div className="relative px-4 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-surface-hover rounded-full transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} className="text-foreground" />
          </button>

          {/* Navigation buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => window.history.back()}
              className="p-2 bg-background hover:bg-surface-hover rounded-full transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft size={20} className="text-text-secondary" />
            </button>
            <button
              onClick={() => window.history.forward()}
              className="p-2 bg-background hover:bg-surface-hover rounded-full transition-colors"
              aria-label="Go forward"
            >
              <ChevronRight size={20} className="text-text-secondary" />
            </button>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md">
            <GlowingSearchBar
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search prompts…"
              variant="pill"
            />
          </div>

          {/* Developer Mode Toggle */}
          <div className="hidden sm:block">
            <DeveloperModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
