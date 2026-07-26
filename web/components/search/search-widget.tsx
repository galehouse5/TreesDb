"use client";

/**
 * Header search widget (task P1-09, deliverable 3). Self-contained client
 * component -- debounced fetch to `/search` in AJAX mode
 * (`X-Requested-With: XMLHttpRequest`, `app/search/route.ts`), rendering
 * Category/Subject/Description links exactly like the legacy `_MenuWidget`
 * partial (`SearchController.MenuWidget`, `TMD/Views/Search/
 * _MenuWidget.cshtml`) did.
 *
 * Wrapped in `<form action="/search" method="get">` (design-audit item 6a)
 * so the SAME GET contract `route.ts` already serves works with no client
 * JS at all -- pressing Enter (or, with JS disabled, the browser's implicit
 * single-field submission) navigates to the canonical `/search?term=...`
 * results page. The AJAX dropdown is a progressive enhancement layered on
 * top; picking a suggestion follows its own `<Link href>` and never touches
 * form submission.
 *
 * A11Y (code-audit finding): the dropdown previously had no combobox
 * semantics or keyboard support at all -- mouse-only. This now follows the
 * ARIA 1.2 combobox-with-listbox-popup pattern: the input carries
 * role="combobox"/aria-expanded/aria-controls/aria-activedescendant, the
 * list carries role="listbox" with id'd role="option" children, and
 * ArrowDown/ArrowUp move a visually-highlighted "active" option (scrolled
 * into view), Enter follows the active option's own link (via
 * `router.push`, pre-empting the plain-GET form submission described
 * above), and Escape closes the popup. A polite `aria-live` region
 * announces the result count as it changes, since the visual dropdown
 * appearing is otherwise silent to screen readers.
 */
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SearchResultJson {
  Category: string;
  Subject: string;
  Description: string;
  Url: string;
}

const DEBOUNCE_MS = 250;

export function SearchWidget() {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchResultJson[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
  const listboxId = useId();

  // Empty-term reset happens in the input's onChange handler (below), not
  // here -- calling setState synchronously and unconditionally at the top
  // of an effect body is a react-hooks/set-state-in-effect lint error
  // ("cascading renders"). This effect only performs the actual
  // external-system interaction (the debounced fetch); it's a no-op for an
  // empty term.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = term.trim();
    if (trimmed.length === 0) return;
    debounceRef.current = setTimeout(() => {
      const requestId = ++requestIdRef.current;
      fetch(`/search?term=${encodeURIComponent(trimmed)}`, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      })
        .then((res) => (res.ok ? (res.json() as Promise<SearchResultJson[]>) : []))
        .then((data) => {
          if (requestId !== requestIdRef.current) return; // stale response, ignore
          setResults(Array.isArray(data) ? data : []);
          setOpen(true);
          // A fresh result set invalidates whatever option was previously
          // highlighted -- start from "nothing active" rather than carrying
          // a stale index into a differently-shaped list. Set alongside
          // setResults/setOpen (not in a separate effect keyed on them,
          // which would be a synchronous setState-in-effect/"cascading
          // renders" lint error -- same reasoning as the empty-term reset
          // above) since this IS the one place a new result set is born.
          setActiveIndex(-1);
        })
        .catch(() => {
          if (requestId === requestIdRef.current) setResults([]);
        });
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [term]);

  // Keep the highlighted option in view as ArrowDown/ArrowUp moves it past
  // the visible edge of the (possibly scrollable) list.
  useEffect(() => {
    if (activeIndex < 0) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Close on any pointer interaction outside the widget (design-audit item
  // 6c). Replaces the old setTimeout(150)-delayed onBlur close, which raced
  // a result link's click event -- the blur fired first and could unmount
  // the list before the click registered. A pointerdown-outside listener
  // never fires for clicks/taps inside the widget, so option selection is
  // never in a race with the close.
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const showListbox = open && results.length > 0;
  const activeOptionId = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      if (results.length === 0) return;
      event.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => (i + 1 >= results.length ? 0 : i + 1));
    } else if (event.key === "ArrowUp") {
      if (results.length === 0) return;
      event.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => (i - 1 < 0 ? results.length - 1 : i - 1));
    } else if (event.key === "Enter") {
      if (showListbox && activeIndex >= 0 && results[activeIndex]) {
        // Follow the highlighted suggestion's own link instead of letting
        // the native GET form submission fire -- same destination-picking
        // behavior a mouse click on that option would have.
        event.preventDefault();
        router.push(results[activeIndex].Url);
        setOpen(false);
      }
      // Else: fall through to the form's plain GET submission (no-JS
      // fallback contract, see file header) -- no active option to follow.
    } else if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
      }
    }
  }

  // sm:flex-1 sm:basis-64 (header-balance review 2026-07): plain
  // `w-full max-w-sm` gave this flex item a 100%-of-container preferred
  // width, wrapping the whole header to a second 105px row across the
  // 640-880px band while /search's twin (flex: 1 1 16rem) stayed on one
  // line. A 16rem basis keeps it inline down to ~700px.
  return (
    <div ref={containerRef} className="relative w-full min-w-0 max-w-sm sm:w-auto sm:flex-1 sm:basis-64">
      <form action="/search" method="get" role="search" className="relative">
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          name="term"
          value={term}
          onChange={(e) => {
            const value = e.target.value;
            setTerm(value);
            if (value.trim().length === 0) {
              requestIdRef.current++; // invalidate any in-flight request
              setResults([]);
              setOpen(false);
              setActiveIndex(-1);
            }
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search sites, states, species…"
          aria-label="Search"
          role="combobox"
          aria-expanded={showListbox}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          aria-autocomplete="list"
          autoComplete="off"
          className="h-9 w-full rounded-md border border-transparent bg-white pl-9 pr-3 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus-visible:border-white focus-visible:ring-2 focus-visible:ring-white/70"
        />
      </form>
      {/* Polite live region: the popup's appearance/result count is a purely
          visual event otherwise -- this narrates it for screen readers
          without moving focus. */}
      <div aria-live="polite" className="sr-only">
        {showListbox ? `${results.length} result${results.length === 1 ? "" : "s"} available` : ""}
      </div>
      {showListbox && (
        <ul id={listboxId} role="listbox" className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-lg">
          {results.map((r, i) => {
            const optionId = `${listboxId}-option-${i}`;
            const active = i === activeIndex;
            return (
              <li
                key={`${r.Category}-${r.Url}-${i}`}
                ref={(el) => {
                  optionRefs.current[i] = el;
                }}
                id={optionId}
                role="option"
                aria-selected={active}
                className="border-b border-border last:border-b-0"
              >
                {r.Category === "message" ? (
                  <Link
                    href={r.Url}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cn(
                      "block px-3 py-2 text-center text-sm text-muted-foreground hover:bg-accent",
                      active && "bg-accent",
                      r.Description === "Show more results"
                        ? "border-t bg-muted/50 font-medium not-italic"
                        : "italic",
                    )}
                  >
                    {r.Description}
                  </Link>
                ) : (
                  <Link
                    href={r.Url}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cn("block px-3 py-2 text-sm hover:bg-accent", active && "bg-accent")}
                  >
                    <span className="font-medium text-link">{r.Subject}</span>
                    {r.Description ? <span className="ml-1 text-muted-foreground">{r.Description}</span> : null}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
