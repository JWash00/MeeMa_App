'use client';

import Link from 'next/link';
import { Plus, X, Lock, Clock } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useDeveloperMode } from '@/lib/hooks/useDeveloperMode';
import ThemeSwitcher from '@/components/theme/ThemeSwitcher';
import { SavedView } from '@/lib/sidebar/types';
import {
  WORKSPACE_VIEWS,
  CAPABILITY_VIEWS,
  MY_LIBRARY_VIEWS,
  COLLECTION_VIEWS,
  SECTION_LABELS
} from '@/lib/sidebar/savedViews';
import { trackSidebarViewSelected } from '@/lib/analytics';
import { NAV } from '@/lib/voice/voice';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView?: string | null;
  onViewSelect?: (view: SavedView) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  activeView,
  onViewSelect,
}: SidebarProps) {
  const pathname = usePathname();
  const { isDeveloperMode, mounted } = useDeveloperMode();

  const handleViewSelect = (view: SavedView) => {
    // Special handling for Prompt Test - it's a route link, not a filter
    if (view.id === 'prompt_test') {
      // Navigation handled by Link component
      onClose();
      return;
    }

    // Handle locked items - would trigger upgrade modal in production
    if (view.locked) {
      console.log('[Sidebar] Locked view clicked:', view.id, view.locked.reason);
      // TODO: Trigger upgrade modal
      return;
    }

    // Handle coming soon items
    if (view.comingSoon) {
      console.log('[Sidebar] Coming soon view clicked:', view.id);
      return;
    }

    trackSidebarViewSelected(view.id);
    onViewSelect?.(view);
    onClose();
  };

  const renderViewButton = (view: SavedView) => {
    const isActive = activeView === view.id;
    const Icon = view.icon;
    const isLocked = !!view.locked;
    const isComingSoon = !!view.comingSoon;

    // Special case: Prompt Test is a Link, not a button
    if (view.id === 'prompt_test') {
      return (
        <Link
          href="/prompttest"
          onClick={() => {
            trackSidebarViewSelected(view.id);
            onClose();
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            pathname === '/prompttest'
              ? 'text-foreground bg-surface-hover'
              : 'text-text-secondary hover:text-foreground hover:bg-surface-hover/50'
          }`}
        >
          {Icon && <Icon size={20} />}
          <span className="font-medium text-sm">{view.label}</span>
        </Link>
      );
    }

    return (
      <button
        onClick={() => handleViewSelect(view)}
        disabled={isComingSoon}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
          isActive
            ? 'text-foreground bg-surface-hover'
            : isComingSoon
            ? 'text-text-muted cursor-not-allowed'
            : 'text-text-secondary hover:text-foreground hover:bg-surface-hover/50'
        }`}
        data-testid={`${view.section}-item-${view.id}`}
      >
        {Icon && <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />}
        <span className="font-medium text-sm flex-1">{view.label}</span>
        {isLocked && <Lock size={14} className="text-text-muted" />}
        {isComingSoon && <Clock size={14} className="text-text-muted" />}
      </button>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-background border-r border-surface-hover flex flex-col overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        data-testid="sidebar"
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <h1 className="text-2xl font-bold text-accent tracking-tight">
              {NAV.logo}
            </h1>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-surface-hover rounded-full transition-colors"
            aria-label="Close menu"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        {/* WORKSPACES Section */}
        <nav className="px-3 mb-2">
          <h2 className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
            {SECTION_LABELS.workspaces}
          </h2>
          <ul className="space-y-1" data-testid="workspaces-section">
            {WORKSPACE_VIEWS.filter(v => !v.comingSoon || isDeveloperMode).map((view) => (
              <li key={view.id}>{renderViewButton(view)}</li>
            ))}
          </ul>
        </nav>

        {/* Divider */}
        <div className="mx-3 border-t border-surface-hover" />

        {/* CAPABILITIES Section */}
        <nav className="px-3 pt-4 mb-2">
          <h2 className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
            {SECTION_LABELS.capabilities}
          </h2>
          <ul className="space-y-1" data-testid="capabilities-section">
            {CAPABILITY_VIEWS.map((view) => (
              <li key={view.id}>{renderViewButton(view)}</li>
            ))}
          </ul>
        </nav>

        {/* Divider */}
        <div className="mx-3 border-t border-surface-hover" />

        {/* MY LIBRARY Section */}
        <nav className="px-3 pt-4 mb-2">
          <h2 className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
            {SECTION_LABELS.my_library}
          </h2>
          <ul className="space-y-1" data-testid="my-library-section">
            {MY_LIBRARY_VIEWS.map((view) => (
              <li key={view.id}>{renderViewButton(view)}</li>
            ))}
          </ul>
        </nav>

        {/* Divider */}
        <div className="mx-3 border-t border-surface-hover" />

        {/* COLLECTIONS Section */}
        <nav className="px-3 pt-4 flex-1">
          <h2 className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
            {SECTION_LABELS.collections}
          </h2>
          <ul className="space-y-1" data-testid="collections-section">
            {COLLECTION_VIEWS.map((view) => (
              <li key={view.id}>{renderViewButton(view)}</li>
            ))}
          </ul>
        </nav>

        {/* Footer: Theme Switcher + New Snippet Button */}
        <div className="p-4 border-t border-surface-hover space-y-3">
          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* New Snippet Button (stubbed) */}
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-surface-hover text-text-muted rounded-full cursor-not-allowed"
          >
            <Plus size={20} />
            <span className="font-semibold text-sm">New Snippet</span>
          </button>
          <p className="text-xs text-text-muted text-center">
            Sign in to create snippets
          </p>
        </div>
      </aside>
    </>
  );
}
