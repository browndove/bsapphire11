import ShadcnLoginForm from "@/components/Auth/ShadcnLoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login - Candidate Dashboard",
  description: "Login to access the candidate management dashboard",
  // other metadata
};

const SigninPage = () => {
  return (
    <>
      <ShadcnLoginForm />
    </>
  );
};

export default SigninPage;
