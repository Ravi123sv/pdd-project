import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NeuroSignal Enterprise AI | Clinical Workstation",
  description: "The unified high-fidelity workstation for neurologists and cardiologists. Real-time ECG/EEG monitoring, neural logic analysis, and professional clinical archiving.",
  keywords: ["ECG", "EEG", "EMG", "Clinical Workstation", "Medical AI", "Signal Analysis", "NeuroSignal"],
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
