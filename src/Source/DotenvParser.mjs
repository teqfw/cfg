// @ts-check
/**
 * @namespace TeqFw_Cfg_Source_DotenvParser
 * @description Deterministic internal dotenv grammar parser.
 */

/**
 * @this {TeqFw_Cfg_Source_DotenvParser}
 */
export default function DotenvParser() {
  /** @param {unknown} text @returns {Record<string, string>} */
  this.parse = function (text) {
    if (typeof text !== "string") throw new TypeError("text");
    const source = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
    const result = new Map();
    let index = 0;
    while (index < source.length) {
      while (source[index] === " " || source[index] === "\t") index++;
      if (source[index] === "\n" || source[index] === "\r") {
        index = skipNewline(source, index);
        continue;
      }
      if (source[index] === "#") {
        index = skipLine(source, index);
        continue;
      }
      if (
        source.startsWith("export", index) &&
        isWhitespace(source[index + 6])
      ) {
        index += 6;
        while (source[index] === " " || source[index] === "\t") index++;
      }
      const nameStart = index;
      while (
        index < source.length &&
        source[index] !== "=" &&
        !isWhitespace(source[index])
      )
        index++;
      if (index === nameStart) throw new Error("malformed assignment");
      const name = source.slice(nameStart, index);
      while (source[index] === " " || source[index] === "\t") index++;
      if (source[index] !== "=") throw new Error("malformed assignment");
      index++;
      while (source[index] === " " || source[index] === "\t") index++;
      const parsed = readValue(source, index);
      result.set(name, parsed.value);
      index = parsed.index;
    }
    return Object.fromEntries(result);
  };
}
/**
 * @param {unknown} char
 * @returns {boolean}
 */
function isWhitespace(char) {
  return char === " " || char === "\t" || char === "\r" || char === "\n";
}
/**
 * @param {string} source
 * @param {number} index
 * @returns {number}
 */
function skipNewline(source, index) {
  return source[index] === "\r" && source[index + 1] === "\n"
    ? index + 2
    : index + 1;
}
/**
 * @param {string} source
 * @param {number} index
 * @returns {number}
 */
function skipLine(source, index) {
  while (
    index < source.length &&
    source[index] !== "\n" &&
    source[index] !== "\r"
  )
    index++;
  return index;
}
/**
 * @param {string} source
 * @param {number} index
 * @returns {TeqFw_Cfg_Source_DotenvParser__Result}
 */
function readValue(source, index) {
  const quote = source[index];
  if (quote !== "'" && quote !== '"') {
    const start = index;
    while (
      index < source.length &&
      source[index] !== "\n" &&
      source[index] !== "\r" &&
      source[index] !== "#"
    )
      index++;
    return {
      value: source.slice(start, index).trim(),
      index: skipLine(source, index),
    };
  }
  index++;
  let value = "";
  while (index < source.length) {
    const char = source[index++];
    if (char === quote) {
      while (source[index] === " " || source[index] === "\t") index++;
      if (
        source[index] &&
        source[index] !== "#" &&
        source[index] !== "\n" &&
        source[index] !== "\r"
      )
        throw new Error("malformed quote");
      return { value, index: skipLine(source, index) };
    }
    if (char === "\r" || char === "\n") {
      value += "\n";
      if (char === "\r" && source[index] === "\n") index++;
    } else if (quote === '"' && char === "\\") {
      const escaped = source[index++];
      /** @type {Record<string, string>} */
      const escapes = { "\\": "\\", '"': '"', n: "\n", r: "\r", t: "\t" };
      if (!(escaped in escapes)) throw new Error("unsupported escape");
      value += escapes[escaped];
    } else value += char;
  }
  throw new Error("unclosed quote");
}
