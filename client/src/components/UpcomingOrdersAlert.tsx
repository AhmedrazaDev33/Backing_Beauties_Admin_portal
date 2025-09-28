import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, X } from "lucide-react";
import { useState } from "react";

interface UpcomingOrder {
  id: string;
  customerName: string;
  deliveryDate: string;
  daysTillDelivery: number;
}

interface UpcomingOrdersAlertProps {
  upcomingOrders: UpcomingOrder[];
  onDismiss?: () => void;
  onViewOrder?: (orderId: string) => void;
}

export default function UpcomingOrdersAlert({ 
  upcomingOrders, 
  onDismiss,
  onViewOrder 
}: UpcomingOrdersAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || upcomingOrders.length === 0) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
    console.log('Upcoming orders alert dismissed');
  };

  const handleViewOrder = (orderId: string) => {
    onViewOrder?.(orderId);
    console.log('View order from alert:', orderId);
  };

  const urgentOrders = upcomingOrders.filter(order => order.daysTillDelivery <= 1);
  const soonOrders = upcomingOrders.filter(order => order.daysTillDelivery > 1);

  return (
    <Alert className="border-primary/20 bg-primary/5" data-testid="alert-upcoming-orders">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Clock className="h-5 w-5 text-primary mt-1" />
          <div className="space-y-2 flex-1">
            <AlertTitle className="text-primary">Upcoming Deliveries</AlertTitle>
            <AlertDescription className="space-y-2">
              {urgentOrders.length > 0 && (
                <div>
                  <p className="font-medium text-destructive mb-1">
                    ⚠️ {urgentOrders.length} order{urgentOrders.length > 1 ? 's' : ''} due tomorrow or today:
                  </p>
                  {urgentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between bg-destructive/10 p-2 rounded text-sm">
                      <span data-testid={`text-urgent-order-${order.id}`}>
                        {order.customerName} - {order.deliveryDate}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleViewOrder(order.id)}
                        data-testid={`button-view-urgent-${order.id}`}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {soonOrders.length > 0 && (
                <div>
                  <p className="font-medium mb-1">
                    📅 {soonOrders.length} order{soonOrders.length > 1 ? 's' : ''} coming up:
                  </p>
                  {soonOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between bg-accent p-2 rounded text-sm">
                      <span data-testid={`text-upcoming-order-${order.id}`}>
                        {order.customerName} - {order.deliveryDate} ({order.daysTillDelivery} days)
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleViewOrder(order.id)}
                        data-testid={`button-view-upcoming-${order.id}`}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                  {soonOrders.length > 3 && (
                    <p className="text-sm text-muted-foreground">
                      ...and {soonOrders.length - 3} more orders
                    </p>
                  )}
                </div>
              )}
            </AlertDescription>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="h-8 w-8 opacity-50 hover:opacity-100"
          data-testid="button-dismiss-alert"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}