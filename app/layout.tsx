import type { Metadata } from "next";
import { Sora, Space_Grotesk } from "next/font/google";
import { AppProvider } from "@/components/providers/app-provider";
import "@/app/globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "LocalWeight",
  description: "Local-first weight tracker with achievements and leveling"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sora.variable} ${spaceGrotesk.variable}`}>
        <AppProvider>
          <main className="mx-auto min-h-screen max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
