/**
 * Capitalizes the first letter of a string, then recursively capitalizes
 * the first letter after each period.
 */
export const capital = (string: string) => {
  const firstLetter = string.charAt(0).toUpperCase();
  let result = firstLetter + string.slice(1);

  const dotIndex = result.indexOf(".");
  if (dotIndex !== -1) {
    const afterDot = result.slice(dotIndex + 1);
    const trimmed = afterDot.trimStart();
    const spaces = " ".repeat(afterDot.length - trimmed.length);
    result = result.slice(0, dotIndex + 1) + spaces + capital(trimmed);
  }

  return result;
};

/**
 * Capitalizes every word in a string, optionally between start/end bounds.
 * Bounds can be a string (finds the index of that substring) or a number (direct index).
 */
export const capitalEach = (str: string, start?: string | number, end?: string | number) => {
  let startIndex = 0;
  let endIndex = str.length;

  if (typeof start === "string") {
    const idx = str.indexOf(start);
    if (idx !== -1) startIndex = idx;
  } else if (typeof start === "number") {
    startIndex = start;
  }

  if (typeof end === "string") {
    const idx = str.indexOf(end);
    if (idx !== -1) endIndex = idx;
  } else if (typeof end === "number") {
    endIndex = end;
  }

  const prefix = str.slice(0, startIndex);
  const suffix = str.slice(endIndex);
  const capitalized = str
    .slice(startIndex, endIndex)
    .split(" ")
    .map((word) => (word[0] ? word[0].toUpperCase() + word.slice(1) : ""))
    .join(" ");

  return prefix + capitalized + suffix;
};

/**
 * Inserts spaces before uppercase letters and replaces _ / - with spaces.
 * @example spacing("newUser") // "new user"
 */
export const spacing = (str: string) => {
  let spaced = "";
  for (const letter of str) {
    const idx = spaced.length - 1;
    if (str[idx - 1] !== " " && /[A-Z]/.test(letter)) {
      spaced += " " + letter;
    } else if (letter === "_" || letter === "-") {
      spaced += " ";
    } else {
      spaced += letter;
    }
  }
  return spaced.trim();
};

/**
 * Converts a camelCase or snake_case string to kebab-case.
 * @example kebab("newUser") // "new-user"
 */
export const kebab = (str: string) => spacing(str).replaceAll(" ", "-");

/**
 * Returns true if the string is a valid HTTP/HTTPS URL.
 * @example isValidUrl("https://google.com") // true
 */
export const isValidUrl = (str: string) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};
