import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { UserProvider } from "@/contexts/UserContext";
import { ProfileModalProvider } from "@/contexts/ProfileModalContext";
import { PostHogProvider } from "@/components/PostHogProvider";
import { ConditionalHeader } from "@/components/ConditionalHeader";
import { ProfileModal } from "@/components/ProfileModal";

// PolymathDisp is the only font used site-wide (replaces Manrope + Cormorant Garamond)
const polymath = localFont({
  src: [
    { path: "../public/fonts/PolymathDisp-Regular.ttf", weight: "400" },
    { path: "../public/fonts/PolymathDisp-Medium.ttf", weight: "500" },
    { path: "../public/fonts/PolymathDisp-Semibold.ttf", weight: "600" },
    { path: "../public/fonts/PolymathDisp-Bold.ttf", weight: "700" }
  ],
  variable: "--font-polymath"
});

// Site-wide SEO and social previews — keep in sync when the product tagline changes.
export const metadata: Metadata = {
  title: "Grex | A better home for your training",
  description:
    "Grex is a premium physical journal built from your activity history. One journal. Your history. Made to be kept.",
  openGraph: {
    title: "Grex | A better home for your training",
    description:
      "Grex is a premium physical journal built from your activity history. One journal. Your history. Made to be kept.",
    siteName: "Grex",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Grex | A better home for your training",
    description:
      "Grex is a premium physical journal built from your activity history. One journal. Your history. Made to be kept."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={polymath.variable}>
      <body>
        <UserProvider>
          <PostHogProvider>
            <ProfileModalProvider>
            <AuthModalProvider>
              <ConditionalHeader />
              {children}
            </AuthModalProvider>
            <ProfileModal />
          </ProfileModalProvider>
          </PostHogProvider>
        </UserProvider>
      </body>
    </html>
  );
}
