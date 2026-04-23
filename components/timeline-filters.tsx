import { PAPER_CATEGORIES } from "@/lib/site";

type TimelineFiltersProps = {
  category: string;
  query: string;
};

export function TimelineFilters({ category, query }: TimelineFiltersProps) {
  return (
    <form action="/" className="filter-form">
      <label className="field grow">
        <span>キーワード検索</span>
        <input
          defaultValue={query}
          name="q"
          placeholder="transformer, reasoning, diffusion など"
        />
      </label>

      <label className="field">
        <span>カテゴリ</span>
        <select defaultValue={category} name="category">
          {PAPER_CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <button className="primary-button" type="submit">
        更新する
      </button>
    </form>
  );
}
