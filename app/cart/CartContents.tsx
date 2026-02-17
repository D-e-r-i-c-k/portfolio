"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ProtectedImage } from "@/components/gallery/ProtectedImage";
import { Loader2, ShoppingCart } from "lucide-react";

export function CartContents() {
  const { items, removeItem, clearCart, totalZAR } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleCheckout = useCallback(async () => {
    setCheckingOut(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            title: item.title,
            price: item.price,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Checkout failed");
      }

      const { fields, actionUrl } = await res.json();

      // Clear cart before redirect
      clearCart();

      // Build and auto-submit a hidden form to PayFast
      const form = formRef.current;
      if (!form) return;

      form.action = actionUrl;
      form.innerHTML = "";

      for (const [key, value] of Object.entries(fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      }

      form.submit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setCheckingOut(false);
    }
  }, [items, clearCart]);

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
              <ProtectedImage
                src={item.previewImageUrl}
                alt={item.title}
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
              disabled={checkingOut}
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

        {error && (
          <p className="mt-3 text-sm text-destructive">{error}</p>
        )}

        <Button
          type="button"
          className="mt-4 w-full gap-2"
          onClick={handleCheckout}
          disabled={checkingOut}
        >
          {checkingOut ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting to PayFast…
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Checkout — R {totalZAR}
            </>
          )}
        </Button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Secure payment via PayFast. Cards, EFT, and SnapScan accepted.
        </p>
      </div>

      {/* Hidden form for PayFast redirect */}
      <form ref={formRef} method="POST" className="hidden" />
    </div>
  );
}
