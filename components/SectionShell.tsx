import { ReactNode } from "react";

type SectionShellProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function SectionShell({ children, className = "", id }: SectionShellProps) {
  return (
    <section
      id={id}
      className={`relative mx-auto w-full max-w-6xl px-6 py-24 md:px-12 md:py-32 ${className}`}
    >
      {children}
    </section>
  );
}
