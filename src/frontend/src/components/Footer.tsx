import { Heart } from 'lucide-react';
import ShareWebsiteDialog from './ShareWebsiteDialog';

type Page = 'home' | 'community' | 'therapy' | 'mood' | 'quiz' | 'guidelines' | 'helpline' | 'outreach' | 'messages';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-blue-100 dark:border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left text-sm text-muted-foreground">
            <p className="flex items-center justify-center md:justify-start gap-2">
              © 2025. Built with <Heart className="w-4 h-4 text-pink-500 fill-pink-500" /> using{' '}
              <a
                href="https://caffeine.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ShareWebsiteDialog />
          </div>
        </div>
      </div>
    </footer>
  );
}

