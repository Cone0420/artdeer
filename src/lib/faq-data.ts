export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqItemInput = Omit<FaqItem, "id"> & { id?: string };

export const FAQ_SEED_VERSION = 2;

export const seedFaqItems: FaqItem[] = [
  {
    id: "1",
    question: "작업 기간은 얼마나 걸리나요?",
    answer:
      "디자인 종류에 따라 다르지만 평균 1~3일 정도 소요됩니다.\n작업량에 따라 일정은 상담 시 안내드립니다.",
  },
  {
    id: "2",
    question: "작업은 언제 시작되나요?",
    answer:
      "결제 완료 후 순차적으로 작업이 시작됩니다.\n작업 일정은 문의 시 상세하게 안내해드립니다.",
  },
  {
    id: "3",
    question: "원하는 스타일로 제작이 가능한가요?",
    answer:
      "원하시는 레퍼런스나 디자인 스타일을 보내주시면\n최대한 원하시는 분위기에 맞춰 제작해드립니다.",
  },
  {
    id: "4",
    question: "수정은 몇 번까지 가능한가요?",
    answer:
      "간단한 수정은 무료로 진행해드리며,\n디자인 변경 범위에 따라 추가 비용이 발생할 수 있습니다.",
  },
  {
    id: "5",
    question: "문의는 어떻게 하나요?",
    answer:
      "디스코드 또는 오픈채팅을 통해 편하게 문의해주시면\n빠르게 상담해드립니다.",
  },
  {
    id: "6",
    question: "작업 취소는 가능한가요?",
    answer:
      "작업이 시작된 이후에는 취소 및 환불이 불가능합니다.\n작업 시작 전에는 상담을 통해 취소 여부를 안내해드립니다.",
  },
];
