# app-table

> global component, you do not need to import in other component.

### Usage

```html
<app-table
	:columns="columns"
	:rows="rows"
>
	<template slot="rows" slot-scope="{ rows, index }">
		<td>
			{{ props.rows.name }}
		</td>
		<td>
			{{ props.rows.age }}
		</td>
	</template>
<app-table>
```

```js

import appTable from '@/components/shared/table';

export default {
	name: 'my-component',
	component: {
		appTable,
	},
	data() {
		return {
			columns: [
				{
					id: 1,// this can be anything, but unique in the whole array
					value: 'name', // property name, should be the property name in rows
					visible: true,
				},
				{
					id: 2,
					value: 'age',
					visible: true,
				},
			],
			rows: [
				{
					id: 1,
					name: 'Eduardo',
					age: 32,
				},
				{
					id: 2,
					name: 'Susana',
					age: 29,
				},
			],
		};
	},
};
```