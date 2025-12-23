import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { UserRole } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Car,
  Wrench,
  Package,
  Shield,
  Users,
  TrendingUp,
  ClipboardList,
  Phone,
  IndianRupee,
  Settings,
  LayoutDashboard,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface DashboardData {
  stats: {
    totalBookings: number;
    pendingDeliveries: number;
    activeJobCards: number;
    monthlyRevenue: number;
    bookingsTrend: number;
    deliveriesTrend: number;
    serviceTrend: number;
    revenueTrend: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    time: string;
  }>;
}

function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    [UserRole.HO_SUPER_ADMIN]: "Head Office Super Admin",
    [UserRole.HO_SALES_ADMIN]: "HO Sales Admin",
    [UserRole.HO_SERVICE_ADMIN]: "HO Service Admin",
    [UserRole.HO_FINANCE_ADMIN]: "HO Finance Admin",
    [UserRole.DEALER_PRINCIPAL]: "Dealer Principal",
    [UserRole.DEALER_SALES_EXECUTIVE]: "Sales Executive",
    [UserRole.SERVICE_MANAGER]: "Service Manager",
    [UserRole.TECHNICIAN]: "Technician",
    [UserRole.CRM_EXECUTIVE]: "CRM Executive",
    [UserRole.FINANCE_EXECUTIVE]: "Finance Executive",
    [UserRole.CUSTOMER]: "Customer",
  };
  return roleNames[role] || role;
}

function QuickAccessCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  stats 
}: { 
  title: string; 
  description: string; 
  icon: React.ComponentType<{ className?: string }>; 
  href: string;
  stats?: { label: string; value: string | number; trend?: "up" | "down" | "neutral" };
}) {
  return (
    <Link href={href}>
      <Card className="group cursor-pointer transition-all hover-elevate">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </CardHeader>
        <CardContent>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="mt-1 text-sm">{description}</CardDescription>
          {stats && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-2xl font-bold">{stats.value}</span>
              <span className="text-sm text-muted-foreground">{stats.label}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function StatCard({ 
  title, 
  value, 
  trend, 
  icon: Icon,
  status 
}: { 
  title: string; 
  value: string | number; 
  trend?: number;
  icon: React.ComponentType<{ className?: string }>;
  status?: "success" | "warning" | "error";
}) {
  const statusColors = {
    success: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    warning: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
    error: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${status ? statusColors[status] : "bg-primary/10"}`}>
          <Icon className={`h-6 w-6 ${status ? "" : "text-primary"}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {trend !== undefined && (
          <Badge variant={trend >= 0 ? "default" : "secondary"} className="text-xs">
            {trend >= 0 ? "+" : ""}{trend}%
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  
  const { data: dashboardData } = useQuery<DashboardData>({
    queryKey: ["/api/home/dashboard", user?.role],
    enabled: !!user,
  });

  if (!user) {
    return null;
  }

  const role = user.role;

  const renderHOSuperAdminDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Dealers" value={dashboardData?.stats?.totalBookings || 12} icon={Users} trend={5} />
        <StatCard title="Active Users" value={156} icon={Users} trend={12} />
        <StatCard title="System Health" value="98%" icon={CheckCircle} status="success" />
        <StatCard title="Pending Approvals" value={8} icon={Clock} status="warning" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <QuickAccessCard
          title="Dealer Management"
          description="View and manage all dealers"
          icon={Users}
          href="/admin/dealers"
        />
        <QuickAccessCard
          title="User & Roles"
          description="Manage users and permissions"
          icon={Settings}
          href="/admin/users"
        />
        <QuickAccessCard
          title="Reports & Analytics"
          description="View performance reports"
          icon={TrendingUp}
          href="/finance"
        />
        <QuickAccessCard
          title="Audit Logs"
          description="View system activity logs"
          icon={ClipboardList}
          href="/admin/settings"
        />
        <QuickAccessCard
          title="System Settings"
          description="Configure system parameters"
          icon={Settings}
          href="/admin/settings"
        />
        <QuickAccessCard
          title="Dashboard Overview"
          description="View overall metrics"
          icon={LayoutDashboard}
          href="/"
        />
      </div>
    </div>
  );

  const renderDealerPrincipalDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Bookings" value={dashboardData?.stats?.totalBookings || 0} icon={Car} trend={dashboardData?.stats?.bookingsTrend} />
        <StatCard title="Pending Deliveries" value={dashboardData?.stats?.pendingDeliveries || 0} icon={Package} trend={dashboardData?.stats?.deliveriesTrend} />
        <StatCard title="Active Job Cards" value={dashboardData?.stats?.activeJobCards || 0} icon={Wrench} trend={dashboardData?.stats?.serviceTrend} />
        <StatCard title="Monthly Revenue" value={`Rs${((dashboardData?.stats?.monthlyRevenue || 0) / 1000).toFixed(0)}K`} icon={IndianRupee} trend={dashboardData?.stats?.revenueTrend} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <QuickAccessCard
          title="Dashboard"
          description="View detailed analytics"
          icon={LayoutDashboard}
          href="/"
        />
        <QuickAccessCard
          title="User Management"
          description="Manage your team"
          icon={Users}
          href="/admin/users"
        />
        <QuickAccessCard
          title="Sales Overview"
          description="View sales performance"
          icon={TrendingUp}
          href="/sales/bookings"
        />
        <QuickAccessCard
          title="Service Summary"
          description="View service metrics"
          icon={Wrench}
          href="/service/job-cards"
        />
        <QuickAccessCard
          title="Finance Summary"
          description="View financial reports"
          icon={IndianRupee}
          href="/finance"
        />
        <QuickAccessCard
          title="Reports"
          description="Generate reports"
          icon={ClipboardList}
          href="/finance"
        />
      </div>
    </div>
  );

  const renderSalesExecutiveDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="My Bookings" value={dashboardData?.stats?.totalBookings || 0} icon={Car} trend={dashboardData?.stats?.bookingsTrend} />
        <StatCard title="Test Rides Today" value={3} icon={Car} status="success" />
        <StatCard title="Pending Follow-ups" value={5} icon={Phone} status="warning" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickAccessCard
          title="Dashboard"
          description="View your metrics"
          icon={LayoutDashboard}
          href="/"
        />
        <QuickAccessCard
          title="Bookings"
          description="Manage vehicle bookings"
          icon={ClipboardList}
          href="/sales/bookings"
        />
        <QuickAccessCard
          title="Test Rides"
          description="Schedule and log test rides"
          icon={Car}
          href="/sales/test-rides"
        />
        <QuickAccessCard
          title="Leads"
          description="Manage your leads"
          icon={Users}
          href="/crm"
        />
      </div>
    </div>
  );

  const renderServiceManagerDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Job Cards" value={dashboardData?.stats?.activeJobCards || 0} icon={Wrench} trend={dashboardData?.stats?.serviceTrend} />
        <StatCard title="Pending Warranty" value={2} icon={Shield} status="warning" />
        <StatCard title="Low Stock Spares" value={5} icon={Package} status="error" />
        <StatCard title="Today's Appointments" value={8} icon={Clock} status="success" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickAccessCard
          title="Dashboard"
          description="View service metrics"
          icon={LayoutDashboard}
          href="/"
        />
        <QuickAccessCard
          title="Job Cards"
          description="Manage service jobs"
          icon={Wrench}
          href="/service/job-cards"
        />
        <QuickAccessCard
          title="Warranty Claims"
          description="Submit warranty claims"
          icon={Shield}
          href="/warranty"
        />
        <QuickAccessCard
          title="Spare Requests"
          description="View spare parts"
          icon={Package}
          href="/spares"
        />
        <QuickAccessCard
          title="Battery Health"
          description="Monitor battery status"
          icon={AlertCircle}
          href="/service/battery-health"
        />
      </div>
    </div>
  );

  const renderTechnicianDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="My Assigned Jobs" value={3} icon={Wrench} status="success" />
        <StatCard title="Pending Uploads" value={1} icon={Clock} status="warning" />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>My Jobs</CardTitle>
          <CardDescription>Your assigned service jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Link href="/service/job-cards">
              <Button className="w-full" data-testid="button-view-my-jobs">
                View My Assigned Jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCRMDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Leads" value={45} icon={Users} trend={8} />
        <StatCard title="Today's Follow-ups" value={12} icon={Phone} status="warning" />
        <StatCard title="Lost Sales" value={3} icon={AlertCircle} status="error" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <QuickAccessCard
          title="Leads"
          description="Manage customer leads"
          icon={Users}
          href="/crm"
        />
        <QuickAccessCard
          title="Follow-ups"
          description="Schedule follow-ups"
          icon={Phone}
          href="/crm"
        />
        <QuickAccessCard
          title="Lost Sales"
          description="Track lost opportunities"
          icon={TrendingUp}
          href="/crm"
        />
      </div>
    </div>
  );

  const renderFinanceDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Pending Receivables" value="Rs 2.5L" icon={IndianRupee} status="warning" />
        <StatCard title="Invoices Due" value={15} icon={ClipboardList} status="warning" />
        <StatCard title="Monthly Collection" value="Rs 12L" icon={TrendingUp} trend={15} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <QuickAccessCard
          title="Receivables"
          description="Track pending payments"
          icon={IndianRupee}
          href="/finance"
        />
        <QuickAccessCard
          title="Invoices"
          description="Manage invoices"
          icon={ClipboardList}
          href="/finance"
        />
        <QuickAccessCard
          title="GST Reports"
          description="View tax reports"
          icon={TrendingUp}
          href="/finance"
        />
      </div>
    </div>
  );

  const renderDashboardByRole = () => {
    switch (role) {
      case UserRole.HO_SUPER_ADMIN:
      case UserRole.HO_SALES_ADMIN:
      case UserRole.HO_SERVICE_ADMIN:
      case UserRole.HO_FINANCE_ADMIN:
        return renderHOSuperAdminDashboard();
      case UserRole.DEALER_PRINCIPAL:
        return renderDealerPrincipalDashboard();
      case UserRole.DEALER_SALES_EXECUTIVE:
        return renderSalesExecutiveDashboard();
      case UserRole.SERVICE_MANAGER:
        return renderServiceManagerDashboard();
      case UserRole.TECHNICIAN:
        return renderTechnicianDashboard();
      case UserRole.CRM_EXECUTIVE:
        return renderCRMDashboard();
      case UserRole.FINANCE_EXECUTIVE:
        return renderFinanceDashboard();
      default:
        return renderDealerPrincipalDashboard();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" data-testid="text-welcome">
          Welcome, {user.username}
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>Logged in as</span>
          <Badge variant="secondary">{getRoleDisplayName(role)}</Badge>
        </div>
      </div>

      {renderDashboardByRole()}
    </div>
  );
}
