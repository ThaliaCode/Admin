<template>
	<div class="detail-in-table">
		<v-layout wrap align-center primary pa-2 class="header-detail">
			<v-flex xs6>
				<div class="white--text">
					{{ customer.fullName }}
				</div>
				<div class="white--text">
					{{ sale.typeDocumentCode }} - {{ sale.documentNumber }}
				</div>
			</v-flex>
			<v-flex xs6>
				<v-layout wrap align-center justify-end>
					<v-flex xs4>
						<p class="caption white--text my-0">Total</p>
						<p class="body-2 white--text my-0">
							<span class="small-currency">{{ sale.currencySymbol }}</span>
							{{ sale.amount | round }}
						</p>
					</v-flex>
					<v-flex xs6 pl-3 pr-2 v-if="showDebt">
						<p class="body-1 white--text my-0">Deuda</p>
						<v-btn
							class="btn-auto body-2 red white--text debt-amount ma-0 py-1"
							@click="$emit('open-debt-modal')"
						>
							<span class="small-currency">{{ sale.currencySymbol }}</span>
							{{ sale.debtAmount | round }}
						</v-btn>
					</v-flex>
					<v-flex xs2>
						<button @click="$emit('close-detail', sale)" class="btn-close pl-1">
							<v-icon color="white">clear</v-icon>
						</button>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<div class="min-height white">
			<v-layout wrap>
				<v-flex xs12 mb-2 body-1>
					<v-layout>
						<v-flex class="content-green">Fecha</v-flex>
						<v-flex class="c-text-green">{{
							date | formatDate('DD/MM/YYYY HH:mm:ss')
						}}</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<v-layout>
						<v-flex class="content-green">Forma de Pago</v-flex>
						<v-flex class="c-text-green">{{ typePayment }}</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<v-layout>
						<v-flex class="content-green">Comentario</v-flex>
						<v-flex class="c-text-green">{{ sale.commentary }}</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<v-layout>
						<v-flex class="content-green">Cantidad de Items</v-flex>
						<v-flex class="c-text-green">
							<template v-if="sale.details">
								{{ sale.details.length }}
							</template>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 mb-2 body-1 v-if="inlineProducts">
					<v-layout wrap>
						<v-flex xs12 class="content-green">Productos</v-flex>
						<v-flex xs12 class="c-text-green">{{ inlineProducts }}</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<v-layout>
						<v-flex class="content-green">Archivos Adjuntos</v-flex>
						<v-flex class="c-text-green">
							<v-layout row wrap>
								<v-flex v-for="(image, index) in sale.urlImages" :key="index" pr-2>
									<a :href="image" target="_blank" class="block">
										Imagen {{ index + 1 }}
										<span
											v-if="
												sale.urlImages.length > 1 && index < sale.urlImages.length - 1
											"
											>,</span
										>
									</a>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<v-layout wrap>
						<v-flex class="content-green">
							Nro de
							<span v-if="sale.typeDocument">{{
								sale.typeDocument.name.toLowerCase()
							}}</span>
							<span v-else>compra</span>
						</v-flex>
						<v-flex class="c-text-green">{{ sale.documentNumber }}</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 body-1 v-if="sale.withholdingTaxActive">
					<div v-if="sale.withholdingTaxActive.details">
						<v-layout wrap v-for="item in sale.viewTax" :key="item.id" mb-2>
							<v-flex class="content-green">{{ `Retencion ${item.name}` }}</v-flex>
							<v-flex class="c-text-green">
								<span class="small-currency">{{ sale.currencySymbol }}</span>
								{{ item.amountTax | round }}
							</v-flex>
						</v-layout>
					</div>
				</v-flex>
				<v-flex xs12 body-1 mb-2>
					<v-layout wrap>
						<v-flex class="content-green">Total de compra</v-flex>
						<v-flex class="c-text-green">
							<span class="small-currency">{{ sale.currencySymbol }}</span>
							{{ sale.amount | round }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 mb-2 body-1>
					<v-layout wrap>
						<v-flex xs12 class="content-green">Pagos</v-flex>
						<v-flex
							v-if="sale.transactions ? sale.transactions.length : false"
							xs12
							class="c-text-green"
							v-for="(t, index) in sale.transactions"
							:key="index"
						>
							- {{ t.typePayment ? t.typePayment.name : '' }} : {{ t.currencySymbol }}
							{{ t.amount || 0 }}
						</v-flex>
						<v-flex
							xs12
							v-if="sale.transactions ? sale.transactions.length === 0 : false"
							class="c-text-green"
							>No se han realizado transacciones en este venta</v-flex
						>
					</v-layout>
				</v-flex>
			</v-layout>
			<div class="px-3 d-block fill-height" v-if="showDebt">
				<h5 class="d-block my-3">Enviar comprobante por:</h5>
				<v-layout wrap justify-space-around class="ma-2">
					<app-tooltip-button
						icon="email"
						text="Email"
						color="primary"
						size="50"
						x-large
						@click-icon="$emit('show-modal-send', sale, 'email')"
					/>
					<app-tooltip-button
						img="/static/icon/whatsapp-icon.svg"
						text="WhatsApp"
						color="primary"
						height="35"
						x-large
						@click-icon="$emit('show-modal-send', sale, 'phone')"
					/>
				</v-layout>
			</div>
			<v-layout wrap justify-center pt-3 v-if="purchase">
				<button
					class="btn-sale mr-2 primary"
					type="button"
					@click="$emit('go-to-detail', sale)"
				>
					Ver detalle
				</button>
				<button
					v-if="isEcuador"
					class="btn-withholding btn-sale"
					type="button"
					@click="$emit('open-retention', sale)"
				>
					Ver retención
				</button>
			</v-layout>
		</div>
	</div>
</template>

<script>
import appTooltipButton from '@/components/shared/app-tooltip-button';

function typePayment() {
	return this.showDebt ? this.sale.typePaymentName : this.sale.paymentName;
}

export default {
	name: 'sales-details-in-table',
	computed: {
		typePayment,
	},
	props: {
		customer: {
			default: () => {},
			type: Object,
		},
		date: [Date, String, Number],
		inlineProducts: String,
		purchase: {
			default: false,
			type: Boolean,
		},
		sale: {
			default: () => {},
			type: Object,
		},
		showDebt: {
			default: true,
			type: Boolean,
		},
	},
	components: {
		appTooltipButton,
	},
};
</script>

<style lang="scss" scoped>
.debt-amount {
	border-radius: 4px;
	height: 32px;
}

.min-height {
	border-bottom-right-radius: 10px;
	min-height: calc(100vh - 450px);
	padding: 13px 13px 63px;
	position: relative;
}

.bottom {
	top: 88%;
	left: 0;
	position: absolute;
	right: 0;
}

.detail-in-table {
	padding-right: 44px;
}

.block {
	display: block;
}

.btn-close {
	border-left: 1px solid color(white);
}

.content-green {
	background: color(title-green);
	color: color(background-sidebar);
	font-family: font(open-bold);
	font-size: size(small11);
	min-width: 125px;
	padding: 4px 12px;
}

.c-text-green {
	background: color(text-green);
	color: color(paginationText);
	font-family: font(open-regular);
	font-size: size(small11);
	padding: 4px 12px;
	width: calc(100% - 125px);
}

.btn-sale {
	color: color(white);
	border-radius: 5px;
	font-family: font(open-semibold);
	font-size: 10px;
	padding: 9px 24px;
}

.header-detail {
	font-family: font(open-bold);
	font-size: size(medium);
}

.btn-withholding {
	background-color: color(bullet-list);
}

.small-currency {
	font-size: 10px;
}
</style>
