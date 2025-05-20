
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { user, loading, supabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!supabaseConfigured) {
      toast.error("Supabase is not configured. Some features may not work.", {
        duration: 5000,
      });
      return;
    }
    
    if (!loading && !user) {
      // Redirect to login page if not authenticated
      navigate('/auth', { state: { from: location.pathname } });
    }
  }, [user, loading, navigate, location, supabaseConfigured]);

  // Show nothing while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If not configured or authenticated, show the protected content (demo mode)
  return (!supabaseConfigured || user) ? <>{children}</> : null;
};

export default RequireAuth;
