<template>
	<div class="detail-amortizations">
		<v-layout wrap align-center primary darken-2 py-3 px-3>
			<v-flex xs6>
				<span class="title white--text">
					{{ detailAmortizations.customer ? detailAmortizations.customer.name : '' }}
					{{ detailAmortizations.customer ? detailAmortizations.customer.lastname : '' }}
				</span>
			</v-flex>
			<v-flex xs6 text-xs-right>
				<span class="body-1 white--text my-0 pr-4">Total</span><br>
				<span class="body-2 white--text my-0 ml-4">
					{{ detailAmortizations.currencySymbol }} {{ detailAmortizations.amount | round }}
				</span>
				<button class="btn-close pl-2" @click="closeSlider">X</button>
			</v-flex>
		</v-layout>
		<div class="min-height white">
			<v-layout wrap pa-4>
				<v-flex xs12 mb-2 body-1>
					<span class="body-2">Fecha: <span class="ml-2">{{ detailAmortizations.createdAt | formatDate('DD-MM-YYYY, HH:MM:SS a') }}</span></span>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<span class="body-2">Tipo de Pago: <span class="ml-2">{{ detailAmortizations.payment ? detailAmortizations.payment.name : '' }}</span></span>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<span class="body-2">Comentario: <span class="ml-2">{{ detailAmortizations.commentary }}</span></span>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<span class="body-2" v-if="detailAmortizations.details">Cantidad de Items <span class="ml-2">{{ detailAmortizations.details.length }}</span></span>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<span class="body-2">Productos: <span class="ml-2">{{ inlineProducts }}</span></span>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<span class="body-2">Archivos Adjuntos:
						<a 
						:href="image"
						target="_blank"
						class="block"
						v-for="(image, index) in detailAmortizations.urlImages"
						:key="index">
							{{ image }}
						</a>
					</span>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<span class="body-2">Nro de documento de venta: <span class="ml-2">{{ detailAmortizations.documentNumberComplete }}</span></span>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<span class="body-2">Total de docuento de compra: <span class="ml-2">{{ detailAmortizations.amount }}</span></span>
				</v-flex>
			</v-layout>
		</div>
	</div>
</template>

<script>

async function amortizationId(value) {
	if (value) {
		try {
			const response = await this.$httpSales.get(`sale-documents/${value}`);
			this.detailAmortizations = response.data;
			const products = this.detailAmortizations.details.map(detail => detail);
			const nameProducts = products.map(p => `${p.product.name} (Cantidad: ${p.quantity})`);
			this.inlineProducts = nameProducts.join(', ');
		} catch (error) {
			this.showGenericError();
		}
	}
}

function closeSlider() {
	this.$emit('close-slider');
}

function data() {
	return {
		detailAmortizations: {},
		inlineProducts: '',
		listDetail: [],
	};
}

export default {
	name: 'detail-amortizations',
	data,
	watch: {
		amortizationId,
	},
	methods: {
		closeSlider,
	},
	props: {
		amortizationId: null,
	},
};
</script>

<style lang="scss" scoped>
.detail-amortizations {
	padding-right: 14px;
	position: fixed;
	transform: translateY(0px);
}

.min-height {
	border-bottom-right-radius: 10px;
	min-height: calc(100vh - 450px);
	padding-bottom: 100px;
	position: relative;
}

.btn-close {
	bottom: 30px;
	color: color(white);
	font-family: map-get($fonts, open-bold);
	font-size: 25px;
	position: relative;
}
</style>