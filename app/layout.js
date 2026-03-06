import "./globals.css";

export const metadata = {
  title: "School Result System",
  description: "Automated result compilation for primary schools",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
