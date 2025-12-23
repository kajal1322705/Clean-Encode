import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
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
  UserCog,
  Bike,
  Battery,
  Phone,
  LogOut,
  User,
  Zap,
  IndianRupee,
  TrendingUp,
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
import { UserRole } from "@shared/schema";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

function getRoleNavigation(role: string): NavGroup[] {
  switch (role) {
    case UserRole.HO_SUPER_ADMIN:
      return [
        {
          label: "Governance",
          items: [
            { title: "Dealers", url: "/admin/dealers", icon: Building2 },
            { title: "Users & Roles", url: "/admin/users", icon: UserCog },
            { title: "Reports", url: "/finance", icon: BarChart3 },
            { title: "Audit Logs", url: "/admin/settings", icon: ClipboardList },
            { title: "System Settings", url: "/admin/settings", icon: Settings },
          ],
        },
      ];
    
    case UserRole.HO_SALES_ADMIN:
      return [
        {
          label: "Sales Oversight",
          items: [
            { title: "Dealers", url: "/admin/dealers", icon: Building2 },
            { title: "Bookings (View)", url: "/sales/bookings", icon: FileText },
            { title: "Stock", url: "/sales/stock", icon: Car },
            { title: "Reports", url: "/finance", icon: BarChart3 },
          ],
        },
      ];

    case UserRole.HO_SERVICE_ADMIN:
      return [
        {
          label: "Service Oversight",
          items: [
            { title: "Dealers", url: "/admin/dealers", icon: Building2 },
            { title: "Job Cards (View)", url: "/service/job-cards", icon: ClipboardList },
            { title: "Warranty (View)", url: "/warranty", icon: Shield },
            { title: "Reports", url: "/finance", icon: BarChart3 },
          ],
        },
      ];

    case UserRole.HO_FINANCE_ADMIN:
      return [
        {
          label: "Finance Oversight",
          items: [
            { title: "Dealers", url: "/admin/dealers", icon: Building2 },
            { title: "Receivables", url: "/finance", icon: IndianRupee },
            { title: "Reports", url: "/finance", icon: BarChart3 },
          ],
        },
      ];

    case UserRole.DEALER_PRINCIPAL:
      return [
        {
          label: "Management",
          items: [
            { title: "Users", url: "/admin/users", icon: UserCog },
          ],
        },
        {
          label: "Overview",
          items: [
            { title: "Sales (View)", url: "/sales/bookings", icon: FileText },
            { title: "Service (View)", url: "/service/job-cards", icon: ClipboardList },
            { title: "Finance (View)", url: "/finance", icon: BarChart3 },
            { title: "Reports", url: "/finance", icon: TrendingUp },
          ],
        },
      ];

    case UserRole.DEALER_SALES_EXECUTIVE:
      return [
        {
          label: "Sales",
          items: [
            { title: "Bookings", url: "/sales/bookings", icon: FileText, badge: "12" },
            { title: "Test Rides", url: "/sales/test-rides", icon: Bike },
            { title: "Leads", url: "/crm", icon: Users },
          ],
        },
      ];

    case UserRole.SERVICE_MANAGER:
      return [
        {
          label: "Service",
          items: [
            { title: "Job Cards", url: "/service/job-cards", icon: ClipboardList, badge: "8" },
            { title: "Warranty", url: "/warranty", icon: Shield },
            { title: "Spare Requests", url: "/spares", icon: Package },
            { title: "Battery Health", url: "/service/battery-health", icon: Battery },
          ],
        },
      ];

    case UserRole.TECHNICIAN:
      return [
        {
          label: "My Work",
          items: [
            { title: "My Jobs", url: "/service/job-cards", icon: Wrench },
          ],
        },
      ];

    case UserRole.CRM_EXECUTIVE:
      return [
        {
          label: "CRM",
          items: [
            { title: "Leads", url: "/crm", icon: Users },
            { title: "Follow-ups", url: "/crm", icon: Phone },
          ],
        },
      ];

    case UserRole.FINANCE_EXECUTIVE:
      return [
        {
          label: "Finance",
          items: [
            { title: "Receivables", url: "/finance", icon: IndianRupee },
            { title: "Invoices", url: "/finance", icon: FileText },
            { title: "GST Reports", url: "/finance", icon: BarChart3 },
          ],
        },
      ];

    case UserRole.CUSTOMER:
      return [
        {
          label: "My Account",
          items: [
            { title: "My Bookings", url: "/sales/bookings", icon: Car },
            { title: "Service History", url: "/service/history", icon: Wrench },
          ],
        },
      ];

    default:
      return [];
  }
}

const roleLabels: Record<string, string> = {
  [UserRole.HO_SUPER_ADMIN]: "HO Super Admin",
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

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (url: string) => {
    if (url === "/") return location === "/";
    return location.startsWith(url);
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const navGroups = user ? getRoleNavigation(user.role) : [];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
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
                  <Link href="/" data-testid="nav-home">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title + item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link 
                        href={item.url} 
                        data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}`}
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
