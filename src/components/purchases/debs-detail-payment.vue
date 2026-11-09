<template>
	<div class="debs-detail-payment">
		<v-layout row d-flex justify-space-between align-center blue darkent-2 px-4 py-4>
			<v-flex xs6>
				<span class="title white--text title-customer">
					{{ getSupplier }}
				</span>
			</v-flex>
			<v-flex xs6 text-xs-right>
				<span class="body-1 white--text my-0">Total</span><br>
				<span class="white--text my-0 total-order">
					{{ detailDeb.currencySymbol }} {{ getAmount }}
				</span>
				<button class="ml-4 btn-close" @click="closeAction">X</button>
			</v-flex>
		</v-layout>
		<div class="min-height white">
			<v-layout wrap pa-4>
				<v-flex xs12 mb-2 body-1>
					<span class="body-2 gray-detail-table">Fecha: <span class="ml-2">{{ detailDeb.createdAt | formatDate }} </span> </span>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<span class="body-2 gray-detail-table">Comentario: <span class="ml-2"> {{ detailDeb.commentary }} </span></span>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<span class="body-2 gray-detail-table">Cantidad de Items: <span class="ml-2" v-if="detailDeb.details">{{ detailDeb.details.length }}</span></span>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<span class="body-2 gray-detail-table">Productos: <span class="ml-2">{{ inlineProducts }}</span></span>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<span class="body-2 gray-detail-table">Archivos Adjuntos: 
						<a 
						:href="image"
						target="_blank"
						class="block"
						v-for="(image, index) in detailDeb.urlImages" 
						:key="index">
							{{ image }}
						</a></span>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<span class="body-2">Nro de documento de compra: <span>{{ detailDeb.documentNumber }}</span></span>
				</v-flex>
				<v-flex xs12 mb-2 body-1 v-if="detailDeb.withholdingTaxActive">
					<div v-if="detailDeb.withholdingTaxActive.details">
						<div
						v-for="tax in sale.viewTax"
						:key="tax.id"
						class="mb-2"
						>
							<span class="body-2">{{`Retención ${item.name}`}}: </span> {{ item.amountTax }}
						</div>
					</div>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<span class="body-2 gray-detail-table">Total del documento de compra: <span class="ml-2">{{ detailDeb.amount }}</span></span>	
				</v-flex>	
			</v-layout>
		</div>
	</div>
</template>

<script>
import lib from '@/shared/lib';

function getSupplier() {
	const supplier = lib.getDeeper('supplier', 'name')(this.detailDeb);
	return supplier;
}

function getAmount() {
	const amount = lib.getDeeper('amount')(this.detailDeb);
	return amount;
}

async function debsId(value) {
	if (value) {
		try {
			({ data: this.detailDeb } = await this.$httpSales.get(`purchase-documents/${value}`));
			const namesArray = this.detailDeb.details.map(c => `${c.product.name} (Cantidad: ${c.quantity})`);
			this.inlineProducts = namesArray.join(', ');
		} catch (error) {
			this.showGenericError();
		}
	}
}

function closeAction() {
	this.$emit('close-modal');
}

function data() {
	return {
		inlineProducts: '',
		detailDeb: {},
	};
}

export default {
	name: 'debs-detail-payment',
	data,
	computed: {
		getAmount,
		getSupplier,
	},
	methods: {
		closeAction,
	},
	props: {
		orderSelected: {
			default: () => {},
			type: Object,
		},
		debsId: null,
	},
	watch: {
		debsId,
	},
};
</script>

<style lang="scss" scoped>
.total-order {
	font-family: font(open-bold);
	font-size: map-get($sizes, medium20);
}

.min-height {
	border-bottom-right-radius: 10px;
	min-height: calc(100vh - 450px);
	padding-bottom: 100px;
	position: relative;
}

.gray-detail-table {
	color: map-get($colors, paginationText);
}

.border-right {
	border-right: 1px solid #0076d1;
}

.btn-close {
	color: color(white);
	font-size: 14px;
}

.title-customer {
	font-family: map-get($fonts, bold);
	font-size: 20px;
}

.debs-detail-payment {
	margin-right: 12px;
	position: fixed;
	transform: translateY(0px);
}
</style>