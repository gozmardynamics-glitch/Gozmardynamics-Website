import * as React from "react";
// Next.js App Router layout — wraps admin shell. For Vite, use this as root App.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f0f1f5] text-[#1d1d1f] antialiased">
        {children}
      </body>
    </html>
  );
}
