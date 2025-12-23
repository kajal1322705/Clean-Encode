import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModuleGuard } from "@/components/guards/PermissionGuard";
import { Module } from "@shared/schema";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Dashboard from "@/pages/dashboard";
import BookingsPage from "@/pages/sales/bookings";
import DeliveriesPage from "@/pages/sales/deliveries";
import StockPage from "@/pages/sales/stock";
import TestRidesPage from "@/pages/sales/test-rides";
import JobCardsPage from "@/pages/service/job-cards";
import ServiceHistoryPage from "@/pages/service/history";
import ComplaintsPage from "@/pages/service/complaints";
import BatteryHealthPage from "@/pages/service/battery-health";
import LeadsPage from "@/pages/crm/leads";
import SpareInventoryPage from "@/pages/spares/inventory";
import WarrantyClaimsPage from "@/pages/warranty/claims";
import FinanceDashboardPage from "@/pages/finance/dashboard";
import DealerManagementPage from "@/pages/admin/dealers";
import UserManagementPage from "@/pages/admin/users";
import SettingsPage from "@/pages/admin/settings";
import LoginPage from "@/pages/auth/login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/login" component={LoginPage} />
      <Route path="/sales/bookings">
        <ModuleGuard module={Module.SALES}><BookingsPage /></ModuleGuard>
      </Route>
      <Route path="/sales/deliveries">
        <ModuleGuard module={Module.SALES}><DeliveriesPage /></ModuleGuard>
      </Route>
      <Route path="/sales/stock">
        <ModuleGuard module={Module.SALES}><StockPage /></ModuleGuard>
      </Route>
      <Route path="/sales/test-rides">
        <ModuleGuard module={Module.SALES}><TestRidesPage /></ModuleGuard>
      </Route>
      <Route path="/service/job-cards">
        <ModuleGuard module={Module.SERVICE}><JobCardsPage /></ModuleGuard>
      </Route>
      <Route path="/service/history">
        <ModuleGuard module={Module.SERVICE}><ServiceHistoryPage /></ModuleGuard>
      </Route>
      <Route path="/service/complaints">
        <ModuleGuard module={Module.SERVICE}><ComplaintsPage /></ModuleGuard>
      </Route>
      <Route path="/service/battery-health">
        <ModuleGuard module={Module.SERVICE}><BatteryHealthPage /></ModuleGuard>
      </Route>
      <Route path="/spares">
        <ModuleGuard module={Module.SPARES}><SpareInventoryPage /></ModuleGuard>
      </Route>
      <Route path="/warranty">
        <ModuleGuard module={Module.WARRANTY}><WarrantyClaimsPage /></ModuleGuard>
      </Route>
      <Route path="/crm">
        <ModuleGuard module={Module.CRM}><LeadsPage /></ModuleGuard>
      </Route>
      <Route path="/finance">
        <ModuleGuard module={Module.FINANCE}><FinanceDashboardPage /></ModuleGuard>
      </Route>
      <Route path="/admin/dealers">
        <ModuleGuard module={Module.ADMIN}><DealerManagementPage /></ModuleGuard>
      </Route>
      <Route path="/admin/users">
        <ModuleGuard module={Module.ADMIN}><UserManagementPage /></ModuleGuard>
      </Route>
      <Route path="/admin/settings">
        <ModuleGuard module={Module.ADMIN}><SettingsPage /></ModuleGuard>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="zforce-dms-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <SidebarProvider style={style as React.CSSProperties}>
              <div className="flex h-screen w-full">
                <AppSidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                  <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-4 border-b bg-background px-4">
                    <div className="flex items-center gap-4">
                      <SidebarTrigger data-testid="button-sidebar-toggle" />
                      <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search..."
                          className="w-64 pl-9"
                          data-testid="input-global-search"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" data-testid="button-notifications">
                        <Bell className="h-4 w-4" />
                      </Button>
                      <ThemeToggle />
                    </div>
                  </header>
                  <main className="flex-1 overflow-auto bg-muted/30">
                    <Router />
                  </main>
                </div>
              </div>
            </SidebarProvider>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
