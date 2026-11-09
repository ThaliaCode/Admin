<template>
	<v-layout wrap>
		<v-flex xs12>
			<app-input-text
				:disabled="disabled"
				:autocomplete="autocomplete"
				append-icon="search"
				:append-icon-cb="search"
				class="product-search-custom"
				:id="id"
				:ref="refValue"
				:label="labelSearching"
				model="product"
				:text="searchValue"
				@input="setValue"
				@input-enter="search"
			/>
		</v-flex>
	</v-layout>
</template>

<script>
function cleanInput(val) {
	if (val) {
		const input = document.getElementById(this.id);
		const refInput = this.$refs[this.refValue];
		refInput.$children[0].lazyValue = '';
		input.value = '';
		this.product = '';
	}
}

function search(ev) {
	const enterKey = ev ? ev.key === 'Enter' : false;
	if (enterKey && this.usedGun) {
		this.showNotification(
			'La tecla enter ha sido desactivada por la activacion del lector de codigo.\n Presione la lupa'
		);
	} else if (this.product && this.product.trim()) {
		this.$emit('search', this.product);
	} else if (this.searchValue && this.searchValue.trim() && this.flagInit) {
		this.$emit('search', this.searchValue);
	} else {
		this.showNotification(
			`Debe ingresar un dato ${this.alertMessage} que desea buscar.`,
			'info'
		);
	}
}

function setValue({ model, value }) {
	this[model] = value;
	if (!value) {
		this.$emit('clean-input');
	} else if (this.flagInputEvent) {
		this.$emit('input', value);
	}
}

function data() {
	return {
		product: '',
	};
}

export default {
	name: 'products-search-input',
	data,
	watch: {
		cleanInput,
	},
	methods: {
		search,
		setValue,
		focus() {
			this.$nextTick(() => {
				const refComponent = this.$refs[this.refValue];
				if (refComponent && refComponent.$el) {
					const input = refComponent.$el.querySelector('input');
					input.focus();
				}
			});
		},
	},
	props: {
		alertMessage: {
			default: 'del producto',
			type: String,
		},
		autocomplete: {
			default: 'off',
			type: String,
		},
		id: String,
		labelSearching: {
			default: 'Producto',
			type: String,
		},
		flagInputEvent: {
			default: false,
			type: Boolean,
		},
		refValue: String,
		searchValue: String,
		cleanInput: {
			default: false,
			type: Boolean,
		},
		flagInit: {
			default: false,
			type: Boolean,
		},
		usedGun: {
			default: false,
			type: Boolean,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
};
</script>
