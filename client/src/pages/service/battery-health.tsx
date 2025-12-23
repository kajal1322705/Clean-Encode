import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Battery, Thermometer, Zap, AlertCircle, Search } from "lucide-react";
import { useState } from "react";
import type { BatteryHealth } from "@shared/schema";
import { cn } from "@/lib/utils";
import { getStatusClass } from "@/data/fieldMapper";

export default function BatteryHealthPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: batteryRecords = [], isLoading } = useQuery<BatteryHealth[]>({
    queryKey: ["/api/battery-health"],
  });

  const filteredRecords = batteryRecords.filter(
    (record) =>
      record.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.batteryId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSohColor = (soh: number | null) => {
    if (!soh) return "text-muted-foreground";
    if (soh >= 80) return "text-green-600 dark:text-green-400";
    if (soh >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getSohProgressColor = (soh: number | null) => {
    if (!soh) return "bg-muted";
    if (soh >= 80) return "bg-green-500";
    if (soh >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight" data-testid="text-page-title">
            <Battery className="h-8 w-8" />
            Battery Health Records
          </h1>
          <p className="text-muted-foreground">
            Monitor battery health and diagnostics for all vehicles
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by VIN or Battery ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-battery"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Battery className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No battery health records found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecords.map((record) => (
            <Card key={record.id} data-testid={`card-battery-${record.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-medium truncate">
                    {record.batteryId}
                  </CardTitle>
                  <Badge className={cn("capitalize", getStatusClass(record.warrantyStatus || "active"))}>
                    {record.warrantyStatus || "Active"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{record.vin}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">State of Health</span>
                    <span className={cn("text-lg font-bold", getSohColor(record.sohPercent))}>
                      {record.sohPercent ?? "--"}%
                    </span>
                  </div>
                  <Progress
                    value={record.sohPercent ?? 0}
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Charge Cycles</p>
                      <p className="font-medium">{record.chargeCycles ?? "--"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Temp Log</p>
                      <p className="font-medium">{record.temperatureLog || "--"}</p>
                    </div>
                  </div>
                </div>

                {record.errorCodes && (
                  <div className="flex items-start gap-2 p-2 rounded-md bg-red-50 dark:bg-red-900/20">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-red-600 dark:text-red-400">Error Codes</p>
                      <p className="text-red-700 dark:text-red-300">{record.errorCodes}</p>
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Last checked: {record.lastChecked ? new Date(record.lastChecked).toLocaleDateString("en-IN") : "--"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
