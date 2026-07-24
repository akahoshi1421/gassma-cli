const openBrowser = async (url: string): Promise<void> => {
  const open = (await import("open")).default;
  await open(url);
};

export { openBrowser };
