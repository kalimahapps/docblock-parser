/* eslint-disable max-lines-per-function */
import { test, expect, describe } from 'vitest';
import Parser from '../src';
const docblock = `/**
 * Summary of the function.
 *
 * Description of the function.
 *
 * @since 1.0.0                This is the version number.
 *
 *
 * @param string $first        Description of the parameter.
 * @param Response $second     Description of the parameter with
 *                             multiple lines.
 * @return string              Description of the return value. */`;

describe('Ensure data is correct', () => {
	const parser = new Parser();
	const ast = parser.parse(docblock);

	const { tags, summary, description } = ast;

	test('Ensure summary position is correct', () => {
		expect(summary.position).toMatchObject({
			start: {
				line: 1,
				column: 3,
				offset: 7,
			},
			end: {
				line: 1,
				column: 27,
				offset: 31,
			},
		});
	});

	test('Ensure summary value has correct value and length', () => {
		expect(summary.value.length).toBe(24);
		expect(summary.value).toBe('Summary of the function.');
	});

	test('Ensure number of tags is correct', () => {
		expect(tags.length).toBe(4);
	});

	test('Ensure length of description is correct', () => {
		expect(description.length).toBe(1);
	});

	test('Ensure `@since` description position is correct', () => {
		expect(description[0].position).toMatchObject({
			start: {
				line: 3,
				column: 3,
				offset: 38,
			},
			end: {
				line: 3,
				column: 31,
				offset: 66,
			},
		});
	});

	test('Ensure `@since` description value is correct', () => {
		expect(description[0].value).toBe('Description of the function.');
	});

	test('Ensure `@since` tag position is correct', () => {
		expect(tags[0].position).toMatchObject({
			start: {
				line: 5,
				column: 3,
				offset: 73,
			},
			end: {
				line: 5,
				column: 58,
				offset: 128,
			},
		});
	});

	test('Ensure `@since` tag name position is correct', () => {
		expect(tags[0].name.position).toMatchObject({
			start: {
				line: 5,
				column: 3,
				offset: 73,
			},
			end: {
				line: 5,
				column: 9,
				offset: 79,
			},
		});
	});

	test('Ensure `@since` tag name value is correct', () => {
		expect(tags[0].name.value).toBe('@since');
	});

	test('Ensure `@since` tag type position is correct', () => {
		expect(tags[0].descriptor.position).toMatchObject({
			start: {
				line: 5,
				column: 10,
				offset: 80,
			},
			end: {
				line: 5,
				column: 15,
				offset: 85,
			},
		});
	});

	test('Ensure first `@param` tag position is correct', () => {
		expect(tags[1].position).toMatchObject({
			start: {
				line: 8,
				column: 3,
				offset: 138,
			},
			end: {
				line: 8,
				column: 60,
				offset: 195,
			},
		});
	});

	test('Ensure first `@param` tag name position is correct', () => {
		expect(tags[1].name.position).toMatchObject({
			start: {
				line: 8,
				column: 3,
				offset: 138,
			},
			end: {
				line: 8,
				column: 9,
				offset: 144,
			},
		});
	});

	test('Ensure first `@param` tag name value is correct', () => {
		expect(tags[1].name.value).toBe('@param');
	});

	test('Ensure first `@param` tag type value is correct', () => {
		expect(tags[1].type.value).toBe('string');
	});

	test('Ensure first `@param` tag type position is correct', () => {
		expect(tags[1].descriptor.position).toMatchObject({
			start: {
				line: 8,
				column: 17,
				offset: 152,
			},
			end: {
				line: 8,
				column: 23,
				offset: 158,
			},
		});
	});

	test('Ensure first `@param` tag description position is correct', () => {
		expect(tags[1].description[0].position).toMatchObject({
			start: {
				line: 8,
				column: 31,
				offset: 166,
			},
			end: {
				line: 8,
				column: 60,
				offset: 195,
			},
		});
	});
});
