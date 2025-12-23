import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FileText,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from "recharts";
import type { Booking, Dealer } from "@shared/schema";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: typeof IndianRupee;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1 text-sm">
          {changeType === "positive" ? (
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          ) : changeType === "negative" ? (
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          ) : null}
          <span
            className={
              changeType === "positive"
                ? "text-green-600"
                : changeType === "negative"
                ? "text-red-600"
                : "text-muted-foreground"
            }
          >
            {change}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FinanceDashboardPage() {
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: dealers = [], isLoading: dealersLoading } = useQuery<Dealer[]>({
    queryKey: ["/api/dealers"],
  });

  const isLoading = bookingsLoading || dealersLoading;

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.bookingAmount || 0), 0);
  const pendingPayments = bookings
    .filter((b) => b.status === "pending" || b.status === "confirmed")
    .reduce((sum, b) => sum + (b.bookingAmount || 0), 0);
  const completedSales = bookings.filter((b) => b.status === "delivered").length;

  const monthlyData = [
    { month: "Jul", revenue: 4500000, target: 5000000 },
    { month: "Aug", revenue: 5200000, target: 5000000 },
    { month: "Sep", revenue: 4800000, target: 5500000 },
    { month: "Oct", revenue: 6100000, target: 5500000 },
    { month: "Nov", revenue: 5800000, target: 6000000 },
    { month: "Dec", revenue: totalRevenue || 5500000, target: 6000000 },
  ];

  const paymentModeData = [
    { name: "Cash", value: 35 },
    { name: "Finance", value: 45 },
    { name: "Card/UPI", value: 20 },
  ];

  const dealerPerformance = dealers.slice(0, 5).map((d, i) => ({
    name: d.name,
    sales: Math.floor(Math.random() * 50) + 10,
    revenue: Math.floor(Math.random() * 5000000) + 1000000,
  }));

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight" data-testid="text-page-title">
            <BarChart3 className="h-8 w-8" />
            Finance & MIS
          </h1>
          <p className="text-muted-foreground">
            Financial reports, analytics, and insights
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" data-testid="button-filter-date">
            <Calendar className="mr-2 h-4 w-4" />
            This Month
          </Button>
          <Button variant="outline" data-testid="button-export-report">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            change="+12.5% from last month"
            changeType="positive"
            icon={IndianRupee}
          />
          <StatCard
            title="Pending Payments"
            value={formatCurrency(pendingPayments)}
            change={`${bookings.filter((b) => b.status === "pending").length} bookings`}
            changeType="neutral"
            icon={CreditCard}
          />
          <StatCard
            title="Completed Sales"
            value={completedSales.toString()}
            change="+8% from last month"
            changeType="positive"
            icon={TrendingUp}
          />
          <StatCard
            title="Active Dealers"
            value={dealers.filter((d) => d.status === "active").length.toString()}
            change={`of ${dealers.length} total`}
            changeType="neutral"
            icon={FileText}
          />
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="dealers" data-testid="tab-dealers">Dealer Performance</TabsTrigger>
          <TabsTrigger value="payments" data-testid="tab-payments">Payment Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue vs Target</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis
                        tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
                        className="text-xs"
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          borderColor: "hsl(var(--border))",
                        }}
                      />
                      <Bar dataKey="revenue" fill="hsl(var(--chart-1))" name="Revenue" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="target" fill="hsl(var(--chart-2))" name="Target" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Mode Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={paymentModeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {paymentModeData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dealers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Performing Dealers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dealerPerformance.map((dealer, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium">{dealer.name}</p>
                        <p className="text-sm text-muted-foreground">{dealer.sales} vehicles sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(dealer.revenue)}</p>
                      <Badge variant="secondary" className="text-xs">
                        {((dealer.revenue / totalRevenue) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Trend (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis
                      tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        borderColor: "hsl(var(--border))",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-1))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
