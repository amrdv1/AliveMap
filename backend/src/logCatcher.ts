export const memoryLogs: string[] = [];

const origLog = console.log;
const origErr = console.error;

console.log = function(...args: any[]) {
  memoryLogs.push(new Date().toISOString() + " [LOG] " + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(" "));
  if (memoryLogs.length > 200) memoryLogs.shift();
  origLog.apply(console, args as any);
};

console.error = function(...args: any[]) {
  memoryLogs.push(new Date().toISOString() + " [ERR] " + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(" "));
  if (memoryLogs.length > 200) memoryLogs.shift();
  origErr.apply(console, args as any);
};
