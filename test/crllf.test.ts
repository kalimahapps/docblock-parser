import fs from 'node:fs';
import path from 'node:path';
import { test, expect, describe } from 'vitest';
import Parser from '../src';

// import txt test file
const docblock = fs.readFileSync(path.join(__dirname, 'docblock-crlf.txt'), 'utf8');

describe('Ensure data with CRLF line break is correct', () => {
	const parser = new Parser();
	const { summary } = parser.parse(docblock);

	test('Ensure summary position is correct', () => {
		expect(summary.position).toMatchObject({
			start: {
				line: 1,
				column: 2,
				offset: 7,
			},
			end: {
				line: 1,
				column: 10,
				offset: 15,
			},
		});
	});

	test('Ensure summar value has correct value and length', () => {
		expect(summary.value.length).toBe(8);
		expect(summary.value).toBe('Summary.');
	});
});