// app/layout.tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css"; // ඔබේ Tailwind CSS මෙහි import කරන්න

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "UniSphere | Portal",
  description: "Advanced Tutor Booking System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${jakarta.className} antialiased selection:bg-indigo-100`}>
        {children}
      </body>
    </html>
  );
}