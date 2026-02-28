import { FloatingHeader } from "@/components/FloatingHeader";

export default function AccountLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FloatingHeader />
      {children}
    </>
  );
}
