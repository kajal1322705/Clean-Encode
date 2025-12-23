import { useQuery } from "@tanstack/react-query";
import { KPICard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  Truck,
  Wrench,
  DollarSign,
  Plus,
  ArrowRight,
  FileText,
  ClipboardList,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Link } from "wouter";
import type { DashboardStats, SalesTrend, ServiceMetrics, Booking, JobCard } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: salesTrend, isLoading: salesLoading } = useQuery<SalesTrend[]>({
    queryKey: ["/api/dashboard/sales-trend"],
  });

  const { data: serviceMetrics, isLoading: serviceLoading } = useQuery<ServiceMetrics[]>({
    queryKey: ["/api/dashboard/service-metrics"],
  });

  const { data: recentBookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings/recent"],
  });

  const { data: activeJobCards, isLoading: jobCardsLoading } = useQuery<JobCard[]>({
    queryKey: ["/api/job-cards/active"],
  });

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of your dealership performance
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild data-testid="button-new-booking">
            <Link href="/sales/bookings">
              <Plus className="mr-2 h-4 w-4" />
              New Booking
            </Link>
          </Button>
          <Button variant="outline" asChild data-testid="button-new-job-card">
            <Link href="/service/job-cards">
              <ClipboardList className="mr-2 h-4 w-4" />
              New Job Card
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="mt-2 h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <KPICard
              title="Total Bookings"
              value={stats?.totalBookings || 0}
              trend={stats?.bookingsTrend}
              trendLabel="vs last month"
              icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
            />
            <KPICard
              title="Pending Deliveries"
              value={stats?.pendingDeliveries || 0}
              trend={stats?.deliveriesTrend}
              trendLabel="vs last month"
              icon={<Truck className="h-4 w-4 text-muted-foreground" />}
            />
            <KPICard
              title="Active Job Cards"
              value={stats?.activeJobCards || 0}
              trend={stats?.serviceTrend}
              trendLabel="vs last month"
              icon={<Wrench className="h-4 w-4 text-muted-foreground" />}
            />
            <KPICard
              title="Monthly Revenue"
              value={`₹${((stats?.monthlyRevenue || 0) / 100000).toFixed(1)}L`}
              trend={stats?.revenueTrend}
              trendLabel="vs last month"
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-1))' }}
                    name="Bookings"
                  />
                  <Line
                    type="monotone"
                    dataKey="deliveries"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-2))' }}
                    name="Deliveries"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Service Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {serviceLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={serviceMetrics}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Bar
                    dataKey="completed"
                    fill="hsl(var(--chart-5))"
                    radius={[4, 4, 0, 0]}
                    name="Completed"
                  />
                  <Bar
                    dataKey="pending"
                    fill="hsl(var(--chart-4))"
                    radius={[4, 4, 0, 0]}
                    name="Pending"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-lg font-medium">Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sales/bookings" data-testid="link-view-all-bookings">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : recentBookings && recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-md p-2 hover-elevate"
                    data-testid={`booking-item-${booking.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{booking.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.vehicleModel} · {booking.bookingNumber}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                No recent bookings
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-lg font-medium">Active Job Cards</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/service/job-cards" data-testid="link-view-all-job-cards">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {jobCardsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : activeJobCards && activeJobCards.length > 0 ? (
              <div className="space-y-4">
                {activeJobCards.slice(0, 5).map((jobCard) => (
                  <div
                    key={jobCard.id}
                    className="flex items-center justify-between rounded-md p-2 hover-elevate"
                    data-testid={`job-card-item-${jobCard.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{jobCard.vehicleNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {jobCard.serviceType} · {jobCard.jobNumber}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={jobCard.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                No active job cards
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link href="/sales/bookings" data-testid="quick-action-new-booking">
                <ShoppingCart className="h-5 w-5" />
                <span>New Booking</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link href="/service/job-cards" data-testid="quick-action-create-job-card">
                <ClipboardList className="h-5 w-5" />
                <span>Create Job Card</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link href="/sales/stock" data-testid="quick-action-check-stock">
                <Truck className="h-5 w-5" />
                <span>Check Stock</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link href="/crm" data-testid="quick-action-add-lead">
                <Plus className="h-5 w-5" />
                <span>Add Lead</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
