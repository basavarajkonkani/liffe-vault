import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { loginPIN } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import { Shield, User, Users, Settings } from 'lucide-react';

type UserRole = 'owner' | 'nominee' | 'admin';

const PINLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [step, setStep] = useState<'role' | 'credentials'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Role configurations
  const roles = [
    {
      id: 'owner' as UserRole,
      title: 'Asset Owner',
      description: 'Manage your assets and nominees',
      icon: User,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      id: 'nominee' as UserRole,
      title: 'Nominee',
      description: 'Access assigned assets when needed',
      icon: Users,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      id: 'admin' as UserRole,
      title: 'Admin',
      description: 'Review and approve vault requests',
      icon: Settings,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-50',
      borderColor: 'border-purple-200',
    },
  ];

  // Handle role selection
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('credentials');
  };

  // Handle PIN input - only allow digits and max 6 characters
  const handlePINChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 6) {
      setPin(value);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    if (pin.length !== 6) {
      toast({
        title: 'Invalid PIN',
        description: 'PIN must be exactly 6 digits.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call login API
      const response = await loginPIN(email, pin);

      if (response.success && response.data) {
        const { user, token } = response.data;

        // Store user and token in Zustand store
        login(user, token);

        // Show success message
        toast({
          title: 'Login Successful',
          description: `Welcome back!`,
        });

        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
          const dashboardPath = `/dashboard/${user.role}`;
          
          // Navigate to role-specific dashboard
          navigate(dashboardPath, { replace: true });
        }, 100);
      } else {
        console.error('Login response not successful:', response); // Debug log
        toast({
          title: 'Login Failed',
          description: 'Invalid response from server.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Login error:', error); // Debug log
      toast({
        title: 'Login Failed',
        description: error.response?.data?.error || 'Invalid email or PIN. Please try again.',
        variant: 'destructive',
      });
      // Clear PIN field
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 p-4 sm:p-6">
      <Card className="w-full max-w-md p-6 sm:p-8 bg-white shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-50 mb-4">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">LifeVault</h1>
          <p className="text-sm sm:text-base text-gray-600">Secure Digital Inheritance Platform</p>
        </div>

        {/* Step 1: Role Selection */}
        {step === 'role' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">Select your role</h2>
            
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`w-full p-4 rounded-lg border-2 ${role.borderColor} ${role.hoverColor} transition-all duration-200 hover:shadow-md text-left group`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full ${role.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{role.title}</h3>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">Secured with 256-bit encryption</p>
            </div>
          </div>
        )}

        {/* Step 2: Credentials */}
        {step === 'credentials' && (
          <div>
            {/* Back button */}
            <button
              onClick={() => {
                setStep('role');
                setSelectedRole(null);
                setEmail('');
                setPin('');
              }}
              className="mb-6 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              ← Back to role selection
            </button>

            {/* Selected Role Display */}
            {selectedRole && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600">Signing in as</p>
                <p className="font-semibold text-gray-900 capitalize">{selectedRole}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-12 text-base"
                  required
                />
              </div>

              {/* PIN Input */}
              <div className="space-y-2">
                <Label htmlFor="pin" className="text-sm font-medium text-gray-700">
                  6-Digit PIN
                </Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="••••••"
                  value={pin}
                  onChange={handlePINChange}
                  disabled={isLoading}
                  className="tracking-widest text-center text-lg h-12"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || !email || pin.length !== 6}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">Secured with 256-bit encryption</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PINLoginPage;
