<p align="center">

<h1 align="center">Dockblock</h1>

</p>

<p align="center">
Line based docblock parser
</p>

<p align="center">
<a target="_blank" href="https://www.npmjs.com/package/@kalimahapps/eslint-config">
  <img src="https://img.shields.io/badge/ESLint%20Config-kalimahapps-blue">
</a>
<a target="_blank" href="https://www.npmjs.com/package/@kalimahapps/docblock">
  <img src="https://img.shields.io/npm/v/@kalimahapps/docblock.svg">
</a>
<a target="_blank" href="https://www.npmjs.com/package/@kalimahapps/docblock">
  <img src="https://img.shields.io/npm/dt/@kalimahapps/docblock.svg">
</a>
<img src="https://img.shields.io/badge/vue-3-%2342b883">
</p>

<br>

This parser provides an AST-like structure for docblocks. It is line based, meaning that it will parse docblock line by line. It provides location information for each node, and it will also parse tags and their values.

## Usage
```js
const Parser = new Parser();
Parser.parse(`Docblock content`);
```
## Example

```js
/**
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
```

output:
```json
{
	"summary": {
		"value": "Summary.",
		"position": {
			"start": {
				"line": 1,
				"column": 2,
				"offset": 6
			},
			"end": {
				"line": 1,
				"column": 10,
				"offset": 14
			}
		}
	},
	"description": [
		{
			"value": "Description that spans multiple lines. This is",
			"position": {
				"start": {
					"line": 3,
					"column": 2,
					"offset": 19
				},
				"end": {
					"line": 3,
					"column": 48,
					"offset": 65
				}
			}
		},
		{
			"value": "the second line of the description. and this is the third line.",
			"position": {
				"start": {
					"line": 4,
					"column": 2,
					"offset": 68
				},
				"end": {
					"line": 4,
					"column": 65,
					"offset": 131
				}
			}
		},
		{
			"value": "This the last line of the description.",
			"position": {
				"start": {
					"line": 5,
					"column": 2,
					"offset": 134
				},
				"end": {
					"line": 5,
					"column": 40,
					"offset": 172
				}
			}
		}
	],
	"tags": [
		{
			"name": {
				"value": "@since",
				"position": {
					"start": {
						"line": 7,
						"column": 2,
						"offset": 177
					},
					"end": {
						"line": 7,
						"column": 8,
						"offset": 183
					}
				}
			},
			"description": [
				{
					"value": "x.x.x",
					"position": {
						"start": {
							"line": 7,
							"column": 9,
							"offset": 184
						},
						"end": {
							"line": 7,
							"column": 14,
							"offset": 189
						}
					}
				}
			],
			"type": {
				"value": "",
				"position": {
					"start": {
						"line": 0,
						"column": 0,
						"offset": 0
					},
					"end": {
						"line": 0,
						"column": 0,
						"offset": 0
					}
				}
			},
			"variable": {
				"value": "",
				"position": {
					"start": {
						"line": 0,
						"column": 0,
						"offset": 0
					},
					"end": {
						"line": 0,
						"column": 0,
						"offset": 0
					}
				}
			},
			"position": {
				"start": {
					"line": 7,
					"column": 2,
					"offset": 177
				},
				"end": {
					"line": 7,
					"column": 14,
					"offset": 189
				}
			}
		},
		{
			"name": {
				"value": "@param",
				"position": {
					"start": {
						"line": 9,
						"column": 2,
						"offset": 194
					},
					"end": {
						"line": 9,
						"column": 8,
						"offset": 200
					}
				}
			},
			"description": [],
			"type": {
				"value": "$isItTrue",
				"position": {
					"start": {
						"line": 9,
						"column": 25,
						"offset": 217
					},
					"end": {
						"line": 9,
						"column": 34,
						"offset": 226
					}
				}
			},
			"variable": {
				"value": "",
				"position": {
					"start": {
						"line": 0,
						"column": 0,
						"offset": 0
					},
					"end": {
						"line": 0,
						"column": 0,
						"offset": 0
					}
				}
			},
			"position": {
				"start": {
					"line": 9,
					"column": 2,
					"offset": 194
				},
				"end": {
					"line": 9,
					"column": 34,
					"offset": 226
				}
			}
		},
		{
			"name": {
				"value": "@param",
				"position": {
					"start": {
						"line": 10,
						"column": 2,
						"offset": 245
					},
					"end": {
						"line": 10,
						"column": 8,
						"offset": 251
					}
				}
			},
			"description": [],
			"type": {
				"value": "$args",
				"position": {
					"start": {
						"line": 10,
						"column": 19,
						"offset": 262
					},
					"end": {
						"line": 10,
						"column": 24,
						"offset": 267
					}
				}
			},
			"variable": {
				"value": "",
				"position": {
					"start": {
						"line": 0,
						"column": 0,
						"offset": 0
					},
					"end": {
						"line": 0,
						"column": 0,
						"offset": 0
					}
				}
			},
			"position": {
				"start": {
					"line": 10,
					"column": 2,
					"offset": 245
				},
				"end": {
					"line": 10,
					"column": 24,
					"offset": 267
				}
			}
		},
		{
			"name": {
				"value": "@param",
				"position": {
					"start": {
						"line": 11,
						"column": 2,
						"offset": 304
					},
					"end": {
						"line": 11,
						"column": 8,
						"offset": 310
					}
				}
			},
			"description": [
				{
					"value": "Description of the parameter",
					"position": {
						"start": {
							"line": 11,
							"column": 22,
							"offset": 324
						},
						"end": {
							"line": 11,
							"column": 50,
							"offset": 352
						}
					}
				}
			],
			"type": {
				"value": "",
				"position": {
					"start": {
						"line": 11,
						"column": 15,
						"offset": 317
					},
					"end": {
						"line": 11,
						"column": 15,
						"offset": 317
					}
				}
			},
			"variable": {
				"value": "$var",
				"position": {
					"start": {
						"line": 11,
						"column": 21,
						"offset": 323
					},
					"end": {
						"line": 11,
						"column": 25,
						"offset": 327
					}
				}
			},
			"position": {
				"start": {
					"line": 11,
					"column": 2,
					"offset": 304
				},
				"end": {
					"line": 11,
					"column": 50,
					"offset": 352
				}
			}
		},
		{
			"name": {
				"value": "@param",
				"position": {
					"start": {
						"line": 12,
						"column": 2,
						"offset": 355
					},
					"end": {
						"line": 12,
						"column": 8,
						"offset": 361
					}
				}
			},
			"description": [
				{
					"value": "Description.",
					"position": {
						"start": {
							"line": 12,
							"column": 23,
							"offset": 376
						},
						"end": {
							"line": 12,
							"column": 35,
							"offset": 388
						}
					}
				}
			],
			"type": {
				"value": "{number}",
				"position": {
					"start": {
						"line": 12,
						"column": 17,
						"offset": 370
					},
					"end": {
						"line": 12,
						"column": 25,
						"offset": 378
					}
				}
			},
			"variable": {
				"value": "$var",
				"position": {
					"start": {
						"line": 12,
						"column": 22,
						"offset": 375
					},
					"end": {
						"line": 12,
						"column": 26,
						"offset": 379
					}
				}
			},
			"position": {
				"start": {
					"line": 12,
					"column": 2,
					"offset": 355
				},
				"end": {
					"line": 12,
					"column": 35,
					"offset": 388
				}
			}
		},
		{
			"name": {
				"value": "@return",
				"position": {
					"start": {
						"line": 13,
						"column": 2,
						"offset": 391
					},
					"end": {
						"line": 13,
						"column": 9,
						"offset": 398
					}
				}
			},
			"description": [
				{
					"value": "return description here. It can be multiline.",
					"position": {
						"start": {
							"line": 13,
							"column": 23,
							"offset": 412
						},
						"end": {
							"line": 13,
							"column": 69,
							"offset": 458
						}
					}
				},
				{
					"value": "This is the second line of the description.",
					"position": {
						"start": {
							"line": 14,
							"column": 2,
							"offset": 460
						},
						"end": {
							"line": 14,
							"column": 45,
							"offset": 503
						}
					}
				}
			],
			"type": {
				"value": "Add",
				"position": {
					"start": {
						"line": 13,
						"column": 21,
						"offset": 410
					},
					"end": {
						"line": 13,
						"column": 24,
						"offset": 413
					}
				}
			},
			"variable": {
				"value": "",
				"position": {
					"start": {
						"line": 0,
						"column": 0,
						"offset": 0
					},
					"end": {
						"line": 0,
						"column": 0,
						"offset": 0
					}
				}
			},
			"position": {
				"start": {
					"line": 13,
					"column": 2,
					"offset": 391
				},
				"end": {
					"line": 14,
					"column": 45,
					"offset": 503
				}
			}
		},
		{
			"name": {
				"value": "",
				"position": {
					"start": {
						"line": 0,
						"column": 0,
						"offset": 0
					},
					"end": {
						"line": 0,
						"column": 0,
						"offset": 0
					}
				}
			},
			"description": [],
			"type": {
				"value": "",
				"position": {
					"start": {
						"line": 0,
						"column": 0,
						"offset": 0
					},
					"end": {
						"line": 0,
						"column": 0,
						"offset": 0
					}
				}
			},
			"variable": {
				"value": "",
				"position": {
					"start": {
						"line": 0,
						"column": 0,
						"offset": 0
					},
					"end": {
						"line": 0,
						"column": 0,
						"offset": 0
					}
				}
			},
			"position": {
				"start": {
					"line": 0,
					"column": 0,
					"offset": 0
				},
				"end": {
					"line": 0,
					"column": 0,
					"offset": 0
				}
			}
		}
	]
}
```


1- Install dependencies with:
```
pnpm install
```
or
```
npm install
```

2- Run build command:
```
pnpm build
```
or
```
pnpm build:watch
```

3- Testing
```
pnpm test
```