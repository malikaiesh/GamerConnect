import React, { useState } from 'react';
import SecurityLayout from '@/components/admin/security/security-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { Slider } from '@/components/ui/slider';
import { 
  Lock, 
  Shield, 
  Clock, 
  HardDrive, 
  Network, 
  ClipboardCheck, 
  Settings, 
  Save,
  AlertTriangle,
  Ban
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  TooltipProvider, 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from '@/components/ui/tooltip';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

// Mock security settings data
const mockSecuritySettings = {
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordExpiration: 90, // days
    preventPasswordReuse: 5, // previous passwords,
    accountLockout: {
      maxAttempts: 5,
      lockoutPeriod: 30, // minutes
      resetCounterAfter: 15 // minutes
    }
  },
  sessionPolicy: {
    sessionTimeout: 60, // minutes of inactivity
    simultaneousSessions: 3,
    enforceSignout: false,
    trackUserActivity: true
  },
  twoFactorAuth: {
    enforceForAdmins: true,
    allowEmailMethod: true,
    allowAppMethod: true,
    validityPeriod: 30 // days before requiring re-verification
  },
  ipRestrictions: {
    enabled: false,
    whitelist: [],
    blacklist: []
  }
};

export default function SecuritySettingsPage() {
  const { data: securitySettings, isLoading } = useQuery({
    queryKey: ['/api/security/settings'],
    // Fallback to mock data since this is a new feature
    initialData: mockSecuritySettings
  });
  
  const [passwordSettings, setPasswordSettings] = useState(securitySettings?.passwordPolicy);
  const [sessionSettings, setSessionSettings] = useState(securitySettings?.sessionPolicy);
  const [twoFactorSettings, setTwoFactorSettings] = useState(securitySettings?.twoFactorAuth);
  const [ipSettings, setIpSettings] = useState(securitySettings?.ipRestrictions);
  const [newIP, setNewIP] = useState('');
  
  const handlePasswordSettingsChange = (key: string, value: any) => {
    setPasswordSettings((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleLockoutSettingsChange = (key: string, value: any) => {
    setPasswordSettings((prev: any) => ({
      ...prev,
      accountLockout: {
        ...prev.accountLockout,
        [key]: value
      }
    }));
  };

  const handleSessionSettingsChange = (key: string, value: any) => {
    setSessionSettings((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTwoFactorSettingsChange = (key: string, value: any) => {
    setTwoFactorSettings((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleIPSettingsChange = (key: string, value: any) => {
    setIpSettings((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const addIPToList = (listType: 'whitelist' | 'blacklist') => {
    if (newIP && isValidIP(newIP)) {
      setIpSettings((prev: any) => ({
        ...prev,
        [listType]: [...prev[listType], newIP]
      }));
      setNewIP('');
    }
  };

  const removeIPFromList = (listType: 'whitelist' | 'blacklist', ip: string) => {
    setIpSettings((prev: any) => ({
      ...prev,
      [listType]: prev[listType].filter((item: string) => item !== ip)
    }));
  };

  const isValidIP = (ip: string) => {
    const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(ip);
  };

  const saveAllSettings = () => {
    // In a real app, would save the settings to the server
    console.log('Saving security settings:', {
      passwordPolicy: passwordSettings,
      sessionPolicy: sessionSettings,
      twoFactorAuth: twoFactorSettings,
      ipRestrictions: ipSettings
    });
    
    // Would make a mutation call here
  };

  return (
    <SecurityLayout title="Security Settings" description="Configure security policies for your application">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Security Settings Configuration</h1>
          <p className="text-muted-foreground">
            Configure security policies, password requirements, and access restrictions for your platform
          </p>
        </div>
        <Button onClick={saveAllSettings} className="bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 dark:bg-amber-950/20 dark:border-amber-900">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5 dark:text-amber-500" />
          <div>
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-400">Configuration Settings</h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              This page allows you to define global security policies that affect how users interact with your platform. 
              Changes made here will affect all users. To view security events and user activity, visit the <strong>Security Logs</strong> page.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1">
        {/* Password Policy Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>Password Policy</CardTitle>
            </div>
            <CardDescription>
              Configure password requirements and account lockout settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="min-length">Minimum Password Length</Label>
                  <span className="text-sm font-medium">{passwordSettings?.minLength} characters</span>
                </div>
                <Slider 
                  id="min-length"
                  min={6} 
                  max={16} 
                  step={1} 
                  value={[passwordSettings?.minLength || 8]}
                  onValueChange={(value) => handlePasswordSettingsChange('minLength', value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Password Expiration</Label>
                <Select 
                  value={passwordSettings?.passwordExpiration.toString()} 
                  onValueChange={(value) => handlePasswordSettingsChange('passwordExpiration', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select expiration period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">365 days</SelectItem>
                    <SelectItem value="0">Never expire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Previous Password Restriction</Label>
                <Select 
                  value={passwordSettings?.preventPasswordReuse.toString()} 
                  onValueChange={(value) => handlePasswordSettingsChange('preventPasswordReuse', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of previous passwords" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="3">Last 3 passwords</SelectItem>
                    <SelectItem value="5">Last 5 passwords</SelectItem>
                    <SelectItem value="10">Last 10 passwords</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Require Uppercase Letters</Label>
                  <p className="text-sm text-muted-foreground">Passwords must contain at least one uppercase letter</p>
                </div>
                <Switch 
                  checked={passwordSettings?.requireUppercase} 
                  onCheckedChange={(checked) => handlePasswordSettingsChange('requireUppercase', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Require Lowercase Letters</Label>
                  <p className="text-sm text-muted-foreground">Passwords must contain at least one lowercase letter</p>
                </div>
                <Switch 
                  checked={passwordSettings?.requireLowercase} 
                  onCheckedChange={(checked) => handlePasswordSettingsChange('requireLowercase', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Require Numbers</Label>
                  <p className="text-sm text-muted-foreground">Passwords must contain at least one number</p>
                </div>
                <Switch 
                  checked={passwordSettings?.requireNumbers} 
                  onCheckedChange={(checked) => handlePasswordSettingsChange('requireNumbers', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Require Special Characters</Label>
                  <p className="text-sm text-muted-foreground">Passwords must contain at least one special character</p>
                </div>
                <Switch 
                  checked={passwordSettings?.requireSpecialChars} 
                  onCheckedChange={(checked) => handlePasswordSettingsChange('requireSpecialChars', checked)}
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-3">Account Lockout Policy</h3>
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="max-attempts">Failed Login Attempts</Label>
                  <Select 
                    value={passwordSettings?.accountLockout.maxAttempts.toString()}
                    onValueChange={(value) => handleLockoutSettingsChange('maxAttempts', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Max failed attempts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="5">5 attempts</SelectItem>
                      <SelectItem value="10">10 attempts</SelectItem>
                      <SelectItem value="15">15 attempts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lockout-period">Lockout Duration</Label>
                  <Select 
                    value={passwordSettings?.accountLockout.lockoutPeriod.toString()}
                    onValueChange={(value) => handleLockoutSettingsChange('lockoutPeriod', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Lockout time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="1440">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reset-counter">Reset Counter After</Label>
                  <Select 
                    value={passwordSettings?.accountLockout.resetCounterAfter.toString()}
                    onValueChange={(value) => handleLockoutSettingsChange('resetCounterAfter', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Reset time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Security Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Session Security</CardTitle>
            </div>
            <CardDescription>
              Configure session timeouts and authentication requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout</Label>
                <Select 
                  value={sessionSettings?.sessionTimeout.toString()}
                  onValueChange={(value) => handleSessionSettingsChange('sessionTimeout', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Timeout after inactivity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max-sessions">Maximum Simultaneous Sessions</Label>
                <Select 
                  value={sessionSettings?.simultaneousSessions.toString()}
                  onValueChange={(value) => handleSessionSettingsChange('simultaneousSessions', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Maximum sessions per user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 session (Single device)</SelectItem>
                    <SelectItem value="2">2 sessions</SelectItem>
                    <SelectItem value="3">3 sessions</SelectItem>
                    <SelectItem value="5">5 sessions</SelectItem>
                    <SelectItem value="10">10 sessions</SelectItem>
                    <SelectItem value="0">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enforce Sign-out on Password Change</Label>
                  <p className="text-sm text-muted-foreground">Sign out users from all devices when they change their password</p>
                </div>
                <Switch 
                  checked={sessionSettings?.enforceSignout} 
                  onCheckedChange={(checked) => handleSessionSettingsChange('enforceSignout', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Track User Activity</Label>
                  <p className="text-sm text-muted-foreground">Record user session activity for security analysis</p>
                </div>
                <Switch 
                  checked={sessionSettings?.trackUserActivity} 
                  onCheckedChange={(checked) => handleSessionSettingsChange('trackUserActivity', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Two-Factor Authentication</CardTitle>
            </div>
            <CardDescription>
              Configure two-factor authentication requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enforce 2FA for Administrators</Label>
                  <p className="text-sm text-muted-foreground">Require administrators to use two-factor authentication</p>
                </div>
                <Switch 
                  checked={twoFactorSettings?.enforceForAdmins} 
                  onCheckedChange={(checked) => handleTwoFactorSettingsChange('enforceForAdmins', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="2fa-validity">2FA Verification Period</Label>
                <Select 
                  value={twoFactorSettings?.validityPeriod.toString()}
                  onValueChange={(value) => handleTwoFactorSettingsChange('validityPeriod', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Require re-verification after" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="0">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Allow Email Authentication</Label>
                  <p className="text-sm text-muted-foreground">Allow users to use email-based two-factor authentication</p>
                </div>
                <Switch 
                  checked={twoFactorSettings?.allowEmailMethod} 
                  onCheckedChange={(checked) => handleTwoFactorSettingsChange('allowEmailMethod', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Allow Authenticator Apps</Label>
                  <p className="text-sm text-muted-foreground">Allow users to use authenticator apps for two-factor authentication</p>
                </div>
                <Switch 
                  checked={twoFactorSettings?.allowAppMethod} 
                  onCheckedChange={(checked) => handleTwoFactorSettingsChange('allowAppMethod', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* IP Restrictions Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Network className="h-5 w-5 text-primary" />
              <CardTitle>IP Restrictions</CardTitle>
            </div>
            <CardDescription>
              Configure IP-based access restrictions for your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Enable IP Restrictions</Label>
                <p className="text-sm text-muted-foreground">
                  Restrict access to the admin panel based on IP address
                </p>
              </div>
              <Switch 
                checked={ipSettings?.enabled} 
                onCheckedChange={(checked) => handleIPSettingsChange('enabled', checked)}
              />
            </div>

            {ipSettings?.enabled && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Be careful when adding IP restrictions. If you restrict access and your IP address changes, you may lock yourself out of the admin panel.
                </AlertDescription>
              </Alert>
            )}

            {ipSettings?.enabled && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-base font-medium">IP Whitelist</h3>
                  <p className="text-sm text-muted-foreground">Only these IP addresses will be allowed to access the admin panel</p>
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add IP address (e.g., 192.168.1.1)"
                      value={newIP}
                      onChange={(e) => setNewIP(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={() => addIPToList('whitelist')} disabled={!newIP || !isValidIP(newIP)}>
                      Add
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {ipSettings?.whitelist.map((ip: string) => (
                      <div key={ip} className="flex justify-between items-center p-2 bg-muted rounded-md">
                        <span className="font-mono text-sm">{ip}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeIPFromList('whitelist', ip)}>
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-base font-medium">IP Blacklist</h3>
                  <p className="text-sm text-muted-foreground">These IP addresses will be blocked from accessing the admin panel</p>
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add IP address (e.g., 192.168.1.1)"
                      value={newIP}
                      onChange={(e) => setNewIP(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={() => addIPToList('blacklist')} disabled={!newIP || !isValidIP(newIP)}>
                      Add
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {ipSettings?.blacklist.map((ip: string) => (
                      <div key={ip} className="flex justify-between items-center p-2 bg-muted rounded-md">
                        <span className="font-mono text-sm">{ip}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeIPFromList('blacklist', ip)}>
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SecurityLayout>
  );
}