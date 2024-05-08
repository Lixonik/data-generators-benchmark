export const getFunctionName = (fn: Function): string => fn.name.split(' ').at(-1) ?? 'fn'

export const calculateOpsPerSecond =  (time: number) => (time > 0) ? (1 / (time / 1000)) : 0