import { ContactForm } from "@/components/ContactForm";

export const metadata = {
  title: "Contact | Photography",
  description:
    "Get in touch for bookings, print enquiries, or any questions about photography services in South Africa.",
};

export default function ContactPage() {
  return (
    <div className="animate-fade-in-up mx-auto max-w-xl px-6 py-12">
      <h1 className="font-display mb-4 text-3xl font-semibold tracking-tight text-foreground">
        Get in touch
      </h1>
      <p className="mb-8 text-muted-foreground">
        Whether you&apos;re looking for event coverage, want to purchase prints, or have
        a question — I&apos;d love to hear from you.
      </p>
      <ContactForm />
    </div>
  );
}
