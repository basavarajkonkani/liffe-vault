import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PINSetupPage() {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '', '', '']);
  const [isLoading] = useState(false);
  const [errors, setErrors] = useState<{ pin?: string; confirmPin?: string }>({});
  
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmPinRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Get email and tempToken from navigation state
  const email = location.state?.email;
  const tempToken = location.state?.tempToken;

  // Redirect to login if no email is provided
  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  // Focus first PIN input on mount
  useEffect(() => {
    pinRefs.current[0]?.focus();
  }, []);

  // Handle PIN input change
  const handlePinChange = (index: number, value: string, field: 'pin' | 'confirmPin') => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const refs = field === 'pin' ? pinRefs : confirmPinRefs;
    const setter = field === 'pin' ? setPin : setConfirmPin;
    const currentValue = field === 'pin' ? pin : confirmPin;

    const newValue = [...currentValue];
    newValue[index] = value;
    setter(newValue);
    setErrors({});

    // Auto-focus next input
    if (value && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    field: 'pin' | 'confirmPin'
  ) => {
    const refs = field === 'pin' ? pinRefs : confirmPinRefs;
    const currentValue = field === 'pin' ? pin : confirmPin;

    if (e.key === 'Backspace' && !currentValue[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent, field: 'pin' | 'confirmPin') => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Only process if it's 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newValue = pastedData.split('');
      const setter = field === 'pin' ? setPin : setConfirmPin;
      const refs = field === 'pin' ? pinRefs : confirmPinRefs;
      
      setter(newValue);
      setErrors({});
      // Focus last input
      refs.current[5]?.focus();
    }
  };

  // Validate PINs
  const validatePins = (): boolean => {
    const newErrors: { pin?: string; confirmPin?: string } = {};
    const pinCode = pin.join('');
    const confirmPinCode = confirmPin.join('');

    // Check if PIN is exactly 6 digits
    if (pinCode.length !== 6) {
      newErrors.pin = 'PIN must be exactly 6 digits';
    }

    // Check if confirmation PIN is exactly 6 digits
    if (confirmPinCode.length !== 6) {
      newErrors.confirmPin = 'Please confirm your PIN';
    }

    // Check if PINs match
    if (pinCode.length === 6 && confirmPinCode.length === 6 && pinCode !== confirmPinCode) {
      newErrors.confirmPin = 'PINs do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate PINs
    if (!validatePins()) {
      return;
    }

    const pinCode = pin.join('');

    // Navigate to role selector with PIN
    navigate('/role-select', {
      state: {
        email,
        pin: pinCode,
        tempToken,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md fade-in">
        {/* Back Button - larger touch target */}
        <Button
          variant="ghost"
          className="mb-3 sm:mb-4 transition-smooth h-10 touch-manipulation"
          onClick={() => navigate('/otp-verify', { state: { email } })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Logo/Brand Section - responsive sizing */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-full mb-3 sm:mb-4">
            <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Set Your PIN</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Create a secure 6-digit PIN for quick login
          </p>
        </div>

        {/* PIN Setup Card - responsive padding and sizing */}
        <Card className="glass-card">
          <CardHeader className="space-y-1 sm:space-y-1.5">
            <CardTitle className="text-xl sm:text-2xl">Create Your PIN</CardTitle>
            <CardDescription className="text-sm">
              You'll use this PIN to securely access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* PIN Input - larger touch targets for mobile */}
              <div className="space-y-2">
                <Label htmlFor="pin-0" className="text-sm sm:text-base">Enter PIN</Label>
                <div className="flex justify-center gap-1.5 sm:gap-2">
                  {pin.map((digit, index) => (
                    <Input
                      key={`pin-${index}`}
                      id={index === 0 ? 'pin-0' : undefined}
                      ref={(el) => {
                        pinRefs.current[index] = el;
                      }}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value, 'pin')}
                      onKeyDown={(e) => handleKeyDown(index, e, 'pin')}
                      onPaste={index === 0 ? (e) => handlePaste(e, 'pin') : undefined}

                      disabled={isLoading}
                      className={`w-11 h-11 sm:w-12 sm:h-12 text-center text-lg font-semibold transition-smooth touch-manipulation ${
                        errors.pin ? 'border-destructive' : ''
                      }`}
                    />
                  ))}
                </div>
                {errors.pin && (
                  <p className="text-sm text-destructive text-center">{errors.pin}</p>
                )}
              </div>

              {/* Confirm PIN Input - larger touch targets for mobile */}
              <div className="space-y-2">
                <Label htmlFor="confirm-pin-0" className="text-sm sm:text-base">Confirm PIN</Label>
                <div className="flex justify-center gap-1.5 sm:gap-2">
                  {confirmPin.map((digit, index) => (
                    <Input
                      key={`confirm-pin-${index}`}
                      id={index === 0 ? 'confirm-pin-0' : undefined}
                      ref={(el) => {
                        confirmPinRefs.current[index] = el;
                      }}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value, 'confirmPin')}
                      onKeyDown={(e) => handleKeyDown(index, e, 'confirmPin')}
                      onPaste={index === 0 ? (e) => handlePaste(e, 'confirmPin') : undefined}

                      disabled={isLoading}
                      className={`w-11 h-11 sm:w-12 sm:h-12 text-center text-lg font-semibold transition-smooth touch-manipulation ${
                        errors.confirmPin ? 'border-destructive' : ''
                      }`}
                    />
                  ))}
                </div>
                {errors.confirmPin && (
                  <p className="text-sm text-destructive text-center">{errors.confirmPin}</p>
                )}
              </div>

              {/* Submit Button - larger touch target */}
              <Button
                type="submit"
                className="w-full transition-smooth h-11 sm:h-12 text-base touch-manipulation"
                disabled={isLoading || pin.join('').length !== 6 || confirmPin.join('').length !== 6}
              >
                {isLoading ? 'Setting up...' : 'Continue to Role Selection'}
              </Button>
            </form>

            {/* Security Tips - responsive text */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary-light rounded-lg">
              <p className="text-xs sm:text-sm text-gray-700 font-semibold mb-2">Security Tips:</p>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                <li>• Choose a PIN that's easy to remember but hard to guess</li>
                <li>• Don't use obvious patterns like 123456 or 000000</li>
                <li>• Keep your PIN confidential</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
