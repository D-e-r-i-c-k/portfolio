import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Payment Successful | Photography",
    description: "Your payment was successful. Thank you for your purchase.",
};

export default function CheckoutSuccessPage() {
    return (
        <div className="animate-fade-in-up mx-auto flex max-w-lg flex-col items-center px-6 py-20 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h1 className="font-display mt-6 text-3xl font-semibold tracking-tight text-foreground">
                Payment successful!
            </h1>
            <p className="mt-4 text-muted-foreground">
                Thank you for your purchase. You will receive your photos shortly.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
                Secure download links for your full-resolution photos will be available soon.
            </p>
            <div className="mt-8 flex gap-4">
                <Button asChild>
                    <Link href="/galleries">Browse more galleries</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/">Go home</Link>
                </Button>
            </div>
        </div>
    );
}
