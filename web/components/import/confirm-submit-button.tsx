"use client";

// Destructive-confirm wrapper for the import wizard's "Remove" submit
// buttons (History's trip Remove, Sites step's Remove site, Trees step's
// Remove tree) -- design-audit item 4: browser-native `confirm()`, no new
// deps, no AlertDialog. Renders as the form's actual submit button (same
// `type="submit"`/`formAction`/hidden-field wiring the caller already has)
// so nothing about the form's action or field names changes -- this only
// intercepts the click to ask for confirmation first.
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

interface ConfirmSubmitButtonProps extends ComponentProps<typeof Button> {
  message: string;
}

export function ConfirmSubmitButton({ message, onClick, children, ...props }: ConfirmSubmitButtonProps) {
  return (
    <Button
      type="submit"
      onClick={(e) => {
        if (!confirm(message)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
