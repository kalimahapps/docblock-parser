import type { Docblock, DocblockOffset, DocblockParserOptions } from './types';
import {
	adjustPosition,
	getOffsetFromLineAndColumn,
	isEmptyLine,
	isTagLine,
	getLineBreakChar
} from './util';
import TagParser from './tag-parser';

/* eslint  max-lines-per-function: ["warn", 120] */
class Parser {
	/**
	 * Whether the summary has been met
	 */
	hasMetSummary = false;

	/**
	 * Whether the description has been met
	 */
	hasMetDescription = false;

	/**
	 * Whether the tags have been met
	 */
	hasMetTags = false;

	/**
	 * Collector object to collect the summary, description, and tags
	 */
	collector: Docblock = {
		summary: {
			value: '',
		},
		description: [],
		tags: [],
	};

	/**
	 * Docblock lines split by linebreak
	 */
	docblockLines: string[] = [];

	/**
	 * Line break character
	 */
	lineBreakChar: 'LF' | 'CRLF' = 'LF';

	/**
	 * Parse a docblock to extract the summary, description, and tags.
	 *
	 * @param  {string}                docblock Docblock to parse
	 * @param  {DocblockParserOptions} options  Options to parse the docblock
	 * @return {Docblock}                       Object containing the summary, description, and tags
	 */
	parse(docblock: string, options: DocblockParserOptions = {}): Docblock {
		const offset: DocblockOffset = {
			line: options.line ?? 0,
			count: options.count ?? 0,
		};

		this.docblockLines = docblock.split(/\r?\n/u);
		const tagParser = new TagParser(this.docblockLines, offset);
		this.lineBreakChar = getLineBreakChar(docblock);

		for (let lineIndex = 0; lineIndex < this.docblockLines.length; lineIndex++) {
			const line = this.docblockLines[lineIndex];
			if (isEmptyLine(line)) {
				continue;
			}

			const isTagged = isTagLine(line) || this.hasMetTags;
			if (!isTagged) {
				// ignore space and asterisk ( *) and slash and asterisk (/** )
				// at the beginning of the line
				const trimmedLine = line.match(/(?:^\s*\*\s*)|(?:^\s*\/\*\*\s*)/u)?.at(-1) ?? '';

				// ignore space and asterisk (*/) at the end of the line
				const trimmedLineEnd = line.match(/\s*\*\/$/u)?.at(-1) ?? '';

				let lineContent = line.slice(trimmedLine.length);
				if (trimmedLineEnd.length > 0) {
					lineContent = lineContent.slice(0, -trimmedLineEnd.length);
				}

				const lineColumnEnd = line.length - trimmedLineEnd.length;

				const position = adjustPosition({
					start: {
						line: lineIndex,
						column: trimmedLine.length,
						offset: getOffsetFromLineAndColumn(
							lineIndex, trimmedLine.length, this.docblockLines, this.lineBreakChar
						),
					},
					end: {
						line: lineIndex,
						column: lineColumnEnd,
						offset: getOffsetFromLineAndColumn(
							lineIndex, lineColumnEnd, this.docblockLines, this.lineBreakChar
						),
					},
				}, offset);

				if (!this.hasMetSummary) {
					this.collector.summary = {
						value: lineContent,
					};

					if (lineContent.length > 0) {
						this.collector.summary.position = position;
					}

					this.hasMetSummary = true;
					continue;
				}

				if (!this.hasMetDescription) {
					this.collector.description.push({
						value: lineContent,
						position,
					});
				}

				continue;
			}

			this.hasMetSummary = true;
			this.hasMetDescription = true;

			// Tagged line
			this.hasMetTags = true;

			const parsedTag = tagParser.parse(lineIndex);
			if (parsedTag === false) {
				continue;
			}

			let endPosition = parsedTag.type.position.end;

			const lastDescriptionLine = parsedTag.description.at(-1);
			if (lastDescriptionLine !== undefined) {
				endPosition = lastDescriptionLine.position.end;
			}

			parsedTag.position = {
				start: parsedTag.name.position.start,
				end: endPosition,
			};

			// get tag from line
			this.collector.tags.push(parsedTag);
		}

		return this.collector;
	}
}

export default Parser;
export { type DocblockTagValue, type Docblock, type DocblockTag } from './types';
