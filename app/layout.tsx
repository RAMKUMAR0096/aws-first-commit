import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

if (!process.env.CLERK_SECRET_KEY) {
  process.env.CLERK_SECRET_KEY = "sk_test_mPkh9FJkAhTBuCMFisNFymJ1vYxxjquPABsFzINFuY";
}
if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_aWRlYWwtbGFiLTk3MTguY2xlcmsuYWNjb3VudHMuZGV2JA";
}

export const metadata: Metadata = {
  title: "AI Career Copilot for Students | Gemini & AWS Powered",
  description:
    "Zero-hallucination AI resume analyzer, skill gap matrix, personalized learning roadmap, grounded interview prep, and AWS DynamoDB application tracker.",
  keywords: ["AI Career Copilot", "Gemini 1.5 Flash", "AWS DynamoDB", "Bharat Builds Hackathon", "Resume Analyzer"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#080c14] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200 min-h-screen flex flex-col">
        <ClerkProvider publishableKey={publishableKey}>
          {children}
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                color: "#f8fafc",
                backdropFilter: "blur(12px)",
              },
            }}
          />
        </ClerkProvider>
      </body>
    </html>
  );
}
