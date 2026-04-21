const absoluteFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const shortFormatter = new Intl.DateTimeFormat("ja-JP", {
  month: "short",
  day: "numeric",
});

const relativeFormatter = new Intl.RelativeTimeFormat("ja-JP", {
  numeric: "auto",
});

export function formatAbsoluteDate(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return absoluteFormatter.format(new Date(value));
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return shortFormatter.format(new Date(value));
}

export function formatRelativeDate(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const diffInSeconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  for (const [unit, divider] of units) {
    if (Math.abs(diffInSeconds) >= divider || unit === "minute") {
      return relativeFormatter.format(Math.round(diffInSeconds / divider), unit);
    }
  }

  return relativeFormatter.format(diffInSeconds, "second");
}
