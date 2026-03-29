import Link from "next/link";

/**
 * Footer with social link placeholders. Replace href="#" with your actual URLs.
 */
export function Footer() {
  const socialLinks = [
    { label: "Instagram", href: "#" },
    { label: "Strava", href: "#" }
  ];

  return (
    <footer className="bg-white py-12 md:py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 px-6 md:flex-row md:px-12">
        <span className="heading text-sm font-medium text-[#231F20]">Grex</span>
        <nav className="flex items-center gap-6" aria-label="Footer links">
          {/* Public legal page for user transparency and compliance requirements. */}
          <Link href="/privacy" className="text-sm text-[#6B6B6B] transition hover:text-[#231F20]">
            Privacy Policy
          </Link>
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-[#6B6B6B] transition hover:text-[#231F20]"
              aria-label={link.label}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
