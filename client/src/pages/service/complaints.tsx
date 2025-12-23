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
import { complaintFieldMap } from "@/data/fieldMaps";
import { dataGateway } from "@/data/dataService";
import { Plus, AlertTriangle } from "lucide-react";
import type { Complaint } from "@shared/schema";

export default function ComplaintsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: complaints = [], isLoading } = useQuery<Complaint[]>({
    queryKey: ["/api/complaints"],
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => dataGateway.complaints.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      setIsDialogOpen(false);
      toast({ title: "Complaint registered successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
            <AlertTriangle className="h-8 w-8" />
            Complaint Management
          </h1>
          <p className="text-muted-foreground">
            Track and resolve customer complaints
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-register-complaint">
              <Plus className="mr-2 h-4 w-4" />
              Register Complaint
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Complaint</DialogTitle>
            </DialogHeader>
            <DynamicForm
              fieldMap={complaintFieldMap}
              onSubmit={handleCreate}
              isLoading={createMutation.isPending}
              submitLabel="Register Complaint"
            />
          </DialogContent>
        </Dialog>
      </div>

      <EntityTable
        data={complaints}
        fieldMap={complaintFieldMap}
        isLoading={isLoading}
        onEdit={(row) => {
          toast({ title: "Edit complaint", description: `Editing ${row.complaintNumber}` });
        }}
        actions={[
          {
            label: "Escalate",
            onClick: (row) => {
              toast({ title: "Escalated", description: `Complaint ${row.complaintNumber} escalated` });
            },
          },
          {
            label: "Resolve",
            onClick: (row) => {
              toast({ title: "Resolved", description: `Complaint ${row.complaintNumber} marked as resolved` });
            },
          },
        ]}
      />
    </div>
  );
}
