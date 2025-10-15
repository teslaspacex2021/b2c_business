export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Override the root layout's structure to remove Header and Footer
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
