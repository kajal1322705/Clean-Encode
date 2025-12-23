import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@shared/schema";
import { Loader2, Zap } from "lucide-react";
import { useState } from "react";

const roleOptions = [
  { value: UserRole.HO_SUPER_ADMIN, label: "HO Super Admin" },
  { value: UserRole.HO_SALES_ADMIN, label: "HO Sales Admin" },
  { value: UserRole.HO_SERVICE_ADMIN, label: "HO Service Admin" },
  { value: UserRole.HO_FINANCE_ADMIN, label: "HO Finance Admin" },
  { value: UserRole.DEALER_PRINCIPAL, label: "Dealer Principal" },
  { value: UserRole.DEALER_SALES_EXECUTIVE, label: "Sales Executive" },
  { value: UserRole.SERVICE_MANAGER, label: "Service Manager" },
  { value: UserRole.TECHNICIAN, label: "Technician" },
  { value: UserRole.CRM_EXECUTIVE, label: "CRM Executive" },
  { value: UserRole.FINANCE_EXECUTIVE, label: "Finance Executive" },
  { value: UserRole.CUSTOMER, label: "Customer" },
];

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.string().min(1, "Role is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      role: UserRole.DEALER_PRINCIPAL,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const success = await login(data.username, data.password, data.role);
      if (success) {
        toast({ title: "Login successful" });
        setLocation("/");
      } else {
        toast({
          title: "Login failed",
          description: "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: string, label: string) => {
    form.setValue("username", "demo");
    form.setValue("password", "demo123");
    form.setValue("role", role);
    toast({ title: `${label} credentials filled`, description: "Click Login to continue" });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access the system
        </CardDescription>
      </CardHeader>
      <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username / Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        {...field}
                        data-testid="input-username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        data-testid="input-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Login As</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-role">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map((option) => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value}
                            data-testid={`option-role-${option.value}`}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>
            </form>
          </Form>

          <div className="mt-6 space-y-3">
            <p className="text-center text-sm text-muted-foreground">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin(UserRole.HO_SUPER_ADMIN, "HO Admin")}
                data-testid="button-demo-ho"
              >
                HO Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin(UserRole.DEALER_PRINCIPAL, "Dealer")}
                data-testid="button-demo-dealer"
              >
                Dealer
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin(UserRole.SERVICE_MANAGER, "Service Mgr")}
                data-testid="button-demo-service"
              >
                Service Mgr
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin(UserRole.TECHNICIAN, "Technician")}
                data-testid="button-demo-tech"
              >
                Technician
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Demo: Use any username/password with selected role
            </p>
          </div>
        </CardContent>
      </Card>
  );
}
