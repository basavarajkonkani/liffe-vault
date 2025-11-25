import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, ArrowLeft, User, Users, UserCog } from 'lucide-react';
import api from '@/lib/api';

type Role = 'owner' | 'nominee' | 'admin';

interface RoleOption {
  value: Role;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export default function RoleSelectorPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get email, PIN, and tempToken from navigation state
  const email = location.state?.email;
  const pin = location.state?.pin;
  const tempToken = location.state?.tempToken;

  // Redirect to login if required data is missing
  useEffect(() => {
    if (!email || !pin) {
      navigate('/login');
    }
  }, [email, pin, navigate]);

  // Role options with descriptions and icons
  const roleOptions: RoleOption[] = [
    {
      value: 'owner',
      label: 'Asset Owner',
      description: 'Create and manage your digital assets, upload documents, and share with nominees',
      icon: <User className="h-8 w-8" />,
    },
    {
      value: 'nominee',
      label: 'Nominee',
      description: 'Access and view digital assets that have been shared with you by asset owners',
      icon: <Users className="h-8 w-8" />,
    },
    {
      value: 'admin',
      label: 'Administrator',
      description: 'Manage users, oversee all assets, and maintain system integrity',
      icon: <UserCog className="h-8 w-8" />,
    },
  ];

  // Handle role selection
  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedRole) {
      toast({
        title: 'Role Required',
        description: 'Please select a role to continue',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call setPIN API with selected role
      const response = await api.post('/auth/set-pin', {
        email,
        pin,
        role: selectedRole,
        tempToken,
      });

      if (response.data.success) {
        toast({
          title: 'Account Created',
          description: 'Your account has been successfully created. Please login with your PIN.',
        });

        // Navigate to login page
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Set PIN error:', error);
      // Error handling is done by axios interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl fade-in">
        {/* Back Button - larger touch target */}
        <Button
          variant="ghost"
          className="mb-3 sm:mb-4 transition-smooth h-10 touch-manipulation"
          onClick={() => navigate('/pin-setup', { state: { email, tempToken } })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to PIN Setup
        </Button>

        {/* Logo/Brand Section - responsive sizing */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-full mb-3 sm:mb-4">
            <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Choose Your Role</h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            Select the role that best describes how you'll use LifeVault
          </p>
        </div>

        {/* Role Selection Card - responsive padding */}
        <Card className="glass-card">
          <CardHeader className="space-y-1 sm:space-y-1.5">
            <CardTitle className="text-xl sm:text-2xl">Select Your Role</CardTitle>
            <CardDescription className="text-sm">
              You can only select one role. Choose carefully based on your needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {/* Role Options - responsive padding and sizing */}
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleRoleSelect(option.value)}
                  disabled={isLoading}
                  className={`w-full p-4 sm:p-6 rounded-lg border-2 transition-smooth text-left touch-manipulation active:scale-[0.98] ${
                    selectedRole === option.value
                      ? 'border-primary bg-primary-light shadow-md'
                      : 'border-gray-200 bg-white hover:border-primary hover:shadow-sm'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Icon - responsive sizing */}
                    <div
                      className={`flex-shrink-0 p-2 sm:p-3 rounded-full transition-smooth ${
                        selectedRole === option.value
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <div className="w-6 h-6 sm:w-8 sm:h-8">
                        {option.icon}
                      </div>
                    </div>

                    {/* Content - responsive text */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 transition-smooth ${
                          selectedRole === option.value ? 'text-primary' : 'text-gray-900'
                        }`}
                      >
                        {option.label}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">{option.description}</p>
                    </div>

                    {/* Selection Indicator */}
                    {selectedRole === option.value && (
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {/* Submit Button - larger touch target */}
              <Button
                onClick={handleSubmit}
                className="w-full mt-4 sm:mt-6 transition-smooth h-11 sm:h-12 text-base touch-manipulation"
                disabled={isLoading || !selectedRole}
              >
                {isLoading ? 'Creating Account...' : 'Complete Setup'}
              </Button>
            </div>

            {/* Additional Info - responsive padding and text */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs sm:text-sm text-gray-700">
                <strong>Note:</strong> Your role determines what features and data you can access.
                Asset Owners can create and manage assets, Nominees can view shared assets, and
                Administrators have system-wide access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
