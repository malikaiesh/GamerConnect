import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Github, KeyRound, Phone } from "lucide-react";
import { FaGoogle, FaFacebook, FaGithub, FaDiscord, FaTwitter, FaApple, FaMicrosoft } from "react-icons/fa";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { SiteSetting, SignupOption } from "@shared/schema";

// Form validation schemas
const loginSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }).optional().or(z.literal('')),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(100),
  confirmPassword: z.string(),
  bio: z.string().max(500, { message: "Bio should be less than 500 characters" }).optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  profilePicture: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal(''))
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  
  // Fetch site settings for logo configuration
  const { data: settings } = useQuery<SiteSetting>({
    queryKey: ['/api/settings'],
  });
  
  // Fetch enabled signup options
  const { data: enabledSignupOptions = [] } = useQuery<SignupOption[]>({
    queryKey: ['/api/signup-options/enabled'],
  });

  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      bio: "",
      country: "",
      profilePicture: "",
    },
  });

  // We're removing this auto-redirect for now so you can log in with different accounts
  // useEffect(() => {
  //   if (user) {
  //     navigate("/");
  //   }
  // }, [user, navigate]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (values: LoginValues) => {
      return await apiRequest('/api/login', {
        method: 'POST',
        body: JSON.stringify(values)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Login successful",
        description: "Welcome back!"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (values: RegisterValues) => {
      return await apiRequest('/api/register', {
        method: 'POST',
        body: JSON.stringify(values)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Registration successful",
        description: "Welcome to Gaming Portal!"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle login form submission
  const onLoginSubmit = (values: LoginValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        // Redirect to admin dashboard if admin user
        if (values.username === 'admin') {
          setTimeout(() => navigate('/admin/dashboard'), 1000);
        }
      }
    });
  };

  // Auto login function for development
  const autoLogin = () => {
    loginMutation.mutate({
      username: "admin",
      password: "admin123"
    }, {
      onSuccess: () => {
        setTimeout(() => navigate('/admin/dashboard'), 1000);
      }
    });
  };

  // Handle registration form submission
  const onRegisterSubmit = (values: RegisterValues) => {
    registerMutation.mutate({
      username: values.username,
      password: values.password,
      email: values.email || undefined,
      bio: values.bio || undefined,
      country: values.country || undefined,
      profilePicture: values.profilePicture || undefined,
    });
  };
  
  // Handle social login
  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    socialLogin(provider);
  };
  
  // Get provider icon
  const getProviderIcon = (provider: string, size: string = 'h-4 w-4') => {
    const iconMap: { [key: string]: React.ReactNode } = {
      email: <Mail className={`mr-2 ${size}`} />,
      phone: <Phone className={`mr-2 ${size}`} />,
      google: <FaGoogle className={`mr-2 ${size}`} />,
      facebook: <FaFacebook className={`mr-2 ${size}`} />,
      github: <FaGithub className={`mr-2 ${size}`} />,
      discord: <FaDiscord className={`mr-2 ${size}`} />,
      twitter: <FaTwitter className={`mr-2 ${size}`} />,
      apple: <FaApple className={`mr-2 ${size}`} />,
      microsoft: <FaMicrosoft className={`mr-2 ${size}`} />,
    };
    return iconMap[provider.toLowerCase()] || <Mail className={`mr-2 ${size}`} />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{backgroundColor: "#f0f0f0"}}>
      {/* Hero Section */}
      <div className="w-full md:w-1/2 bg-blue-600 p-10 flex items-center justify-center">
        <div className="max-w-md text-white">
          <div className="flex items-center space-x-2 mb-8">
            {settings?.siteLogo && !settings?.useTextLogo ? (
              <img 
                src={settings.siteLogo} 
                alt={settings.siteTitle || 'Game Zone'} 
                className="h-12 w-auto" 
              />
            ) : (
              <>
                <i className="ri-gamepad-line text-white text-4xl"></i>
                <h1 className="text-3xl font-bold font-poppins">
                  {settings?.siteTitle ? settings.siteTitle : 'Game'}<span className="text-yellow-300">Zone</span>
                </h1>
              </>
            )}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The Ultimate Gaming Experience!</h2>
          <p className="text-lg mb-6">
            Join thousands of gamers playing free online games. Create an account to track your favorites, rate games,
            and participate in our gaming community.
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <i className="ri-gamepad-line text-xl"></i>
              </div>
              <p>Access to thousands of free games</p>
            </div>
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <i className="ri-star-line text-xl"></i>
              </div>
              <p>Rate games and share your experience</p>
            </div>
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <i className="ri-notification-line text-xl"></i>
              </div>
              <p>Receive notifications about new games</p>
            </div>
          </div>
          
          {/* Signup Options */}
          {enabledSignupOptions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Sign up with:</h3>
              <div className="grid grid-cols-1 gap-3">
                {enabledSignupOptions
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((option) => (
                    <Button 
                      key={option.id}
                      type="button" 
                      variant="outline" 
                      className="bg-white/10 text-white border-white/30 hover:bg-white/20 justify-start"
                      onClick={() => {
                        if (option.provider === 'email') {
                          // For email, just switch to register tab
                          setActiveTab('register');
                        } else if (option.provider === 'phone') {
                          // Handle phone signup - for now just switch to register
                          setActiveTab('register');
                        } else {
                          // Handle social login
                          handleSocialLogin(option.provider as 'google' | 'facebook');
                        }
                      }}
                      style={{
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      <span style={{ color: option.color }}>
                        {getProviderIcon(option.provider, 'h-5 w-5')}
                      </span>
                      {option.displayName}
                    </Button>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/2 p-6 md:p-10 flex items-center justify-center bg-white">
        <Card className="w-full max-w-md shadow-lg border border-gray-200 bg-gray-800 text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">Welcome to GameZone</CardTitle>
            <CardDescription className="text-center text-gray-300">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                {showForgotPassword ? (
                  <ForgotPasswordForm 
                    onBack={() => setShowForgotPassword(false)} 
                  />
                ) : (
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 mt-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white font-medium">Username</FormLabel>
                            <FormControl>
                              <Input 
                                className="bg-white border-gray-300 text-black placeholder:text-gray-500" 
                                style={{color: 'black'}}
                                placeholder="Enter your username" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white font-medium">Password</FormLabel>
                            <FormControl>
                              <Input 
                                className="bg-white border-gray-300 text-black placeholder:text-gray-500" 
                                style={{color: 'black'}}
                                type="password" 
                                placeholder="Enter your password" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                            <div className="text-right">
                              <Button
                                variant="link"
                                className="text-sm text-blue-400 p-0 h-auto font-normal hover:text-blue-300"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setShowForgotPassword(true);
                                }}
                              >
                                Forgot password?
                              </Button>
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Sign In
                      </Button>

                      {/* Auto Login Button for Development */}
                      <Button
                        type="button"
                        onClick={autoLogin}
                        className="w-full bg-green-600 hover:bg-green-700 mt-3"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        🚀 Auto Login as Admin
                      </Button>
                      
                      <div className="text-center text-gray-400 text-sm mt-4">
                        Have social media accounts? Check the signup options on the left!
                      </div>
                    </form>
                  </Form>
                )}
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4 mt-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Username</FormLabel>
                          <FormControl>
                            <Input 
                              className="bg-white border-gray-300 text-black placeholder:text-gray-500" 
                              style={{color: 'black'}}
                              placeholder="Choose a username" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Email</FormLabel>
                          <FormControl>
                            <Input 
                              className="bg-white border-gray-300 text-black placeholder:text-gray-500" 
                              style={{color: 'black'}}
                              type="email"
                              placeholder="your@email.com" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Password</FormLabel>
                          <FormControl>
                            <Input 
                              className="bg-white border-gray-300 text-black placeholder:text-gray-500" 
                              style={{color: 'black'}}
                              type="password" 
                              placeholder="Create a password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              className="bg-white border-gray-300 text-black placeholder:text-gray-500" 
                              style={{color: 'black'}}
                              type="password" 
                              placeholder="Confirm your password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="profilePicture"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Profile Picture URL (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              className="bg-white border-gray-300 text-black placeholder:text-gray-500" 
                              style={{color: 'black'}}
                              placeholder="https://example.com/picture.jpg" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Country</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white border-gray-300 text-black">
                                <SelectValue placeholder="Select your country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              <SelectItem value="Afghanistan">Afghanistan</SelectItem>
                              <SelectItem value="Albania">Albania</SelectItem>
                              <SelectItem value="Algeria">Algeria</SelectItem>
                              <SelectItem value="Argentina">Argentina</SelectItem>
                              <SelectItem value="Armenia">Armenia</SelectItem>
                              <SelectItem value="Australia">Australia</SelectItem>
                              <SelectItem value="Austria">Austria</SelectItem>
                              <SelectItem value="Azerbaijan">Azerbaijan</SelectItem>
                              <SelectItem value="Bahrain">Bahrain</SelectItem>
                              <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                              <SelectItem value="Belarus">Belarus</SelectItem>
                              <SelectItem value="Belgium">Belgium</SelectItem>
                              <SelectItem value="Bolivia">Bolivia</SelectItem>
                              <SelectItem value="Brazil">Brazil</SelectItem>
                              <SelectItem value="Bulgaria">Bulgaria</SelectItem>
                              <SelectItem value="Cambodia">Cambodia</SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="Chile">Chile</SelectItem>
                              <SelectItem value="China">China</SelectItem>
                              <SelectItem value="Colombia">Colombia</SelectItem>
                              <SelectItem value="Croatia">Croatia</SelectItem>
                              <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                              <SelectItem value="Denmark">Denmark</SelectItem>
                              <SelectItem value="Ecuador">Ecuador</SelectItem>
                              <SelectItem value="Egypt">Egypt</SelectItem>
                              <SelectItem value="Estonia">Estonia</SelectItem>
                              <SelectItem value="Finland">Finland</SelectItem>
                              <SelectItem value="France">France</SelectItem>
                              <SelectItem value="Georgia">Georgia</SelectItem>
                              <SelectItem value="Germany">Germany</SelectItem>
                              <SelectItem value="Ghana">Ghana</SelectItem>
                              <SelectItem value="Greece">Greece</SelectItem>
                              <SelectItem value="Hungary">Hungary</SelectItem>
                              <SelectItem value="Iceland">Iceland</SelectItem>
                              <SelectItem value="India">India</SelectItem>
                              <SelectItem value="Indonesia">Indonesia</SelectItem>
                              <SelectItem value="Iran">Iran</SelectItem>
                              <SelectItem value="Iraq">Iraq</SelectItem>
                              <SelectItem value="Ireland">Ireland</SelectItem>
                              <SelectItem value="Israel">Israel</SelectItem>
                              <SelectItem value="Italy">Italy</SelectItem>
                              <SelectItem value="Japan">Japan</SelectItem>
                              <SelectItem value="Jordan">Jordan</SelectItem>
                              <SelectItem value="Kazakhstan">Kazakhstan</SelectItem>
                              <SelectItem value="Kenya">Kenya</SelectItem>
                              <SelectItem value="Kuwait">Kuwait</SelectItem>
                              <SelectItem value="Latvia">Latvia</SelectItem>
                              <SelectItem value="Lebanon">Lebanon</SelectItem>
                              <SelectItem value="Lithuania">Lithuania</SelectItem>
                              <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                              <SelectItem value="Malaysia">Malaysia</SelectItem>
                              <SelectItem value="Mexico">Mexico</SelectItem>
                              <SelectItem value="Morocco">Morocco</SelectItem>
                              <SelectItem value="Netherlands">Netherlands</SelectItem>
                              <SelectItem value="New Zealand">New Zealand</SelectItem>
                              <SelectItem value="Nigeria">Nigeria</SelectItem>
                              <SelectItem value="Norway">Norway</SelectItem>
                              <SelectItem value="Pakistan">Pakistan</SelectItem>
                              <SelectItem value="Peru">Peru</SelectItem>
                              <SelectItem value="Philippines">Philippines</SelectItem>
                              <SelectItem value="Poland">Poland</SelectItem>
                              <SelectItem value="Portugal">Portugal</SelectItem>
                              <SelectItem value="Qatar">Qatar</SelectItem>
                              <SelectItem value="Romania">Romania</SelectItem>
                              <SelectItem value="Russia">Russia</SelectItem>
                              <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                              <SelectItem value="Serbia">Serbia</SelectItem>
                              <SelectItem value="Singapore">Singapore</SelectItem>
                              <SelectItem value="Slovakia">Slovakia</SelectItem>
                              <SelectItem value="Slovenia">Slovenia</SelectItem>
                              <SelectItem value="South Africa">South Africa</SelectItem>
                              <SelectItem value="South Korea">South Korea</SelectItem>
                              <SelectItem value="Spain">Spain</SelectItem>
                              <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                              <SelectItem value="Sweden">Sweden</SelectItem>
                              <SelectItem value="Switzerland">Switzerland</SelectItem>
                              <SelectItem value="Taiwan">Taiwan</SelectItem>
                              <SelectItem value="Thailand">Thailand</SelectItem>
                              <SelectItem value="Turkey">Turkey</SelectItem>
                              <SelectItem value="Ukraine">Ukraine</SelectItem>
                              <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                              <SelectItem value="United States">United States</SelectItem>
                              <SelectItem value="Uruguay">Uruguay</SelectItem>
                              <SelectItem value="Venezuela">Venezuela</SelectItem>
                              <SelectItem value="Vietnam">Vietnam</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              className="bg-white border-gray-300 text-black placeholder:text-gray-500 resize-none" 
                              style={{color: 'black'}}
                              placeholder="Tell us a bit about yourself..." 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Create Account
                    </Button>
                    
                    <div className="text-center text-gray-400 text-sm mt-4">
                      Have social media accounts? Check the signup options on the left!
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <p className="text-sm text-gray-400">
              By continuing, you agree to our{" "}
              <a href="/terms" className="text-blue-400 hover:text-blue-300 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-blue-400 hover:text-blue-300 hover:underline">
                Privacy Policy
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
