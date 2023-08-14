/* eslint-disable max-lines-per-function */
import { test, expect, describe } from 'vitest';
import Parser from '../src';
const docblock = `/**
* Summary for this method.
*
* Single line description.
*
* @since 2.4.0 This is since description.
* @since 1.1.2 Another since description with
* multiple lines.
*
* @param boolean $isItTrue Check if value is true.
* @param array $args List of arguments in an array format.
* This parameter has a second line of description.
* @param string|int  $var Description of the parameter
* @param {number} $foo Description.
* @param $no_type This parameter has no type.
* @return Response Add return description here. It can be multiline.
* This is the second line of the description.
*/`;

describe('Ensure data is correct', () => {
	const parser = new Parser();
	const ast = parser.parse(docblock);

	const { tags, summary, description } = ast;

	test('Ensure summary position is correct', () => {
		expect(summary.position).toMatchObject({
			start: {
				line: 1,
				column: 2,
				offset: 6,
			},
			end: {
				line: 1,
				column: 26,
				offset: 30,
			},
		});
	});

	test('Ensure summary value has correct value and length', () => {
		expect(summary.value.length).toBe(24);
		expect(summary.value).toBe('Summary for this method.');
	});

	test('Ensure number of tags is correct', () => {
		expect(tags.length).toBe(8);
	});

	test('Ensure length of description is correct', () => {
		expect(description.length).toBe(1);
	});

	test('Ensure first description position is correct', () => {
		expect(description[0].position).toMatchObject({
			start: {
				line: 3,
				column: 2,
				offset: 35,
			},
			end: {
				line: 3,
				column: 26,
				offset: 59,
			},
		});
	});

	test('Ensure first description value is correct', () => {
		expect(description[0].value).toBe('Single line description.');
	});

	test('Ensure first `@since` tag position is correct', () => {
		expect(tags[0].position).toMatchObject({
			start: {
				line: 5,
				column: 2,
				offset: 64,
			},
			end: {
				line: 5,
				column: 41,
				offset: 103,
			},
		});
	});

	test('Ensure first `@since` tag value is correct', () => {
		expect(tags[0].description[0].value).toBe('This is since description.');
	});

	test("Ensure first `@since` tag's version is correct", () => {
		expect(tags[0].descriptor.value).toBe('2.4.0');
	});

	test('Ensure second `@since` tag position is correct', () => {
		expect(tags[1].position).toMatchObject({
			start: {
				line: 6,
				column: 2,
				offset: 106,
			},
			end: {
				line: 7,
				column: 17,
				offset: 167,
			},
		});
	});

	test('Ensure second `@since` tag value is correct', () => {
		expect(tags[1].description[0].value).toBe('Another since description with');
		expect(tags[1].description[1].value).toBe('multiple lines.');
	});

	test("Ensure second `@since` tag's version is correct", () => {
		expect(tags[1].descriptor.value).toBe('1.1.2');
	});

	test('Ensure `@param` tag position is correct', () => {
		expect(tags[2].position).toMatchObject({
			start: {
				line: 9,
				column: 2,
				offset: 172,
			},
			end: {
				line: 9,
				column: 50,
				offset: 220,
			},
		});
	});

	test('Ensure `@param` tag description is correct', () => {
		expect(tags[2].description[0].value).toBe('Check if value is true.');
	});

	test('Ensure `@param` tag type is correct', () => {
		expect(tags[2].type.value).toBe('boolean');
	});

	test('Ensure `@param` descriptor is correct', () => {
		expect(tags[2].descriptor.value).toBe('$isItTrue');
	});

	test('Ensure second `@param` tag position is correct', () => {
		expect(tags[3].position).toMatchObject({
			start: {
				line: 10,
				column: 2,
				offset: 223,
			},
			end: {
				line: 11,
				column: 50,
				offset: 330,
			},
		});
	});

	test('Ensure second `@param` tag description is correct', () => {
		expect(tags[3].description[0].value).toBe('List of arguments in an array format.');
		expect(tags[3].description[1].value).toBe('This parameter has a second line of description.');
	});

	test('Ensure second `@param` tag type is correct', () => {
		expect(tags[3].type.value).toBe('array');
	});

	test('Ensure second `@param` descriptor is correct', () => {
		expect(tags[3].descriptor.value).toBe('$args');
	});

	test('Ensure third `@param` tag position is correct', () => {
		expect(tags[4].position).toMatchObject({
			start: {
				line: 12,
				column: 2,
				offset: 333,
			},
			end: {
				line: 12,
				column: 54,
				offset: 385,
			},
		});
	});

	test('Ensure third `@param` tag description is correct', () => {
		expect(tags[4].description[0].value).toBe('Description of the parameter');
	});

	test('Ensure third `@param` tag type is correct', () => {
		expect(tags[4].type.value).toBe('string|int');
	});

	test('Ensure third `@param` type position is correct', () => {
		expect(tags[4].type.position).toMatchObject({
			start: {
				line: 12,
				column: 9,
				offset: 340,
			},
			end: {
				line: 12,
				column: 19,
				offset: 350,
			},
		});
	});

	test('Ensure third `@param` descriptor is correct', () => {
		expect(tags[4].descriptor.value).toBe('$var');
	});

	test('Ensure fourth `@param` tag position is correct', () => {
		expect(tags[5].position).toMatchObject({
			start: {
				line: 13,
				column: 2,
				offset: 388,
			},
			end: {
				line: 13,
				column: 35,
				offset: 421,
			},
		});
	});

	test('Ensure fourth `@param` tag description is correct', () => {
		expect(tags[5].description[0].value).toBe('Description.');
	});

	test('Ensure fourth `@param` tag type is correct', () => {
		expect(tags[5].type.value).toBe('{number}');
	});

	test('Ensure fourth `@param` type position is correct', () => {
		console.log(tags[5].type);
		expect(tags[5].type.position).toMatchObject({
			start: {
				line: 13,
				column: 9,
				offset: 395,
			},
			end: {
				line: 13,
				column: 17,
				offset: 403,
			},
		});
	});

	test('Ensure fourth `@param` descriptor is correct', () => {
		expect(tags[5].descriptor.value).toBe('$foo');
	});

	test('Ensure fifth `@param` tag position is correct', () => {
		expect(tags[6].position).toMatchObject({
			start: {
				line: 14,
				column: 2,
				offset: 424,
			},
			end: {
				line: 14,
				column: 45,
				offset: 467,
			},
		});
	});

	test('Ensure `@return` tag position is correct', () => {
		expect(tags[7].position).toMatchObject({
			start: {
				line: 15,
				column: 2,
				offset: 470,
			},
			end: {
				line: 16,
				column: 45,
				offset: 582,
			},
		});
	});
});
