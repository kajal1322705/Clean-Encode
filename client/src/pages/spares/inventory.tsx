import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { EntityTable } from "@/components/forms/EntityTable";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { spareFieldMap } from "@/data/fieldMaps";
import { dataGateway } from "@/data/dataService";
import { Plus, Package } from "lucide-react";
import type { Spare } from "@shared/schema";

export default function SpareInventoryPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: spares = [], isLoading } = useQuery<Spare[]>({
    queryKey: ["/api/spares"],
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => dataGateway.spares.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spares"] });
      setIsDialogOpen(false);
      toast({ title: "Spare part added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreate = (data: Record<string, unknown>) => {
    createMutation.mutate({ ...data, dealerId: "dealer-1" });
  };

  const lowStockItems = spares.filter((s) => s.quantity < s.minStock);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight" data-testid="text-page-title">
            <Package className="h-8 w-8" />
            Spare Parts Inventory
          </h1>
          <p className="text-muted-foreground">
            Manage spare parts stock and inventory
            {lowStockItems.length > 0 && (
              <span className="ml-2 text-red-600 dark:text-red-400 font-medium">
                ({lowStockItems.length} items below minimum stock)
              </span>
            )}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-spare">
              <Plus className="mr-2 h-4 w-4" />
              Add Spare Part
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Spare Part</DialogTitle>
            </DialogHeader>
            <DynamicForm
              fieldMap={spareFieldMap}
              onSubmit={handleCreate}
              isLoading={createMutation.isPending}
              submitLabel="Add Part"
            />
          </DialogContent>
        </Dialog>
      </div>

      <EntityTable
        data={spares}
        fieldMap={spareFieldMap}
        isLoading={isLoading}
        onEdit={(row) => {
          toast({ title: "Edit part", description: `Editing ${row.partName}` });
        }}
        actions={[
          {
            label: "Adjust Stock",
            onClick: (row) => {
              toast({ title: "Stock adjustment", description: `Adjusting stock for ${row.partName}` });
            },
          },
          {
            label: "Order More",
            onClick: (row) => {
              toast({ title: "Order initiated", description: `Creating order for ${row.partName}` });
            },
          },
        ]}
      />
    </div>
  );
}
