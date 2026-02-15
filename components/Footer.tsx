import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/events" className="transition-colors hover:text-foreground">
              Events
            </Link>
            <Link href="/galleries" className="transition-colors hover:text-foreground">
              Galleries
            </Link>
            <Link href="/contact" className="transition-colors hover:text-foreground">
              Contact
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            © {year} Photography. South Africa.
          </p>
        </div>
      </div>
    </footer>
  );
}
