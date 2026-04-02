import "./globals.css";

export const metadata = {
  title: "UniSphere Portfolio",
  description: "Dynamic Achievement Portfolio & Admin Desk"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}