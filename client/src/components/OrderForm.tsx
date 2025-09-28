import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Upload, X, Plus, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrderSchema, type InsertOrder, type Customer, type OrderStatus } from "@shared/schema";
import { format } from "date-fns";
import { z } from "zod";
import CustomerForm from "./CustomerForm";

// Extended schema for the form with string dates
const orderFormSchema = insertOrderSchema.extend({
  orderDate: z.date(),
  deliveryDate: z.date(),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  customers: Customer[];
  initialData?: Partial<OrderFormData> & { id?: string };
  onSubmit: (data: OrderFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export default function OrderForm({
  customers,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode
}: OrderFormProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(initialData?.cakeImage || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerId: initialData?.customerId || "",
      cakeImage: initialData?.cakeImage || "",
      writingOnCake: initialData?.writingOnCake || "",
      orderDate: initialData?.orderDate || new Date(),
      deliveryDate: initialData?.deliveryDate || new Date(),
      price: initialData?.price || 0,
      status: initialData?.status || "Pending",
      notes: initialData?.notes || "",
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/orders/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setSelectedImage(data.imageUrl);
      form.setValue('cakeImage', data.imageUrl);
      console.log('Image uploaded successfully:', data.imageUrl);
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    form.setValue('cakeImage', '');
    console.log('Image removed');
  };

  const handleFormSubmit = (data: OrderFormData) => {
    console.log('Order form submitted:', data);
    onSubmit(data);
  };

  const handleNewCustomer = () => {
    setShowCustomerForm(true);
    console.log('New customer dialog opened');
  };

  const handleCustomerCreated = (customer: Customer) => {
    setShowCustomerForm(false);
    form.setValue('customerId', customer.id);
    console.log('New customer created and selected:', customer.name);
  };

  const selectedCustomer = customers.find(c => c.id === form.watch('customerId'));

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mode === 'create' ? 'Create New Order' : 'Edit Order'}
          {initialData?.id && <Badge variant="secondary">#{initialData.id}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Customer Selection */}
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer *</FormLabel>
                  <div className="flex gap-2">
                    <FormControl className="flex-1">
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger data-testid="select-customer">
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              <div>
                                <div className="font-medium">{customer.name}</div>
                                <div className="text-sm text-muted-foreground">{customer.phone}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleNewCustomer}
                          data-testid="button-add-customer"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add New Customer</DialogTitle>
                        </DialogHeader>
                        <CustomerForm
                          mode="create"
                          onSubmit={handleCustomerCreated}
                          onCancel={() => setShowCustomerForm(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                  {selectedCustomer && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <User className="h-4 w-4" />
                      <span>{selectedCustomer.name} - {selectedCustomer.phone}</span>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload */}
            <FormField
              control={form.control}
              name="cakeImage"
              render={() => (
                <FormItem>
                  <FormLabel>Cake Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {selectedImage ? (
                        <div className="relative inline-block">
                          <img
                            src={selectedImage}
                            alt="Cake preview"
                            className="w-32 h-32 object-cover rounded-lg border"
                            data-testid="img-cake-preview"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={removeImage}
                            data-testid="button-remove-image"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Upload cake image</p>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        data-testid="input-image-upload"
                      />
                      {uploadingImage && (
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload an image of the cake or baking item
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Writing on Cake */}
            <FormField
              control={form.control}
              name="writingOnCake"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Writing on Cake</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Happy Birthday John!"
                      data-testid="input-writing-on-cake"
                    />
                  </FormControl>
                  <FormDescription>
                    Optional text to be written on the cake
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="orderDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Order Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                            data-testid="button-order-date"
                          >
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          data-testid="calendar-order-date"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Delivery Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                            data-testid="button-delivery-date"
                          >
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          data-testid="calendar-delivery-date"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Price and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price * ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Additional notes about the order..."
                      className="min-h-[80px]"
                      data-testid="textarea-notes"
                    />
                  </FormControl>
                  <FormDescription>
                    Any additional information about the order
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
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                data-testid="button-submit"
              >
                {isLoading ? 'Saving...' : mode === 'create' ? 'Create Order' : 'Update Order'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}