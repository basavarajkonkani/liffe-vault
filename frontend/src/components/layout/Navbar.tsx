import { LogOut, User, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Asset Owner';
      case 'nominee':
        return 'Nominee';
      case 'admin':
        return 'Administrator';
      default:
        return role;
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/70 backdrop-blur-md border-b border-white/30 shadow-sm">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left section - Menu button and Logo */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LV</span>
            </div>
            <span className="text-xl font-bold text-primary hidden sm:block">
              LifeVault
            </span>
          </div>
        </div>

        {/* Right section - User profile dropdown */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-primary/10 transition-smooth"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.email}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user?.role && getRoleLabel(user.role)}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-gray-500">
                  {user?.role && getRoleLabel(user.role)}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
