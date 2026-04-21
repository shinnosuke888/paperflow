import { PAPER_CATEGORIES } from "@/lib/site";

type TimelineFiltersProps = {
  category: string;
  query: string;
};

export function TimelineFilters({ category, query }: TimelineFiltersProps) {
  return (
    <form action="/" className="filter-form">
      <label className="field grow">
        <span>Search</span>
        <input defaultValue={query} name="q" placeholder="transformer, reasoning, diffusion..." />
      </label>

      <label className="field">
        <span>Category</span>
        <select defaultValue={category} name="category">
          {PAPER_CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <button className="primary-button" type="submit">
        Refresh feed
      </button>
    </form>
  );
}
