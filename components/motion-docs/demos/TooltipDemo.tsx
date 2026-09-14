'use client';

import { DocumentDuplicateIcon, PencilSquareIcon, ShareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useInView } from 'framer-motion';
import { useEffect, useRef, useState, type ComponentType, type ReactNode, type SVGProps } from 'react';

import Tooltip, { Kbd, TooltipDivider, TooltipText } from '@/components/Tooltip';
import type { Side } from '@/components/motion';

import styles from './TooltipDemo.module.css';

/** Najpierw widać stan startowy, potem tooltipy — także po „Odtwórz ponownie”. */
const AUTO_PLAY_DELAY = 600;
/** Co tyle ms autoplay przechodzi do kolejnego tooltipa. */
const AUTO_PLAY_STEP = 1400;

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const ACTIONS: { id: string; label: string; icon: IconComponent }[] = [
  { id: 'edytuj', label: 'Edytuj ogłoszenie', icon: PencilSquareIcon },
  { id: 'duplikuj', label: 'Duplikuj', icon: DocumentDuplicateIcon },
  { id: 'udostepnij', label: 'Udostępnij', icon: ShareIcon },
  { id: 'usun', label: 'Usuń', icon: TrashIcon },
];

const SIDES: { id: Side; label: string; content: string }[] = [
  { id: 'top', label: 'Nad', content: 'Nad elementem' },
  { id: 'right', label: 'Z prawej', content: 'Z prawej strony' },
  { id: 'bottom', label: 'Pod', content: 'Pod elementem' },
  { id: 'left', label: 'Z lewej', content: 'Z lewej strony' },
];

/** Kropka z typu Graph — eksport z Figmy: koło r = 4 z obwódką 0.5 px, w ramce 15 × 15. */
function GraphDot({ color }: { color: string }) {
  return (
    <svg className={styles.graphDot} width="15" height="15" viewBox="0.5 0.5 15 15" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="4" fill={color} />
      <circle cx="8" cy="8" r="3.75" fill="none" stroke="#18181B" strokeOpacity="0.24" strokeWidth="0.5" />
    </svg>
  );
}

function ItemRow({ name, sku }: { name: string; sku: string }) {
  return (
    <div className={styles.itemRow}>
      <span>1x</span>
      {/* Miniatura z Figmy (3 warstwy złożone w jeden PNG 60 × 80) */}
      <img className={styles.thumb} src="/tooltip/items-thumbnail.png" width={15} height={20} alt="" />
      <span className={styles.row}>
        <span>{name}</span>
        <span aria-hidden="true">·</span>
        <span>{sku}</span>
      </span>
    </div>
  );
}

function AddressBlock({ heading, lines }: { heading: string; lines: string[] }) {
  return (
    <div className={styles.section}>
      <span className={styles.strong}>{heading}</span>
      {lines.map((line) => (
        <span key={line} className={styles.muted}>
          {line}
        </span>
      ))}
    </div>
  );
}

