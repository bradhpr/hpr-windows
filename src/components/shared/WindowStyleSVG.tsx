import type { WindowStyle } from '../../types';

interface Props {
  style: WindowStyle;
  size?: number;
  className?: string;
}

export function WindowStyleSVG({ style, size = 60, className = '' }: Props) {
  const s = size;
  const stroke = '#003DA5';
  const fill = '#EEF4FF';
  const arrow = '#003DA5';

  const svgProps = {
    width: s,
    height: s,
    viewBox: '0 0 60 60',
    className,
    xmlns: 'http://www.w3.org/2000/svg',
  };

  switch (style) {
    case 'SH':
      return (
        <svg {...svgProps}>
          <rect x="4" y="4" width="52" height="52" rx="2" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <line x1="4" y1="32" x2="56" y2="32" stroke={stroke} strokeWidth="2" />
          {/* up arrow on top sash */}
          <path d="M30 14 L30 28" stroke={arrow} strokeWidth="2" strokeLinecap="round" />
          <path d="M24 20 L30 13 L36 20" stroke={arrow} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="30" y="50" textAnchor="middle" fontSize="7" fill={stroke} fontFamily="sans-serif">Single Hung</text>
        </svg>
      );

    case 'RoundTopSH':
      return (
        <svg {...svgProps}>
          {/* round top frame */}
          <path d="M4 56 L4 28 A26 26 0 0 1 56 28 L56 56 Z" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <line x1="4" y1="40" x2="56" y2="40" stroke={stroke} strokeWidth="2" />
          {/* up arrow on top sash */}
          <path d="M30 20 L30 36" stroke={arrow} strokeWidth="2" strokeLinecap="round" />
          <path d="M24 26 L30 19 L36 26" stroke={arrow} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="30" y="54" textAnchor="middle" fontSize="5.5" fill={stroke} fontFamily="sans-serif">Round Top SH</text>
        </svg>
      );

    case 'XO':
    case 'OX':
      return (
        <svg {...svgProps}>
          <rect x="4" y="4" width="52" height="52" rx="2" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <line x1="30" y1="4" x2="30" y2="56" stroke={stroke} strokeWidth="2" />
          {/* arrow on left panel (XO) */}
          <path d="M22 30 L12 30" stroke={arrow} strokeWidth="2" strokeLinecap="round" />
          <path d="M16 24 L10 30 L16 36" stroke={arrow} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="30" y="56" textAnchor="middle" fontSize="6.5" fill={stroke} fontFamily="sans-serif">Glider</text>
        </svg>
      );

    case 'XOX':
      return (
        <svg {...svgProps}>
          <rect x="4" y="4" width="52" height="52" rx="2" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <line x1="22" y1="4" x2="22" y2="56" stroke={stroke} strokeWidth="2" />
          <line x1="38" y1="4" x2="38" y2="56" stroke={stroke} strokeWidth="2" />
          <path d="M15 30 L7 30" stroke={arrow} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 25 L5 30 L10 35" stroke={arrow} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M45 30 L53 30" stroke={arrow} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M50 25 L55 30 L50 35" stroke={arrow} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="30" y="56" textAnchor="middle" fontSize="6" fill={stroke} fontFamily="sans-serif">3-Lite Glider</text>
        </svg>
      );

    case 'PW':
      return (
        <svg {...svgProps}>
          <rect x="4" y="4" width="52" height="52" rx="2" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <rect x="12" y="12" width="36" height="36" fill="none" stroke={stroke} strokeWidth="1" strokeDasharray="3,2" />
          <text x="30" y="50" textAnchor="middle" fontSize="7" fill={stroke} fontFamily="sans-serif">Picture</text>
        </svg>
      );

    case 'DH':
      return (
        <svg {...svgProps}>
          <rect x="4" y="4" width="52" height="52" rx="2" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <line x1="4" y1="30" x2="56" y2="30" stroke={stroke} strokeWidth="2" />
          <path d="M30 12 L30 26" stroke={arrow} strokeWidth="2" strokeLinecap="round" />
          <path d="M24 17 L30 11 L36 17" stroke={arrow} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M30 48 L30 34" stroke={arrow} strokeWidth="2" strokeLinecap="round" />
          <path d="M24 43 L30 49 L36 43" stroke={arrow} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="30" y="56" textAnchor="middle" fontSize="6.5" fill={stroke} fontFamily="sans-serif">Double Hung</text>
        </svg>
      );

    case 'XX':
      return (
        <svg {...svgProps}>
          <rect x="4" y="4" width="52" height="52" rx="2" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <line x1="30" y1="4" x2="30" y2="56" stroke={stroke} strokeWidth="2" />
          <path d="M22 30 L12 30" stroke={arrow} strokeWidth="2" strokeLinecap="round" />
          <path d="M16 24 L10 30 L16 36" stroke={arrow} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M38 30 L48 30" stroke={arrow} strokeWidth="2" strokeLinecap="round" />
          <path d="M44 24 L50 30 L44 36" stroke={arrow} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="30" y="56" textAnchor="middle" fontSize="6" fill={stroke} fontFamily="sans-serif">Double Glider</text>
        </svg>
      );

    case 'Casement':
      return (
        <svg {...svgProps}>
          <rect x="4" y="4" width="52" height="52" rx="2" fill={fill} stroke={stroke} strokeWidth="2.5" />
          {/* hinge on left */}
          <line x1="18" y1="4" x2="18" y2="56" stroke={stroke} strokeWidth="1.5" strokeDasharray="3,2" />
          <path d="M18 30 L50 30" stroke={arrow} strokeWidth="2" strokeLinecap="round" />
          <path d="M45 24 L52 30 L45 36" stroke={arrow} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* crank symbol */}
          <circle cx="46" cy="48" r="3" fill="none" stroke={stroke} strokeWidth="1.5" />
          <text x="30" y="56" textAnchor="middle" fontSize="7" fill={stroke} fontFamily="sans-serif">Casement</text>
        </svg>
      );

    case 'Awning':
      return (
        <svg {...svgProps}>
          <rect x="4" y="4" width="52" height="52" rx="2" fill={fill} stroke={stroke} strokeWidth="2.5" />
          {/* hinge on top */}
          <line x1="4" y1="18" x2="56" y2="18" stroke={stroke} strokeWidth="1.5" strokeDasharray="3,2" />
          <path d="M30 18 L30 48" stroke={arrow} strokeWidth="2" strokeLinecap="round" />
          <path d="M24 43 L30 50 L36 43" stroke={arrow} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="30" y="56" textAnchor="middle" fontSize="7" fill={stroke} fontFamily="sans-serif">Awning</text>
        </svg>
      );

    case 'Geometric':
      return (
        <svg {...svgProps}>
          <rect x="4" y="4" width="52" height="52" rx="2" fill={fill} stroke={stroke} strokeWidth="2.5" />
          {/* half-circle */}
          <path d="M10 38 A20 20 0 0 1 50 38 Z" fill={fill} stroke={stroke} strokeWidth="2" />
          <text x="30" y="55" textAnchor="middle" fontSize="7" fill={stroke} fontFamily="sans-serif">Geometric</text>
        </svg>
      );

    default:
      return (
        <svg {...svgProps}>
          <rect x="4" y="4" width="52" height="52" rx="2" fill={fill} stroke={stroke} strokeWidth="2.5" />
        </svg>
      );
  }
}

export const WINDOW_STYLE_LABELS: Record<WindowStyle, string> = {
  SH: 'Single Hung',
  RoundTopSH: 'Round Top SH',
  XO: 'Single Glider (XO)',
  OX: 'Single Glider (OX)',
  XOX: '3-Lite Glider',
  PW: 'Picture (Fixed)',
  DH: 'Double Hung',
  XX: 'Double Glider',
  Casement: 'Casement',
  Awning: 'Awning',
  Geometric: 'Geometric',
};
