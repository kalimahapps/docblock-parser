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
	variable: DocblockTagValue;
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

export type {
	DocblockPosition,
	Docblock,
	DocblockTag,
	DocblockTagValue
};