import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Mail, MapPin, Package, Eye } from "lucide-react";

interface CustomerCardProps {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders: number;
  avatar?: string;
  onView?: (id: string) => void;
}

export default function CustomerCard({
  id,
  name,
  phone,
  email,
  address,
  totalOrders,
  avatar,
  onView
}: CustomerCardProps) {
  const handleView = () => {
    console.log(`View customer ${id} triggered`);
    onView?.(id);
  };

  return (
    <Card className="hover-elevate" data-testid={`card-customer-${id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
              {name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg" data-testid={`text-customer-name-${id}`}>
              {name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Customer #{id}</p>
          </div>
        </div>
        <Badge variant="secondary" data-testid={`badge-orders-${id}`}>
          {totalOrders} orders
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm" data-testid={`text-phone-${id}`}>{phone}</span>
        </div>
        
        {email && (
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm" data-testid={`text-email-${id}`}>{email}</span>
          </div>
        )}
        
        {address && (
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-sm" data-testid={`text-address-${id}`}>{address}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>Total Orders: {totalOrders}</span>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleView}
            data-testid={`button-view-customer-${id}`}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}