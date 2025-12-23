import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  ShoppingCart,
  Wrench,
  Package,
  Shield,
  Users,
  BarChart3,
  Settings,
  Building2,
  FileText,
  Car,
  Truck,
  ClipboardList,
  AlertCircle,
  UserCog,
  Bike,
  Battery,
  MessageSquare,
  LogOut,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Module, type ModuleType } from "@shared/schema";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: string;
  module?: ModuleType;
}

interface NavGroup {
  label: string;
  module: ModuleType;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Sales",
    module: Module.SALES,
    items: [
      { title: "Bookings", url: "/sales/bookings", icon: FileText, badge: "12" },
      { title: "Deliveries", url: "/sales/deliveries", icon: Truck },
      { title: "Stock", url: "/sales/stock", icon: Car },
      { title: "Test Rides", url: "/sales/test-rides", icon: Bike },
    ],
  },
  {
    label: "Service",
    module: Module.SERVICE,
    items: [
      { title: "Job Cards", url: "/service/job-cards", icon: ClipboardList, badge: "8" },
      { title: "Service History", url: "/service/history", icon: Wrench },
      { title: "Battery Health", url: "/service/battery-health", icon: Battery },
      { title: "Complaints", url: "/service/complaints", icon: MessageSquare },
    ],
  },
  {
    label: "Spare Parts",
    module: Module.SPARES,
    items: [
      { title: "Inventory", url: "/spares", icon: Package },
    ],
  },
  {
    label: "Warranty",
    module: Module.WARRANTY,
    items: [
      { title: "Claims", url: "/warranty", icon: Shield },
    ],
  },
  {
    label: "CRM",
    module: Module.CRM,
    items: [
      { title: "Leads", url: "/crm", icon: Users },
    ],
  },
  {
    label: "Finance",
    module: Module.FINANCE,
    items: [
      { title: "Dashboard", url: "/finance", icon: BarChart3 },
    ],
  },
  {
    label: "Admin",
    module: Module.ADMIN,
    items: [
      { title: "Dealers", url: "/admin/dealers", icon: Building2 },
      { title: "Users", url: "/admin/users", icon: UserCog },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ],
  },
];

const roleLabels: Record<string, string> = {
  ho_super_admin: "HO Super Admin",
  ho_sales_admin: "HO Sales Admin",
  ho_service_admin: "HO Service Admin",
  ho_finance_admin: "HO Finance Admin",
  dealer_principal: "Dealer Principal",
  dealer_sales_exec: "Sales Executive",
  service_manager: "Service Manager",
  technician: "Technician",
  crm_executive: "CRM Executive",
  finance_executive: "Finance Executive",
  customer: "Customer",
};

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, canAccessModule, logout } = useAuth();

  const isActive = (url: string) => {
    if (url === "/") return location === "/";
    return location.startsWith(url);
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const visibleGroups = navGroups.filter(group => 
    isAuthenticated && canAccessModule(group.module)
  );

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <AlertCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight">ZFORCE</span>
            <span className="text-xs text-muted-foreground">DMS Platform</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/")}>
                  <Link href="/" data-testid="nav-dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link 
                        href={item.url} 
                        data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4">
        {isAuthenticated && user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-md bg-sidebar-accent p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {roleLabels[user.role] || user.role}
                </span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2" 
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        ) : (
          <Button 
            variant="default" 
            className="w-full" 
            onClick={() => setLocation("/login")}
            data-testid="button-login"
          >
            Login
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
