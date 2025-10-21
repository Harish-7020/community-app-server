'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, LogOut, Menu, Search, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useUIStore } from '@/store/useUIStore';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/utils/formatter';
import { NotificationPanel } from './NotificationPanel';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const { user } = useAuthStore();
  const { unreadCount, notifications } = useNotificationStore();
  const { toggleSidebar } = useUIStore();
  const { logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Debug logging for notifications
  console.log('🔔 Header: unreadCount:', unreadCount, 'total notifications:', notifications.length);

  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />


          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative h-10 w-10 rounded-lg hover:bg-primary/10"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </Button>

            <AnimatePresence>
              {showNotifications && (
                <NotificationPanel onClose={() => setShowNotifications(false)} />
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-xl p-2 hover:bg-muted/70 transition-all"
            >
              <Avatar className="h-9 w-9 ring-2 ring-transparent hover:ring-primary/20 transition-all">
                {user?.profilePicture ? (
                  <AvatarImage src={user.profilePicture} alt={user.firstName} />
                ) : (
                  <AvatarFallback className="bg-gradient-bg-blue text-white font-semibold text-xs">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-foreground">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute right-0 mt-3 w-72 rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
                >
                  <div className="border-b border-border px-5 py-4 bg-gradient-to-r from-primary/5 to-accent/5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                        {user?.profilePicture ? (
                          <AvatarImage src={user.profilePicture} alt={user.firstName} />
                        ) : (
                          <AvatarFallback className="bg-gradient-bg-blue text-white font-semibold">
                            {getInitials(user?.firstName, user?.lastName)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-base truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => logout()}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

