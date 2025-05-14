import React, { useState } from 'react';
import SecurityLayout from '@/components/admin/security/security-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Smartphone, 
  QrCode, 
  KeySquare, 
  Mail, 
  Plus, 
  Check, 
  RefreshCw, 
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Mock TwoFA data
const mockTwoFactorData = {
  enabled: true,
  methods: [
    {
      id: 1,
      type: 'app',
      name: 'Google Authenticator',
      addedOn: '2023-10-15T12:30:45Z',
      lastUsed: '2023-11-10T08:15:30Z'
    }
  ],
  recoveryKeys: {
    generated: true,
    lastGenerated: '2023-10-15T12:35:10Z',
    keysRemaining: 8,
    totalKeys: 10
  }
};

// Mock QR code for setup
const mockQrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/KBHGames:admin@example.com?secret=JBSWY3DPEHPK3PXP&issuer=KBHGames';

export default function TwoFactorAuthPage() {
  const [activeTab, setActiveTab] = useState('methods');
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [showRecoveryKeys, setShowRecoveryKeys] = useState(false);
  const [recoveryKeys, setRecoveryKeys] = useState<string[]>([]);
  
  const { data: twoFactorData, isLoading } = useQuery({
    queryKey: ['/api/security/two-factor'],
    // Fallback to mock data since this is a new feature
    initialData: mockTwoFactorData
  });

  const handleStartSetup = () => {
    setShowSetupDialog(true);
    setSetupStep(1);
    setVerificationCode('');
  };

  const handleVerifyCode = () => {
    // In a real app, would verify the code with the server
    if (verificationCode.length === 6) {
      setSetupStep(3);
      // Generate mock recovery keys
      setRecoveryKeys([
        'ABCD-EFGH-IJKL-MNOP',
        'QRST-UVWX-YZ12-3456',
        'BCDE-FGHI-JKLM-NOPQ',
        '5678-ABCD-EFGH-IJKL',
        'MNOP-QRST-UVWX-YZ12',
        '3456-789A-BCDE-FGHI',
        'JKLM-NOPQ-RSTU-VWXY',
        'Z123-4567-89AB-CDEF',
        'GHIJ-KLMN-OPQR-STUV',
        'WXYZ-1234-5678-9ABC'
      ]);
    }
  };

  const handleFinishSetup = () => {
    setShowSetupDialog(false);
    // In a real app, would update the state with the new method
  };

  const generateRecoveryKeys = () => {
    setShowRecoveryKeys(true);
    // Generate new mock recovery keys
    setRecoveryKeys([
      'DEFG-HIJK-LMNO-PQRS',
      'TUVW-XYZ1-2345-6789',
      'ABCD-EFGH-IJKL-MNOP',
      'QRST-UVWX-YZ12-3456',
      'BCDE-FGHI-JKLM-NOPQ',
      '5678-ABCD-EFGH-IJKL',
      'MNOP-QRST-UVWX-YZ12',
      '3456-789A-BCDE-FGHI',
      'JKLM-NOPQ-RSTU-VWXY',
      'Z123-4567-89AB-CDEF'
    ]);
  };

  return (
    <SecurityLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Two-Factor Authentication Setup</h1>
          <p className="text-muted-foreground">
            Configure and manage multi-factor authentication methods for enhanced account security
          </p>
        </div>
        <div>
          {twoFactorData?.enabled ? (
            <Badge className="bg-green-600">Enabled</Badge>
          ) : (
            <Badge variant="outline" className="text-amber-500 border-amber-500">Not Enabled</Badge>
          )}
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 dark:bg-blue-950/20 dark:border-blue-900">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5 dark:text-blue-400" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Enhanced Account Protection</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Two-factor authentication adds an extra security layer requiring verification from your devices during login.
              This prevents unauthorized access even if your password is compromised.
            </p>
          </div>
        </div>
      </div>

      {!twoFactorData?.enabled && (
        <Alert className="mb-6" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Your admin account is vulnerable</AlertTitle>
          <AlertDescription>
            Without two-factor authentication, your administrator account is at higher risk. Enable 2FA immediately to protect
            your site from unauthorized access.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="methods">
            <Smartphone className="h-4 w-4 mr-2" />
            2FA Verification Methods
          </TabsTrigger>
          <TabsTrigger value="recovery">
            <KeySquare className="h-4 w-4 mr-2" />
            Backup & Recovery Keys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Available Authentication Methods</CardTitle>
              <CardDescription>
                Set up and manage device-based or email verification methods that will be required during login
              </CardDescription>
            </CardHeader>
            <CardContent>
              {twoFactorData?.methods && twoFactorData.methods.length > 0 ? (
                <div className="space-y-4">
                  {twoFactorData.methods.map(method => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {method.type === 'app' && <Smartphone className="h-5 w-5 text-primary" />}
                        {method.type === 'email' && <Mail className="h-5 w-5 text-primary" />}
                        <div>
                          <h3 className="font-medium">{method.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Added on {new Date(method.addedOn).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last used: {new Date(method.lastUsed).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No authentication methods</h3>
                  <p className="text-muted-foreground mt-1 mb-4 max-w-md">
                    You haven't set up any two-factor authentication methods yet. Add a method to increase the security of your account.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleStartSetup}>
                <Plus className="h-4 w-4 mr-2" />
                Add Authentication Method
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="recovery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Recovery Keys</CardTitle>
              <CardDescription>
                Backup access codes that let you regain access to your account if you lose your authentication device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {twoFactorData?.recoveryKeys.generated ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Recovery Keys</h3>
                      <Badge variant="outline">
                        {twoFactorData.recoveryKeys.keysRemaining} of {twoFactorData.recoveryKeys.totalKeys} remaining
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generated on {new Date(twoFactorData.recoveryKeys.lastGenerated).toLocaleDateString()}
                    </p>
                    
                    {showRecoveryKeys ? (
                      <div className="mb-4">
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {recoveryKeys.map((key, index) => (
                            <div key={index} className="font-mono text-sm p-2 bg-muted rounded">
                              {key}
                            </div>
                          ))}
                        </div>
                        <Alert variant="destructive" className="mb-3">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Save these keys in a secure location</AlertTitle>
                          <AlertDescription>
                            Each key can only be used once. Keep them safe and accessible in case you lose access to your authentication methods.
                          </AlertDescription>
                        </Alert>
                        <div className="flex justify-end">
                          <Button variant="outline" onClick={() => setShowRecoveryKeys(false)}>
                            Done
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        <p className="text-sm">
                          Your recovery keys are stored securely. You can view them at any time or generate new ones.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" onClick={() => setShowRecoveryKeys(true)}>
                            View Recovery Keys
                          </Button>
                          <Button variant="outline" onClick={generateRecoveryKeys}>
                            Generate New Keys
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <KeySquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No recovery keys generated</h3>
                  <p className="text-muted-foreground mt-1 mb-4 max-w-md">
                    Recovery keys let you access your account if you lose your authentication device. Generate keys to prevent being locked out.
                  </p>
                  <Button variant="outline" onClick={generateRecoveryKeys}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Recovery Keys
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Two-Factor Authentication Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {setupStep === 1 && "Set Up Authenticator App"}
              {setupStep === 2 && "Verify Setup"}
              {setupStep === 3 && "Save Recovery Keys"}
            </DialogTitle>
            <DialogDescription>
              {setupStep === 1 && "Scan the QR code with your authenticator app."}
              {setupStep === 2 && "Enter the verification code from your authenticator app."}
              {setupStep === 3 && "Save these recovery keys in a secure location."}
            </DialogDescription>
          </DialogHeader>

          {setupStep === 1 && (
            <div className="space-y-4 py-4">
              <div className="flex justify-center">
                <img 
                  src={mockQrCodeUrl} 
                  alt="QR Code for authenticator app" 
                  className="w-48 h-48 border rounded-md"
                />
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground mb-2">Or enter this code manually:</p>
                <p className="font-mono bg-muted p-2 rounded text-center">JBSWY3DPEHPK3PXP</p>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={() => setSetupStep(2)}>
                  Next
                </Button>
              </div>
            </div>
          )}

          {setupStep === 2 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input 
                  id="verification-code" 
                  placeholder="Enter 6-digit code" 
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="font-mono text-center text-lg tracking-widest"
                  maxLength={6}
                />
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code from your authenticator app.
                </p>
              </div>
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={handleVerifyCode}
                  disabled={verificationCode.length !== 6}
                >
                  Verify
                </Button>
              </div>
            </div>
          )}

          {setupStep === 3 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {recoveryKeys.map((key, index) => (
                    <div key={index} className="font-mono text-sm p-2 bg-muted rounded">
                      {key}
                    </div>
                  ))}
                </div>
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Keep these keys safe</AlertTitle>
                  <AlertDescription>
                    Store these recovery keys in a secure location. They're the only way to regain access if you lose your device.
                  </AlertDescription>
                </Alert>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
                <Button variant="outline" onClick={() => setSetupStep(1)}>
                  Start Over
                </Button>
                <Button onClick={handleFinishSetup}>
                  <Check className="h-4 w-4 mr-2" />
                  Finish Setup
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SecurityLayout>
  );
}