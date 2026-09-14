'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import { anchoredMotion, anchoredMotionReduced, type Side } from './motion';
import { useControllable } from './useControllable';
import styles from './Tooltip.module.css';

/* ────────────────────────────────────────────────────────────────────────────
 * Tooltip — Design System, strona „Tooltip” (node 671:207): kontener bg-component,
 * radius 8, cień Light/Elevation/tooltip, tekst 12/20 Medium. Typy z Figmy (Text,
 * Shortcut, Return, Graph, Items, Address, Breadcrumbs) różnią się tylko treścią.
 *
 * SPECYFIKACJA ANIMACJI — w Figmie brak animacji; propozycja we wspólnym stylu
 * (components/motion.ts, przepis anchoredMotion — ten sam co menu, z dowolnej strony):
 *
 * Pojawienie się (najechanie — po 400 ms; fokus z klawiatury — od razu):
 *   opacity : 0 → 1                  | 200 ms, cubic-bezier(0.22, 1, 0.36, 1)
 *   x / y   : 2 px bliżej elementu → 0 | 250 ms, ta sama krzywa
 *   scale   : 0.98 → 1               | 250 ms; transform-origin: krawędź przy elemencie
 *
 * Zniknięcie (zjechanie kursorem — po 100 ms, blur, Esc, kliknięcie elementu):
 *   wszystkie właściwości wracają do wartości startowych | 150 ms, cubic-bezier(0.4, 0, 1, 1)
 *
 * Przejście na sąsiedni element, gdy tooltip jest otwarty albo zamknął się < 300 ms temu:
 *   kolejny tooltip pojawia się bez opóźnienia 400 ms (animacja ta sama); naraz otwarty jest jeden
 *
 * prefers-reduced-motion: bez ruchu i skali, sam fade (200 ms / 150 ms).
 *
 * Położenie: portal do document.body, position: fixed, 8 px od elementu. Gdy po wybranej
 * stronie brakuje miejsca, tooltip przechodzi na przeciwną; w poprzek trzyma się okna.
 * Dostępność: role="tooltip" + aria-describedby na elemencie; kursor może przejść z elementu
 * na tooltip, a ten nie znika (WCAG 1.4.13).
 * ──────────────────────────────────────────────────────────────────────────── */

/** Opóźnienie pokazania po najechaniu (ms). */
export const TOOLTIP_OPEN_DELAY = 400;
/** Opóźnienie ukrycia po zjechaniu kursorem — czas na przejście na sam tooltip (ms). */
export const TOOLTIP_CLOSE_DELAY = 100;
/** Okno, w którym kolejny tooltip pojawia się bez opóźnienia (ms). */
export const TOOLTIP_SKIP_DELAY = 300;

/** Odstęp od elementu i minimalny margines od krawędzi okna (px). */
const OFFSET = 8;
const VIEWPORT_MARGIN = 8;

const OPPOSITE: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

/* Wspólny stan tooltipów na stronie: zamykanie pozostałych i „rozgrzanie” po zamknięciu. */
const openTooltips = new Map<string, () => void>();
let lastClosedAt = -Infinity;

type Layout = { top: number; left: number; side: Side };

function computeLayout(trigger: DOMRect, width: number, height: number, preferred: Side): Layout {
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const fits: Record<Side, boolean> = {
    top: trigger.top - OFFSET - height >= VIEWPORT_MARGIN,
    bottom: trigger.bottom + OFFSET + height <= viewportHeight - VIEWPORT_MARGIN,
    left: trigger.left - OFFSET - width >= VIEWPORT_MARGIN,
    right: trigger.right + OFFSET + width <= viewportWidth - VIEWPORT_MARGIN,
  };
  const side = fits[preferred] || !fits[OPPOSITE[preferred]] ? preferred : OPPOSITE[preferred];
  const clamp = (value: number, size: number, viewport: number) =>
    Math.round(Math.min(Math.max(value, VIEWPORT_MARGIN), Math.max(VIEWPORT_MARGIN, viewport - size - VIEWPORT_MARGIN)));

  if (side === 'top' || side === 'bottom') {
    return {
      side,
      top: Math.round(side === 'top' ? trigger.top - OFFSET - height : trigger.bottom + OFFSET),
      left: clamp(trigger.left + trigger.width / 2 - width / 2, width, viewportWidth),
    };
  }
  return {
    side,
    top: clamp(trigger.top + trigger.height / 2 - height / 2, height, viewportHeight),
    left: Math.round(side === 'left' ? trigger.left - OFFSET - width : trigger.right + OFFSET),
  };
}

export type TooltipProps = {
  /** Treść: tekst (Type=Text) albo układ jednego z pozostałych typów z Figmy. */
  content: ReactNode;
  /** Element, przy którym pojawia się tooltip — przycisk, link albo inny element z fokusem. */
  children: ReactElement<{ 'aria-describedby'?: string }>;
  /** Strona, po której pojawia się tooltip. Domyślnie nad elementem. */
  placement?: Side;
  /** Otwarcie sterowane z zewnątrz. Bez tego tooltip pilnuje stanu sam. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Dodatkowa klasa kontenera, np. stała szerokość typu Graph. */
  className?: string;
};

