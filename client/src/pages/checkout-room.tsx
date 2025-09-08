import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DollarSign, Users, ArrowLeft, CreditCard } from "lucide-react";

interface PaymentData {
  roomData: any;
  pricing: {
    totalCost: number;
    costBreakdown: {
      roomCost: number;
      seatCost: number;
      description: string[];
    };
    currency: string;
  };
}

export default function CheckoutRoom() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Get payment data from localStorage
    const storedData = localStorage.getItem('roomPaymentData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setPaymentData(data);
      } catch (error) {
        console.error('Error parsing payment data:', error);
        toast({
          title: "Error",
          description: "Invalid payment data. Please try again.",
          variant: "destructive",
        });
        navigate('/user-dashboard');
      }
    } else {
      toast({
        title: "No Payment Data",
        description: "No payment information found. Please try creating the room again.",
        variant: "destructive",
      });
      navigate('/user-dashboard');
    }
  }, [navigate, toast]);

  const handlePayment = async () => {
    if (!paymentData) return;

    setIsProcessing(true);
    try {
      // Process payment through our room purchase endpoint
      const result = await apiRequest("/api/rooms/purchase", {
        method: "POST",
        body: {
          roomData: paymentData.roomData,
          paymentMethod: {
            gatewayId: 1 // Default gateway
          }
        }
      });

      toast({
        title: "Payment Successful!",
        description: `Room "${paymentData.roomData.name}" created successfully!`,
      });

      // Clear payment data
      localStorage.removeItem('roomPaymentData');

      // Redirect to the new room
      navigate(`/room/${result.room.roomId}`);
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('roomPaymentData');
    navigate('/user-dashboard');
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { roomData, pricing } = paymentData;
  const totalCost = pricing.totalCost / 100; // Convert from cents

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <div className="space-y-6">
            {/* Room Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Room Purchase
                </CardTitle>
                <CardDescription>
                  Complete your payment to create your room
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{roomData.name}</h3>
                  {roomData.description && (
                    <p className="text-muted-foreground">{roomData.description}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {roomData.maxSeats} seats
                  </Badge>
                  <Badge variant="outline">
                    {roomData.type} room
                  </Badge>
                  <Badge variant="outline">
                    {roomData.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pricing.costBreakdown.description.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-muted-foreground">{item}</span>
                    <span className="font-medium">
                      ${item.includes('room') ? '5.00' : item.match(/\$(\d+)\.00/)?.[1] + '.00'}
                    </span>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>${totalCost.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
                <CardDescription>
                  For this demo, payment is processed automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="flex-1"
                    size="lg"
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    {isProcessing ? 'Processing...' : `Pay $${totalCost.toFixed(2)}`}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isProcessing}
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground text-center">
                  This is a demo payment. In production, this would integrate with a real payment gateway.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}