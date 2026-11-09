<template>
	<div>
		<v-layout row wrap px-2>
			<v-flex xs12>
				<v-layout row wrap align-center mt-2>
					<v-flex xs3 pl-2>
						<switch-vendor
							disabled
							prices
							model="basePriceUsed"
							:false-value="0"
							:model-value="Number(basePriceComputed.PV === basePriceUsed)"
							:true-value="1"
							@on-switch-change="$emit('get-data', $event)"
						></switch-vendor>
					</v-flex>
					<v-flex xs9>
						<div v-if="showMessage" class="prices-notification">
							<template v-if="basePriceComputed.PV === basePriceUsed">
								Para activar la opción <span>Precio Unitatio (PU)</span> es
								necesario desactivar la opción
								<span>Incluye {{ labelsByCountry.taxName }}</span> en la
								<router-link :to="companyHref"
									>configuración de la compañía.</router-link
								>
							</template>
							<template v-else-if="basePriceComputed.PU === basePriceUsed">
								Para activar la opción <span>Precio Venta (PV)</span> es
								necesario activar la opción
								<span>Incluye {{ labelsByCountry.taxName }}</span> en la
								<router-link :to="companyHref"
									>configuración de la compañía.</router-link
								>
							</template>
							<v-btn
								class="btn-auto ma-0 prices-notification-icon"
								depressed
								flat
								icon
								@click="closeMessage"
							>
								<v-icon color="primary" size="14">close</v-icon>
							</v-btn>
						</div>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 px-2 pt-3 pb-5 mb-5>
				<template v-for="(priceList, indexPriceList) in pricesLists">
					<price-list
						v-if="priceList.show"
						:product="product"
						:index-price-list="indexPriceList"
						:key="indexPriceList"
						:open="priceList.open"
						:price-list="priceList"
						class="price-list-alternate"
						@valid-commissions="onValidCommissions"
						@set-price-list="
							$emit('set-price-list-data', $event, indexPriceList)
						"
						@toogle-open="$emit('toogle-open', indexPriceList)"
					/>
				</template>
				<span style="color: red; font-size: 12px">
					Tenga en cuenta que para guardar los cambios en sus listas de precios
					no se debe enviar en <strong>0</strong> el precio de la unidad
					principal.
				</span>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				success-color="primary"
				success-text="Guardar"
				:is-loading="isLoading || isComissions"
				@accept-button-clicked="$emit('accept-button')"
				@cancel-button-clicked="$emit('cancel-button', false, 'price-list')"
			/>
		</section>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import priceList from '@/components/master-product/price-list';
import switchVendor from '@/components/field-sale/vendors/switch-vendor';

function closeMessage() {
	this.showMessage = false;
}

function data() {
	return {
		companyHref: {
			name: 'companies',
			params: {
				tab: 'products',
			},
		},
		disabled: false,
		showMessage: true,
		isComissions: false,
	};
}

export default {
	name: 'prices-list-set',
	components: {
		modalSidebarButton,
		priceList,
		switchVendor,
	},
	data,
	methods: {
		closeMessage,
		onValidCommissions(e) {
			this.isComissions = !e;
		},
	},
	props: {
		basePriceComputed: {
			default: () => {},
			type: Object,
		},
		basePriceUsed: {
			default: 0,
			type: [Number, Boolean],
		},
		isLoading: {
			default: false,
			type: Boolean,
		},
		pricesLists: {
			default: () => [],
			type: Array,
		},
		product: {
			default: () => {},
			type: Object,
		},
	},
};
</script>

<style lang="scss" scoped>
.prices-notification {
	background-color: rgba(207, 239, 240, 0.96);
	border: 1px solid color(primary);
	border-radius: 11px;
	color: color(primary);
	font-family: font(open-regular);
	font-size: size(small11);
	max-width: 372px;
	padding: 11px 14px;
	position: relative;

	&-icon {
		position: absolute;
		right: 5px;
		top: 5px;
	}
}
</style>
