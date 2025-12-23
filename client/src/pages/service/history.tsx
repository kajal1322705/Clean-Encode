import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import type { JobCard } from "@shared/schema";

export default function ServiceHistoryPage() {
  const [searchValue, setSearchValue] = useState("");

  const { data: jobCards, isLoading } = useQuery<JobCard[]>({
    queryKey: ["/api/job-cards"],
  });

  const completedJobCards = jobCards?.filter((j) => j.status === "completed");

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
      accessor: (row) => row.serviceType.replace(/_/g, " "),
    },
    {
      header: "Technician",
      accessor: (row) => row.technicianName || "-",
    },
    {
      header: "Completed Date",
      accessor: (row) =>
        row.completedAt
          ? new Date(row.completedAt).toLocaleDateString()
          : "-",
    },
    {
      header: "Total Cost",
      accessor: (row) => {
        const total = (row.laborCost || 0) + (row.partsCost || 0);
        return total > 0 ? `₹${total.toLocaleString()}` : "-";
      },
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const filteredHistory = completedJobCards?.filter(
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
            Service History
          </h1>
          <p className="text-muted-foreground">
            View completed service records
          </p>
        </div>
        <Button variant="outline" data-testid="button-export">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredHistory || []}
        actions={[
          {
            label: "View Details",
            onClick: (row) => console.log("View", row.id),
            icon: <Eye className="h-4 w-4" />,
          },
        ]}
        searchPlaceholder="Search service history..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        isLoading={isLoading}
        emptyMessage="No completed service records found."
        testIdPrefix="service-history"
      />
    </div>
  );
}
