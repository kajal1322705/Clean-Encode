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
import { warrantyClaimFieldMap } from "@/data/fieldMaps";
import { dataGateway } from "@/data/dataService";
import { Plus, Shield } from "lucide-react";
import type { WarrantyClaim } from "@shared/schema";

export default function WarrantyClaimsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: claims = [], isLoading } = useQuery<WarrantyClaim[]>({
    queryKey: ["/api/warranty-claims"],
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => dataGateway.warrantyClaims.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warranty-claims"] });
      setIsDialogOpen(false);
      toast({ title: "Warranty claim submitted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreate = (data: Record<string, unknown>) => {
    createMutation.mutate({ ...data, dealerId: "dealer-1" });
  };

  const pendingClaims = claims.filter((c) => c.status === "pending" || c.status === "under_review");

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight" data-testid="text-page-title">
            <Shield className="h-8 w-8" />
            Warranty Claims
          </h1>
          <p className="text-muted-foreground">
            Submit and track warranty claims
            {pendingClaims.length > 0 && (
              <span className="ml-2 text-yellow-600 dark:text-yellow-400 font-medium">
                ({pendingClaims.length} pending review)
              </span>
            )}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-submit-claim">
              <Plus className="mr-2 h-4 w-4" />
              Submit Claim
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Warranty Claim</DialogTitle>
            </DialogHeader>
            <DynamicForm
              fieldMap={warrantyClaimFieldMap}
              onSubmit={handleCreate}
              isLoading={createMutation.isPending}
              submitLabel="Submit Claim"
            />
          </DialogContent>
        </Dialog>
      </div>

      <EntityTable
        data={claims}
        fieldMap={warrantyClaimFieldMap}
        isLoading={isLoading}
        onEdit={(row) => {
          toast({ title: "Edit claim", description: `Editing ${row.claimNumber}` });
        }}
        actions={[
          {
            label: "View Details",
            onClick: (row) => {
              toast({ title: "Viewing", description: `Claim ${row.claimNumber}` });
            },
          },
          {
            label: "Upload Evidence",
            onClick: (row) => {
              toast({ title: "Upload", description: `Adding evidence for ${row.claimNumber}` });
            },
          },
        ]}
      />
    </div>
  );
}
