import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin, useCheckAndAssignAdmin } from './hooks/useQueries';
import { Toaster, toast } from 'sonner';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CommunityPage from './pages/CommunityPage';
import TherapyPage from './pages/TherapyPage';
import MoodTrackerPage from './pages/MoodTrackerPage';
import StressQuizPage from './pages/StressQuizPage';
import GuidelinesPage from './pages/GuidelinesPage';
import HelplinePage from './pages/HelplinePage';
import OutreachDashboardPage from './pages/OutreachDashboardPage';
import MessagesPage from './pages/MessagesPage';
import ProfileSetupDialog from './components/ProfileSetupDialog';
import AdminPromotionBanner from './components/AdminPromotionBanner';
import { useState, useEffect, useRef } from 'react';

type Page = 'home' | 'community' | 'therapy' | 'mood' | 'quiz' | 'guidelines' | 'helpline' | 'outreach' | 'messages';

export default function App() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading, refetch: refetchAdminStatus } = useIsCallerAdmin();
  const { mutateAsync: checkAndAssignAdmin } = useCheckAndAssignAdmin();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showAdminBanner, setShowAdminBanner] = useState(false);
  const adminCheckAttempted = useRef(false);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Check and assign admin role immediately after successful login
  useEffect(() => {
    const checkAdmin = async () => {
      // Only run once per login session when user is authenticated and login is complete
      if (isAuthenticated && loginStatus === 'success' && !adminCheckAttempted.current) {
        adminCheckAttempted.current = true;
        
        try {
          // Call backend to check and potentially assign admin role
          const wasPromoted = await checkAndAssignAdmin();
          
          if (wasPromoted) {
            // User was promoted to admin - show banner and notification
            setShowAdminBanner(true);
            
            // Show toast notification
            toast.success('Admin Privileges Granted', {
              description: 'You are now an administrator with full access to the Outreach Dashboard.',
              duration: 5000,
            });
            
            // Force refetch admin status to update UI immediately
            await refetchAdminStatus();
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
    };

    checkAdmin();
  }, [isAuthenticated, loginStatus, checkAndAssignAdmin, refetchAdminStatus]);

  // Reset admin check flag and banner when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      adminCheckAttempted.current = false;
      setShowAdminBanner(false);
    }
  }, [isAuthenticated]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'community':
        return <CommunityPage />;
      case 'therapy':
        return <TherapyPage />;
      case 'mood':
        return <MoodTrackerPage />;
      case 'quiz':
        return <StressQuizPage />;
      case 'guidelines':
        return <GuidelinesPage />;
      case 'helpline':
        return <HelplinePage />;
      case 'outreach':
        return <OutreachDashboardPage />;
      case 'messages':
        return <MessagesPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header currentPage={currentPage} onNavigate={setCurrentPage} isAdmin={isAdmin || false} />
        {showAdminBanner && <AdminPromotionBanner onDismiss={() => setShowAdminBanner(false)} />}
        <main className="flex-1">
          {renderPage()}
        </main>
        <Footer onNavigate={setCurrentPage} />
        <Toaster richColors position="top-right" />
        {showProfileSetup && <ProfileSetupDialog />}
      </div>
    </ThemeProvider>
  );
}

