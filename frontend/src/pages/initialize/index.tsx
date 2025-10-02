import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React from 'react'
import { z } from "zod";
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
import { useAuth } from "@/providers";


const loginSchema = z.object({
    username: z.string()
        .min(4, "Username must be at least 4 characters long")
        .max(20, "Username must be at most 20 characters long"),
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .max(16, "Password must be at most 16 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[\W_]/, "Password must contain at least one special character"),
    confirmPassword: z.string()
        .min(8, "Confirm Password must be at least 8 characters long")
        .max(16, "Password must be at most 16 characters long")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});


type LoginFormData = z.infer<typeof loginSchema>;

interface LoginResponse {
    accessToken: string;
}

export const InitializePage: React.FC = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });
    
    const { setUserDataFromToken } = useAuth();
    
    const onSubmit = async (data: LoginFormData) => {
        const response = await httpService<LoginResponse>(
            API_METHODS.POST,
            ENDPOINTS.login,
            data
        );

        const token = response.data.accessToken;
        setUserDataFromToken(token, false);
    };


    return (
        <section className="flex items-center justify-center h-[calc(100vh-6rem)] min-h-full w-full">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Card className="w-full md:w-[350px] xl:w-[400px] h-fit">
                    <CardHeader>
                        <CardTitle className="font-asgrike font-medium text-4xl text-center mb-5">NeuSentra</CardTitle>
                        <CardTitle className="text-xl">Create your account</CardTitle>
                        <CardDescription>Setup a master account</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                {...register("username")}
                                aria-invalid={errors.username ? "true" : "false"}
                            />
                            {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>}
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
                                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Creating account..." : "Create Account"}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </section>
    );
}
