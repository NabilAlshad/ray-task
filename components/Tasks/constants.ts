export const TASK_CARD_DESCRIPTION_WORD_LIMIT = 200;

export const TASK_BOARD_COLUMNS = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "DONE", title: "Done" },
] as const;

export const TASK_DETAILS_STATUS_STYLES = {
  TODO: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-sky-100 text-sky-700",
  DONE: "bg-emerald-100 text-emerald-700",
} as const;

export const TASK_COLUMN_STYLES = {
  TODO: {
    container: "bg-amber-50/80 border border-amber-200/70",
    active: "ring-2 ring-amber-400 bg-amber-100/70",
    badge: "bg-amber-100 text-amber-700",
  },
  IN_PROGRESS: {
    container: "bg-sky-50/80 border border-sky-200/70",
    active: "ring-2 ring-sky-400 bg-sky-100/70",
    badge: "bg-sky-100 text-sky-700",
  },
  DONE: {
    container: "bg-emerald-50/80 border border-emerald-200/70",
    active: "ring-2 ring-emerald-400 bg-emerald-100/70",
    badge: "bg-emerald-100 text-emerald-700",
  },
} as const;
