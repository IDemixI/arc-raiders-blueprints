import "./globals.css";

export const metadata = {
  title: "ARC Raiders • Blueprints",
  description: "Fan-made Blueprints Tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
