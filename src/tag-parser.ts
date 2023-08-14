import type { DocblockTag, DocblockTagValue, DocblockOffset, LineBreakChar } from './types';
import { adjustPosition, getOffsetFromLineAndColumn, isEmptyLine, isTagLine } from './util';

class TagParser {
	/**
	 * Docblock lines. Inherited from the Parser class.
	 */
	docblockLines: string[] = [];

	/**
	 * Whether the tag name has been collected.
	 */
	isTagCollected = false;

	/**
	 * Whether the type has been collected.
	 */
	isTypeCollected = false;

	/**
	 * Whether the descriptor has been collected.
	 * Descriptor is the text after the tag name, type,
	 * and variable.
	 */
	isDescriptorCollected = false;

	/**
	 * Offset all positions by these values.
	 */
	offset: DocblockOffset = {
		line: 0,
		count: 0,
	};

	/**
	 * Tag collector that contains the tag name, type, variable, and description.
	 */
	tagCollector: DocblockTag = {} as DocblockTag;

	/**
	 * Start line index of the tag line.
	 */
	lineIndex = 0;

	/**
	 * Current index of the loop for each line.
	 */
	loopIndex = -1;

	/**
	 * Line index to skip. This is for multi-line description.
	 */
	skipLine = -1;

	/**
	 * Line break character
	 */
	lineBreakChar: LineBreakChar;

	/**
	 * Constructor.
	 *
	 * @param {string[]}       docblock      Docblock lines
	 * @param {DocblockOffset} offset        Start line offset.
	 * @param {LineBreakChar}  lineBreakChar Line break character
	 */
	constructor(docblock: string[], offset: DocblockOffset, lineBreakChar: LineBreakChar = 'LF') {
		this.docblockLines = docblock;
		this.offset = offset;
		this.lineBreakChar = lineBreakChar;
	}

	/**
	 * Parse a tag line to extract the tag name, type, variable, and description.
	 *
	 * @param  {number}      lineIndex Line index of the tag line
	 * @return {DocblockTag}           Object containing the tag name,
	 *                                 type, variable, and description
	 */
	parse(lineIndex: number): DocblockTag | false {
		this.lineIndex = lineIndex;

		// If skip line is set, skip the line
		// This is for multi-line description
		if (lineIndex < this.skipLine) {
			return false;
		}

		const position = {
			start: {
				line: 0,
				column: 0,
				offset: 0,
			},
			end: {
				line: 0,
				column: 0,
				offset: 0,
			},
		};

		this.tagCollector = {
			name: {
				value: '',
				position,
			},
			description: [],
			type: {
				value: '',
				position,
			},
			descriptor: {
				value: '',
				position,
			},
			position,
		};

		const line = this.docblockLines[this.lineIndex];
		this.isTagCollected = false;
		this.isTypeCollected = false;
		this.isDescriptorCollected = false;
		for (this.loopIndex = 0; this.loopIndex < line.length; this.loopIndex++) {
			const char = line[this.loopIndex];

			if (char === '@' && this.isTagCollected === false) {
				this.collectTagName();
				continue;
			}

			const isCollected = this.collectType();
			if (isCollected) {
				continue;
			}

			// PHP variable
			if (
				char === '$' &&
				this.isDescriptorCollected === false &&
				this.hasArgument(this.tagCollector.name.value)
			) {
				this.collectPhpVariable();
				continue;
			}

			// Collect version number for @since tag
			if (this.tagCollector.name.value === '@since' && this.isDescriptorCollected === false) {
				// skip leading whitespace
				if (char === ' ') {
					continue;
				}

				this.collectDescriptor();
				continue;
			}

			// Some tags don't have arguments (e.g. @return)
			// If the tag doesn't have an argument, we can assume that the description starts here.
			if (!this.hasArgument(this.tagCollector.name.value) && this.isTagCollected) {
				this.isDescriptorCollected = true;
			}

			// Some tags don't have types (e.g. @since)
			// If the tag doesn't have a type, we can assume that the description starts here.
			if (!this.hasType(this.tagCollector.name.value) && this.isTagCollected) {
				this.isTypeCollected = true;
			}

			// All collected, which means we are meeting the description
			if (this.isTagCollected && this.isTypeCollected && this.isDescriptorCollected) {
				this.collectDescription();
				break;
			}
		}

		return this.tagCollector;
	}

	/**
	 * Collect tag type.
	 *
	 * @return {boolean} Whether the type has been collected
	 */
	collectType(): boolean {
		const line = this.docblockLines[this.lineIndex];
		const char = line[this.loopIndex];

		// Check if the next character is '{'
		// if it is, it means that it is a Javascript type, so we skip
		// this iteration. This is to avoid collecting the type as a
		// PHP type since PHP type check below is just checking for
		// a space.
		const nextChar = line[this.loopIndex + 1];
		if (nextChar === '{') {
			return false;
		}

		if (this.hasType(this.tagCollector.name.value) && this.isTagCollected) {
			// Javascript type
			if (char === '{' && this.isTypeCollected === false) {
				this.collectJsType();
				return true;
			}

			// PHP type
			if (char === ' ' && this.isTypeCollected === false) {
				// check for '$' to avoid collecting the variable
				// as a type if there is no type
				if (nextChar === undefined || nextChar === '$') {
					this.isTypeCollected = true;

					return true;
				}

				this.collectPhpType();
				return true;
			}

			this.isTypeCollected = true;
		}

		return false;
	}

