type DocblockPosition = {
	start: {
		line: number;
		column: number;
		offset: number;
	};
	end: {
		line: number;
		column: number;
		offset: number;
	};
};

type DocblockTagValue = {
	value: string;
	position: DocblockPosition;
};

type DocblockTag = {
	name: DocblockTagValue;
	description: DocblockTagValue[];
	type: DocblockTagValue;
	descriptor: DocblockTagValue;
	position: DocblockPosition;
};

type Docblock = {
	summary: {
		value: string;
		position?: DocblockPosition;
	};
	description: DocblockTagValue[];
	tags: DocblockTag[];
};

/**
 * Offset all the positions in the docblock
 * by these values which are provided by the
 * the user.
 */
type DocblockOffset = {
	line: number;
	count: number;
};

type DocblockParserOptions = Partial<DocblockOffset>;

type LineBreakChar = 'LF' | 'CRLF';

export type {
	DocblockPosition,
	Docblock,
	DocblockTag,
	DocblockOffset,
	DocblockTagValue,
	LineBreakChar,
	DocblockParserOptions
};