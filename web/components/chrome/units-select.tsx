"use client";

// Design-audit item: legacy's units control was one click (ft | m | yd
// links, no separate submit step). Ours was a <select> + a "Save" button --
// two interactions. This wraps ONLY the <select> in app/layout.tsx's footer
// form to auto-submit on change (form.requestSubmit()), so a single click/
// keystroke is enough again. The surrounding <form action="/api/units"
// method="post"> and its Save button are untouched -- Save stays as the
// no-JS fallback, and the POST contract/option values are unchanged.
import * as React from "react";

export function UnitsSelect(props: React.ComponentPropsWithoutRef<"select">) {
  return (
    <select
      {...props}
      onChange={(e) => {
        e.currentTarget.form?.requestSubmit();
      }}
    />
  );
}
