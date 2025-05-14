import { useState } from "react";
import SecurityLayout from "@/components/admin/security/security-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle, Copy, KeyRound, Smartphone, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function TwoFactorPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [setupStep, setSetupStep] = useState(0);
  const [verificationCode, setVerificationCode] = useState("");
  
  // Mock QR code for demonstration
  const mockQRCodeUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAAFOdJREFUeF7tnduOJTcOBOv//+i9bMDAAK7q0iWSkiwm9+MAomJIhVx96/7z9/fvv/zwHwRg4CUDfwhIDQMjAghSIwEBEKRAAAQQpEAABBCkQAAEEKRAAAQQpEAABBCkQAAEEKRAAAQQpEAABBCkQAAEEKRAAAQQpEAABBCkQAAEEKRAAAQQpEAABBCkQAAEEKRAAAQQpEAABBCkQAAEEKRAAAQQpEAABBCkQAAEEKRAAAQQpEAABBCkQAAEEKRAAAQQpEAABBCkQAAEEKRAAAQQpEAABBCkQAAEEKRAAAQQpEAABBCkQAAEEKRAAAQQpEAABBCkQAAEEKRAAAQQpEAABBCkQAAEEKRAAAQQpEAABBCkQAAEEKRAAAQQpEAABBCkQAAEEKRAAAQQpEAABBCkQAAEEKRAAAQQpEDgP0HCMCBwDgIIco5c8ZQPAgjygUDu7gyVnyPxpW8IIAiCQAACzRKAIMDuFgEEQRAIQKBZAhAE2N0igCBtEdB6KYEQJBSOk7VWEQS5W0B31ytk+b+9XCAIgjRHYLcAu79v1JqgAQRBkPII7Ja8+/sQ5H4RIkj3+Sn1BAEE6bZ8SzLvlnx0fcgP5yMEQRDH7KXyqr6JIAjS7BIEYQdpNjSpcEsECLI0zk0/hiDMbk2K+n5Nyyzvvv7oepYFQY4gSPdYrhYIgjBfq3XU/Dt2EPbz0eRKF9UmiCBcU6VJnO5DEHbQ6UR1P4AgCMIOEjiBIUj8fM05SDABLNHMIEkRQRBa0ORJ9V8egpzL2KXnQ5DldNbMNILU8HH9KoK4idWiIQiCtAhBbBAE6b5/EgThmnJPIIIgyLHsWxOEJvRYIV997pHnQ5DLnkAQ7rN6Pbe+7iMIgugrm1whCIK4Z9W9EEFqhwmulymXlyZUe2YE0TLz9CMIO0jzFK5dH0EQpFkM7CDsIM2GJhVuiQBBuKa+mcGn+xCE+/ybEUQQrqmvDkl+CEG4z+fJlyYUQbjPD7gEEYRrKsBMwSWY0tyhgiD3+wuCIEhzBOwmiGvK2c4XnYcgWj6ufgpBEKR5ItcmeO76CII1+XFCRRC+rNs8eKnCLREgCNfUN+PoQRB20G8i7H4PQbimggaQ++07OgiCIA5fp+vbsv6W719yTXFNpQyFHiDfAkGQlGE+c1AEQZBkGYIg6UYUQRBkuAQRhB2EHcQxnwjiAFWuQhAEGc4igrCDsIM4JgxBHKDKVQiCIMNZRBB2EHYQx4QhiANUuQpBEGQ4iwiCIEMZGm1yPn3eqR9qPjNeq0UQBOlmfLq+7ZYcQRAk+yODIAhyrPoRBEGCJ3Cw/OgOgiAmcEEQBHGUFoIgSPA8D5YjCIIElz2CIEhw6SEIggSXPYIgSHDpIQiCQOCCAIJw5KRpgyDsIBBw7CAIgiDN04ggCNJsaFLhlggQhGvqmxEgiCZzCMJV7wBWz0AQBGkedwRBkGZDkwq3RIAgXFPfjCB7bSHI3eJDEARpFhVBmg1NKtwSAYJwTX0zgrzfzRGEHeSnYQh9tBCEHS14IJnfT0+2fhJCEK6pBPgQhFYseQYRhB0ke8YQhB0kecYQhB0kecYQhB0ke8YQhB0ke8YQhB0ke8YQhB0ke8YQhB0ke8YQhB0ke8YQhB0kecYQhB0kecYQhB0ke8YQhB0kecYQhB0ke8YQhB0ke8YQhB0kecYQhB0kecYQhB0ke8YQhB0kecYQhB0kecYQhB0ke8YQhB0kecYQhB0kecYQhB0ke8YQhB0kecYQhB0kecYQhB0kecYQhB0kecYQhB0kecYQhB0ke8YQhB0kecYQhB0kecYQhB0kecYQhB0kecYQhB0kecYQhB0kecYQhB0kecYQhB0kecYQhB0kecYQhB0kecYQhB0kecYQhB0kecYQhB0kecYQhB0kecYQhB0kecYQhB0kecYQhB0kecYQhB0kecYQhB0kecYQZGIHmZnInVUze++u2vn2z83cuxNTBDn/BN5ZPSuJcucI3/ndnWd7+h0EQR71T3eqJrRbchDkbqlDEAQZLunKcgjCNXWc0dGSnrk+Vq6pWvMrLZxbYrTYRz+1cl+tPvfoPPJox3ynHQRBHhVDt+QtEniW76Qr6nq1CSIIOwhPvnoUE0FEBV2uL0HYQbh0VWYQBEFeZXzmuuiWfPT6GTeAIM8IrtzXr64fgmy0g6zIC8l1J28xEQRB3nK4+z6n67ubyOrvc01V7yCz17Tr+r7z/Oztt9oljeB/E0CQRxHYLXnr+gjyN4FXX9Z9/dNvCDkjCIIgyb8EEGRQgW4JDk5wugPsIAhyhZdTPp3lNbUiLz3XrP4JXARBkFfFhiCJewRBECRZkwzNvRsqgrCDXOHldP2+GzqC7PFNM4JsNEG7l26uj0QcPi8ExCIfXTd3C2aRQ8+67CCXuOyWvOshBEEQ9XP89nOJgiBIsmIcXdsKv27JrxDd9f21vEdcIgjCDnKFoNOSP13f1uvfPZ+74EIQBGEHmZggJRyKbLPnZt5HEARJlnE3/aNnKIIgCIIgT7/WE4KMUjiJqLPLNMt8sujHEUS5pq5+c+aa4v3fBF7NRclLNz4IgiCxI4Egy9fEqOSj5Qiy9+fUzlxTayuT36r18rz/N4FXySgFMLqEz74v1n22CCIIgiBXEER/jgxB2EGW/4WPO0A3Xd80O4jSDnL6HURJcPT6lsG46YYgfCuZPjPTFPFWG3uVTEkRQbjPf0xAaRGCIIi+VGvtMFpMCLK3gKM7yKi84z+HIAjyKPjd9Y0gCIIgz/4hGQRRpz09MrOnWPn28a4fdmIZfVf4u1V2EHaQsgnOvq4jiH5bPlrM+twmnyrdU3+DIDwHcczntNRH63drSJkwdcKU8znTiNQl+BN8R5CMtgVBcmXM41xZ45K8giAIsqSZdv+I0k+0iNPrIAiCfK+KJ9+XGu0SdvdTvXI+ZTAUMXYCsS6CGdkRRL2moN9NwLqDIQgEHpdhBI9v//y0aCt/wOb0cP5+mRUBBLkioH9+tAl1r48g+i5hXQgQRI7IdgG7r49fO86nKjuCXBNQvoqFIAhyNxfH6iMIgjgyI1UiyC8kQJDEXYUdBEFC/hMYBEEQBLlbVX9+RJD6PZC/YZ4QRJDoCUAQZZKKcARpnITd10eQ2fUQRJHgR/jMEm1dP7XkCMI19WuW9d3fFx6qhHXf518CKYyOIIwLQdZXxdQSPPp9BMlqAZXrF0HWRzh6SBKve3T90WfMClrtj68sP8p82Z+h8jn6NYLUT1L1DgJ9JQK7l2yuqeKqmNlBpvMRPWGK6N3Xn5azDEh3oO8uP8K/6nlFzG4BRtfvDjWCIEjI1BdBEASZniDlXGZJdUeAIDu40RvCDsLXbUKm/i7BBXGnAXHUP33uX/yJxWuQa4K7l/Tp61uanZ+9RgBBrhklVEUQBPnl0k393N1DskP16RWUIIiygywvRK4p7vNPjODJ+giCIE9WJAlSPbm/YfTkMwvB06/z0Tp89G5SJgRZX7rTCURfXzbhN6aQp+7xCLTeOiLI+lA9Hd3RgZrWYDRwj76P9U5ydJJHE9C9/qvnpb6DPC1AdyLd9K1NLILcjZsiyOj7TkG7JVcl73690sQjSMpVvYXDDnI/S9OTOyM5gtwtnwThADsIgrx9bDcnONrMKNdPglWFICxR3tQBRRBl9no1YQhyP0NKS6ScT/nUHf35x5t8/TFLtPsSJIGrnrnlPn+21O8eCATh27odVTd6EARh1Xq7XBHkHsHdE6yIqTQE0cWMIEfbQbj+PnoBOzN0qQnaLWfq+zvLaTrUxzNnFmx3IN3w3S0cXVO7r4/dEzytfxrSz8dEEA5X94SxgyAIO8idwvn5WRAkZAdxC64sXSuJmrmmRq5BrmllwpS/k9E9YatB3F3fM3s2BYQg3zHZHQGCIPezNgTpu4MQZNMO4pyIJFARBEESzQ2CIIglPLPXh/UcCLKXd8vp7q8KPwsJgiAIdwMdAQRp9M7u65MdhH96Y5gABPmFILzPqv/dLBvXr8I5/ZkEu7/P8iPsUkWQ9aUeQdhBfpo0PqQRCQRZT/hhxPCXDQQRBEGQz3Yo/qzWI5QIcpqvYUULp5z7lLxzTC7X1C84GH3ZlQlbtWB3ExWt78xzUV+oiCCfVVGurxlJ3wUPQfRL3bIGgiBO1MXrrQlSTyAF83N9u8WI3kHcj2A0sNZkl37f3UGiJ0ztb6yjfHSSR9/3n7e7+qc3vvoigrDXfGHLDrKDlOuMx8WMIOfdQdzXj7KDuFuZLYEo7y89YzSgevy7r48g4fP6HVEEuWZWaSejjxV3AzDaJbivf+X6RANgfa4ix+z1lYZg9/WtuwWCrF8NVgFefR9B1ue5W0D5+VfuVo5O8mhhz3TR7lZU6fPdAkRfnyUafjU9LiZxtyovf0s0/NuXGaUJ6M5z9/URI3xuE0QQRK68nwZCkLpI2UG4z3+aGATpTsA+gVja6nrOmfXd94uV53Z/f8uXdREkfFIePSCC1NOIIPWMuAW4v2Ke/ZClBXs0aMp7u1s4pYVzr48g9wRuIoggTkTX67qvjyBrRXE0YH6z4v7RRxBGKpoAO8g+O4jS5GQP7NOQIsjeBPKLjTrAbsmVdm1mwlZ/Fn36MxnVbkRzAq7fPcHK+qnXt9JOu1sj9/pKE+hO1LrLWs8XPWERBJz9gW0xwb+CAnYQ/ealYcK+2iEEucMJO0j9s20RQRCE/3qqPJcIUk9h9w7ilnO3nLs/37G+ddx5fPqcm/zfBBBk73T/YkF5DkL3pPpbQK4p/unXgfhiCIIgB5oqJoofSCzBNEasFiUdgWf3+giCIOkahyBpEo9egiCpEo8gCJIo8cM1c7y5aOl72EH4QbVDtVXPMIIgyKHK6n6G3fUjCIJEz6LlfAgS/Q0sd/0V8J1++ZJPJQi5TxCcXt9L70OQtTxPBxBB1tdBkL0JfCV59YuYO0LnzxnWUVIOV/fEIgjX1Pvf1h1rBlKOJYtgPeN0E6ycz3nul2s+RHJE0H19BOH6fZfjcuVXm9aXFAih8NB9/SeBnLmm3n9egiDICOzfz7qlnnnv6PcRhB1k2cQhSO00LldmB8nwrUTl+nW38UoXvXt9pa3j+mUH2ZAJ9+xNC/7pvtHvIwg7yHLVKi3g6JJGkOXIeH/wiKQICiUJgswlPl1TRTDlx6b5UYjDrRyFIAjCDuIoMAS5BmXUq9XCKXIiCO2hMlHdCY4a0D2fM0MnOwgEbgtAkOc7CIG8x/nH/5n4DsIOssO0IoiLJCfROgEE4clyI4AgiCN28ToEQZBi1XW/jiC0gs1CIwiCNIvhXx2CIEizoVsijCCuZ9KkKoIgSLMYCNJBYDTRu9d3/0xFd0K+FtQJqnbFcQlCEP0H1ZSA3QFZT4SWr/9V5Jm/NfHq2ewgCHKlU5QmnqDWCSDI37QRhB1kh5lLMKMIgiBkNEkAQZIE/nmZHYRrqr6kbv1EBJmgXxQWQWYYPXqOx1aP+VzPu3v96XBvfF9pZt0T63wEhxijIZxuxXYTUP7p+ujrK+/tjsDu9WeLYuaaQpClC9l9Pt0BKddP9/oIsld3CMLvYnU0F4KsJ4ogzKB7UtPcMU9LdGchQZCpDK0Dg/vsvxeciWBJUgTRx17rEhBE72AcASrff3q+6O4JQdZHV6lLBEGQ60lNc4cdhB2E/6X2mZVGX8gO8r9YEWRvAN3N5ZKfk/+HAJZO9TlUbwRBkOZmXEEQQZoNnSrcEgEEuSbgrBKlkek+38q52UFcFO/qnD/j6UYQpgdBmgFetMKVhcufrRtWUmrhEIRr6p1JZQdJqTIePEYAQRL3Dl/vRpDxK2Qmj90TuzvR0c/N/rDkzPtOIcjd9WoXlOQRBEEWCeRKHkEQZJGAPhwIgiAXOVQOuVv1TztDAO/73CNkB1kfT7nKEGRGXvfnlAKemSmuo3ViCLK+4hFkvWYR5JrRjoCeXvHsIJc0Ru+zYwYdQXZPODvIfQYRxJGhR7UIwg5yEcfpJnbrTuLsEmZ2ECUCpZteDaLyvuj3u++jVy+bneN6N/Eiob/RJu6+vmePZwdBkJ+acLcA0dffu0RnrmkEQZB/CQxB6geEHeQ+gyEIgsRKuvu6RBAEARqRQBAEsVzOu9vnGQFdp+v+Pc6ZD0oIIvLbvYPMXI+7A1RO/FiblcD+cF3N3KfP3D1B1wVqfQRBkGPQ6MptBSA/hCDHKrjd5F+tj98cefPvEUAQBInVNYKswSGIKJW7/ek+X/kfn9Ofkz/b5e5rV/f6p7+DRHdou9d/6lAEeTwOEARJXCnAU55jPTaCnDdHCHLeGd/+5AjCDuKYFQRxgCpXIQiCOJJDLQQ4lFUEOY/k359+ZIl2rv5ZrdVe9r+CIN2LdGXC1Plrjjz4sQiCIIjjAkEQB6hyFYIgiCM5CIIgyztIC+yMu1z5Pn80Yfbp0fc/rR/KP2VHkPtlNrp0fb23ZTAQhB3kUVOHIPdLGkEQZDmCZfBZovHkaxS6pR0VVFmCz9ZXpIxOxrm+Uld3Oaj8FEv5pF0ZiNX3uQQfCTa6YKPX7+4OlO9Hv/c085n3nx5yd///00+/2UEQJI3Ap78/MzkzfyoZQW4n8BUcYpXf3n19BFnvsBHkmpE8uc/ek8/tFvxTRvHT9cUO8nmk3p2IICTw0WwxYZ8juSI/BMlZaIoAu6+PIAjy0+wt7SCjr4/+RJaSiHK+mWaIa+qaxuhzkWSaCDLuP4KwgwzP4DsBeXp9dRdVrml3q8UOcpdIWpMwW1MXcXSvn3Z9XD06giAIO8juazotuKBHRxAESVtpCJIGBYJ8E2AHYZ7SItgtuKJ4YkJZos2Mnb6DjF5/5lDsIPZNnEBCIJQAgoTC4uMQ4JoAgnBtQSCUAIKEwuLjEOCaAIJwbUEglACChMLi4xDgmgCCcG1BIJQAgoTC4uMQ4JoAgnBtQSCUAIKEwuLjEOCaAIJwbUEglACChMLi4xDgmgCCcG1BIJQAgoTC4uMQ4JoAgnBtQSCUAIKEwuLjEOCaAIJwbUEglACChMLi4xDgmgCCcG1BIJQAgoTC4uMQ4JoAgnBtQSCUAIKEwuLjEOCaAIJwbUEglACChMLi4xDgmgCCcG1BIJQAgoTC4uMQ4JoAgnBtQSCUAIKEwuLjEOCaAIJwbUEglACChMLi4xDgmgCCcG1BIJQAgoTC4uMQ4JoAgnBtQSCUAIKEwuLjEOCaAIJwbUEglACChMLi4xDgmgCCcG1BIJQAgoTC4uMQ4JrAf5Gq8aZD/yodAAAAAElFTkSuQmCC";

  // Function to handle enabling two-factor authentication
  const handleEnableTwoFactor = () => {
    if (!twoFactorEnabled) {
      setShowQRCode(true);
      setSetupStep(1);
      toast({
        title: "Setting up Two-Factor Authentication",
        description: "Scan the QR code with your authenticator app to continue.",
      });
    } else {
      // Disabling two-factor auth
      setTwoFactorEnabled(false);
      setShowQRCode(false);
      setSetupStep(0);
      toast({
        title: "Two-Factor Authentication Disabled",
        description: "Your account is now secured with password only.",
        variant: "destructive",
      });
    }
  };

  // Function to validate verification code
  const validateVerificationCode = () => {
    // In a real implementation, this would validate against the server
    if (verificationCode.length === 6) {
      setTwoFactorEnabled(true);
      setShowQRCode(false);
      setSetupStep(2);
      toast({
        title: "Two-Factor Authentication Enabled",
        description: "Your account is now secured with 2FA.",
        variant: "success",
      });
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit code from your authenticator app.",
        variant: "destructive",
      });
    }
  };

  // Function to copy recovery codes
  const copyRecoveryCodes = () => {
    // In a real implementation, these would be generated on the server
    const recoveryCodes = "ABCD-EFGH-IJKL\nMNOP-QRST-UVWX\nYZAB-CDEF-GHIJ";
    navigator.clipboard.writeText(recoveryCodes);
    
    toast({
      title: "Recovery Codes Copied",
      description: "Store these codes in a safe place. You'll need them if you lose access to your authenticator app.",
    });
  };

  return (
    <SecurityLayout 
      title="Two-Factor Authentication" 
      description="Add an extra layer of security to your admin account"
    >
      <div className="space-y-6">
        {/* Current Status Card */}
        <Card className="bg-background border-0">
          <CardHeader className="bg-background border-0">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-foreground">Two-Factor Authentication Status</CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  {twoFactorEnabled 
                    ? "Your account is protected with two-factor authentication" 
                    : "Your account is currently using password authentication only"}
                </CardDescription>
              </div>
              <div className={`p-2 rounded-full ${twoFactorEnabled ? 'bg-primary/20' : 'bg-destructive/20'}`}>
                {twoFactorEnabled 
                  ? <CheckCircle className="h-5 w-5 text-primary" /> 
                  : <AlertTriangle className="h-5 w-5 text-destructive" />}
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-background">
            <div className="flex items-center space-x-2">
              <Switch
                id="two-factor-toggle"
                checked={twoFactorEnabled}
                onCheckedChange={handleEnableTwoFactor}
              />
              <Label htmlFor="two-factor-toggle" className="text-foreground">
                {twoFactorEnabled ? "Disable" : "Enable"} Two-Factor Authentication
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Setup Process Cards */}
        {showQRCode && (
          <Card className="bg-background border-0">
            <CardHeader className="bg-background border-0">
              <CardTitle className="text-foreground">Setup Two-Factor Authentication</CardTitle>
              <CardDescription className="text-muted-foreground">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-background">
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <img 
                    src={mockQRCodeUrl} 
                    alt="Two-Factor Authentication QR Code" 
                    className="w-64 h-64" 
                  />
                </div>
                <p className="text-muted-foreground text-center max-w-md">
                  Can't scan the QR code? You can manually enter this setup key into your authenticator app:
                </p>
                <div className="flex items-center space-x-2 bg-accent/50 p-2 rounded-md">
                  <code className="text-xs text-foreground">ABCD EFGH IJKL MNOP QRST UVWX</code>
                  <Button size="sm" variant="ghost" onClick={() => {
                    navigator.clipboard.writeText("ABCDEFGHIJKLMNOPQRSTUVWX");
                    toast({
                      title: "Copied to clipboard",
                      description: "Setup key has been copied to clipboard",
                    });
                  }}>
                    <Copy size={14} />
                  </Button>
                </div>
                
                <div className="w-full max-w-xs space-y-2 mt-4">
                  <Label htmlFor="verification-code" className="text-foreground">Enter Verification Code</Label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      id="verification-code"
                      maxLength={6}
                      className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                    <Button onClick={validateVerificationCode}>Verify</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {twoFactorEnabled && (
          <Card className="bg-background border-0">
            <CardHeader className="bg-background border-0">
              <CardTitle className="text-foreground">Recovery Codes</CardTitle>
              <CardDescription className="text-muted-foreground">
                Store these recovery codes in a safe place to regain access to your account if you lose your authenticator device.
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-background">
              <div className="bg-accent/50 p-4 rounded-md font-mono text-sm text-foreground mb-4">
                <p>ABCD-EFGH-IJKL</p>
                <p>MNOP-QRST-UVWX</p>
                <p>YZAB-CDEF-GHIJ</p>
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                <p>• Each code can only be used once.</p>
                <p>• These codes were generated when you enabled two-factor authentication.</p>
                <p>• If you lose your authenticator device and don't have these codes, you'll lose access to your account.</p>
              </div>
            </CardContent>
            <CardFooter className="bg-background border-0">
              <Button
                variant="outline"
                onClick={copyRecoveryCodes}
                className="flex items-center gap-2"
              >
                <Copy size={16} />
                Copy Recovery Codes
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Information Card */}
        <Card className="bg-background border-0">
          <CardHeader className="bg-background border-0">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Why Use Two-Factor Authentication?
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-background">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="min-w-[40px] flex-shrink-0 text-center">
                  <Smartphone className="h-5 w-5 text-primary mx-auto" />
                </div>
                <div>
                  <h3 className="text-md font-medium text-foreground">Something You Have</h3>
                  <p className="text-sm text-muted-foreground">
                    Requires a physical device (like your phone) to generate unique codes that expire quickly.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="min-w-[40px] flex-shrink-0 text-center">
                  <KeyRound className="h-5 w-5 text-primary mx-auto" />
                </div>
                <div>
                  <h3 className="text-md font-medium text-foreground">Enhanced Security</h3>
                  <p className="text-sm text-muted-foreground">
                    Even if someone knows your password, they can't access your account without the second factor.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="min-w-[40px] flex-shrink-0 text-center">
                  <AlertTriangle className="h-5 w-5 text-primary mx-auto" />
                </div>
                <div>
                  <h3 className="text-md font-medium text-foreground">Critical for Admin Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Protects sensitive administrator functions from unauthorized access and potential security breaches.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SecurityLayout>
  );
}