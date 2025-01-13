"use server";

import { cookies } from "next/headers";

export async function login(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Email and password are required" };
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (email.includes("@")) {
    const cookieStore = await cookies();
    cookieStore.set("user", email, { secure: true, httpOnly: true });
    return {
      success: true,
      message: "Login successful",
      redirectUrl: "/dashboard",
    };
  } else {
    return { success: false, message: "Invalid email or password" };
  }
}
