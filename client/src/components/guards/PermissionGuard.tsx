import { type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { type ModuleType, type PermissionType } from "@shared/schema";
import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface ModuleGuardProps {
  module: ModuleType;
  children: ReactNode;
  fallback?: ReactNode;
}

export function ModuleGuard({ module, children, fallback }: ModuleGuardProps) {
  const { canAccessModule, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return (
      <AccessDenied 
        title="Authentication Required"
        message="Please log in to access this page."
        showLoginButton
        onLogin={() => setLocation("/login")}
      />
    );
  }

  if (!canAccessModule(module)) {
    return fallback || (
      <AccessDenied 
        title="Access Denied"
        message="You do not have permission to access this module."
      />
    );
  }

  return <>{children}</>;
}

interface PermissionGuardProps {
  module: ModuleType;
  permission: PermissionType;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ module, permission, children, fallback }: PermissionGuardProps) {
  const { canPerformAction } = useAuth();

  if (!canPerformAction(module, permission)) {
    return fallback || null;
  }

  return <>{children}</>;
}

interface AccessDeniedProps {
  title: string;
  message: string;
  showLoginButton?: boolean;
  onLogin?: () => void;
}

function AccessDenied({ title, message, showLoginButton, onLogin }: AccessDeniedProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>
          <div className="flex gap-2 justify-center">
            {showLoginButton && onLogin && (
              <Button onClick={onLogin} data-testid="button-login-redirect">
                Go to Login
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => setLocation("/")}
              data-testid="button-go-home"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function usePermission(module: ModuleType, permission: PermissionType): boolean {
  const { canPerformAction } = useAuth();
  return canPerformAction(module, permission);
}

export function useModuleAccess(module: ModuleType): boolean {
  const { canAccessModule } = useAuth();
  return canAccessModule(module);
}
