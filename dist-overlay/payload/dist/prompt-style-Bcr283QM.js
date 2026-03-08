import { f as isRich, p as theme } from "./globals-Bv4ZcVWM.js";
//#region src/terminal/prompt-style.ts
const stylePromptMessage = (message) => isRich() ? theme.accent(message) : message;
const stylePromptTitle = (title) => title && isRich() ? theme.heading(title) : title;
const stylePromptHint = (hint) => hint && isRich() ? theme.muted(hint) : hint;
//#endregion
export { stylePromptMessage as n, stylePromptTitle as r, stylePromptHint as t };
