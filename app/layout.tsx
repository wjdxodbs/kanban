import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RegisterServiceWorker } from "@/shared/pwa/register-sw";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "칸반 보드",
    template: "%s | 칸반 보드",
  },
  description: "할 일, 진행 중, 완료를 한눈에 관리하는 개인용 칸반 보드",
  applicationName: "칸반 보드",
  manifest: "/manifest.webmanifest",
  keywords: ["칸반", "할 일 관리", "업무 관리", "To Do", "Kanban"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "칸반 보드",
    description: "할 일, 진행 중, 완료를 한눈에 관리하는 개인용 칸반 보드",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary",
    title: "칸반 보드",
    description: "할 일, 진행 중, 완료를 한눈에 관리하는 개인용 칸반 보드",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
