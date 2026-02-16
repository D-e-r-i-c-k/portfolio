import Link from "next/link";
import { HeaderCartLink } from "@/components/HeaderCartLink";
import { MobileNav } from "@/components/MobileNav";

export function Header() {
  return (
    <header className="border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-xl tracking-tight text-foreground">
          Photography
        </Link>
        {/* Desktop nav – hidden on mobile */}
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/events" className="transition-colors hover:text-foreground">
            Events
          </Link>
          <Link href="/galleries" className="transition-colors hover:text-foreground">
            Galleries
          </Link>
          <Link href="/contact" className="transition-colors hover:text-foreground">
            Contact
          </Link>
          <HeaderCartLink />
        </nav>
        {/* Mobile nav – visible on mobile only */}
        <MobileNav />
      </div>
    </header>
  );
}
