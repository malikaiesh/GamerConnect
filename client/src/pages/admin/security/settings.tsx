import { useState } from "react";
import SecurityLayout from "@/components/admin/security/security-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  AlertTriangle, 
  Check, 
  Clock, 
  KeyRound,
  Lock, 
  ShieldAlert, 
  ShieldCheck,
  UserCheck,
  FingerPrint
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function SecuritySettingsPage() {
  const { toast } = useToast();
  
  // Password Policy Settings
  const [minPasswordLength, setMinPasswordLength] = useState(10);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireNumbers, setRequireNumbers] = useState(true);
  const [requireSpecialChars, setRequireSpecialChars] = useState(true);
  const [passwordExpiration, setPasswordExpiration] = useState("90");
  
  // Login Security Settings
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [lockoutDuration, setLockoutDuration] = useState("30");
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [enforceIPCheck, setEnforceIPCheck] = useState(true);
  const [requireAdminTwoFactor, setRequireAdminTwoFactor] = useState(false);
  
  // API Security Settings
  const [apiRateLimit, setApiRateLimit] = useState(100);
  const [apiTokenExpiration, setApiTokenExpiration] = useState("7");
  const [enableCORS, setEnableCORS] = useState(true);
  const [corsOrigins, setCorsOrigins] = useState("*.yourdomain.com");
  const [enableCSP, setEnableCSP] = useState(true);
  
  // Calculate password strength based on settings
  const calculatePasswordStrength = () => {
    let strength = 0;
    
    if (minPasswordLength >= 12) strength += 2;
    else if (minPasswordLength >= 8) strength += 1;
    
    if (requireUppercase) strength += 1;
    if (requireNumbers) strength += 1;
    if (requireSpecialChars) strength += 1;
    
    if (strength <= 1) return "Weak";
    if (strength <= 3) return "Moderate";
    return "Strong";
  };
  
  // Get password strength color
  const getPasswordStrengthColor = () => {
    const strength = calculatePasswordStrength();
    if (strength === "Weak") return "text-destructive";
    if (strength === "Moderate") return "text-orange-500";
    return "text-green-500";
  };
  
  // Handle form submission
  const handleSaveSettings = () => {
    toast({
      title: "Security settings updated",
      description: "Your security settings have been saved successfully.",
      variant: "success",
    });
  };

  return (
    <SecurityLayout 
      title="Security Settings" 
      description="Configure security policies and measures for your gaming website"
    >
      <div className="space-y-6">
        {/* Password Policy Card */}
        <Card className="bg-background border-0">
          <CardHeader className="bg-background border-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-primary" />
                  Password Policy
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Define password requirements for all users
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                <span className="text-sm">Strength:</span>
                <span className={`text-sm font-medium ${getPasswordStrengthColor()}`}>
                  {calculatePasswordStrength()}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-background space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="password-length" className="text-foreground">
                    Minimum Password Length: {minPasswordLength} characters
                  </Label>
                </div>
                <Slider
                  id="password-length"
                  min={6}
                  max={20}
                  step={1}
                  value={[minPasswordLength]}
                  onValueChange={(value) => setMinPasswordLength(value[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>6</span>
                  <span>12</span>
                  <span>20</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="require-uppercase" className="text-foreground flex-1">
                    Require uppercase letters
                  </Label>
                  <Switch
                    id="require-uppercase"
                    checked={requireUppercase}
                    onCheckedChange={setRequireUppercase}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="require-numbers" className="text-foreground flex-1">
                    Require numbers
                  </Label>
                  <Switch
                    id="require-numbers"
                    checked={requireNumbers}
                    onCheckedChange={setRequireNumbers}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="require-special" className="text-foreground flex-1">
                    Require special characters
                  </Label>
                  <Switch
                    id="require-special"
                    checked={requireSpecialChars}
                    onCheckedChange={setRequireSpecialChars}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Label htmlFor="password-expiration" className="text-foreground flex-1">
                    Password expiration
                  </Label>
                  <Select value={passwordExpiration} onValueChange={setPasswordExpiration}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="0">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Login Security Card */}
        <Card className="bg-background border-0">
          <CardHeader className="bg-background border-0">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Login Security
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure login protection measures
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-background space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="max-attempts" className="text-foreground">
                    Maximum login attempts before lockout: {maxLoginAttempts}
                  </Label>
                </div>
                <Slider
                  id="max-attempts"
                  min={3}
                  max={10}
                  step={1}
                  value={[maxLoginAttempts]}
                  onValueChange={(value) => setMaxLoginAttempts(value[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>3</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="lockout-duration" className="text-foreground flex-1">
                    Account lockout duration
                  </Label>
                  <Select value={lockoutDuration} onValueChange={setLockoutDuration}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select minutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="1440">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Label htmlFor="session-timeout" className="text-foreground flex-1">
                    Session timeout
                  </Label>
                  <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select minutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="enforce-ip" className="text-foreground flex-1">
                    Enforce IP consistency
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1 cursor-help text-muted-foreground">(?)</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px] text-xs">
                            Alerts on session access from different IP addresses, which may indicate session hijacking
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Switch
                    id="enforce-ip"
                    checked={enforceIPCheck}
                    onCheckedChange={setEnforceIPCheck}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="require-admin-2fa" className="text-foreground flex-1">
                    Require 2FA for admin accounts
                  </Label>
                  <Switch
                    id="require-admin-2fa"
                    checked={requireAdminTwoFactor}
                    onCheckedChange={setRequireAdminTwoFactor}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* API Security Card */}
        <Card className="bg-background border-0">
          <CardHeader className="bg-background border-0">
            <CardTitle className="text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              API & Web Security
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure API rate limiting and web security features
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-background space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="rate-limit" className="text-foreground">
                    API rate limit: {apiRateLimit} requests / minute
                  </Label>
                </div>
                <Slider
                  id="rate-limit"
                  min={10}
                  max={500}
                  step={10}
                  value={[apiRateLimit]}
                  onValueChange={(value) => setApiRateLimit(value[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>10</span>
                  <span>100</span>
                  <span>500</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="api-token-expiration" className="text-foreground flex-1">
                    API token expiration
                  </Label>
                  <Select value={apiTokenExpiration} onValueChange={setApiTokenExpiration}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="0">Never expire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="enable-cors" className="text-foreground flex-1">
                    Enable CORS protection
                  </Label>
                  <Switch
                    id="enable-cors"
                    checked={enableCORS}
                    onCheckedChange={setEnableCORS}
                  />
                </div>
                
                {enableCORS && (
                  <div className="md:col-span-2">
                    <Label htmlFor="cors-origins" className="text-foreground block mb-2">
                      Allowed Origins (comma-separated)
                    </Label>
                    <Input
                      id="cors-origins"
                      value={corsOrigins}
                      onChange={(e) => setCorsOrigins(e.target.value)}
                      placeholder="e.g., *.example.com, trusted-site.com"
                      className="w-full"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="enable-csp" className="text-foreground flex-1">
                    Enable Content Security Policy (CSP)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1 cursor-help text-muted-foreground">(?)</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px] text-xs">
                            Helps prevent XSS attacks by restricting what resources can be loaded
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Switch
                    id="enable-csp"
                    checked={enableCSP}
                    onCheckedChange={setEnableCSP}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Advanced Security Features */}
        <Card className="bg-background border-0">
          <CardHeader className="bg-background border-0">
            <CardTitle className="text-foreground flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Advanced Security Features
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Additional security measures to protect your site
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-background">
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 rounded-lg bg-primary/5">
                <FingerPrint className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <h3 className="text-foreground font-medium mb-1">User Behavior Analytics</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Detect suspicious activities by analyzing user behavior patterns.
                  </p>
                  <div className="flex items-center mb-2">
                    <Switch id="enable-behavior-analytics" />
                    <Label htmlFor="enable-behavior-analytics" className="ml-2 text-foreground">
                      Enable Behavior Analytics
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Note: This feature may increase system resource usage
                  </p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-start space-x-4 p-4 rounded-lg bg-primary/5">
                <UserCheck className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <h3 className="text-foreground font-medium mb-1">Role-Based Access Control</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Enforce strict permission boundaries for different user roles.
                  </p>
                  <div className="flex items-center mb-2">
                    <Switch id="enable-rbac" defaultChecked />
                    <Label htmlFor="enable-rbac" className="ml-2 text-foreground">
                      Enable RBAC
                    </Label>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">
                    Configure Permissions
                  </Button>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-start space-x-4 p-4 rounded-lg bg-primary/5">
                <Clock className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <h3 className="text-foreground font-medium mb-1">Scheduled Security Scans</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Automatically scan your website for vulnerabilities on a set schedule.
                  </p>
                  <div className="flex gap-3 mb-2 mt-4">
                    <Select defaultValue="weekly">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button>Schedule Scans</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Actions Footer */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline">Reset Defaults</Button>
          <Button onClick={handleSaveSettings} className="gap-2">
            <Check className="h-4 w-4" />
            Save Security Settings
          </Button>
        </div>
      </div>
    </SecurityLayout>
  );
}