/** Siedem typów z Figmy (Tooltip, node 671:1320) — ta sama animacja, inna treść. */
const TYPES: { id: string; label: string; content: ReactNode; className?: string }[] = [
  { id: 'text', label: 'Text', content: 'Oznacz jako sprzedany' },
  {
    id: 'shortcut',
    label: 'Shortcut',
    content: (
      <TooltipText className={styles.shortcut}>
        Szukaj
        <span className={styles.keys}>
          <Kbd>⌘</Kbd>
          <Kbd>/</Kbd>
        </span>
      </TooltipText>
    ),
  },
  {
    id: 'return',
    label: 'Return',
    content: (
      <div className={styles.body}>
        <span className={styles.badge}>#8W5C3HB</span>
        <div>
          <div className={styles.row}>
            <span>Zwrot zgłoszony</span>
            <span className={styles.muted} aria-hidden="true">
              ·
            </span>
            <span className={styles.muted}>17 sie 2022, 14:56</span>
          </div>
          <div className={styles.row}>
            <span>Pojazd odebrany</span>
            <span className={styles.muted} aria-hidden="true">
              ·
            </span>
            <span className={styles.muted}>21 sie 2022, 14:56</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'graph',
    label: 'Graph',
    className: styles.graph,
    content: (
      <div className={styles.body}>
        <span className={styles.muted}>22 lip 2025</span>
        {[
          { label: 'Wyświetlenia', value: '1 204', color: '#7BC63E' },
          { label: 'Kliknięcia', value: '437', color: '#AD46FF' },
          { label: 'Zapytania', value: '88', color: '#FF6900' },
          { label: 'Rezerwacje', value: '29', color: '#FB2C36' },
        ].map((row) => (
          <div key={row.label} className={styles.graphRow}>
            <span className={styles.graphLabel}>
              <GraphDot color={row.color} />
              <span className={styles.ellipsis}>{row.label}</span>
            </span>
            <span>{row.value}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'items',
    label: 'Items',
    content: (
      <>
        <div className={`${styles.section} ${styles.itemsSection}`}>
          <span className={styles.strong}>Wydanie z magazynu</span>
          <ItemRow name="Łóżko Nordic" sku="RN-160" />
          <ItemRow name="Łóżko Nordic" sku="RN-140" />
        </div>
        <TooltipDivider />
        <div className={`${styles.section} ${styles.itemsSection}`}>
          <span className={styles.strong}>Zwrot</span>
          <ItemRow name="Łóżko Nordic" sku="RN-160" />
          <ItemRow name="Łóżko Nordic" sku="RN-120" />
        </div>
      </>
    ),
  },
  {
    id: 'address',
    label: 'Address',
    content: (
      <>
        <AddressBlock heading="Od" lines={['ul. Fabryczna 12', '61-001 Poznań', 'Polska']} />
        <TooltipDivider />
        <AddressBlock heading="Do" lines={['ul. Długa 5', '80-001 Gdańsk', 'Polska']} />
      </>
    ),
  },
  {
    id: 'breadcrumbs',
    label: 'Breadcrumbs',
    content: (
      <TooltipText>
        <span>Ogłoszenia</span>
        <span className={styles.slash} aria-hidden="true">
          /
        </span>
        <span>Ducati HD883</span>
      </TooltipText>
    ),
  },
];

const STEPS: Record<TooltipDemoProps['mode'], (string | null)[]> = {
  hover: ['edytuj', 'duplikuj', null],
  placement: ['top', 'right', 'bottom', 'left', null],
  types: [...TYPES.map((type) => type.id), null],
};

type TooltipDemoProps = {
  /**
   * Autoplay startuje, gdy scena wjedzie w ekran:
   * „hover” — pasek ikon, tooltip przechodzi z pierwszej na drugą;
   * „placement” — cztery strony po kolei; „types” — siedem typów z Figmy po kolei.
   */
  mode: 'hover' | 'placement' | 'types';
};

/** Podgląd do dokumentacji: prawdziwe tooltipy — najechanie, Tab i Esc działają. */
export default function TooltipDemo({ mode }: TooltipDemoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const userInteracted = useRef(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!isInView) return;
    const timers = STEPS[mode].map((id, index) =>
      window.setTimeout(() => {
        if (!userInteracted.current) setOpenId(id);
      }, AUTO_PLAY_DELAY + index * AUTO_PLAY_STEP),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [mode, isInView]);

  // W pełni sterowane: naraz otwarty jeden. Zamknięcie przez inny tooltip nie przerywa autoplay.
  const control = (id: string) => ({
    open: openId === id,
    onOpenChange: (next: boolean) => {
      if (next) userInteracted.current = true;
      setOpenId((current) => (next ? id : current === id ? null : current));
    },
  });

  if (mode === 'hover') {
    return (
      <div ref={ref} className={styles.demo}>
        <div className={styles.toolbar}>
          {ACTIONS.map(({ id, label, icon: Icon }) => (
            <Tooltip key={id} content={label} {...control(id)}>
              <button type="button" className={styles.iconButton} aria-label={label}>
                <Icon className={styles.icon} aria-hidden="true" />
              </button>
            </Tooltip>
          ))}
        </div>
        <p className={styles.hint}>Najedź na ikonę — tooltip pojawia się po 400 ms, na sąsiedniej od razu. Tab i Esc też działają.</p>
      </div>
    );
  }

  if (mode === 'placement') {
    return (
      <div ref={ref} className={styles.demo}>
        {/* Na krzyż: tooltip każdego przycisku wychodzi w wolne miejsce, a nie na sąsiedni przycisk */}
        <div className={styles.cross}>
          {SIDES.map((side) => (
            <div key={side.id} className={styles.crossCell} data-side={side.id}>
              <Tooltip placement={side.id} content={side.content} {...control(side.id)}>
                <button type="button" className={styles.chip}>
                  {side.label}
                </button>
              </Tooltip>
            </div>
          ))}
        </div>
        <p className={styles.hint}>
          Tooltip rośnie od krawędzi przy elemencie. Gdy po wybranej stronie brakuje miejsca, przechodzi na przeciwną.
        </p>
      </div>
    );
  }

  return (
    <div ref={ref} className={styles.demo}>
      <div className={styles.chips}>
        {TYPES.map((type) => (
          <Tooltip key={type.id} content={type.content} className={type.className} {...control(type.id)}>
            <button type="button" className={styles.chip}>
              {type.label}
            </button>
          </Tooltip>
        ))}
      </div>
      <p className={styles.hint}>Najedź na typ z Figmy — animacja jest ta sama, zmienia się tylko treść.</p>
    </div>
  );
}
