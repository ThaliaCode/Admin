# app-date-mask

> global component, you do not need to import in other component.

### Usage

```html
<app-date-mask
	label="Fecha Inicio"
	v-model="startDate"
	@format-date="formatDate"
/>
```

```js
function formatDate(value) {
	// The value is the same as the v-model but in the format YYYY-MM-DD
}

export default {
	name: 'my-component',
	data() {
		return {
			startDate: '',
		};
	},
	methods: {
		formatDate,
	},
};
```