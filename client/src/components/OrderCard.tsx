import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, User, FileText, Edit, Eye } from "lucide-react";
import { useState } from "react";

export type OrderStatus = 'Pending' | 'Completed' | 'Cancelled';

interface OrderCardProps {
  id: string;
  customerName: string;
  customerAvatar?: string;
  cakeImage?: string;
  writingOnCake?: string;
  orderDate: string;
  deliveryDate: string;
  price: number;
  status: OrderStatus;
  notes?: string;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
}

export default function OrderCard({
  id,
  customerName,
  customerAvatar,
  cakeImage,
  writingOnCake,
  orderDate,
  deliveryDate,
  price,
  status,
  notes,
  onEdit,
  onView
}: OrderCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const getStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 'secondary';
      case 'Completed': return 'default';
      case 'Cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleEdit = () => {
    console.log(`Edit order ${id} triggered`);
    onEdit?.(id);
  };

  const handleView = () => {
    console.log(`View order ${id} triggered`);
    onView?.(id);
  };

  return (
    <Card className="hover-elevate" data-testid={`card-order-${id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={customerAvatar} alt={customerName} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {customerName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base" data-testid={`text-customer-${id}`}>
              {customerName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Order #{id}</p>
          </div>
        </div>
        <Badge variant={getStatusVariant(status)} data-testid={`badge-status-${id}`}>
          {status}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {cakeImage && (
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
            <img
              src={cakeImage}
              alt="Cake order"
              className={`h-full w-full object-cover transition-opacity ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              data-testid={`img-cake-${id}`}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </div>
        )}

        {writingOnCake && (
          <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-md">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Writing:</span>
            <span className="text-sm" data-testid={`text-writing-${id}`}>"{writingOnCake}"</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Order Date</p>
              <p className="font-medium" data-testid={`text-order-date-${id}`}>{orderDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <div>
              <p className="text-muted-foreground">Delivery Date</p>
              <p className="font-medium text-primary" data-testid={`text-delivery-date-${id}`}>{deliveryDate}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-lg font-bold text-primary" data-testid={`text-price-${id}`}>
            Rs {price.toFixed(2)}
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleView}
              data-testid={`button-view-${id}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              onClick={handleEdit}
              data-testid={`button-edit-${id}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {notes && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">Notes: {notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}