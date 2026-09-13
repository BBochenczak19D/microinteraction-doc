'use client';

import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { AnimatePresence } from 'framer-motion';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type MouseEvent,
  type SVGProps,
} from 'react';

import { MenuPanel } from './Menu';
import styles from './MenuButton.module.css';

/* MenuButton — przycisk z ikoną, który otwiera menu akcji.
 * Platform for dealers, 2130:17714: IconButton 36 × 36 + „Select Menu”
 * z „SIMPLE Menu Items” Small (28 px) i separatorem. Wygląd menu: Design System,
 * strona „Select” (node 81:993). Animacja menu: components/Menu.tsx.
 *
 * Dostępność: wzorzec „menu button” — otwarte klawiaturą ustawia fokus na
 * pierwszej pozycji, strzałki chodzą po pozycjach, Esc i wybór wracają na przycisk.
 *
 * Tło przycisku: domyślne i hover z tokenów DS (buttons/button-transparent
 * i -hover, jak w paginacji); przy otwartym menu 10% — z Figmy. */

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export type MenuButtonItem =
  | { type?: 'item'; label: string; icon?: IconComponent; onSelect?: () => void }
  | { type: 'separator' };

export type MenuButtonProps = {
  /** Etykieta a11y przycisku, np. „Akcje faktury”. */
  label: string;
  items: MenuButtonItem[];
  /** Ikona przycisku. Domyślnie heroicons-outline/ellipsis-horizontal. */
  icon?: IconComponent;
  /** Otwarcie sterowane z zewnątrz. Bez tego przycisk pilnuje stanu sam. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

type FocusTarget = 'first' | 'last' | 'menu';

export default function MenuButton({
  label,
  items,
  icon: Icon = EllipsisHorizontalIcon,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
}: MenuButtonProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  /** Gdzie ustawić fokus po otwarciu przez użytkownika; null = nie ruszać (np. otwarcie z kodu). */
  const focusOnOpen = useRef<FocusTarget | null>(null);

  const id = useId();
  const triggerId = `${id}-trigger`;
  const menuId = `${id}-menu`;

  const setOpen = (next: boolean) => {
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const menuItems = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  const focusItem = (target: FocusTarget) => {
    const all = menuItems();
    const element = target === 'first' ? all[0] : target === 'last' ? all[all.length - 1] : menuRef.current;
    element?.focus({ preventScroll: true });
  };

  const openBy = (target: FocusTarget) => {
    if (isOpen) {
      focusItem(target);
      return;
    }
    focusOnOpen.current = target;
    setOpen(true);
  };

  useEffect(() => {
    if (!isOpen || !focusOnOpen.current) return;
    focusItem(focusOnOpen.current);
    focusOnOpen.current = null;
  }, [isOpen]);

  // Klik poza przyciskiem i menu zamyka (fokus zostaje tam, gdzie kliknięto).
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  });

  const onTriggerClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isOpen) {
      close(true);
      return;
    }
    // detail 0 = Enter/Spacja: fokus na pierwszą pozycję; myszką — na samo menu
    openBy(event.detail === 0 ? 'first' : 'menu');
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openBy(event.key === 'ArrowDown' ? 'first' : 'last');
    }
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const all = menuItems();
    const current = all.indexOf(document.activeElement as HTMLElement);
    const focusAt = (index: number) => all[(index + all.length) % all.length]?.focus();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusAt(current + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusAt(current === -1 ? -1 : current - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusAt(0);
        break;
      case 'End':
        event.preventDefault();
        focusAt(-1);
        break;
      case 'Escape':
        event.preventDefault();
        close(true);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className={className ? `${styles.root} ${className}` : styles.root}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className={styles.trigger}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={onTriggerClick}
        onKeyDown={onTriggerKeyDown}
      >
        <Icon className={styles.triggerIcon} aria-hidden="true" focusable="false" />
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <MenuPanel
            key="menu"
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-labelledby={triggerId}
            tabIndex={-1}
            placement="button"
            className={styles.menu}
            onKeyDown={onMenuKeyDown}
          >
            {items.map((item, index) =>
              item.type === 'separator' ? (
                <div key={index} role="separator" className={styles.separator} />
              ) : (
                <button
                  key={index}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  className={styles.item}
                  onClick={() => {
                    item.onSelect?.();
                    close(true);
                  }}
                  onPointerMove={(event) => {
                    if (event.pointerType === 'mouse') event.currentTarget.focus({ preventScroll: true });
                  }}
                  onPointerLeave={() => menuRef.current?.focus({ preventScroll: true })}
                >
                  {item.icon ? <item.icon className={styles.itemIcon} aria-hidden="true" focusable="false" /> : null}
                  {item.label}
                </button>
              ),
            )}
          </MenuPanel>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
