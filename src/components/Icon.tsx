import type { SVGProps } from 'react';

export type IconName =
  | 'code' | 'plus' | 'play' | 'pause' | 'refresh' | 'copy' | 'download'
  | 'trash' | 'duplicate' | 'chevron' | 'sparkle' | 'folder' | 'check'
  | 'close' | 'layers' | 'cursor' | 'arrow';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 18, ...props }: IconProps) {
  const common = { stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      {name === 'code' && <><path {...common} d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" /></>}
      {name === 'plus' && <path {...common} d="M12 5v14M5 12h14" />}
      {name === 'play' && <path d="m8 5 12 7-12 7V5Z" fill="currentColor" />}
      {name === 'pause' && <path d="M8 5h3v14H8zM15 5h3v14h-3z" fill="currentColor" />}
      {name === 'refresh' && <path {...common} d="M20 7v5h-5M4.9 9a7.5 7.5 0 0 1 12.4-2.2L20 12M4 17v-5h5m10.1 3a7.5 7.5 0 0 1-12.4 2.2L4 12" />}
      {name === 'copy' && <><rect {...common} x="8" y="8" width="12" height="12" rx="2" /><path {...common} d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>}
      {name === 'download' && <><path {...common} d="M12 3v12m0 0 4-4m-4 4-4-4" /><path {...common} d="M5 17v3h14v-3" /></>}
      {name === 'trash' && <><path {...common} d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" /></>}
      {name === 'duplicate' && <><rect {...common} x="8" y="8" width="12" height="12" rx="2" /><path {...common} d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /><path {...common} d="M12 11v6m-3-3h6" /></>}
      {name === 'chevron' && <path {...common} d="m9 18 6-6-6-6" />}
      {name === 'sparkle' && <><path {...common} d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path {...common} d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></>}
      {name === 'folder' && <path {...common} d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />}
      {name === 'check' && <path {...common} d="m5 12 4 4L19 6" />}
      {name === 'close' && <path {...common} d="m6 6 12 12M18 6 6 18" />}
      {name === 'layers' && <><path {...common} d="m12 3 9 5-9 5-9-5 9-5Z" /><path {...common} d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>}
      {name === 'cursor' && <path {...common} d="m5 3 14 9-7 1-3 7L5 3Z" />}
      {name === 'arrow' && <path {...common} d="M5 12h14m-6-6 6 6-6 6" />}
    </svg>
  );
}
