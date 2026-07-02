export type WorkStatus = "consulting" | "in_progress" | "revision" | "completed";

export type WorkItem = {
  id: string;
  clientName: string;
  title: string;
  category: string;
  status: WorkStatus;
  date: string;
  note?: string;
};

export const workStatusOrder: WorkStatus[] = [
  "consulting",
  "in_progress",
  "revision",
  "completed",
];

export const workStatusLabels: Record<WorkStatus, string> = {
  consulting: "상담중",
  in_progress: "작업중",
  revision: "수정중",
  completed: "완료",
};

export const workStatusColors: Record<WorkStatus, string> = {
  consulting: "bg-sky-100 text-sky-700 border-sky-200",
  in_progress: "bg-artdear-purple-light text-artdear-purple border-artdear-purple/30",
  revision: "bg-amber-100 text-amber-800 border-amber-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export const seedWorks: WorkItem[] = [
  {
    id: "1",
    clientName: "게임마스터",
    title: "RPG 메인 포스터",
    category: "게임 포스터",
    status: "consulting",
    date: "2024.11.22",
  },
  {
    id: "2",
    clientName: "스트리머A",
    title: "채널아트 리뉴얼",
    category: "채널아트",
    status: "in_progress",
    date: "2024.11.18",
  },
  {
    id: "3",
    clientName: "길드장님",
    title: "길드 엠블럼",
    category: "길드마크",
    status: "revision",
    date: "2024.11.15",
  },
  {
    id: "4",
    clientName: "유튜버B",
    title: "썸네일 3종",
    category: "유튜브 디자인",
    status: "completed",
    date: "2024.11.10",
  },
];

export type WorkItemInput = Omit<WorkItem, "id" | "date" | "status"> & {
  id?: string;
  date?: string;
  status?: WorkStatus;
};
