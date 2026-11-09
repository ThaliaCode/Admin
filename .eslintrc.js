// http://eslint.org/docs/user-guide/configuring

module.exports = {
	root: true,
	parser: 'vue-eslint-parser',
	parserOptions: {
		parser: 'babel-eslint',
		sourceType: 'module',
	},
	env: {
		browser: true,
	},
	extends: 'airbnb-base',
	// required to lint *.vue files
	plugins: ['vue'],
	// check if imports actually resolve
	settings: {
		'import/resolver': {
			webpack: {
				config: 'build/webpack.base.conf.js',
			},
		},
	},
	// add your custom rules here
	rules: {
		'func-names': 'off',
		'spaced-comment': 'off',
		'vue/require-v-for-key': 'off',
		'no-multiple-empty-lines': 'off',
		'no-console': 'off',
		'no-irregular-whitespace': 'off',
		'eol-last': 'off',
		'semi-spacing': 'off',
		'no-continue': 'off',
		'no-plusplus': 'off',
		'comma-dangle': 'off',
		'no-underscore-dangle': ['error', { allow: ['_uid'] }],
		'vue/no-v-text-v-html-on-component': 'off',
		'vue/no-async-in-computed-properties': 'off',
		'vue/no-parsing-error': 'error',
		'vue/valid-template-root': 'error',
		'vue/no-use-v-if-with-v-for': 'off',
		'vue/prefer-default-export': 'off',
		'arrow-parens': ['off', 'off'], // Desactiva la regla o ajusta según tu preferencia
		'vue/no-useless-template-attributes': 'off', // Desactiva la regla
		'vue/no-useless-template-attributes': 'off', // Desactiva la regla
		'import/no-extraneous-dependencies': 'off', // Desactiva la regla import/no-extraneous-dependencies
		'no-mixed-operators': 'off', // Activar la regla no-mixed-operators
		indent: 'off', // Indentación con tabs
		'no-mixed-spaces-and-tabs': 'off', // Evitar mezcla de espacios y tabs
		// 'indent': ['error', 'tab'], // Indentación con tabs
		'no-confusing-arrow': 'off',
		curly: 'off',
		'max-len': [
			'error',
			{
				code: 130,
				ignoreStrings: true,
				ignoreTemplateLiterals: true,
				ignoreComments: true, // Ignorar longitud de línea en comentarios largos
				ignoreUrls: true, // Ignorar longitud de línea en URLs largas
				ignoreRegExpLiterals: true, // Ignorar longitud de línea en expresiones regulares largas
				ignorePattern: '^[ \t]*<(\\w+)([^>]*)>(.|\n)*?<\\/\\1>', // Ignorar líneas dentro de JSX
				ignorePattern: '^\\s*\\{', // Ignorar líneas dentro de objetos de configuración largos
			},
		],
		// don't require .vue extension when importing
		'import/extensions': [
			'error',
			'always',
			{
				js: 'never',
				vue: 'never',
			},
		],
		// allow optionalDependencies
		'import/no-extraneous-dependencies': [
			'error',
			{
				optionalDependencies: ['test/unit/index.js'],
			},
		],
		'linebreak-style': ['error', 'windows'],
		// allow debugger during development
		'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
		'no-tabs': 0,
		// 'indent': 'off',
		// 'no-mixed-spaces-and-tabs': 'off',
		'linebreak-style': 0,
		'no-nested-ternary': 'off',
		'import/prefer-default-export': 'off',
		'no-trailing-spaces': 'off',
		'no-underscore-dangle': 'off',
		'object-shorthand': 'off',
		'no-param-reassign': 'off',
		camelcase: 'off',
	},
	overrides: [
		{
			files: ['*.vue'],
			rules: {
				'max-len': 'off',
				'no-trailing-spaces': 'off',
			},
		},
	],
};
