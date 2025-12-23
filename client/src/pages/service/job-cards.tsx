import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable, type Column, type Action } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Eye, Edit, Wrench, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { JobCard } from "@shared/schema";

const jobCardFormSchema = z.object({
  vehicleNumber: z.string().min(4, "Enter valid vehicle number"),
  vin: z.string().min(10, "VIN must be at least 10 characters"),
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z.string().min(10, "Phone must be at least 10 digits"),
  serviceType: z.string().min(1, "Please select service type"),
  complaints: z.string().min(10, "Please describe the complaint"),
  priority: z.string().default("normal"),
});

type JobCardFormData = z.infer<typeof jobCardFormSchema>;

const serviceTypes = [
  { value: "regular_service", label: "Regular Service" },
  { value: "battery_check", label: "Battery Health Check" },
  { value: "motor_repair", label: "Motor Repair" },
  { value: "electrical", label: "Electrical Issue" },
  { value: "body_repair", label: "Body Repair" },
  { value: "warranty", label: "Warranty Claim" },
  { value: "other", label: "Other" },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function JobCardsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { toast } = useToast();

  const { data: jobCards, isLoading } = useQuery<JobCard[]>({
    queryKey: ["/api/job-cards"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: JobCardFormData) => {
      return apiRequest("POST", "/api/job-cards", {
        ...data,
        dealerId: "dealer-1",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Job Card Created",
        description: "New job card has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create job card. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<JobCardFormData>({
    resolver: zodResolver(jobCardFormSchema),
    defaultValues: {
      vehicleNumber: "",
      vin: "",
      customerName: "",
      customerPhone: "",
      serviceType: "",
      complaints: "",
      priority: "normal",
    },
  });

  const onSubmit = (data: JobCardFormData) => {
    createMutation.mutate(data);
  };

  const getJobCardCounts = () => {
    if (!jobCards) return { open: 0, inProgress: 0, completed: 0, total: 0 };
    return {
      open: jobCards.filter((j) => j.status === "open").length,
      inProgress: jobCards.filter((j) => j.status === "in_progress").length,
      completed: jobCards.filter((j) => j.status === "completed").length,
      total: jobCards.length,
    };
  };

  const counts = getJobCardCounts();

  const columns: Column<JobCard>[] = [
    {
      header: "Job #",
      accessor: (row) => (
        <span className="font-mono text-sm">{row.jobNumber}</span>
      ),
    },
    {
      header: "Vehicle",
      accessor: (row) => (
        <div>
          <p className="font-medium">{row.vehicleNumber}</p>
          <p className="font-mono text-xs text-muted-foreground">{row.vin}</p>
        </div>
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
      header: "Service Type",
      accessor: (row) => (
        <Badge variant="secondary" className="text-xs">
          {row.serviceType.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      header: "Priority",
      accessor: (row) => {
        const priorityColors: Record<string, string> = {
          low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
          normal: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
          high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
          urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        };
        return (
          <Badge
            variant="outline"
            className={`border-0 text-xs ${priorityColors[row.priority || "normal"]}`}
          >
            {(row.priority || "normal").charAt(0).toUpperCase() + (row.priority || "normal").slice(1)}
          </Badge>
        );
      },
    },
    {
      header: "Technician",
      accessor: (row) => row.technicianName || "-",
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const actions: Action<JobCard>[] = [
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
      label: "Start Work",
      onClick: (row) => console.log("Start", row.id),
      icon: <Wrench className="h-4 w-4" />,
    },
  ];

  const filteredJobCards = jobCards?.filter(
    (jobCard) =>
      jobCard.vehicleNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      jobCard.jobNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      jobCard.customerName.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">
            Job Cards
          </h1>
          <p className="text-muted-foreground">
            Manage service requests and job cards
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-job-card">
              <Plus className="mr-2 h-4 w-4" />
              New Job Card
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Job Card</DialogTitle>
              <DialogDescription>
                Enter vehicle and service details to create a new job card.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="vehicleNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., MH 12 AB 1234"
                            {...field}
                            data-testid="input-vehicle-number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VIN</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter VIN number"
                            {...field}
                            className="font-mono"
                            data-testid="input-vin"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter customer name"
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
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-service-type">
                              <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {serviceTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
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
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-priority">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {priorities.map((priority) => (
                              <SelectItem key={priority.value} value={priority.value}>
                                {priority.label}
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
                    name="complaints"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Complaints / Issues</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the customer's complaints or issues..."
                            className="min-h-[100px]"
                            {...field}
                            data-testid="input-complaints"
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
                    data-testid="button-submit-job-card"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Job Card"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{counts.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <Wrench className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{counts.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{counts.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Priority
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {jobCards?.filter((j) => j.priority === "high" || j.priority === "urgent").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={filteredJobCards || []}
        actions={actions}
        searchPlaceholder="Search job cards..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        isLoading={isLoading}
        emptyMessage="No job cards found. Create a new job card to get started."
        testIdPrefix="job-cards"
      />
    </div>
  );
}
