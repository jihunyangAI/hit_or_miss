export interface SliceColor {
  bg: string;
  text: string;
  border?: string;
}

export const WHEEL_PALETTE: SliceColor[] = [
  { bg: '#FF6B6B', text: '#FFFFFF' }, // Coral Red
  { bg: '#4ECDC4', text: '#FFFFFF' }, // Turquoise Mint
  { bg: '#FFD166', text: '#593D00' }, // Sunny Mustard Yellow
  { bg: '#6A0572', text: '#FFFFFF' }, // Deep Purple
  { bg: '#FF8ED4', text: '#FFFFFF' }, // Sweet Candy Pink
  { bg: '#1A535C', text: '#FFFFFF' }, // Deep Teal
  { bg: '#F77F00', text: '#FFFFFF' }, // Bright Orange
  { bg: '#3A86FF', text: '#FFFFFF' }, // Vivid Blue
  { bg: '#8338EC', text: '#FFFFFF' }, // Electric Violet
  { bg: '#06D6A0', text: '#FFFFFF' }, // Emerald Mint
  { bg: '#FF5964', text: '#FFFFFF' }, // Warm Crimson
  { bg: '#35A7FF', text: '#FFFFFF' }, // Sky Blue
  { bg: '#F4A261', text: '#43281C' }, // Peach Amber
  { bg: '#2A9D8F', text: '#FFFFFF' }, // Persian Green
  { bg: '#E76F51', text: '#FFFFFF' }, // Burnt Coral
  { bg: '#9B5DE5', text: '#FFFFFF' }, // Lavender Purple
];

export function getColorForIndex(index: number): SliceColor {
  return WHEEL_PALETTE[index % WHEEL_PALETTE.length];
}

export const DEFAULT_PRESETS = [
  {
    title: '친구들과 내기',
    emoji: '🎲',
    names: ['민준', '서연', '예준', '지우', '도윤', '하은'],
  },
  {
    title: '커피 쏘기',
    emoji: '☕️',
    names: ['김팀장', '이수석', '박선임', '최책임', '정사원', '강인턴'],
  },
  {
    title: '점심 메뉴 고르기',
    emoji: '🍱',
    names: ['김치찌개', '돈까스', '짜장면/짬뽕', '수제버거', '쌀국수', '마라탕', '샐러드', '초밥'],
  },
  {
    title: '청소 & 분리수거',
    emoji: '🧹',
    names: ['지훈', '수빈', '현우', '채원', '민서'],
  },
];

export const DEFAULT_PENALTIES = [
  '엉덩이로 이름 쓰기 🍑',
  '팀원들에게 커피 쏘기 ☕️',
  '노래 1소절 부르기 🎤',
  '편의점 아이스크림 쏘기 🍦',
  '오늘 자리 정리 & 분리수거 🧹',
  '애교 3종 세트 보여주기 😊',
  '손목/이마 딱밤 한 대 맞기 💥',
  '오늘 하루 모두에게 극존칭 쓰기 🙇',
];

export const PENALTY_PRESETS = [
  {
    title: '가벼운 내기',
    emoji: '☕️',
    items: ['커피 쏘기', '편의점 간식 쏘기', '디저트 사오기', '물 떠다주기'],
  },
  {
    title: '재미있는 벌칙',
    emoji: '💃',
    items: ['엉덩이로 이름 쓰기', '노래 1소절 부르기', '애교 3종 세트', '30초 댄스 타임', '흑역사 1개 고백하기'],
  },
  {
    title: '당번 뽑기',
    emoji: '🧹',
    items: ['회의실 정리하기', '분리수거 당번', '문 잠그고 퇴근하기', '점심 식당 예약하기', '간식 창고 정리'],
  },
];
