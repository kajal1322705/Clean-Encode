import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable, type Column, type Action } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { Booking } from "@shared/schema";

export default function DeliveriesPage() {
  const [searchValue, setSearchValue] = useState("");

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const deliveryBookings = bookings?.filter(
    (b) => b.status === "confirmed" || b.status === "delivered"
  );

  const pendingCount = deliveryBookings?.filter((b) => b.status === "confirmed").length || 0;
  const completedCount = deliveryBookings?.filter((b) => b.status === "delivered").length || 0;

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
      header: "VIN",
      accessor: (row) =>
        row.vin ? (
          <span className="font-mono text-xs">{row.vin}</span>
        ) : (
          <Badge variant="outline" className="text-xs">Not Assigned</Badge>
        ),
    },
    {
      header: "Expected Delivery",
      accessor: (row) =>
        row.expectedDelivery
          ? new Date(row.expectedDelivery).toLocaleDateString()
          : "-",
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
      label: "Mark Delivered",
      onClick: (row) => console.log("Deliver", row.id),
      icon: <CheckCircle className="h-4 w-4" />,
    },
  ];

  const filteredDeliveries = deliveryBookings?.filter(
    (booking) =>
      booking.customerName.toLowerCase().includes(searchValue.toLowerCase()) ||
      booking.bookingNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      (booking.vin && booking.vin.toLowerCase().includes(searchValue.toLowerCase()))
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">
            Deliveries
          </h1>
          <p className="text-muted-foreground">
            Track and manage vehicle deliveries
          </p>
        </div>
        <Button variant="outline" data-testid="button-export">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Deliveries
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting delivery</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed This Month
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Delayed
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Past expected date</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={filteredDeliveries || []}
        actions={actions}
        searchPlaceholder="Search by customer, booking #, or VIN..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        isLoading={isLoading}
        emptyMessage="No deliveries scheduled."
        testIdPrefix="deliveries"
      />
    </div>
  );
}
