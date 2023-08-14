/* eslint-disable max-lines-per-function */
import { test, expect, describe } from 'vitest';
import Parser from '../src';
const docblock = `/**
 * Summary of the function.
 *
 * Description of the function.
 *
 * @since     1.0.0   This is the version number.
 *
 *
 * @param    string    $first Description of the parameter.
 * @param   Response     $second Description of the parameter with
 *                             multiple lines.
 * @param    {string}   $third Description with JS style type
 * @return  string   Description of the return value. */`;

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
		expect(tags.length).toBe(5);
	});

	test('Ensure length of description is correct', () => {
		expect(description.length).toBe(1);
	});
});
