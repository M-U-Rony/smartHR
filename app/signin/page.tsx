import type { Metadata } from "next";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign In | SmartHR",
  description: "Sign in to your SmartHR account.",
};

export default function SigninPage() {
  return <AuthForm mode="signin" />;
}
