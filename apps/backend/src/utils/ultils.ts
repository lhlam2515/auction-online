export const maskName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "****";
  if (parts.length === 1) return "****";
  const last = parts[parts.length - 1];
  return "****" + last;
};