	/**
	 * Collect description.
	 * Description is the text after the tag name, type,
	 * and variable. Tt can span multiple lines.
	 * The description ends when it meets another tag, or
	 * an empty line.
	 *
	 * @example
	 * - @param string $var, the description is "the description"
	 */
	collectDescription() {
		const line = this.docblockLines[this.lineIndex];
		const description = line.slice(this.loopIndex);
		const leadingWhitespace = description.match(/^\s+/u);
		let descriptionIndex = 0;

		// Start description after the leading whitespace
		if (leadingWhitespace !== null) {
			descriptionIndex += leadingWhitespace[0].length;
		}

		const startColumn = this.loopIndex + descriptionIndex;
		const endColumn = startColumn + (description.length - descriptionIndex);

		// Add the first line of the description
		const position = adjustPosition({
			start: {
				line: this.lineIndex,
				column: startColumn,
				offset: getOffsetFromLineAndColumn(
					this.lineIndex, startColumn, this.docblockLines, this.lineBreakChar
				),
			},
			end: {
				line: this.lineIndex,
				column: endColumn,
				offset: getOffsetFromLineAndColumn(
					this.lineIndex, endColumn, this.docblockLines, this.lineBreakChar
				),
			},
		}, this.offset);

		this.tagCollector.description.push({
			value: description.slice(descriptionIndex),
			position,
		},
			...this.getMultiLineDesc(this.lineIndex + 1));
	}

	/**
	 * Collect tag descriptor.
	 *
	 * @example
	 * - @since 1.0.0, the descriptor is "1.0.0"
	 * - @since 1.0.0-beta.1, the descriptor is "1.0.0-beta.1"
	 */
	collectDescriptor() {
		const line = this.docblockLines[this.lineIndex];

		const startColumn = this.loopIndex;
		this.tagCollector.descriptor.value = this.consumeUntil(line.slice(startColumn), ' ');

		const versionLength = this.tagCollector.descriptor.value.length;

		this.tagCollector.descriptor.position = adjustPosition({
			start: {
				line: this.lineIndex,
				column: startColumn,
				offset: getOffsetFromLineAndColumn(
					this.lineIndex, startColumn, this.docblockLines, this.lineBreakChar
				),
			},
			end: {
				line: this.lineIndex,
				column: startColumn + versionLength,
				offset: getOffsetFromLineAndColumn(
					this.lineIndex,
					startColumn + versionLength,
					this.docblockLines,
					this.lineBreakChar
				),
			},
		}, this.offset);

		this.isDescriptorCollected = true;
		this.loopIndex += versionLength;
	}

	/**
	 * Collect PHP variable.
	 *
	 * @example
	 * - @param string $var, the variable is "$var"
	 */
	collectPhpVariable() {
		const line = this.docblockLines[this.lineIndex];

		const startColumn = this.loopIndex;
		this.tagCollector.descriptor.value = this.consumeUntil(line.slice(startColumn), ' ');

		const variableLength = this.tagCollector.descriptor.value.length;

		this.tagCollector.descriptor.position = adjustPosition({
			start: {
				line: this.lineIndex,
				column: startColumn,
				offset: getOffsetFromLineAndColumn(
					this.lineIndex, startColumn, this.docblockLines, this.lineBreakChar
				),
			},
			end: {
				line: this.lineIndex,
				column: startColumn + variableLength,
				offset: getOffsetFromLineAndColumn(
					this.lineIndex,
					startColumn + variableLength,
					this.docblockLines,
					this.lineBreakChar
				),
			},
		}, this.offset);

		this.isDescriptorCollected = true;
		this.loopIndex = startColumn + variableLength;
	}

	/**
	 * Collect PHP type.
	 *
	 * @example
	 * - @param string $var, the type is "string"
	 */
	collectPhpType() {
		const line = this.docblockLines[this.lineIndex];
		let typeIndex = this.loopIndex + 1;
		const sliceLine = line.slice(typeIndex);

		// Ignore leading whitespace
		const leadingWhitespace = sliceLine.match(/^\s+/u);
		if (leadingWhitespace !== null) {
			typeIndex += leadingWhitespace[0].length;
			this.loopIndex += leadingWhitespace[0].length;
		}

		// const startColumn = this.loopIndex + 1;
		this.tagCollector.type.value += this.consumeUntil(line.slice(typeIndex), ' ');
		const typeLength = this.tagCollector.type.value.length;

		this.tagCollector.type.position = adjustPosition({
			start: {
				line: this.lineIndex,
				column: typeIndex,
				offset: getOffsetFromLineAndColumn(
					this.lineIndex, typeIndex, this.docblockLines, this.lineBreakChar
				),
			},
			end: {
				line: this.lineIndex,
				column: typeIndex + typeLength,
				offset: getOffsetFromLineAndColumn(
					this.lineIndex,
					typeIndex + typeLength,
					this.docblockLines,
					this.lineBreakChar
				),
			},
		}, this.offset);

		this.isTypeCollected = true;

		// + 1 to include the space
		this.loopIndex += typeLength + 1;
	}

