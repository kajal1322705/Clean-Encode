import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable, type Column, type Action } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Eye, Edit, Trash2, Download } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Booking } from "@shared/schema";

const bookingFormSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z.string().min(10, "Phone must be at least 10 digits"),
  customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  vehicleModel: z.string().min(1, "Please select a model"),
  variant: z.string().min(1, "Please select a variant"),
  color: z.string().min(1, "Please select a color"),
  bookingAmount: z.number().min(1000, "Minimum booking amount is ₹1000"),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

const vehicleModels = [
  { value: "zforce-x1", label: "ZForce X1" },
  { value: "zforce-x2", label: "ZForce X2 Pro" },
  { value: "zforce-city", label: "ZForce City" },
  { value: "zforce-cargo", label: "ZForce Cargo" },
];

const variants = [
  { value: "base", label: "Base" },
  { value: "plus", label: "Plus" },
  { value: "pro", label: "Pro" },
  { value: "max", label: "Max" },
];

const colors = [
  { value: "white", label: "Pearl White" },
  { value: "black", label: "Midnight Black" },
  { value: "silver", label: "Lunar Silver" },
  { value: "blue", label: "Ocean Blue" },
  { value: "red", label: "Flame Red" },
];

export default function BookingsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { toast } = useToast();

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      return apiRequest("POST", "/api/bookings", {
        ...data,
        customerEmail: data.customerEmail || null,
        dealerId: "dealer-1",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsDialogOpen(false);
      toast({
        title: "Booking Created",
        description: "New booking has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      vehicleModel: "",
      variant: "",
      color: "",
      bookingAmount: 10000,
    },
  });

  const onSubmit = (data: BookingFormData) => {
    createMutation.mutate(data);
  };

  const columns: Column<Booking>[] = [
    {
      header: "Booking #",
      accessor: (row) => (
        <span className="font-mono text-sm">{row.bookingNumber}</span>
      ),
    },
    {
      header: "Customer",
      accessor: (row) => (
        <div>
          <p className="font-medium">{row.customerName}</p>
          <p className="text-xs text-muted-foreground">{row.customerPhone}</p>
        </div>
      ),
    },
    {
      header: "Vehicle",
      accessor: (row) => (
        <div>
          <p className="font-medium">{row.vehicleModel}</p>
          <p className="text-xs text-muted-foreground">
            {row.variant} · {row.color}
          </p>
        </div>
      ),
    },
    {
      header: "Amount",
      accessor: (row) => (
        <span className="font-medium">₹{row.bookingAmount.toLocaleString()}</span>
      ),
    },
    {
      header: "KYC",
      accessor: (row) => <StatusBadge status={row.kycStatus || "pending"} />,
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const actions: Action<Booking>[] = [
    {
      label: "View Details",
      onClick: (row) => console.log("View", row.id),
      icon: <Eye className="h-4 w-4" />,
    },
    {
      label: "Edit",
      onClick: (row) => console.log("Edit", row.id),
      icon: <Edit className="h-4 w-4" />,
    },
    {
      label: "Delete",
      onClick: (row) => console.log("Delete", row.id),
      icon: <Trash2 className="h-4 w-4" />,
    },
  ];

  const filteredBookings = bookings?.filter(
    (booking) =>
      booking.customerName.toLowerCase().includes(searchValue.toLowerCase()) ||
      booking.bookingNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      booking.vehicleModel.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">
            Bookings
          </h1>
          <p className="text-muted-foreground">
            Manage vehicle bookings and customer orders
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" data-testid="button-export">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-booking">
                <Plus className="mr-2 h-4 w-4" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Booking</DialogTitle>
                <DialogDescription>
                  Enter customer and vehicle details to create a new booking.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter full name"
                              {...field}
                              data-testid="input-customer-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter phone number"
                              {...field}
                              data-testid="input-customer-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter email address"
                              {...field}
                              data-testid="input-customer-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vehicleModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Model</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-vehicle-model">
                                <SelectValue placeholder="Select model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vehicleModels.map((model) => (
                                <SelectItem key={model.value} value={model.value}>
                                  {model.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="variant"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Variant</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-variant">
                                <SelectValue placeholder="Select variant" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {variants.map((variant) => (
                                <SelectItem key={variant.value} value={variant.value}>
                                  {variant.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-color">
                                <SelectValue placeholder="Select color" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {colors.map((color) => (
                                <SelectItem key={color.value} value={color.value}>
                                  {color.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bookingAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Booking Amount (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              data-testid="input-booking-amount"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      data-testid="button-submit-booking"
                    >
                      {createMutation.isPending ? "Creating..." : "Create Booking"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredBookings || []}
        actions={actions}
        searchPlaceholder="Search bookings..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        isLoading={isLoading}
        emptyMessage="No bookings found. Create your first booking to get started."
        testIdPrefix="bookings"
      />
    </div>
  );
}
