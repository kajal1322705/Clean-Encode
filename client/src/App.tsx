import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Dashboard from "@/pages/dashboard";
import BookingsPage from "@/pages/sales/bookings";
import DeliveriesPage from "@/pages/sales/deliveries";
import StockPage from "@/pages/sales/stock";
import JobCardsPage from "@/pages/service/job-cards";
import ServiceHistoryPage from "@/pages/service/history";
import PlaceholderPage from "@/pages/placeholder";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/sales/bookings" component={BookingsPage} />
      <Route path="/sales/deliveries" component={DeliveriesPage} />
      <Route path="/sales/stock" component={StockPage} />
      <Route path="/service/job-cards" component={JobCardsPage} />
      <Route path="/service/history" component={ServiceHistoryPage} />
      <Route path="/spares">
        {() => <PlaceholderPage title="Spare Parts" description="Manage spare parts inventory, orders, and stock analysis." />}
      </Route>
      <Route path="/warranty">
        {() => <PlaceholderPage title="Warranty Claims" description="Track and manage warranty claims and approvals." />}
      </Route>
      <Route path="/crm">
        {() => <PlaceholderPage title="CRM & Leads" description="Manage leads, follow-ups, and sales funnel." />}
      </Route>
      <Route path="/finance">
        {() => <PlaceholderPage title="Finance & MIS" description="View financial reports, incentives, and analytics." />}
      </Route>
      <Route path="/admin/dealers">
        {() => <PlaceholderPage title="Dealer Management" description="Manage dealer profiles and configurations." />}
      </Route>
      <Route path="/admin/users">
        {() => <PlaceholderPage title="User Management" description="Manage users, roles, and permissions." />}
      </Route>
      <Route path="/admin/settings">
        {() => <PlaceholderPage title="System Settings" description="Configure system-wide settings and preferences." />}
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
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
