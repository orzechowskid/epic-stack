const vitestFiles = [ "app/**/__tests__/**/*", "app/**/*.{spec,test}.*" ];
const testFiles = [ "**/tests/**", ...vitestFiles ];
const appFiles = [ "app/**" ];

/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
	extends: [
		"@remix-run/eslint-config",
		"@remix-run/eslint-config/node"
	],
	rules: {
		"@typescript-eslint/consistent-type-imports": [
			"warn",
			{
				prefer: "type-imports",
				disallowTypeAnnotations: true,
				fixStyle: "inline-type-imports"
			}
		],
		"import/no-duplicates": "warn"
	},
	overrides: [
		{
			plugins: [ "remix-react-routes" ],
			files: appFiles,
			excludedFiles: testFiles,
			rules: {
				"remix-react-routes/use-link-for-routes": "error",
				"remix-react-routes/require-valid-paths": "error",
				// disable this one because it doesn't appear to work with our
				// route convention. Someone should dig deeper into this...
				"remix-react-routes/no-relative-paths": [
					"off",
					{ allowLinksToSelf: true }
				],
				"remix-react-routes/no-urls": "error",
				"no-restricted-imports": [
					"error",
					{
						patterns: [
							{
								group: testFiles,
								message: "Do not import test files in app files"
							}
						]
					}
				]
			}
		},
		{
			extends: [ "@remix-run/eslint-config/jest-testing-library" ],
			files: vitestFiles,
			rules: {
				"testing-library/no-await-sync-events": "off",
				"jest-dom/prefer-in-document": "off"
			},
			// we're using vitest which has a very similar API to jest
			// (so the linting plugins work nicely), but it means we have to explicitly
			// set the jest version.
			settings: {
				jest: {
					version: 28
				}
			}
		}
	],
	rules: {
		"arrow-body-style": [ "warn", "always" ],
		curly: [ "warn", "all" ],
		eqeqeq: [ "error" ],
		"no-useless-computed-key": [ "warn" ],
		"no-var": [ "warn" ],
		"no-warning-comments": [ "warn" ],
		"no-with": [ "error" ],

		"@typescript-eslint/consistent-type-imports": [
			"warn",
			{
				prefer: "type-imports",
				disallowTypeAnnotations: true,
				fixStyle: "inline-type-imports"
			}
		],
		"@typescript-eslint/no-duplicate-imports": "warn",

		/* https://github.com/jsx-eslint/eslint-plugin-react */
		"react/boolean-prop-naming": [ "warn" ],
		"react/button-has-type": [ "error" ],
		"react/hook-use-state": [ "warn" ],
		"react/iframe-missing-sandbox": [ "error" ],
		"react/jsx-boolean-value": [ "warn", "never" ],
		"react/jsx-closing-bracket-location": [ "warn" ],
		"react/jsx-closing-tag-location": [ "warn" ],
		"react/jsx-equals-spacing": [ "warn", "never" ],
		"react/jsx-first-prop-new-line": [ "warn", "multiline" ],
		"react/jsx-indent": [ "warn", "tab" ],
		"react/jsx-indent-props": [ "warn", "tab" ],
		"react/jsx-key": [ "error" ],
		"react/jsx-no-bind": [ "error" ],
		"react/jsx-no-duplicate-props": [ "error" ],
		"react/jsx-no-target-blank": [ "error" ],
		"react/jsx-no-useless-fragment": [ "warn" ],
		"react/jsx-one-expression-per-line": [ "warn" ],
		"react/jsx-pascal-case": [ "warn" ],
		"react/jsx-sort-props": [ "warn" ],
		"react/jsx-tag-spacing": [ "warn", {
			afterOpening: "never",
			beforeClosing: "never",
			beforeSelfClosing: "always",
			closingSlash: "never"
		} ],
		"react/jsx-wrap-multilines": [ "warn" ],
		"react/no-danger-with-children": [ "error" ],
		"react/no-string-refs": [ "error" ],
		"react/self-closing-comp": [ "warn" ],
		"react/style-prop-object": [ "error" ],
		"react/void-dom-elements-no-children": [ "error" ]
	}
};
