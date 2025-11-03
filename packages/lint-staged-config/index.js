export const config = {
  "*.{js,jsx,ts,tsx}": [
    (filenames) =>
      `eslint --fix ${filenames
        .map((f) => `"${f.replace(/\\/g, "/")}"`)
        .join(" ")}`,
    (filenames) =>
      `prettier --write ${filenames
        .map((f) => `"${f.replace(/\\/g, "/")}"`)
        .join(" ")}`,
  ],
  "*.{json,css,md}": [
    (filenames) =>
      `prettier --write ${filenames
        .map((f) => `"${f.replace(/\\/g, "/")}"`)
        .join(" ")}`,
  ],
};
