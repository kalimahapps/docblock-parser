/* eslint-disable max-lines-per-function */
import { test, expect, describe } from 'vitest';
import Parser from '../src';

const docblock = `/**
* Summary.
*
* Description that spans multiple lines. This is
* the second line of the description. and this is the third line.
* This the last line of the description.
*
* @return Response Add return description here. It is a single line.
*/`;

describe('Ensure data is correct', () => {
	const parser = new Parser();
	const ast = parser.parse(docblock);

	test('Ensure summary position is correct', () => {
		expect(ast.summary.position).toMatchObject({
			start: {
				line: 1,
				column: 2,
				offset: 6,
			},
			end: {
				line: 1,
				column: 10,
				offset: 14,
			},
		});
	});

	test('Ensure summar value has correct value and length', () => {
		expect(ast.summary.value.length).toBe(8);
		expect(ast.summary.value).toBe('Summary.');
	});

	test('Ensure number of tags is correct', () => {
		expect(ast.tags.length).toBe(1);
	});

	test('Ensure length of description is correct', () => {
		expect(ast.description.length).toBe(3);
	});

	test('Ensure first description position is correct', () => {
		expect(ast.description[0].position).toMatchObject({
			start: {
				line: 3,
				column: 2,
				offset: 19,
			},
			end: {
				line: 3,
				column: 48,
				offset: 65,
			},
		});

		expect(ast.description[1].position).toMatchObject({
			start: {
				line: 4,
				column: 2,
				offset: 68,
			},
			end: {
				line: 4,
				column: 65,
				offset: 131,
			},
		});

		expect(ast.description[2].position).toMatchObject({
			start: {
				line: 5,
				column: 2,
				offset: 134,
			},
			end: {
				line: 5,
				column: 40,
				offset: 172,
			},
		});
	});

	test('Ensure @return tag data is correct', () => {
		expect(ast.tags[0].position).toMatchObject({
			start: {
				line: 7,
				column: 2,
				offset: 177,
			},
			end: {
				line: 7,
				column: 68,
				offset: 243,
			},
		});

		expect(ast.tags[0].name.position).toMatchObject({
			start: {
				line: 7,
				column: 2,
				offset: 177,
			},
			end: {
				line: 7,
				column: 9,
				offset: 184,
			},
		});
	});
});