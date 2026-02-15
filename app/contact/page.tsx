export const metadata = {
  title: "Contact | Photography",
  description: "Get in touch for bookings and print enquiries.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display mb-6 text-3xl font-semibold tracking-tight text-foreground">
        Contact
      </h1>
      <p className="text-muted-foreground">
        Contact form will be connected to Formspree. For now, add your form
        endpoint to <code className="rounded bg-muted px-1.5 py-0.5 text-sm">.env.local</code> as{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm">NEXT_PUBLIC_FORMSPREE_ENDPOINT</code>.
      </p>
    </div>
  );
}
