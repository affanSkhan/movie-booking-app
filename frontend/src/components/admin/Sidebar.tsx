import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Film, 
  Calendar, 
  Ticket, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onLogout,
  isMobileMenuOpen,
  onMobileMenuToggle
}) => {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'movies', name: 'Add Movie', icon: Film },
    { id: 'shows', name: 'Manage Shows', icon: Calendar },
    { id: 'bookings', name: 'View Bookings', icon: Ticket },
  ];

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: '-100%', opacity: 0 }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass rounded-xl shadow-soft-dark border border-border/50"
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-foreground" />
        ) : (
          <Menu className="h-6 w-6 text-foreground" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={onMobileMenuToggle}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={isMobileMenuOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 glass border-r border-border/50
          transform lg:translate-x-0 transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo/Brand */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-border/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
              <Film className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-gradient">
              Admin Panel
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4" aria-label="Admin navigation">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    if (window.innerWidth < 1024) {
                      onMobileMenuToggle();
                    }
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl
                    transition-all duration-200 ease-in-out
                    ${isActive
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-soft'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                  <span className="font-medium">{item.name}</span>
                </motion.button>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-4 right-4">
          <motion.button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-200 ease-in-out"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar; 