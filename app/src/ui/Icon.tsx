import type { CSSProperties } from 'react';

type IconName =
  | 'search' | 'bookmark' | 'bookmarkFilled' | 'plus' | 'filter'
  | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'external' | 'check'
  | 'dot' | 'bell' | 'settings' | 'briefcase' | 'pin' | 'spark'
  | 'clock' | 'close' | 'link' | 'refresh' | 'menu';

type Props = { name: IconName; size?: number; stroke?: string; style?: CSSProperties };

export function Icon({ name, size = 14, stroke = 'currentColor', style }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke,
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style,
  };
  const paths: Record<IconName, React.ReactNode> = {
    search: <><circle cx="7" cy="7" r="5" /><path d="M14 14l-3-3" /></>,
    bookmark: <path d="M4 2h8v12l-4-3-4 3z" />,
    bookmarkFilled: <path d="M4 2h8v12l-4-3-4 3z" fill={stroke} stroke="none" />,
    plus: <><path d="M8 3v10M3 8h10" /></>,
    filter: <path d="M2 3h12M4 8h8M6 13h4" />,
    arrowRight: <path d="M3 8h10M9 4l4 4-4 4" />,
    arrowUp: <path d="M8 13V3M4 7l4-4 4 4" />,
    arrowDown: <path d="M8 3v10M4 9l4 4 4-4" />,
    external: <><path d="M10 2h4v4" /><path d="M14 2L7 9" /><path d="M12 9v5H2V4h5" /></>,
    check: <path d="M3 8l3 3 7-7" />,
    dot: <circle cx="8" cy="8" r="2" fill={stroke} />,
    bell: <><path d="M4 11V7a4 4 0 118 0v4l1 2H3z" /><path d="M6 13a2 2 0 004 0" /></>,
    settings: <><circle cx="8" cy="8" r="2" /><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M3.5 12.5l1.4-1.4M11.1 4.9l1.4-1.4" /></>,
    briefcase: <><rect x="2" y="5" width="12" height="9" rx="1" /><path d="M6 5V3h4v2" /></>,
    pin: <><path d="M8 14s-4-4.5-4-8a4 4 0 118 0c0 3.5-4 8-4 8z" /><circle cx="8" cy="6" r="1.5" /></>,
    spark: <path d="M8 1v4M8 11v4M1 8h4M11 8h4M3 3l3 3M10 10l3 3M3 13l3-3M10 6l3-3" />,
    clock: <><circle cx="8" cy="8" r="6" /><path d="M8 4v4l3 2" /></>,
    close: <path d="M4 4l8 8M12 4l-8 8" />,
    link: <><path d="M7 9l2-2M10 5l1-1a2.8 2.8 0 014 4l-2 2" /><path d="M9 11l-2 2a2.8 2.8 0 01-4-4l1-1" /></>,
    refresh: <><path d="M3 8a5 5 0 019-3l1 1" /><path d="M13 3v3h-3" /><path d="M13 8a5 5 0 01-9 3l-1-1" /><path d="M3 13v-3h3" /></>,
    menu: <path d="M2 4h12M2 8h12M2 12h12" />,
  };
  return <svg {...common}>{paths[name]}</svg>;
}
