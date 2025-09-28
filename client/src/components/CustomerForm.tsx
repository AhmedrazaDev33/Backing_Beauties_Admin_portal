import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema, type InsertCustomer, type Customer } from "@shared/schema";
import { z } from "zod";

type CustomerFormData = z.infer<typeof insertCustomerSchema>;

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData> & { id?: string };
  onSubmit: (data: CustomerFormData | Customer) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
  hideCard?: boolean;
}

export default function CustomerForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
  hideCard = false
}: CustomerFormProps) {
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
    },
  });

  const handleFormSubmit = (data: CustomerFormData) => {
    console.log('Customer form submitted:', data);
    onSubmit(data);
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter customer name"
                  data-testid="input-customer-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="tel"
                  placeholder="e.g., +1 (555) 123-4567"
                  data-testid="input-customer-phone"
                />
              </FormControl>
              <FormDescription>
                Primary contact number
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="customer@example.com"
                  data-testid="input-customer-email"
                />
              </FormControl>
              <FormDescription>
                Optional - for sending order confirmations
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="123 Main Street, City, State, ZIP"
                  className="min-h-[60px]"
                  data-testid="textarea-customer-address"
                />
              </FormControl>
              <FormDescription>
                Optional - delivery or billing address
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            data-testid="button-cancel-customer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            data-testid="button-submit-customer"
          >
            {isLoading ? 'Saving...' : mode === 'create' ? 'Add Customer' : 'Update Customer'}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (hideCard) {
    return <div className="space-y-4">{formContent}</div>;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Add New Customer' : 'Edit Customer'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
}