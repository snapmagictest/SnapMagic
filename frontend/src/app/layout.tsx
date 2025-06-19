import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SnapMagic - AI-Powered Content Creation",
  description: "Transform your selfies with AI at AWS events. Powered by Amazon Bedrock, Rekognition, and Kinesis.",
  keywords: "AWS, AI, Bedrock, Rekognition, Image Transformation, Video Generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
