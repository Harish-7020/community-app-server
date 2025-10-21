'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Users,
  BarChart3,
  Search,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/useUIStore';

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Communities', href: '/communities' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Search, label: 'Search', href: '/search' },
  { icon: User, label: 'Profile', href: '/profile' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 240 : 60,
        }}
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-card border-r border-border transition-all duration-200',
          'lg:relative lg:z-0',
          !sidebarOpen && 'lg:w-16'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo - Clean and Minimal */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <motion.div
              animate={{ opacity: sidebarOpen ? 1 : 0 }}
              className="overflow-hidden flex items-center gap-2"
            >
              {sidebarOpen && (
                <h1 className="brand-font text-2xl text-foreground font-bold">
                  Fynora
                </h1>
              )}
            </motion.div>
            <motion.button
              onClick={toggleSidebar}
              className="rounded-lg p-2 hover:bg-muted transition-colors"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </motion.button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-3">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      'relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all cursor-pointer group',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0 transition-all" />
                    {sidebarOpen && (
                      <span className="text-sm font-medium truncate">
                        {item.label}
                      </span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-3 bg-gradient-to-t from-muted/30 to-transparent">
            {sidebarOpen && (
              <div className="text-center py-2">
                <p className="text-[10px] text-muted-foreground font-medium">
                  © 2025 <span className="brand-font text-xs text-primary font-bold">Fynora</span>
                </p>
                <p className="text-[9px] text-muted-foreground mt-1">
                  Made with ❤️
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}

