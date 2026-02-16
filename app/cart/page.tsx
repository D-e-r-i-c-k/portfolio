import Link from "next/link";
import { CartContents } from "./CartContents";

export const metadata = {
  title: "Cart | Photography",
  description: "Your selected photos. Proceed to checkout to purchase.",
};

export default function CartPage() {
  return (
    <div className="animate-fade-in-up mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/galleries"
        className="mb-8 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        ← Continue shopping
      </Link>
      <h1 className="font-display mb-8 text-3xl font-semibold tracking-tight text-foreground">
        Your cart
      </h1>
      <CartContents />
    </div>
  );
}
