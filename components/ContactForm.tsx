"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type FormStatus = "idle" | "submitting" | "success" | "error";

const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<FormStatus>("idle");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = "Name is required.";
        if (!email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!validateEmail(email.trim())) {
            newErrors.email = "Please enter a valid email address.";
        }
        if (!message.trim()) newErrors.message = "Message is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [name, email, message]);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!validate()) return;

            setStatus("submitting");
            try {
                const res = await fetch(
                    FORMSPREE_ENDPOINT
                        ? `https://formspree.io/f/${FORMSPREE_ENDPOINT}`
                        : "/api/contact-placeholder",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Accept: "application/json" },
                        body: JSON.stringify({
                            name: name.trim(),
                            email: email.trim(),
                            message: message.trim(),
                        }),
                    }
                );
                if (res.ok) {
                    setStatus("success");
                    setName("");
                    setEmail("");
                    setMessage("");
                    setErrors({});
                } else {
                    setStatus("error");
                }
            } catch {
                setStatus("error");
            }
        },
        [name, email, message, validate]
    );

    if (!FORMSPREE_ENDPOINT) {
        return (
            <div className="rounded-lg border border-border bg-muted/50 p-6 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Contact form not configured</p>
                <p className="mt-2">
                    To enable the contact form, add your Formspree form ID to{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">.env.local</code> as{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">NEXT_PUBLIC_FORMSPREE_ENDPOINT</code>.
                </p>
                <p className="mt-1">
                    Create a free form at{" "}
                    <a
                        href="https://formspree.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                        formspree.io
                    </a>
                    .
                </p>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-muted/30 p-10 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
                <h2 className="font-display text-xl font-semibold text-foreground">
                    Message sent
                </h2>
                <p className="text-muted-foreground">
                    Thank you for getting in touch. I&apos;ll get back to you as soon as possible.
                </p>
                <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => setStatus("idle")}
                >
                    Send another message
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Name */}
            <div>
                <label
                    htmlFor="contact-name"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                >
                    Name
                </label>
                <input
                    id="contact-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    className={`block w-full rounded-md border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${errors.name ? "border-destructive" : "border-input"
                        }`}
                    placeholder="Your name"
                />
                {errors.name && (
                    <p className="mt-1.5 text-sm text-destructive">{errors.name}</p>
                )}
            </div>

            {/* Email */}
            <div>
                <label
                    htmlFor="contact-email"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                >
                    Email
                </label>
                <input
                    id="contact-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    className={`block w-full rounded-md border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${errors.email ? "border-destructive" : "border-input"
                        }`}
                    placeholder="you@example.com"
                />
                {errors.email && (
                    <p className="mt-1.5 text-sm text-destructive">{errors.email}</p>
                )}
            </div>

            {/* Message */}
            <div>
                <label
                    htmlFor="contact-message"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                >
                    Message
                </label>
                <textarea
                    id="contact-message"
                    rows={5}
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) setErrors((prev) => ({ ...prev, message: "" }));
                    }}
                    className={`block w-full resize-y rounded-md border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${errors.message ? "border-destructive" : "border-input"
                        }`}
                    placeholder="How can I help? Tell me about your event, print request, or question."
                />
                {errors.message && (
                    <p className="mt-1.5 text-sm text-destructive">{errors.message}</p>
                )}
            </div>

            {/* Error banner */}
            {status === "error" && (
                <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <p>Something went wrong. Please try again or email directly.</p>
                </div>
            )}

            {/* Submit */}
            <Button
                type="submit"
                className="w-full gap-2"
                disabled={status === "submitting"}
            >
                {status === "submitting" ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending…
                    </>
                ) : (
                    <>
                        <Send className="h-4 w-4" />
                        Send message
                    </>
                )}
            </Button>
        </form>
    );
}