export default function Tooltip({
  content,
  children,
  placement = 'top',
  open,
  defaultOpen = false,
  onOpenChange,
  className,
}: TooltipProps) {
  const prefersReducedMotion = useReducedMotion();
  const tooltipId = useId();
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const timer = useRef(0);
  /** Najnowsze wartości dla timerów i listenerów, które żyją dłużej niż jeden render. */
  const latest = useRef({ isOpen, setOpen });

  useLayoutEffect(() => {
    latest.current = { isOpen, setOpen };
  });

  useEffect(() => {
    setMounted(true);
    return () => window.clearTimeout(timer.current);
  }, []);

  const schedule = (next: boolean, delay: number) => {
    window.clearTimeout(timer.current);
    const apply = () => {
      if (latest.current.isOpen !== next) latest.current.setOpen(next);
    };
    if (delay > 0) timer.current = window.setTimeout(apply, delay);
    else apply();
  };

  const show = (immediate: boolean) => {
    const warm = openTooltips.size > 0 || performance.now() - lastClosedAt < TOOLTIP_SKIP_DELAY;
    schedule(true, immediate || warm ? 0 : TOOLTIP_OPEN_DELAY);
  };

  const hide = (immediate: boolean) => schedule(false, immediate ? 0 : TOOLTIP_CLOSE_DELAY);

  // Naraz jeden tooltip; Esc zamyka go jako pierwszy (preventDefault — modal wtedy zostaje otwarty).
  useEffect(() => {
    if (!isOpen) return;

    openTooltips.forEach((close, id) => {
      if (id !== tooltipId) close();
    });
    openTooltips.set(tooltipId, () => {
      window.clearTimeout(timer.current);
      latest.current.setOpen(false);
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault();
      window.clearTimeout(timer.current);
      latest.current.setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown, true);

    return () => {
      openTooltips.delete(tooltipId);
      lastClosedAt = performance.now();
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [isOpen, tooltipId]);

  // Położenie: najpierw pomiar ukrytej kopii, potem tooltip od razu po właściwej stronie — przed pierwszą klatką.
  useLayoutEffect(() => {
    if (!isOpen || !mounted) {
      setLayout(null);
      return;
    }
    const trigger = triggerRef.current;
    if (!trigger) return;

    const update = () => {
      const box = tooltipRef.current ?? measureRef.current;
      if (box) setLayout(computeLayout(trigger.getBoundingClientRect(), box.offsetWidth, box.offsetHeight, placement));
    };

    let frame = 0;
    const onViewportChange = () => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          update();
        });
      }
    };

    update();
    window.addEventListener('scroll', onViewportChange, true);
    window.addEventListener('resize', onViewportChange);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onViewportChange, true);
      window.removeEventListener('resize', onViewportChange);
    };
  }, [isOpen, mounted, placement]);

  const describedBy = children.props['aria-describedby'];
  const trigger = isValidElement(children)
    ? cloneElement(children, {
        'aria-describedby': isOpen ? [describedBy, tooltipId].filter(Boolean).join(' ') : describedBy,
      })
    : children;

  const body = typeof content === 'string' ? <TooltipText>{content}</TooltipText> : content;
  const boxClassName = className ? `${styles.tooltip} ${className}` : styles.tooltip;

  return (
    <>
      <span
        ref={triggerRef}
        className={styles.trigger}
        onPointerEnter={(event) => {
          if (event.pointerType !== 'touch') show(false);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== 'touch') hide(false);
        }}
        onPointerDown={() => hide(true)}
        onFocus={(event) => {
          if (event.target instanceof Element && event.target.matches(':focus-visible')) show(true);
        }}
        onBlur={() => hide(true)}
      >
        {trigger}
      </span>

      {mounted
        ? createPortal(
            <>
              {isOpen && !layout ? (
                <div ref={measureRef} className={boxClassName} style={{ top: 0, left: 0, visibility: 'hidden' }} aria-hidden="true">
                  {body}
                </div>
              ) : null}
              <AnimatePresence>
                {isOpen && layout ? (
                  <motion.div
                    key="tooltip"
                    ref={tooltipRef}
                    id={tooltipId}
                    role="tooltip"
                    data-side={layout.side}
                    className={boxClassName}
                    style={{ top: layout.top, left: layout.left }}
                    custom={layout.side}
                    variants={prefersReducedMotion ? anchoredMotionReduced : anchoredMotion}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    onPointerEnter={() => window.clearTimeout(timer.current)}
                    onPointerLeave={(event) => {
                      if (event.pointerType !== 'touch') hide(false);
                    }}
                  >
                    {body}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </>,
            document.body,
          )
        : null}
    </>
  );
}

/** Type=Text, Shortcut, Breadcrumbs — jedna linia: 4 px × 8 px, odstęp 6 px. */
export function TooltipText({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className ? `${styles.text} ${className}` : styles.text}>{children}</div>;
}

/** Klawisz w typie Shortcut — 16 × 16. */
export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className={styles.kbd}>{children}</kbd>;
}

/** Kropkowany separator z typów Items i Address. */
export function TooltipDivider() {
  return <div className={styles.divider} aria-hidden="true" />;
}
