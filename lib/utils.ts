export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function parsePage(value: string | undefined, fallback = 1) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return fallback;
  }

  return page;
}

export function getSafeRedirectPath(value: string | undefined, fallback = "/") {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}
