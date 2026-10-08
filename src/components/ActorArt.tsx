import type { ActorImage } from '../types/game';

const LABELS: Record<ActorImage, string> = {
  spaceship: 'Spaceship',
  alien: 'Alien',
  coin: 'Coin',
  ball: 'Ball',
};

export function ActorArt({ image, size = 48 }: { image: ActorImage; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label={LABELS[image]}>
      {image === 'spaceship' && <>
        <path d="M25 42 16 53l2-16 7-5M39 42l9 11-2-16-7-5" fill="#73a7ff" stroke="#3467d6" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M32 8c9 9 13 19 13 32l-13 9-13-9c0-13 4-23 13-32Z" fill="#dceaff" stroke="#3467d6" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M32 17c4 5 6 10 6 15h-12c0-5 2-10 6-15Z" fill="#6ab8f3" stroke="#3467d6" strokeWidth="2" />
        <path d="m27 49 5 8 5-8" fill="#ffbc5b" stroke="#e28c37" strokeWidth="2" strokeLinejoin="round" />
        <path d="m30 50 2 4 2-4" fill="#fff2a1" />
      </>}
      {image === 'alien' && <>
        <path d="M23 20c0-8 4-13 9-13s9 5 9 13" stroke="#7657d7" strokeWidth="3" strokeLinecap="round" />
        <path d="m24 14-5-5m21 5 5-5" stroke="#7657d7" strokeWidth="3" strokeLinecap="round" />
        <path d="M12 35c0-12 9-21 20-21s20 9 20 21v12c0 4-3 7-7 7H19c-4 0-7-3-7-7V35Z" fill="#ae9cff" stroke="#6f55c9" strokeWidth="2.5" />
        <ellipse cx="24" cy="34" rx="5" ry="7" fill="#fff" /><ellipse cx="40" cy="34" rx="5" ry="7" fill="#fff" />
        <ellipse cx="25" cy="35" rx="2" ry="4" fill="#283354" /><ellipse cx="39" cy="35" rx="2" ry="4" fill="#283354" />
        <path d="M26 45c3 3 9 3 12 0" stroke="#6f55c9" strokeWidth="2" strokeLinecap="round" />
      </>}
      {image === 'coin' && <>
        <circle cx="32" cy="32" r="25" fill="#ffcf57" stroke="#d89b25" strokeWidth="3" />
        <circle cx="32" cy="32" r="19" fill="#ffe49a" stroke="#f4b83d" strokeWidth="2" />
        <path d="m32 18 4.2 8.7 9.6 1.4-6.9 6.7 1.6 9.5-8.5-4.5-8.5 4.5 1.6-9.5-6.9-6.7 9.6-1.4L32 18Z" fill="#f2b637" />
        <path d="M20 20c3-3 7-5 11-5" stroke="#fff4c7" strokeWidth="3" strokeLinecap="round" />
      </>}
      {image === 'ball' && <>
        <circle cx="32" cy="32" r="25" fill="#59c8bb" stroke="#219c91" strokeWidth="3" />
        <path d="M12 23c11 2 23 14 25 29M34 8c-2 10 1 20 13 30M12 39c11-5 21-6 39-1" stroke="#dbfff8" strokeWidth="3" strokeLinecap="round" />
        <path d="M18 14c6-5 15-7 22-4" stroke="#a6f0df" strokeWidth="3" strokeLinecap="round" />
      </>}
    </svg>
  );
}
