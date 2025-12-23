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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { testRideFieldMap } from "@/data/fieldMaps";
import { getStatusClass } from "@/data/fieldMapper";
import { dataGateway } from "@/data/dataService";
import { Plus, Car, Calendar, User, Phone } from "lucide-react";
import type { TestRide } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function TestRidesPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: testRides = [], isLoading } = useQuery<TestRide[]>({
    queryKey: ["/api/test-rides"],
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => dataGateway.testRides.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/test-rides"] });
      setIsDialogOpen(false);
      toast({ title: "Test ride scheduled successfully" });
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
            <Car className="h-8 w-8" />
            Test Ride Logbook
          </h1>
          <p className="text-muted-foreground">
            Schedule and track customer test rides
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-schedule-test-ride">
              <Plus className="mr-2 h-4 w-4" />
              Schedule Test Ride
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Schedule Test Ride</DialogTitle>
            </DialogHeader>
            <DynamicForm
              fieldMap={testRideFieldMap}
              onSubmit={handleCreate}
              isLoading={createMutation.isPending}
              submitLabel="Schedule"
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : testRides.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No test rides scheduled yet</p>
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              Schedule First Test Ride
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testRides.map((ride) => (
            <Card key={ride.id} className="hover-elevate" data-testid={`card-test-ride-${ride.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{ride.vehicleModel}</CardTitle>
                  <Badge className={cn("capitalize", getStatusClass(ride.status))}>
                    {ride.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{ride.customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{ride.customerPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(ride.scheduledDate).toLocaleString("en-IN")}</span>
                </div>
                {ride.salesperson && (
                  <div className="text-sm text-muted-foreground">
                    Salesperson: {ride.salesperson}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Complete
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
