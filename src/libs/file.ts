export const trimExt = (filename: string) => {
  const dotIdx = filename.lastIndexOf(".");
  return dotIdx === -1 ? filename : filename.slice(0, dotIdx);
};
