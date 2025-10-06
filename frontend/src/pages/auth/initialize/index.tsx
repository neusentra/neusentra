import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { zodResolver } from "@hookform/resolvers/zod";
import { ENDPOINTS } from '@/constants/api-routes';
import { API_METHODS } from '@/enums/common.enum';
import { Button } from '@/components/ui/button';
import type { IUserPermissions } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useForm } from "react-hook-form";
import { httpService } from '@/services';
import { useAuth } from '@/providers';
import { toast } from 'sonner';
import { z } from 'zod';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const loginSchema = z
  .object({
    fullname: z
      .string()
      .min(4, "Full Name must be at least 4 characters long")
      .max(25, "Full Name must be at most 25 characters long"),
    username: z
      .string()
      .min(4, "Username must be at least 4 characters long")
      .max(20, "Username must be at most 20 characters long"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(16, "Password must be at most 16 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[\W_]/, "Password must contain at least one special character"),
    confirmPassword: z
      .string()
      .min(8, "Confirm Password must be at least 8 characters long")
      .max(16, "Password must be at most 16 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginResponse {
  accessToken: string;
  permissions: IUserPermissions;
}

export const InitializePage: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { setUserDataFromToken, isAuthenticated, isInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated || isInitialized) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, isInitialized, navigate])

  const onSubmit = async (superAdminData: LoginFormData) => {
    const { data, success, error, message } = await httpService<LoginResponse>(
      API_METHODS.POST,
      ENDPOINTS.AUTH.INITIALIZE,
      superAdminData
    );

    if (success && data) setUserDataFromToken(data.accessToken, data.permissions);

    if (error) toast.error(message)
  };

  return (
    <section className="flex items-center justify-center h-[calc(100vh-6rem)] min-h-full w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card className="w-full md:w-[350px] xl:w-[400px] h-fit">
          <CardHeader>
            <CardTitle className="font-asgrike font-medium text-4xl text-center mb-5">
              NeuSentra
            </CardTitle>
            <CardTitle className="text-xl">Create your account</CardTitle>
            <CardDescription>Setup a master account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input
                id="fullname"
                type="text"
                placeholder="Enter your full name"
                {...register("fullname")}
                aria-invalid={errors.fullname ? "true" : "false"}
              />
              {errors.fullname && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.fullname.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                {...register("username")}
                aria-invalid={errors.username ? "true" : "false"}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                aria-invalid={errors.password ? "true" : "false"}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                {...register("confirmPassword")}
                aria-invalid={errors.confirmPassword ? "true" : "false"}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Initializing..." : "Create Account"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </section>
  );
};
