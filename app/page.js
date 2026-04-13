import "./globals.css";

export const metadata = {
  title: "EasyAcad \u2014 Result Processing Made Effortless",
  description: "Automated report card and broadsheet generation for Nigerian primary and secondary schools. Enter scores once, get finished results in minutes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}