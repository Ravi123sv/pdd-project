import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NeuroSignal App | Clinical Handheld",
  description: "Mobile clinical node for the NeuroSignal Enterprise AI hub. Real-time patient monitoring and diagnostic telemetry.",
  manifest: "/manifest.json",
  icons: {
      icon: "https://ravi123sv.github.io/pdd-project/assets/icon/app_icon.svg"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
