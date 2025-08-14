import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/authContext";
import "./globals.css";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Cashonrails",
  description: "Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
        />
      </head>

      <body className={`${GeistSans.className}`}>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: 'none'
            },
            success: {
              iconTheme: {
                primary: '#05E47A',
                secondary: '#ffffff',
              },
              style: {
                background: '#F0FDFA',
                color: '#0D9488',
                border: '0.7px solid #ffffff',
              }
            },
            error: {
              iconTheme: {
                primary: '#E11D48',
                secondary: '#ffffff',
              },
              style: {
                background: '#FFF1F2',
                color: '#E11D48',
                border: '0.7px solid #E11D48',
              }
            }
          }}
        />

        <AuthProvider>
          <Suspense fallback={<></>}>
            {children}
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
