import type { Metadata } from "next";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign Up | SmartHR",
  description: "Create a SmartHR account.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