	/**
	 * Collect Javascript type.
	 * Javascript type is wrapped in curly braces.
	 *
	 * @example
	 * - @param {string} var, the type is "string"
	 */
	collectJsType() {
		const line = this.docblockLines[this.lineIndex];
		const char = line[this.loopIndex];

		// Set value and position
		this.tagCollector.type.value += char;
		this.tagCollector.type.value += this.consumeUntil(line.slice(this.loopIndex + 1), '}');
		this.tagCollector.type.value += '}';

		const typeLength = this.tagCollector.type.value.length;

		this.tagCollector.type.position = adjustPosition({
			start: {
				line: this.lineIndex,
				column: this.loopIndex,
				offset: getOffsetFromLineAndColumn(
					this.lineIndex, this.loopIndex, this.docblockLines, this.lineBreakChar
				),
			},
			end: {
				line: this.lineIndex,
				column: this.loopIndex + typeLength,
				offset: getOffsetFromLineAndColumn(
					this.lineIndex,
					this.loopIndex + typeLength,
					this.docblockLines,
					this.lineBreakChar
				),
			},
		}, this.offset);

		this.isTypeCollected = true;
		this.loopIndex += typeLength;
	}

	/**
	 * Collect tag name.
	 *
	 * @example
	 * - @param, the tag name is "@param"
	 * - @return, the tag name is "@return"
	 */
	collectTagName() {
		const line = this.docblockLines[this.lineIndex];
		const char = line[this.loopIndex];

		// Set tag name and position
		this.tagCollector.name.value += char;
		this.tagCollector.name.value += this.consumeUntil(line.slice(this.loopIndex + 1), ' ');

		const tagLength = this.tagCollector.name.value.length;

		this.tagCollector.name.position = adjustPosition({
			start: {
				line: this.lineIndex,
				column: this.loopIndex,
				offset: getOffsetFromLineAndColumn(
					this.lineIndex, this.loopIndex, this.docblockLines, this.lineBreakChar
				),
			},
			end: {
				line: this.lineIndex,
				column: this.loopIndex + tagLength,
				offset: getOffsetFromLineAndColumn(
					this.lineIndex,
					this.loopIndex + tagLength,
					this.docblockLines,
					this.lineBreakChar
				),
			},
		}, this.offset);

		this.tagCollector.position.start.column = this.loopIndex;

		this.isTagCollected = true;
		this.loopIndex += tagLength - 1;
	}

	/**
	 * Check if the tag has a type.
	 *
	 * @param  {string}  tagName Tag name to check
	 * @return {boolean}         Whether the tag has a type
	 */
	hasType(tagName: string): boolean {
		return ['@param', '@return'].includes(tagName.trim());
	}

	/**
	 * Check if the tag has an argument.
	 *
	 * @param  {string}  tagName Tag name to check
	 * @return {boolean}         Whether the tag has an argument
	 */
	hasArgument(tagName: string): boolean {
		return ['@param', '@since'].includes(tagName.trim());
	}

	/**
	 * Get description that spans multiple lines.
	 * The description ends when it meets another tag, or
	 * an empty line.
	 *
	 * @param  {number}             index Line index of the first line of the description
	 * @return {DocblockTagValue[]}       Description that spans multiple lines
	 */
	getMultiLineDesc(index: number): DocblockTagValue[] {
		const sliceLines = this.docblockLines.slice(index);
		const description: DocblockTagValue[] = [];

		let lineIndex = index;
		for (const line of sliceLines) {
			if (isEmptyLine(line) || isTagLine(line)) {
				break;
			}

			// ignore space and asterisk at the beginning of the line
			const trimmedLine = line.match(/^\s*\*\s*/u)?.at(-1) ?? '';
			const lineContent = line.slice(trimmedLine.length);

			const position = adjustPosition({
				start: {
					line: index,
					column: trimmedLine.length,
					offset: getOffsetFromLineAndColumn(
						index, trimmedLine.length, this.docblockLines, this.lineBreakChar
					),
				},
				end: {
					line: index,
					column: line.length,
					offset: getOffsetFromLineAndColumn(
						index, line.length, this.docblockLines, this.lineBreakChar
					),
				},
			}, this.offset);

			description.push({
				value: lineContent,
				position,
			});

			lineIndex++;
			this.skipLine = lineIndex;
		}

		return description;
	}

	/**
	 * Get all characters from the beginning of the line until the specified character.
	 *
	 * @param  {string} line Line to consume
	 * @param  {string} char Character to consume until
	 * @return {string}      Consumed characters
	 */
	consumeUntil(line: string, char: string): string {
		let consumed = '';
		for (const currentChar of line) {
			if (currentChar === char) {
				break;
			}

			consumed += currentChar;
		}

		return consumed;
	}
}

export default TagParser;