import { memo } from 'react';
import type { StyleTone } from '@/config/styleCatalog';

type ToneIconProps = React.SVGProps<SVGSVGElement> & {
  stroke?: string;
};

const createIcon = (paths: React.ReactNode) =>
  memo(function ToneIcon({ stroke = 'currentColor', strokeWidth = 1.6, ...props }: ToneIconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        role="img"
        aria-hidden="true"
        focusable="false"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        {...props}
      >
        {paths}
      </svg>
    );
  });

const TrendingIcon = createIcon(
  <>
    <path d="M12 3v4" />
    <path d="M7.5 5.5l2 2" />
    <path d="M16.5 5.5l-2 2" />
    <path d="M5 13.5c1.2 1.3 3.3 2.5 7 2.5 3.7 0 5.8-1.2 7-2.5" />
    <path d="M7 18.5c1 .7 2.5 1 5 1s4-.3 5-1" />
  </>
);

const ClassicIcon = createIcon(
  <>
    <circle cx="8.5" cy="9.5" r="3.25" />
    <path d="M11.5 12.5c-1.5.5-3.5 1.7-4.5 3.5" />
    <path d="M13.5 5l5 5-8 8a2.5 2.5 0 01-3.5 0l-.5-.5a2.5 2.5 0 010-3.5z" />
    <path d="M16 7l2 2" />
  </>
);

const ModernIcon = createIcon(
  <>
    <path d="M7.5 6.5l4.5-2.5 4.5 2.5v5l-4.5 2.5-4.5-2.5z" />
    <path d="M7.5 11.5l4.5 2.5 4.5-2.5" />
    <path d="M7.5 11.5v5l4.5 2.5 4.5-2.5v-5" />
  </>
);

const StylizedIcon = createIcon(
  <>
    <path d="M5 12c1.5-2.5 2-5 7-5s5.5 2.5 7 5" />
    <path d="M19 12c-1.5 2.5-2 5-7 5s-5.5-2.5-7-5" />
    <path d="M6.5 9.5C7.2 10.2 8 11 9.3 11" />
    <path d="M17.5 9.5C16.8 10.2 16 11 14.7 11" />
  </>
);

const ElectricIcon = createIcon(
  <>
    <path d="M11 3l-4 9h5l-2 9 7-11h-5l2-7z" />
  </>
);

const SignatureIcon = createIcon(
  <>
    <path d="M5 10l3-4 4 2 4-2 3 4" />
    <path d="M7 19h10" />
    <path d="M7.5 15.5h9" />
    <path d="M12 12v3.5" />
  </>
);

export const toneIconMap: Record<StyleTone, React.MemoExoticComponent<(props: ToneIconProps) => JSX.Element>> =
  {
    trending: TrendingIcon,
    classic: ClassicIcon,
    modern: ModernIcon,
    stylized: StylizedIcon,
    electric: ElectricIcon,
    signature: SignatureIcon,
  };

export const getToneIcon = (tone: StyleTone) => toneIconMap[tone] ?? TrendingIcon;

