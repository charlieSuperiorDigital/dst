"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import axios from "axios";

const formSchema = z.object({
  tempcode: z.string().min(1, "Reset code is required"),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  passwordconfirm: z.string(),
}).refine((data) => data.password === data.passwordconfirm, {
  message: "Passwords don't match",
  path: ["passwordconfirm"],
});

type FormValues = z.infer<typeof formSchema>;

export default function ResetPasswordConfirmPage({ params }: { params: { email: string } }) {
  const router = useRouter();
  const email = decodeURIComponent(params.email);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tempcode: "",
      password: "",
      passwordconfirm: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/authorization/PasswordReset`,
        {
          email,
          tempcode: values.tempcode,
          password: values.password,
          passwordconfirm: values.passwordconfirm,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast({
          title: "Password Reset Successful",
          description: "Your password has been reset successfully.",
        });
        router.push("/");
      } else {
        throw new Error("Failed to reset password");
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Reset Failed",
        description: error.response?.data || "An error occurred while resetting your password.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto border border-gray-200 rounded-lg shadow-lg bg-white p-6">
      <h1 className="text-3xl font-bold mb-6">Reset Password</h1>
      <p className="text-gray-600 mb-6">
        Enter the reset code sent to your email and your new password.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="tempcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reset Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter reset code"
                    {...field}
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
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passwordconfirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full">
              Reset Password
            </Button>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Return to Login
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 