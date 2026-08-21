import type { CardDef } from "./types";

/** 確定デッキ: 3柱 × 20 = 60枚 */
export const DECK: CardDef[] = [
  // 心・感情
  { id: "heart-01", label: "愛", pillar: "heart" },
  { id: "heart-02", label: "自由", pillar: "heart" },
  { id: "heart-03", label: "楽しさ", pillar: "heart" },
  { id: "heart-04", label: "純粋", pillar: "heart" },
  { id: "heart-05", label: "情熱", pillar: "heart" },
  { id: "heart-06", label: "スリル", pillar: "heart" },
  { id: "heart-07", label: "ゆとり", pillar: "heart" },
  { id: "heart-08", label: "安心", pillar: "heart" },
  { id: "heart-09", label: "感謝", pillar: "heart" },
  { id: "heart-10", label: "誠実", pillar: "heart" },
  { id: "heart-11", label: "好奇心", pillar: "heart" },
  { id: "heart-12", label: "遊び心", pillar: "heart" },
  { id: "heart-13", label: "美", pillar: "heart" },
  { id: "heart-14", label: "直感", pillar: "heart" },
  { id: "heart-15", label: "穏やかさ", pillar: "heart" },
  { id: "heart-16", label: "興奮", pillar: "heart" },
  { id: "heart-17", label: "希望", pillar: "heart" },
  { id: "heart-18", label: "自尊心", pillar: "heart" },
  { id: "heart-19", label: "慈悲", pillar: "heart" },
  { id: "heart-20", label: "冒険", pillar: "heart" },
  // 仕事・成果
  { id: "work-01", label: "効率", pillar: "work" },
  { id: "work-02", label: "利益", pillar: "work" },
  { id: "work-03", label: "貢献", pillar: "work" },
  { id: "work-04", label: "堅実", pillar: "work" },
  { id: "work-05", label: "秩序", pillar: "work" },
  { id: "work-06", label: "クオリティ", pillar: "work" },
  { id: "work-07", label: "安定", pillar: "work" },
  { id: "work-08", label: "達成", pillar: "work" },
  { id: "work-09", label: "影響力", pillar: "work" },
  { id: "work-10", label: "責任", pillar: "work" },
  { id: "work-11", label: "スピード", pillar: "work" },
  { id: "work-12", label: "専門性", pillar: "work" },
  { id: "work-13", label: "創造", pillar: "work" },
  { id: "work-14", label: "リーダーシップ", pillar: "work" },
  { id: "work-15", label: "思いやり", pillar: "work" },
  { id: "work-16", label: "革新", pillar: "work" },
  { id: "work-17", label: "継続", pillar: "work" },
  { id: "work-18", label: "公平", pillar: "work" },
  { id: "work-19", label: "成果", pillar: "work" },
  { id: "work-20", label: "自立", pillar: "work" },
  // 成長・関係
  { id: "growth-01", label: "学び", pillar: "growth" },
  { id: "growth-02", label: "知識", pillar: "growth" },
  { id: "growth-03", label: "一体感", pillar: "growth" },
  { id: "growth-04", label: "つながり", pillar: "growth" },
  { id: "growth-05", label: "共感", pillar: "growth" },
  { id: "growth-06", label: "成長", pillar: "growth" },
  { id: "growth-07", label: "勇気", pillar: "growth" },
  { id: "growth-08", label: "信頼", pillar: "growth" },
  { id: "growth-09", label: "協力", pillar: "growth" },
  { id: "growth-10", label: "挑戦", pillar: "growth" },
  { id: "growth-11", label: "自己理解", pillar: "growth" },
  { id: "growth-12", label: "多様性", pillar: "growth" },
  { id: "growth-13", label: "対話", pillar: "growth" },
  { id: "growth-14", label: "育成", pillar: "growth" },
  { id: "growth-15", label: "尊敬", pillar: "growth" },
  { id: "growth-16", label: "率直", pillar: "growth" },
  { id: "growth-17", label: "調和", pillar: "growth" },
  { id: "growth-18", label: "探究", pillar: "growth" },
  { id: "growth-19", label: "変容", pillar: "growth" },
  { id: "growth-20", label: "絆", pillar: "growth" },
];

export const PILLAR_LABEL: Record<CardDef["pillar"], string> = {
  heart: "心・感情",
  work: "仕事・成果",
  growth: "成長・関係",
};

export function getCard(id: string): CardDef | undefined {
  return DECK.find((c) => c.id === id);
}

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
