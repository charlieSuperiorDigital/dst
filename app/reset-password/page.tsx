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
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/authorization/PasswordResetTempCode`,
        { email: values.email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast({
          title: "Reset Code Sent",
          description:
            "If an account exists with this email, you will receive a password reset code.",
        });
        // Store the email in the URL state for the next step
        router.push(`/reset-password/${values.email}`);
      } else {
        throw new Error("Failed to send reset code");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Request Failed",
        description: "An error occurred while processing your request.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto border border-gray-200 rounded-lg shadow-lg bg-white p-6">
      <h1 className="text-3xl font-bold mb-6">Reset Password</h1>
      <p className="text-gray-600 mb-6">
        Please enter your email address to reset your password. We&apos;ll send
        you an email with instructions on how to reset your password.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full">
              Send Reset Code
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
