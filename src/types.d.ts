type AstPosition = {
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

type ValueAst = {
	value: string;
	position: AstPosition;
};

type TagAst = {
	name: ValueAst;
	description: ValueAst[];
	type: ValueAst;
	variable: ValueAst;
	position: AstPosition;
};

type Ast = {
	summary: {
		value: string;
		position?: AstPosition;
	};
	description: ValueAst[];
	tags: TagAst[];
};

export type {
	AstPosition,
	ValueAst,
	TagAst,
	Ast
};