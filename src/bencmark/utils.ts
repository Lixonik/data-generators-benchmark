export const getFunctionName = (fn: Function): string => fn.name.split(' ').at(-1) ?? 'fn'
