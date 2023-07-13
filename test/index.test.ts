import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { test, expect } from 'vitest';
import Parser from '../src/';
const docblock = `/**
* Summary.
*
* Description that spans multiple lines. This is
* the second line of the description. and this is the third line.
* This the last line of the description.
*
* @since x.x.x
*
* @param boolean $isItTrue Check if value is true.
* @param array $args List of arguments in an array format.
* @param string  $var Description of the parameter
* @param {number} $var Description.
* @return Response Add return description here. It can be multiline.
* This is the second line of the description.
*/`;

const rootDirectory = fileURLToPath(new URL('../', import.meta.url));
const testDirectory = path.join(rootDirectory, 'test');

test('Full docblock produces correct AST', () => {
	const ast = new Parser().parse(docblock);
	const fileContent = fs.readFileSync(path.join(testDirectory, 'full-docblock.json'));
	expect(ast).toMatchInlineSnapshot(JSON.parse(fileContent.toString()));
});

test('Empty docblock', () => {
	const ast = new Parser().parse('/** */');
	const fileContent = fs.readFileSync(path.join(testDirectory, 'empty-docblock.json'));
	expect(ast).toMatchInlineSnapshot(JSON.parse(fileContent.toString()));
});