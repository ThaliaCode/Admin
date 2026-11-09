<template>
	<div class="pa-4">
		<v-layout wrap mb-2 v-for="product in productsSelected" :key="product.id">
			<v-flex xs12 mb-3>
				<p class="mb-3">{{ product.name}}</p>
				<v-text-field
					class="filter-select"
					name="price"
					label="Precio"
					v-model="product.changePrice"
					type="number"
				></v-text-field>
			</v-flex>
		</v-layout>
		<v-layout wrap>
			<v-flex xs12>
				<v-checkbox
					color="success"
					hide-details
					label="Replicar en todos los almacenes"
					v-model="flagWarehouse"
				></v-checkbox>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="false"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="verifyWarehouse"
			/>
		</section>
		<v-dialog
			v-model="dialog"
			persistent
			max-width="425">
			<v-card>
				<v-card-title class="headline">
					¿Deseas cambiar el precio de los productos?
				</v-card-title>
				<v-card-text class="subtext">{{ message }}</v-card-text>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs6 pr-1
							text-xs-right>
							<v-btn
								color="pink"
								class="btn-action white--text"
								@@click.native="cancel"
								>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1
							text-xs-left>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="updatePrice"
							>
								Aceptar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import helper from '@/shared/helper';

function data() {
	return {
		flagWarehouse: true,
		price: null,
		productsSelected: [],
		changeSalPriceListId: null,
		dialog: false,
		message: '',
	};
}

function getPrice(self, product) {
	const { priceList } = product;
	const user = helper.getLocalData('admin-user');
	const idPriceList = user.salPriceList.id;
	if (self.idCommerce) {
		return priceList && priceList[self.selectedPriceList] ?
			priceList[self.selectedPriceList].price : 0;
	} else if (priceList) {
		const l = priceList[idPriceList] ? priceList[idPriceList].price : 0;
		return priceList ? l : 0;
	}
	return 0;
}

function created() {
	const user = helper.getLocalData('admin-user');
	const idPriceList = user.salPriceList.id;
	this.changeSalPriceListId = this.idCommerce ? this.selectedPriceList : idPriceList;
	this.productsSelected = this.products.map((p) => {
		const newProduct = { ...p };
		newProduct.changePrice = getPrice(this, p);
		return newProduct;
	});
	this.message = this.idCommerce ?
		'Solo se cambiara el precio en el almacén por defecto del comercio.' :
		'Solo se cambiara el precio en el almacén asignado a este usuario.';
}

function cancel() {
	this.dialog = false;
}

function updatePrice() {
	this.$emit('update-price', this.changeSalPriceListId, this.productsSelected, this.flagWarehouse);
	this.cancel();
}

function verifyWarehouse() {
	if (this.flagWarehouse) {
		this.updatePrice();
	} else {
		this.dialog = true;
	}
}

export default {
	name: 'change-price',
	data,
	created,
	components: {
		modalSidebarButton,
	},
	methods: {
		getPrice,
		cancel,
		updatePrice,
		verifyWarehouse,
	},
	props: {
		products: {
			default: () => [],
			type: Array,
		},
		selectedPriceList: {
			default: 0,
			type: Number,
		},
		idCommerce: {
			type: [Number, String],
		},
	},
};
</script>