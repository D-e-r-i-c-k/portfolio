"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

export function CartContents() {
  const { items, removeItem, totalZAR } = useCart();

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground">
        Your cart is empty.{" "}
        <Link href="/galleries" className="text-primary underline-offset-4 hover:underline">
          Browse galleries
        </Link>{" "}
        to add photos.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="flex gap-4 py-4 first:pt-0">
            <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
              <Image
                src={item.previewImageUrl}
                alt={item.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {item.title}
              </p>
              <p className="text-sm text-muted-foreground">R {item.price}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => removeItem(item.id)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <div className="border-t border-border pt-4">
        <p className="flex justify-between text-lg font-semibold text-foreground">
          <span>Total (ZAR)</span>
          <span>R {totalZAR}</span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Checkout will be added in the next step (PayFast/Stripe).
        </p>
      </div>
    </div>
  );
}
