import type { DocblockOffset, DocblockPosition, LineBreakChar } from './types';

/**
 * Adjust position based on offsetLine and offsetCount
 *
 * @param  {any}            position Position to adjust
 * @param  {DocblockOffset} offset   Offset to adjust
 * @return {any}                     Adjusted position
 */
const adjustPosition = function (
	position: DocblockPosition,
	offset: DocblockOffset
): DocblockPosition {
	const { line, count } = offset;
	position.start.line += line;
	position.start.offset += count;
	position.end.line += line;
	position.end.offset += count;

	return position;
};

/**
 * Check if linebreak is LF or CRLF.
 *
 * @param  {string} string String to check
 * @return {string}        Linebreak character
 */
const getLineBreakChar = function (string: string): 'LF' | 'CRLF' {
	const indexOfLF = string.indexOf('\n', 1);

	if (indexOfLF === -1) {
		if (string.includes('\r')) {
			return 'CRLF';
		}

		return 'LF';
	}

	if (string[indexOfLF - 1] === '\r') {
		return 'CRLF';
	}

	return 'LF';
};

/**
 * Calculate offset based on the line and column
 *
 * @param  {number}        lineIndex     Line index to calculate
 * @param  {number}        column        Column index to calculate
 * @param  {string[]}      docblockLines Docblock lines
 * @param  {LineBreakChar} lineBreakChar The linebreak character (LF or CRLF)
 * @return {number}                      Offset
 */
const getOffsetFromLineAndColumn = function (
	lineIndex: number,
	column: number,
	docblockLines: string[],
	lineBreakChar: LineBreakChar
): number {
	let offset = 0;

	for (let index = 0; index < lineIndex; index++) {
		offset += docblockLines[index].length;
	}

	// const lineBreakChar = getLineBreakChar(docblockLines[lineIndex]);
	const singleLineBreakLength = lineBreakChar === 'CRLF' ? 2 : 1;
	const allLineBreakLength = singleLineBreakLength * (lineIndex);
	return offset + column + allLineBreakLength;
};

/**
 * Check if a line is empty.
 * A line is considered empty if it contains only whitespace and an asterisk.
 *
 * @param  {string}  line Line to check
 * @return {boolean}      Whether the line is empty
 */
const isEmptyLine = function (line: string): boolean {
	return (/^\s*\/*\*+\/*\s*$/u.test(line));
};

/**
 * Check if a line is a tag line.
 * A line is considered a tag line if it starts with an asterisk and an @.
 *
 * @param  {string}  line Line string to check
 * @return {boolean}      Whether the line is a tag line
 */
const isTagLine = function (line: string): boolean {
	return /^\s*\*\s*@\S+/u.test(line);
};

export {
	adjustPosition,
	getOffsetFromLineAndColumn,
	isEmptyLine,
	isTagLine,
	getLineBreakChar
};