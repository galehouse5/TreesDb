"use client";

// Pending-aware submit button for the import wizard's server-action forms
// (UX audit 2026-07: no submit anywhere gave pending feedback, and rapid
// clicks fired the action repeatedly -- triple-clicking "Add tree" created
// three trees; the same path could double-Finish a trip). `useFormStatus`
// only observes the ENCLOSING form, so this must sit inside the <form> it
// guards -- page-level buttons that join a form via the `form` attribute
// can't use it.
import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SubmitButton({ children, disabled, ...props }: ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending} aria-busy={pending || undefined} {...props}>
      {pending ? <Loader2Icon className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </Button>
  );
}
