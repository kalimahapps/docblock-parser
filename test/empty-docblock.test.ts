import { test, expect } from 'vitest';
import Parser from '../src';

test('Empty docblock', () => {
	const parser = new Parser();
	const ast = parser.parse('/** */');

	expect(ast).toMatchInlineSnapshot(JSON.parse('{"summary":{"value":""},"description":[],"tags":[]}'));
});