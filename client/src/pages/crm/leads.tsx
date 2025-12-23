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
import { leadFieldMap } from "@/data/fieldMaps";
import { dataGateway } from "@/data/dataService";
import { Plus, Users } from "lucide-react";
import type { Lead } from "@shared/schema";

export default function LeadsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => dataGateway.leads.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setIsDialogOpen(false);
      toast({ title: "Lead created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      dataGateway.leads.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({ title: "Lead updated successfully" });
    },
  });

  const handleCreate = (data: Record<string, unknown>) => {
    createMutation.mutate({ ...data, dealerId: "dealer-1" });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight" data-testid="text-page-title">
            <Users className="h-8 w-8" />
            Lead Management
          </h1>
          <p className="text-muted-foreground">
            Track and manage customer leads from all sources
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-lead">
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
            </DialogHeader>
            <DynamicForm
              fieldMap={leadFieldMap}
              onSubmit={handleCreate}
              isLoading={createMutation.isPending}
              submitLabel="Create Lead"
            />
          </DialogContent>
        </Dialog>
      </div>

      <EntityTable
        data={leads}
        fieldMap={leadFieldMap}
        isLoading={isLoading}
        onEdit={(row) => {
          toast({ title: "Edit lead", description: `Editing ${row.name}` });
        }}
        actions={[
          {
            label: "Schedule Follow-up",
            onClick: (row) => {
              toast({ title: "Follow-up scheduled", description: `For ${row.name}` });
            },
          },
          {
            label: "Convert to Booking",
            onClick: (row) => {
              toast({ title: "Converting", description: `${row.name} to booking` });
            },
          },
        ]}
      />
    </div>
  );
}
