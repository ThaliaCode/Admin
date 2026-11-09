# sales-cancel

> Display a form in order to perform the cancellation of the sale

![captura de pantalla 2018-10-31 a la s 12 32 12](https://user-images.githubusercontent.com/461124/47807017-07cb2c80-dd09-11e8-9433-c3a0b4ec7147.png)

### Usage

This component is intended to use inside our <action-sidebar> component.
The only prop is the sale identifier.

```html
<sales-cancel
	:sale-id="2382"
	@sales-canceled="salesCanceled"
	@cancel-button-clicked="closeModal"
>
```

```js
export default {
	name: 'my-component',
	methods: {
		// this event is fired when the web service return a 200 status code
		salesCanceled(saleId) {
			// Do something with the id, like update the status name
			const sale = this.sales.findIndex(s => s.id === saleId);
			this.$set(sale, 'statusName', 'CANCELADO');
		},
		// this event is fired when the Cancelar button is clicked
		closeModal() {
			// Here you can close the action-sidebar, if you want to.
		}
	},
};
```