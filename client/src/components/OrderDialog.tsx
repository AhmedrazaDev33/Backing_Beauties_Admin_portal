import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import OrderForm from "./OrderForm";
import { useCustomers } from "@/hooks/useCustomers";
import { useCreateOrder, useUpdateOrder } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";
import type { InsertOrder, OrderWithCustomer } from "@shared/schema";
import { format } from "date-fns";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: OrderWithCustomer;
}

export default function OrderDialog({
  open,
  onOpenChange,
  mode,
  initialData
}: OrderDialogProps) {
  const { toast } = useToast();
  const { data: customers = [] } = useCustomers();
  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();

  const handleSubmit = async (data: any) => {
    try {
      // Convert form data to API format
      const orderData: InsertOrder = {
        customerId: data.customerId,
        cakeImage: data.cakeImage || undefined,
        writingOnCake: data.writingOnCake || undefined,
        orderDate: format(data.orderDate, 'yyyy-MM-dd'),
        deliveryDate: format(data.deliveryDate, 'yyyy-MM-dd'),
        price: data.price.toString(),
        status: data.status,
        notes: data.notes || undefined,
      };

      if (mode === 'create') {
        await createOrderMutation.mutateAsync(orderData);
        toast({
          title: "Order created",
          description: "The order has been successfully created.",
        });
      } else if (initialData) {
        await updateOrderMutation.mutateAsync({
          id: initialData.id,
          data: orderData
        });
        toast({
          title: "Order updated",
          description: "The order has been successfully updated.",
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Order operation failed:', error);
      toast({
        title: "Error",
        description: mode === 'create' 
          ? "Failed to create order. Please try again."
          : "Failed to update order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Prepare initial data for edit mode
  const formInitialData = initialData ? {
    id: initialData.id,
    customerId: initialData.customerId,
    cakeImage: initialData.cakeImage || undefined,
    writingOnCake: initialData.writingOnCake || undefined,
    orderDate: new Date(initialData.orderDate),
    deliveryDate: new Date(initialData.deliveryDate),
    price: parseFloat(initialData.price),
    status: initialData.status,
    notes: initialData.notes || undefined,
  } : undefined;

  const isLoading = createOrderMutation.isPending || updateOrderMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Order' : 'Edit Order'}
          </DialogTitle>
        </DialogHeader>
        <OrderForm
          customers={customers}
          initialData={formInitialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  );
}