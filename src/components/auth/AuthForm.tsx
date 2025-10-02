
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff, Check, X, Shield } from "@/components/ui/icons";
import { supabase } from "@/integrations/supabase/client";
import { 
  logAuthFailure, 
  incrementFailedAttempts, 
  clearFailedAttempts, 
  isAccountLocked, 
  getFailedAttemptCount 
} from "@/utils/securityLogger";

interface AuthFormProps {
  onAuthSuccess: () => void;
}

interface PasswordRequirement {
  text: string;
  met: boolean;
}

const AuthForm = ({ onAuthSuccess }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  // Password complexity validation
  const getPasswordRequirements = (password: string): PasswordRequirement[] => [
    { text: "At least 8 characters long", met: password.length >= 8 },
    { text: "Contains at least one uppercase letter", met: /[A-Z]/.test(password) },
    { text: "Contains at least one lowercase letter", met: /[a-z]/.test(password) },
    { text: "Contains at least one number", met: /\d/.test(password) },
    { text: "Contains at least one special character (!@#$%^&*)", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
  ];

  const passwordRequirements = getPasswordRequirements(formData.password);
  const isPasswordValid = passwordRequirements.every(req => req.met);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!isPasswordValid) {
      return "Password does not meet complexity requirements";
    }
    return null;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Check if account is locked
    if (isAccountLocked(formData.email)) {
      const attemptCount = getFailedAttemptCount(formData.email);
      setError(`Account temporarily locked due to ${attemptCount} failed attempts. Please try again in 15 minutes.`);
      setIsLoading(false);
      return;
    }

    // Validate password complexity
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName
          }
        }
      });

      if (error) {
        const attemptCount = incrementFailedAttempts(formData.email);
        
        if (error.message.includes('already registered')) {
          logAuthFailure(formData.email, 'Email already registered', undefined);
          setError('This email is already registered. Please sign in instead.');
        } else {
          logAuthFailure(formData.email, error.message, undefined);
          setError(error.message);
        }

        // Show lockout warning
        if (attemptCount >= 3) {
          setError(prev => `${prev} (${attemptCount} failed attempts - account will be locked after 5 attempts)`);
        }
      } else {
        clearFailedAttempts(formData.email);
        setError(null);
        // Check if email confirmation is required
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          onAuthSuccess();
        } else {
          setError('Please check your email and click the confirmation link to complete registration.');
        }
      }
    } catch (err) {
      logAuthFailure(formData.email, 'Unexpected signup error', undefined);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Check if account is locked
    if (isAccountLocked(formData.email)) {
      const attemptCount = getFailedAttemptCount(formData.email);
      setError(`Account temporarily locked due to ${attemptCount} failed attempts. Please try again in 15 minutes.`);
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        const attemptCount = incrementFailedAttempts(formData.email);
        
        if (error.message.includes('Invalid login credentials')) {
          logAuthFailure(formData.email, 'Invalid credentials', undefined);
          setError('Invalid email or password. Please check your credentials and try again.');
        } else {
          logAuthFailure(formData.email, error.message, undefined);
          setError(error.message);
        }

        // Show lockout warning
        if (attemptCount >= 3) {
          setError(prev => `${prev} (${attemptCount} failed attempts - account will be locked after 5 attempts)`);
        }
      } else {
        clearFailedAttempts(formData.email);
        onAuthSuccess();
      }
    } catch (err) {
      logAuthFailure(formData.email, 'Unexpected signin error', undefined);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show security info for locked accounts
  const failedAttempts = getFailedAttemptCount(formData.email);
  const showSecurityWarning = failedAttempts > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome to Forever In Color</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Security warning for failed attempts */}
            {showSecurityWarning && (
              <Alert className="border-orange-200 bg-orange-50">
                <Shield className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <div className="flex items-center justify-between">
                    <span>{failedAttempts} failed attempt{failedAttempts > 1 ? 's' : ''} detected for this email</span>
                    <span className="text-sm">({5 - failedAttempts} remaining)</span>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || isAccountLocked(formData.email)}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    name="fullName"
                    type="text"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Password Requirements */}
                  {formData.password && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                      <div className="space-y-1">
                        {passwordRequirements.map((req, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            {req.met ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <X className="h-3 w-3 text-red-600" />
                            )}
                            <span className={`text-xs ${req.met ? 'text-green-600' : 'text-red-600'}`}>
                              {req.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || (formData.password && !isPasswordValid) || isAccountLocked(formData.email)}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;
