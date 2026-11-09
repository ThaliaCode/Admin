<template>
	<v-layout wrap>
		<v-flex xs10>
			<app-input-text
				append-icon="search"
				:append-icon-cb="search"
				class="product-search-custom"
				:id="id"
				:ref="refValue"
				:label="labelSearching"
				model="person"
				:text="searchValue"
				@input="setValue"
				@input-enter="search"
				@focus="handleFocus"
				@mousedown.native="onInteract"
			/>
		</v-flex>
		<v-flex xs1 pt-3 mt-1 v-if="showCreatePerson">
			<button
				@click="$emit('create-person')"
				class="pl-add-container size"
				style="height: 29px"
			>
				<v-icon id="add-icon" color="white">add</v-icon>
			</button>
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
		this.person = '';
	}
}

function search() {
	if (this.person && this.person.trim()) {
		this.$emit('search', this.person);
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
		person: '',
		isInteraction: false,
	};
}

export default {
	name: 'person-search-input',
	data,
	watch: {
		cleanInput,
	},
	methods: {
		search,
		setValue,
		onInteract() {
			this.isInteraction = true;
			setTimeout(() => {
				this.isInteraction = false;
			}, 500);
		},
		handleFocus() {
			if (!this.isInteraction) return;
			const refInput = this.$refs[this.refValue];

			if (refInput && refInput.$el) {
				const input = refInput.$el.querySelector('input');
				if (input) {
					// Limpia el valor visible
					input.value = '';

					// También limpia el modelo interno de Vuetify (para evitar inconsistencias)
					if (refInput.$children && refInput.$children[0]) {
						refInput.$children[0].lazyValue = '';
					}

					// Limpia tu modelo de datos
					this.person = '';
				}
			}
		},
	},
	props: {
		alertMessage: {
			default: 'del cliente',
			type: String,
		},
		id: String,
		labelSearching: {
			default: 'Cliente',
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
		showCreatePerson: {
			default: false,
			type: Boolean,
		},
	},
};
</script>
