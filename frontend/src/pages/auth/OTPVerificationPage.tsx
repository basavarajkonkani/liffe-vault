import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Shield, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get email from navigation state
  const email = location.state?.email;

  // Redirect to login if no email is provided
  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle OTP input change
  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Only process if it's 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setError('');
      // Focus last input
      inputRefs.current[5]?.focus();
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otp.join('');

    // Validate OTP is complete
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call verifyOTP API
      const response = await api.post('/auth/verify-otp', {
        email,
        otp: otpCode,
      });

      if (response.data.success) {
        toast({
          title: 'Verification Successful',
          description: 'Your email has been verified.',
        });

        // Navigate to PIN setup page
        navigate('/pin-setup', { 
          state: { 
            email,
            tempToken: response.data.data?.tempToken 
          } 
        });
      }
    } catch (error: any) {
      // Increment attempt count
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);

      // Check if max attempts reached
      if (newAttemptCount >= 3) {
        setError('Maximum attempts reached. Your account has been locked for 15 minutes.');
        toast({
          title: 'Account Locked',
          description: 'Too many failed attempts. Please try again in 15 minutes.',
          variant: 'destructive',
        });
        
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        // Show error for invalid/expired OTP
        const errorMessage = error.response?.data?.error || 'Invalid or expired OTP';
        setError(`${errorMessage} (Attempt ${newAttemptCount}/3)`);
        
        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }

      console.error('Verify OTP error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');
    setOtp(['', '', '', '', '', '']);
    setAttemptCount(0);

    try {
      const response = await api.post('/auth/send-otp', { email });

      if (response.data.success) {
        toast({
          title: 'OTP Resent',
          description: 'A new verification code has been sent to your email.',
        });
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md fade-in">
        {/* Back Button - larger touch target */}
        <Button
          variant="ghost"
          className="mb-3 sm:mb-4 transition-smooth h-10 touch-manipulation"
          onClick={() => navigate('/login')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Button>

        {/* Logo/Brand Section - responsive sizing */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-full mb-3 sm:mb-4">
            <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Verify Your Email</h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            We've sent a 6-digit code to <strong className="break-all">{email}</strong>
          </p>
        </div>

        {/* OTP Verification Card - responsive padding and sizing */}
        <Card className="glass-card">
          <CardHeader className="space-y-1 sm:space-y-1.5">
            <CardTitle className="text-xl sm:text-2xl">Enter Verification Code</CardTitle>
            <CardDescription className="text-sm">
              The code will expire in 10 minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* OTP Input Fields - larger touch targets for mobile */}
              <div className="flex justify-center gap-1.5 sm:gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={isLoading || attemptCount >= 3}
                    className={`w-11 h-11 sm:w-12 sm:h-12 text-center text-lg font-semibold transition-smooth touch-manipulation ${
                      error ? 'border-destructive' : ''
                    }`}
                  />
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Submit Button - larger touch target */}
              <Button
                type="submit"
                className="w-full transition-smooth h-11 sm:h-12 text-base touch-manipulation"
                disabled={isLoading || attemptCount >= 3 || otp.join('').length !== 6}
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  Didn't receive the code?
                </p>
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendOTP}
                  disabled={isLoading || attemptCount >= 3}
                  className="transition-smooth touch-manipulation h-auto"
                >
                  Resend Code
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice - responsive text */}
        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
          <p>
            For your security, you have 3 attempts to enter the correct code.
          </p>
        </div>
      </div>
    </div>
  );
}
