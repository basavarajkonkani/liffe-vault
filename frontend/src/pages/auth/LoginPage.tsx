import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';
import api from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});

    // Validate email format
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);

    try {
      // Call sendOTP API
      const response = await api.post('/auth/send-otp', { email });

      if (response.data.success) {
        toast({
          title: 'OTP Sent',
          description: 'Please check your email for the verification code.',
        });

        // Navigate to OTP verification page with email
        navigate('/otp-verify', { state: { email } });
      }
    } catch (error: any) {
      // Error handling is done by axios interceptor
      // Additional specific error handling can be added here if needed
      console.error('Send OTP error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md fade-in">
        {/* Logo/Brand Section - responsive sizing */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-full mb-3 sm:mb-4">
            <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">LifeVault</h1>
          <p className="text-sm sm:text-base text-gray-600">Secure Digital Asset Management</p>
        </div>

        {/* Login Card - responsive padding and text */}
        <Card className="glass-card">
          <CardHeader className="space-y-1 sm:space-y-1.5">
            <CardTitle className="text-xl sm:text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-sm">
              Enter your email to receive a verification code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className={`transition-smooth h-11 sm:h-12 text-base ${errors.email ? 'border-destructive' : ''}`}
                  autoComplete="email"
                  autoFocus
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full transition-smooth h-11 sm:h-12 text-base touch-manipulation"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </form>

            <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
              <p>
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info - responsive text */}
        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
          <p>
            New to LifeVault? You'll be able to create an account after verification.
          </p>
        </div>
      </div>
    </div>
  );
}
