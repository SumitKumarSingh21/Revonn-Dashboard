
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User, MapPin, Upload } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import PrivacyPolicy from "@/components/PrivacyPolicy";
import TermsAndConditions from "@/components/TermsAndConditions";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [garageName, setGarageName] = useState("");
  const [garageAddress, setGarageAddress] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [garageImage, setGarageImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in and handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in, redirecting to dashboard');
        navigate("/dashboard");
      }
    });

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate("/dashboard");
      }
    };
    
    checkUser();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGarageImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadGarageImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `garage-images/${fileName}`;

    const { error } = await supabase.storage
      .from('garages')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('garages')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const isEmail = (input: string) => {
    return input.includes('@');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailOrPhone,
        password,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Determine if input is email or phone
      const isEmailInput = isEmail(emailOrPhone);
      
      // For signup, we need an email, so if phone is provided, we'll create a dummy email
      const email = isEmailInput ? emailOrPhone : `${emailOrPhone}@temp.revonn.com`;
      const phone = isEmailInput ? "" : emailOrPhone;

      // Sign up the user with proper redirect
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: ownerName,
            phone: phone,
          },
        },
      });

      if (authError) {
        toast({
          title: "Error",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (authData.user) {
        // Upload garage image if provided
        let imageUrl = null;
        if (garageImage) {
          imageUrl = await uploadGarageImage(garageImage);
        }

        // Create garage profile immediately
        const { error: garageError } = await supabase
          .from('garages')
          .insert({
            owner_id: authData.user.id,
            name: garageName,
            location: garageAddress,
            image_url: imageUrl,
          });

        if (garageError) {
          console.error('Error creating garage:', garageError);
          toast({
            title: "Warning",
            description: "Account created but garage profile setup incomplete. Please complete your profile in the dashboard.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Account and garage profile created successfully!",
          });
        }

        // For development, we'll sign them in immediately since email confirmation is disabled
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!signInError) {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
      }
      // Don't set loading to false here as the redirect will happen
    } catch (error) {
      console.error("Google auth error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/7a2c0481-ceb6-477c-b9ef-b6e8e634b7f9.png" 
              alt="Revonn Logo" 
              className="h-12 w-12"
            />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Partner with Revonn</CardTitle>
          <CardDescription className="text-lg text-gray-600 mt-2">
            Join India's #1 Local Garage Booking Platform
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 pb-8">
          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="signup" className="text-base py-3">Sign Up</TabsTrigger>
              <TabsTrigger value="signin" className="text-base py-3">Sign In</TabsTrigger>
            </TabsList>

            <TabsContent value="signup" className="space-y-6">
              {/* Google Sign Up Button */}
              <Button
                onClick={handleGoogleAuth}
                disabled={loading}
                variant="outline"
                className="w-full h-12 text-base flex items-center justify-center gap-3 border-2 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="relative flex items-center">
                <Separator className="flex-1" />
                <span className="px-4 text-sm text-gray-500 bg-white">OR</span>
                <Separator className="flex-1" />
              </div>

              {/* Manual Signup Form */}
              <form onSubmit={handleManualSignUp} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="garageName" className="text-sm font-medium">Garage Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="garageName"
                        type="text"
                        placeholder="Enter garage name"
                        value={garageName}
                        onChange={(e) => setGarageName(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerName" className="text-sm font-medium">Owner's Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="ownerName"
                        type="text"
                        placeholder="Enter your full name"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="garageImage" className="text-sm font-medium">Garage Image (Optional)</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Upload className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="garageImage"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                    {imagePreview && (
                      <div className="w-16 h-16 border-2 border-gray-200 rounded-lg overflow-hidden">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="garageAddress" className="text-sm font-medium">Garage Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="garageAddress"
                      type="text"
                      placeholder="Enter complete garage address"
                      value={garageAddress}
                      onChange={(e) => setGarageAddress(e.target.value)}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailOrPhone" className="text-sm font-medium">Phone Number or Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="emailOrPhone"
                        type="text"
                        placeholder="Enter phone number or email"
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Garage Account"}
                </Button>
              </form>

              {/* Terms Text */}
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                By continuing, you agree to our{" "}
                <TermsAndConditions>
                  <span className="text-blue-600 hover:text-blue-800 cursor-pointer underline">
                    Terms of Service
                  </span>
                </TermsAndConditions>{" "}
                and{" "}
                <PrivacyPolicy>
                  <span className="text-blue-600 hover:text-blue-800 cursor-pointer underline">
                    Privacy Policy
                  </span>
                </PrivacyPolicy>
                .
              </p>
            </TabsContent>

            <TabsContent value="signin" className="space-y-6">
              {/* Google Sign In Button */}
              <Button
                onClick={handleGoogleAuth}
                disabled={loading}
                variant="outline"
                className="w-full h-12 text-base flex items-center justify-center gap-3 border-2 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="relative flex items-center">
                <Separator className="flex-1" />
                <span className="px-4 text-sm text-gray-500 bg-white">OR</span>
                <Separator className="flex-1" />
              </div>

              {/* Manual Sign In Form */}
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="loginEmailOrPhone" className="text-sm font-medium">Phone Number or Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="loginEmailOrPhone"
                      type="text"
                      placeholder="Enter your phone number or email"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginPassword" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="loginPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In to Dashboard"}
                </Button>
              </form>

              {/* Terms Text */}
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                By continuing, you agree to our{" "}
                <TermsAndConditions>
                  <span className="text-blue-600 hover:text-blue-800 cursor-pointer underline">
                    Terms of Service
                  </span>
                </TermsAndConditions>{" "}
                and{" "}
                <PrivacyPolicy>
                  <span className="text-blue-600 hover:text-blue-800 cursor-pointer underline">
                    Privacy Policy
                  </span>
                </PrivacyPolicy>
                .
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
