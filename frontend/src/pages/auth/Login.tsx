import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { httpService } from "@/services";
import { API_METHODS } from "@/enums/common.enum";
import { ENDPOINTS } from "@/constants";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long")
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    const response = await httpService<any>(
      API_METHODS.POST,
      ENDPOINTS.login,
      data
    );
    console.log("response -->", response);
    const token = response.data.token;
    console.log("token -->", token);
  };

  return (
    <section className="flex items-center justify-center h-[calc(100vh-6rem)] min-h-full w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card className="w-full md:w-[350px] xl:w-[400px] h-fit">
          <CardHeader>
            <CardTitle className="font-asgrike font-medium text-4xl text-center mb-5">NeuSentra</CardTitle>
            <CardTitle className="text-xl">Login</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your email"
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
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
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </section>
  );
}
