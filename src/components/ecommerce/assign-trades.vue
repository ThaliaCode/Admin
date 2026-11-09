<template>
	<div>
		<v-layout wrap pa-4>
			<v-flex xs12 mb-3>
				<v-select
					autocomplete
					:items="trades"
					v-model="tradesItem"
					item-text="name"
					item-value="id"
					label="Comercios"
					multiple
					chips
					solo
				></v-select>
			</v-flex>
			<v-flex xs12 mb-3>
				<v-checkbox
					label="Activar productos seleccionados para el ecommerce"
					hide-details
					v-model="flagActiveProductsEcom"
					class="checkbox-customers label-text mr-3"
					small
				>
				</v-checkbox>
			</v-flex>
			<v-flex xs12>
				<v-checkbox
					label="Activar todos los productos para el ecommerce"
					hide-details
					v-model="flagAllActiveProductsEcom"
					class="checkbox-customers label-text mr-3"
					small
				>
				</v-checkbox>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="!tradesItem.length || loadingAssignTrades"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="save"
			/>
		</section>
	</div>
</template>

<script>
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.loadTrades();
}

async function loadTrades() {
	try {
		({ data: this.trades } = await this.$httpSales.get(
			'com-ecommerce-companies'
		));
		this.tradesItem = this.products.reduce((acum, p) => {
			let newAcum = [...acum];
			if (p.commerce.length) {
				const ids = p.commerce.map((c) => c.commerceId);
				newAcum = newAcum.concat(ids);
			}
			return newAcum;
		}, []);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function setData(values) {
	if (values) {
		this.tradesItem = [...values];
	}
}

function save() {
	const self = this;
	const commerce = this.trades.reduce((acum, t) => {
		const newAcum = [...acum];
		const index = self.tradesItem.findIndex((r) => r === t.id);
		if (index > -1) {
			const newObj = {
				code: t.code,
				commerceId: t.id,
			};
			newAcum.push(newObj);
		}
		return newAcum;
	}, []);
	const products = this.products.map((p) => p.id);
	const body = {
		products,
		commerce,
	};
	const flagActiveEcom =
		this.flagActiveProductsEcom || this.flagAllActiveProductsEcom;
	if (flagActiveEcom) {
		body.allProducts = this.flagAllActiveProductsEcom;
	}

	if (this.flagAllActiveProductsEcom) {
		delete body.products;
	}

	this.$emit('save', flagActiveEcom, body);
}

function data() {
	return {
		flagActiveProductsEcom: false,
		flagAllActiveProductsEcom: false,
		tradesItem: [],
		trades: [],
	};
}

export default {
	name: 'assign-categories',
	components: {
		autocompleteComponent,
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		loadTrades,
		setData,
		save,
	},
	props: {
		products: {
			default: () => [],
			type: Array,
		},
		loadingAssignTrades: {
			default: false,
			type: Boolean,
		}
	},
	watch: {
		flagActiveProductsEcom(newVal) {
			if (newVal) {
				this.flagAllActiveProductsEcom = false;
			}
		},
		flagAllActiveProductsEcom(newVal) {
			if (newVal) {
				this.flagActiveProductsEcom = false;
			}
		},
	},
};
</script>
<style lang="scss">
.checkbox-customers {
	.input-group__details {
		display: none !important;
	}

	label {
		font-size: 15px !important;
	}
}
</style>
