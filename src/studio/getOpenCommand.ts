type OpenCommand = {
  command: string;
  args: string[];
};

const getOpenCommand = (platform: string, url: string): OpenCommand => {
  if (platform === "darwin") return { command: "open", args: [url] };
  if (platform === "win32") {
    return { command: "cmd", args: ["/c", "start", "", url] };
  }
  return { command: "xdg-open", args: [url] };
};

export { getOpenCommand };
export type { OpenCommand };
