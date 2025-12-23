import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Package, TruckIcon, CheckCircle } from "lucide-react";
import type { Inventory } from "@shared/schema";

export default function StockPage() {
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: inventory, isLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const getStockCounts = () => {
    if (!inventory) return { total: 0, inTransit: 0, inStock: 0, allocated: 0 };
    return {
      total: inventory.length,
      inTransit: inventory.filter((i) => i.status === "in_transit").length,
      inStock: inventory.filter((i) => i.status === "in_stock").length,
      allocated: inventory.filter((i) => i.status === "allocated").length,
    };
  };

  const counts = getStockCounts();

  const columns: Column<Inventory>[] = [
    {
      header: "VIN",
      accessor: (row) => (
        <span className="font-mono text-sm">{row.vin}</span>
      ),
    },
    {
      header: "Model",
      accessor: (row) => (
        <div>
          <p className="font-medium">{row.model}</p>
          <p className="text-xs text-muted-foreground">{row.variant}</p>
        </div>
      ),
    },
    {
      header: "Color",
      accessor: "color",
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Arrival Date",
      accessor: (row) =>
        row.arrivalDate
          ? new Date(row.arrivalDate).toLocaleDateString()
          : "-",
    },
  ];

  const filteredInventory = inventory?.filter((item) => {
    const matchesSearch =
      item.vin.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.model.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.color.toLowerCase().includes(searchValue.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "in_transit" && item.status === "in_transit") ||
      (activeTab === "in_stock" && item.status === "in_stock") ||
      (activeTab === "allocated" && item.status === "allocated");

    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">
            Vehicle Stock
          </h1>
          <p className="text-muted-foreground">
            Track vehicle inventory and allocation status
          </p>
        </div>
        <Button variant="outline" data-testid="button-request-allocation">
          Request Allocation
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Stock
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{counts.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Transit
            </CardTitle>
            <TruckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{counts.inTransit}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Stock
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{counts.inStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Allocated
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{counts.allocated}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="stock-tabs">
          <TabsTrigger value="all" data-testid="tab-all">
            All ({counts.total})
          </TabsTrigger>
          <TabsTrigger value="in_transit" data-testid="tab-in-transit">
            In Transit ({counts.inTransit})
          </TabsTrigger>
          <TabsTrigger value="in_stock" data-testid="tab-in-stock">
            In Stock ({counts.inStock})
          </TabsTrigger>
          <TabsTrigger value="allocated" data-testid="tab-allocated">
            Allocated ({counts.allocated})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <DataTable
            columns={columns}
            data={filteredInventory || []}
            searchPlaceholder="Search by VIN, model, or color..."
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            isLoading={isLoading}
            emptyMessage="No vehicles found in this category."
            testIdPrefix="stock"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
