import Header from "@/components/header/header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>
  <Header />
  {children}
  </>;
}
