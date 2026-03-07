import "./globals.css";
import { ThemeProvider } from "@/lib/ThemeContext";

export const metadata = {
  title: "School Result System",
  description: "Automated result compilation for primary schools",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}