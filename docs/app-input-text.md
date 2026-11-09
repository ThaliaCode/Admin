# app-input-text

> global component, you do not need to import in other component.

### Usage

In order to enable the autocomplete google map you must provide an **id** and the **google-map** prop.

```html
<!-- id and google-map are required -->
<app-input-text label="hola" id="my-google-map" @input-map="setValue" google-map :text="address" />
```

```js

function setValue(place) {
	// Google Place object https://gist.github.com/eperedo/172e8cf7eb0975aa3686279dc29aa14b
	this.address = place.formatted_address;
}

export default {
	name: 'my-component',
	data() {
		return {
			address: '',
		};
	},
	methods: {
		setValue,
	},
};
```