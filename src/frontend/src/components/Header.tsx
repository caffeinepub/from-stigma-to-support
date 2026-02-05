import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart, Shield, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import ShareWebsiteDialog from './ShareWebsiteDialog';

type Page = 'home' | 'community' | 'therapy' | 'mood' | 'quiz' | 'guidelines' | 'helpline' | 'outreach' | 'messages';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isAdmin: boolean;
}

export default function Header({ currentPage, onNavigate, isAdmin }: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const buttonText = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      onNavigate('home');
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navItems: { label: string; page: Page; adminOnly?: boolean; authRequired?: boolean }[] = [
    { label: 'Home', page: 'home' },
    { label: 'Community', page: 'community' },
    { label: 'Therapy', page: 'therapy' },
    { label: 'Mood Tracker', page: 'mood' },
    { label: 'Stress Quiz', page: 'quiz' },
    { label: 'Guidelines', page: 'guidelines' },
    { label: 'Helpline', page: 'helpline' },
    { label: 'Messages', page: 'messages', authRequired: true },
    { label: 'Outreach Dashboard', page: 'outreach', adminOnly: true },
  ];

  const visibleNavItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.authRequired && !isAuthenticated) return false;
    return true;
  });

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-blue-100 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
            From Stigma to Support
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {visibleNavItems.map((item) => (
              <Button
                key={item.page}
                variant={currentPage === item.page ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate(item.page)}
                className={`${currentPage === item.page ? 'bg-gradient-to-r from-blue-500 to-purple-500' : ''} ${item.adminOnly || item.authRequired ? 'gap-1' : ''}`}
              >
                {item.adminOnly && <Shield className="w-3 h-3" />}
                {item.page === 'messages' && <MessageCircle className="w-3 h-3" />}
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ShareWebsiteDialog />
            <Button
              onClick={handleAuth}
              disabled={disabled}
              size="sm"
              className={isAuthenticated ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'}
            >
              {buttonText}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 flex flex-col gap-2">
            {visibleNavItems.map((item) => (
              <Button
                key={item.page}
                variant={currentPage === item.page ? 'default' : 'ghost'}
                onClick={() => {
                  onNavigate(item.page);
                  setMobileMenuOpen(false);
                }}
                className={`justify-start ${currentPage === item.page ? 'bg-gradient-to-r from-blue-500 to-purple-500' : ''} ${item.adminOnly || item.authRequired ? 'gap-2' : ''}`}
              >
                {item.adminOnly && <Shield className="w-4 h-4" />}
                {item.page === 'messages' && <MessageCircle className="w-4 h-4" />}
                {item.label}
              </Button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

