export const TIMELINE_PAGE_SIZE = 20;

export const DEFAULT_SEARCH_QUERY =
  "cat:cs.AI OR cat:cs.LG OR cat:cs.CL OR cat:cs.CV";

export const PAPER_CATEGORIES = [
  { value: "all", label: "For You" },
  { value: "cs.AI", label: "AI" },
  { value: "cs.LG", label: "ML" },
  { value: "cs.CL", label: "NLP" },
  { value: "cs.CV", label: "Vision" },
  { value: "cs.RO", label: "Robotics" },
  { value: "cs.HC", label: "HCI" },
  { value: "stat.ML", label: "Stats ML" },
];

export function isKnownCategory(value: string | undefined) {
  if (!value) {
    return false;
  }

  return PAPER_CATEGORIES.some((category) => category.value === value);
}
