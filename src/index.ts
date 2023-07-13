import type { DocblockTagValue, Docblock, DocblockTag } from './types';

class Parser {
	hasMetSummary = false;
	hasMetDescription = false;
	hasMetTags = false;

	collector: Docblock = {
		summary: {
			value: '',
		},
		description: [],
		tags: [],
	};

	docblockLines: string[] = [];

	offsetLine = 0;
	offsetCount = 0;

	parse(docblock: string, startLine = 0, startOffset = 0) {
		this.offsetLine = startLine;
		this.offsetCount = startOffset;

		this.docblockLines = docblock.split(/\r?\n/u);
		for (let lineIndex = 0; lineIndex < this.docblockLines.length; lineIndex++) {
			const line = this.docblockLines[lineIndex];
			if (this.isEmptyLine(line)) {
				continue;
			}

			const isTagged = this.isTagLine(line) || this.hasMetTags;
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

				const position = this.adjustPosition({
					start: {
						line: lineIndex,
						column: trimmedLine.length,
						offset: this.getOffsetFromLineAndColumn(lineIndex, trimmedLine.length),
					},
					end: {
						line: lineIndex,
						column: lineColumnEnd,
						offset: this.getOffsetFromLineAndColumn(lineIndex, lineColumnEnd),
					},
				});

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
			const parsedTag = this.parseTagLine(lineIndex);

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

	getMultiLineDesc(index: number): DocblockTagValue[] {
		const sliceLines = this.docblockLines.slice(index);
		const description: DocblockTagValue[] = [];
		for (const line of sliceLines) {
			if (this.isEmptyLine(line) || this.isTagLine(line)) {
				break;
			}

			// ignore space and asterisk at the beginning of the line
			const trimmedLine = line.match(/^\s*\*\s*/u)?.at(-1) ?? '';
			const lineContent = line.slice(trimmedLine.length);

			const position = this.adjustPosition(
				{
					start: {
						line: index,
						column: trimmedLine.length,
						offset: this.getOffsetFromLineAndColumn(index, trimmedLine.length),
					},
					end: {
						line: index,
						column: line.length,
						offset: this.getOffsetFromLineAndColumn(index, line.length),
					},
				}
			);
			description.push({
				value: lineContent,
				position,
			});
		}

		return description;
	}

	/**
	 * Adjust position based on offsetLine and offsetCount
	 *
	 * @param position Position to adjust
	 */
	adjustPosition(position: any) {
		position.start.line += this.offsetLine;
		position.start.offset += this.offsetCount;
		position.end.line += this.offsetLine;
		position.end.offset += this.offsetCount;

		return position;
	}

	getOffsetFromLineAndColumn(
		lineIndex: number,
		column: number
	): number {
		let offset = 0;
		for (let index = 0; index < lineIndex; index++) {
			offset += this.docblockLines[index].length;
		}

		// Adding lineIndex for line breaks (assuming LF)
		return offset + column + lineIndex;
	}

	// eslint-disable-next-line max-lines-per-function
	parseTagLine(lineIndex: number) {
		let isTagCollected = false;
		let isTypeCollected = false;
		let isVariableCollected = false;
		const line = this.docblockLines[lineIndex];

		const tagCollector: DocblockTag = {
			name: {
				value: '',
				position: {
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
				},
			},
			description: [],
			type: {
				value: '',
				position: {
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
				},
			},
			variable: {
				value: '',
				position: {
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
				},
			},
			position: {
				start: {
					line: 0,
					column: 0,
					offset: 0,
				},
				end: {
					line: 0,
					column: line.length,
					offset: 0,
				},
			},
		};

		for (let index = 0; index < line.length; index++) {
			const char = line[index];

			if (char === '@' && isTagCollected === false) {
				// Set tag name and position
				tagCollector.name.value += char;
				tagCollector.name.value += this.consumeUntil(line.slice(index + 1), ' ');

				const tagLength = tagCollector.name.value.length;
				tagCollector.name.position = this.adjustPosition({
					start: {
						line: lineIndex,
						column: index,
						offset: this.getOffsetFromLineAndColumn(lineIndex, index),
					},
					end: {
						line: lineIndex,
						column: index + tagLength,
						offset: this.getOffsetFromLineAndColumn(
							lineIndex, index + tagLength
						),
					},
				});

				tagCollector.position.start.column = index;
				index += tagLength - 1;

				isTagCollected = true;
				continue;
			}

			if (this.hasType(tagCollector.name.value) && isTagCollected) {
				// Javascript type
				if (char === '{' && isTypeCollected === false) {
					// Set value and position
					tagCollector.type.value += char;
					tagCollector.type.value += this.consumeUntil(line.slice(index + 1), '}');
					tagCollector.type.value += '}';

					const typeLength = tagCollector.type.value.length;
					index += typeLength;

					tagCollector.type.position = this.adjustPosition({
						start: {
							line: lineIndex,
							column: index,
							offset: this.getOffsetFromLineAndColumn(
								lineIndex, index
							),
						},
						end: {
							line: lineIndex,
							column: index + typeLength,
							offset: this.getOffsetFromLineAndColumn(lineIndex, index + typeLength),
						},
					});

					isTypeCollected = true;
					continue;
				}

				// PHP type
				if (char === ' ' && isTypeCollected === false) {
					// check for '$' to avoid collecting the variable
					// if there is no type
					const nextChar = line[index + 1];
					if (nextChar === undefined || nextChar === '$') {
						isTypeCollected = true;

						continue;
					}

					tagCollector.type.value += this.consumeUntil(line.slice(index + 1), ' ');
					const typeLength = tagCollector.type.value.length;
					index += typeLength;

					tagCollector.type.position = this.adjustPosition({
						start: {
							line: lineIndex,
							column: index,
							offset: this.getOffsetFromLineAndColumn(lineIndex, index),
						},
						end: {
							line: lineIndex,
							column: index + typeLength,
							offset: this.getOffsetFromLineAndColumn(lineIndex, index + typeLength),
						},
					});

					isTypeCollected = true;
					continue;
				}

				isTypeCollected = true;
			}

			// PHP variable
			if (
				char === '$' &&
				isVariableCollected === false &&
				this.hasArgument(tagCollector.name.value)
			) {
				tagCollector.variable.value += char;
				tagCollector.variable.value += this.consumeUntil(line.slice(index + 1), ' ');

				const variableLength = tagCollector.variable.value.length;
				index += variableLength;

				tagCollector.variable.position = this.adjustPosition({
					start: {
						line: lineIndex,
						column: index,
						offset: this.getOffsetFromLineAndColumn(lineIndex, index),
					},
					end: {
						line: lineIndex,
						column: index + variableLength,
						offset: this.getOffsetFromLineAndColumn(lineIndex, index + variableLength),
					},
				});

				isVariableCollected = true;
				continue;
			}

			// Some tags don't have arguments (e.g. @return)
			// If the tag doesn't have an argument, we can assume that the description starts here.
			if (!this.hasArgument(tagCollector.name.value) && isTagCollected) {
				isVariableCollected = true;
			}

			// Some tags don't have types (e.g. @since)
			// If the tag doesn't have a type, we can assume that the description starts here.
			if (!this.hasType(tagCollector.name.value) && isTagCollected) {
				isTypeCollected = true;
			}

			// All collected, which means we are meeting the description
			if (isTagCollected && isTypeCollected && isVariableCollected) {
				const description = line.slice(index);
				const leadingWhitespace = description.match(/^\s+/u);
				let descriptionIndex = 0;

				// Start description after the leading whitespace
				if (leadingWhitespace !== null) {
					descriptionIndex += leadingWhitespace[0].length;
				}

				const startColumn = index + descriptionIndex;
				const endColumn = startColumn + description.length;

				// Add the first line of the description
				const position = this.adjustPosition({
					start: {
						line: lineIndex,
						column: startColumn,
						offset: this.getOffsetFromLineAndColumn(lineIndex, startColumn),
					},
					end: {
						line: lineIndex,
						column: endColumn,
						offset: this.getOffsetFromLineAndColumn(
							lineIndex, endColumn
						),
					},
				});

				tagCollector.description.push({
					value: description.slice(descriptionIndex),
					position,
				},
					...this.getMultiLineDesc(lineIndex + 1));
				break;
			}
		}

		return tagCollector;
	}

	/**
	 * Check if a line is empty.
	 * A line is considered empty if it contains only whitespace and an asterisk.
	 *
	 * @param  {string}  line Line to check
	 * @return {boolean}      Whether the line is empty
	 */
	isEmptyLine(line: string): boolean {
		return (/^\s*\/*\*+\/*\s*$/u.test(line));
	}

	/**
	 * Check if a line is a tag line.
	 * A line is considered a tag line if it starts with an asterisk and an @.
	 *
	 * @param  {string}  line Line string to check
	 * @return {boolean}      Whether the line is a tag line
	 */
	isTagLine(line: string): boolean {
		return /^\s*\*\s*@\S+/u.test(line);
	}

	hasArgument(tagName: string) {
		return ['@param'].includes(tagName.trim());
	}

	hasType(tagName: string) {
		return ['@param', '@return'].includes(tagName.trim());
	}

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

export default Parser;
export { type DocblockTagValue, type Docblock, type DocblockTag } from './types';
