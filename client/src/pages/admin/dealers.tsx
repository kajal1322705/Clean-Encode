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
import { dealerFieldMap } from "@/data/fieldMaps";
import { dataGateway } from "@/data/dataService";
import { Plus, Building2 } from "lucide-react";
import type { Dealer } from "@shared/schema";

export default function DealerManagementPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: dealers = [], isLoading } = useQuery<Dealer[]>({
    queryKey: ["/api/dealers"],
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => dataGateway.dealers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dealers"] });
      setIsDialogOpen(false);
      toast({ title: "Dealer created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreate = (data: Record<string, unknown>) => {
    createMutation.mutate(data);
  };

  const activeCount = dealers.filter((d) => d.status === "active").length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight" data-testid="text-page-title">
            <Building2 className="h-8 w-8" />
            Dealer Management
          </h1>
          <p className="text-muted-foreground">
            Manage dealer profiles and configurations ({activeCount} active of {dealers.length})
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-dealer">
              <Plus className="mr-2 h-4 w-4" />
              Add Dealer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Dealer</DialogTitle>
            </DialogHeader>
            <DynamicForm
              fieldMap={dealerFieldMap}
              onSubmit={handleCreate}
              isLoading={createMutation.isPending}
              submitLabel="Create Dealer"
            />
          </DialogContent>
        </Dialog>
      </div>

      <EntityTable
        data={dealers}
        fieldMap={dealerFieldMap}
        isLoading={isLoading}
        onEdit={(row) => {
          toast({ title: "Edit dealer", description: `Editing ${row.name}` });
        }}
        actions={[
          {
            label: "View Details",
            onClick: (row) => {
              toast({ title: "Viewing", description: row.name });
            },
          },
          {
            label: "Suspend",
            onClick: (row) => {
              toast({ title: "Suspended", description: `${row.name} has been suspended`, variant: "destructive" });
            },
          },
        ]}
      />
    </div>
  );
}
