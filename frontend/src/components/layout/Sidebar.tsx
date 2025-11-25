import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Vault,
  Users,
  UserPlus,
  FolderOpen,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  roles: Array<'owner' | 'nominee' | 'admin'>;
}

const navItems: NavItem[] = [
  {
    to: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    roles: ['owner', 'nominee', 'admin'],
  },
  {
    to: '/vault',
    icon: Vault,
    label: 'My Vault',
    roles: ['owner'],
  },
  {
    to: '/nominees',
    icon: UserPlus,
    label: 'Manage Nominees',
    roles: ['owner'],
  },
  {
    to: '/shared-assets',
    icon: FolderOpen,
    label: 'Shared Assets',
    roles: ['nominee'],
  },
  {
    to: '/admin/users',
    icon: Users,
    label: 'User Management',
    roles: ['admin'],
  },
  {
    to: '/admin/assets',
    icon: FolderOpen,
    label: 'Asset Management',
    roles: ['admin'],
  },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user } = useAuthStore();

  const filteredNavItems = navItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-16 left-0 bottom-0 w-64 bg-white/70 backdrop-blur-md border-r border-white/30 shadow-lg z-40 transition-transform duration-300',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close button for mobile */}
        <div className="lg:hidden absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  // Close sidebar on mobile when clicking a link
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={({ isActive }: { isActive: boolean }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth',
                    'hover:bg-primary/10',
                    isActive
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'text-gray-700'
                  )
                }
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
