import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CustomerForm from "./CustomerForm";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/useCustomers";
import { useToast } from "@/hooks/use-toast";
import type { InsertCustomer, Customer } from "@shared/schema";

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: Customer;
}

export default function CustomerDialog({
  open,
  onOpenChange,
  mode,
  initialData
}: CustomerDialogProps) {
  const { toast } = useToast();
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  const handleSubmit = async (data: InsertCustomer | Customer) => {
    try {
      if (mode === 'create') {
        await createCustomerMutation.mutateAsync(data as InsertCustomer);
        toast({
          title: "Customer added",
          description: "The customer has been successfully added.",
        });
      } else if (initialData) {
        await updateCustomerMutation.mutateAsync({
          id: initialData.id,
          data: data as InsertCustomer
        });
        toast({
          title: "Customer updated",
          description: "The customer has been successfully updated.",
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Customer operation failed:', error);
      toast({
        title: "Error",
        description: mode === 'create' 
          ? "Failed to add customer. Please try again."
          : "Failed to update customer. Please try again.",
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
    name: initialData.name,
    phone: initialData.phone,
    email: initialData.email,
    address: initialData.address,
  } : undefined;

  const isLoading = createCustomerMutation.isPending || updateCustomerMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Customer' : 'Edit Customer'}
          </DialogTitle>
        </DialogHeader>
        <CustomerForm
          initialData={formInitialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          mode={mode}
          hideCard={true}
        />
      </DialogContent>
    </Dialog>
  );
}