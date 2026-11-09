<template>
	<div class="overflow-table table-inventory mb-5 content-table" :class="padding">
		<div class="table-general-inventory">
			<div class="wrapper-table-inventory">
				<div class="table-product">
					<div class="table-stock">
						<span>Stock</span>
					</div>
					<div class="stock-prod scroll-body" @scroll="onVerticalScroll">
						<div class="item-product" :class="`item-code-${index}`" v-for="(product, index) in listProduct"
							:key="index">
							<span>{{ product.stock }}</span>
						</div>
					</div>
					<div class="pa-4 content-footer"></div>
				</div>
				<div class="table-product">
					<div class="table-theory width-theory">
						<span>Teorico</span>
					</div>
					<div class="list-product scroll-body" @scroll="onVerticalScroll">
						<div class="item-product width-theory" :class="`item-name-${index}`"
							v-for="(product, index) in listProduct" :key="index">
							<app-input-text model="quantityTheoretical" :text="product.quantityTheoretical" :disabled="isKardexConfirmed"
								@input="$emit('set-theory', $event, index, product)" />
						</div>
					</div>
					<div class="pa-4 content-footer"></div>
				</div>
				<div class="table-product border-left">
					<div class="table-name">
						<span>Nombre</span>
					</div>
					<div class="list-product scroll-body" @scroll="onVerticalScroll">
						<v-layout px-1 d-flex justify-space-between class="item-product" :class="`item-name-${index}`"
							v-for="(product, index) in listProduct" :key="index">
							<v-flex text-xs-left>
								<v-tooltip bottom v-if="
									product.nameProduct
										? product.nameProduct.length > 10
										: false
								">
									<p slot="activator" class="ma-0">
										{{ product.codeProduct | limitTo(20) }} -
										{{ product.nameProduct | limitTo(20) }}
									</p>
									<span>{{ product.nameProduct }}</span>
								</v-tooltip>
								<p class="ma-0" v-else>
									{{ product.codeProduct }} - {{ product.nameProduct }}
								</p>
							</v-flex>
							<v-flex text-xs-right>
								<app-tooltip-button v-if="
									product.conversionProduct &&
									product.conversionProduct.length
								" class="ml-2" color="primary" icon="check_circle_outline" text="Seleccionar Conversión"
									@click-icon="$emit('show-conversion', index, product)" />
							</v-flex>
						</v-layout>
					</div>
					<div class="pa-4 content-footer">
						<v-btn v-show="totalTeorico > 0" :disabled="isKardexConfirmed" type="button" color="success" class="px-2 white--text btn-full py2 ft-14"
							@click="$emit('open-custom-modal')">
							Ingresar Stock
						</v-btn>
					</div>
				</div>
				<div style="display: flex; flex-direction: column; flex: 1; min-width: 0; position: relative;">
					<div class="top-scrollbar-container" ref="topScroll" @scroll="onTopScroll" style="width: 100%;">
						<div class="top-scrollbar-content" :style="{ width: innerWidth + 'px', height: '1px' }"></div>
					</div>
					<div class="table-list-inventories" ref="bottomScroll" @scroll="onBottomScroll"
						style="width: 100%;">
						<div class="item-inventory item-100" v-if="listDetail.length === 0">
							<div>
								<div class="item-name">
									<span>Punto de Venta 0</span>
								</div>
								<div class="wrapper-item-detail">
									<div class="item-100 text-center">Solicitado</div>
									<div class="item-100 text-center">Enviar (UND)</div>
								</div>
							</div>
						</div>
						<div class="item-inventory" :style="style" v-for="(itemHeader, indexHeader) in listDetail"
							:key="indexHeader">
							<div style="height: 100px;">
								<div class="item-name">
									<v-layout row pt-2 pb-2 align-center>
										<v-flex text-xs-center>
											<span>{{ itemHeader.warehouseName }} </span>
											<br />
											<button class="url-domain" @click="goToReference(itemHeader)">
												Nro: {{ itemHeader.serie }} - {{ itemHeader.number }}
											</button>
										</v-flex>
										<v-flex ml-4>
											<span>
												<app-tooltip-button icon="print"
													text="Descarga Detalle de Transferencia" color="white" size="22"
													@click-icon="downloadPdf(itemHeader)" />
											</span>
										</v-flex>
									</v-layout>
								</div>
								<div class="wrapper-item-detail">
									<div class="text-center" style="width: 75%">Solicitado</div>
									<div class="text-center" style="width: 25%">Enviar (UND)</div>
								</div>
							</div>
							<div class="content-consolidated scroll-body" @scroll="onVerticalScroll">
								<div v-for="(detail, indexDetail) in itemHeader.products" :key="indexDetail"
									class="wrapper-item-information">
									<v-layout wrap row style="width: 79%"
										class="text-center item-information pt-1 px-1878">
										<v-flex class="text-center border-right"
											v-for="(item, index) in detail.conversions" :key="index">
											<label class="ft-10">{{ item.codeConversion || item.name }}
												{{
													item.codeConversion !== 'UNIDAD' &&
														item.codeConversion !== 'UND' &&
														item.codeConversion !== 'UNQ' &&
														item.quantityTo > 0
														? ` - ${item.unitQuantity / item.quantityTo}`
														: ''
												}}</label>
											<v-tooltip top>
												<app-input-text slot="activator" :disabled="itemHeader.status === 5"
													:style="detail.conversions.length > 2
														? 'width: 34.6px'
														: 'width: 48.9px'
														" model="quantityTo" :text="item.quantityTo" @input="
															$emit(
																'set-conversion',
																itemHeader,
																detail,
																item,
																indexHeader,
																index,
																indexDetail,
																$event
															)
															" />
												<span>
													Almacen: {{ itemHeader.warehouseName }} / Cantidad:
													{{ item.quantityTo }}
												</span>
											</v-tooltip>
										</v-flex>
									</v-layout>
									<div class="text-center item-information"
										style="width: 21%; border: none; flex-direction: row">
										{{ detail.quantity || 0 }}
										<v-tooltip top>
											<v-btn v-if="detail.quantity > 0" :disabled="!itemHeader" slot="activator"
												class="table-icon primary--text ma-0 ml-2" icon flat small
												@click="$emit('open-dialog-record', detail, itemHeader)">
												<v-icon color="primary" size="19"> restore </v-icon>
											</v-btn>
											<span>Historial de Transferencias</span>
										</v-tooltip>
									</div>
								</div>
							</div>
							<div class="pa-4 content-footer">
								<v-tooltip top>
									<v-btn slot="activator" type="button" :style="itemHeader.status === 5
										? 'cursor: not-allowed; pointer-events:none'
										: null
										" :color="itemHeader.status === 5 ? 'input' : 'success'" class="px-2 white--text btn-full py-2 ft-14"
										@click="$emit('send-transfer', itemHeader)">
										{{ itemHeader.status === 5 ? 'Enviado' : 'Realizar Envio' }}
									</v-btn>
									<span> Almacén: {{ itemHeader.warehouseName }} </span>
								</v-tooltip>
							</div>
						</div>
					</div>
				</div>

				<div class="table-slide">
					<div class="table-slide-header">
						<div class="slide-item">
							<span class="text-center">Total Disponible</span>
						</div>
						<div class="slide-item">
							<span class="text-center">Total Solicitado</span>
						</div>
						<div class="slide-item">
							<span class="text-center">Total a Enviar</span>
						</div>
						<div class="slide-item">
							<span class="text-center">Nuevo <br />
								Stock</span>
						</div>
					</div>
					<div class="contet-final scroll-body" @scroll="onVerticalScroll">
						<div class="table-slide-items" v-for="(product, index) in listProduct" :key="index">
							<div class="text-center slider-number">
								{{ product.quantityAvailable | round }}
							</div>
							<div class="text-center slider-number">
								{{ product.quantityRequested | round }}
							</div>
							<div class="text-center slider-number">
								{{ product.quantitySend | round }}
							</div>
							<div class="text-center slider-number">
								{{ product.newQuantity | round }}
							</div>
						</div>
					</div>
					<div class="pa-4 content-footer"></div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
// import { format } from 'date-fns';
import helper from '@/shared/helper';

function style() {
	let styleClass;
	if (this.numColum > 4) {
		styleClass = 'width: 200px; min-width: 200px';
	} else {
		styleClass = `width: calc(100% / ${this.numColum})`;
	}
	return styleClass;
}

function styleSeccion(value) {
	return `width: calc(100%/ ${value})`;
}

async function downloadPdf(itemHeaderParam) {
	const { transferId, status } = itemHeaderParam;
	const itemHeader = JSON.parse(JSON.stringify(itemHeaderParam));

	this.listProduct.forEach((item, index) => {
		if (itemHeader.products[index]) {
			itemHeader.products[index].nameProduct = item.nameProduct;
			itemHeader.products[index].codeProduct = item.codeProduct;
		}
	});
	console.log('downloadPDF => ', itemHeader);
	if (status !== 5) {
		this.generateHtmlFile(itemHeader);
		return;
	}
	try {
		const body = {
			code: 'conversions-transfer-detail-pdf',
		};
		const response = await this.$httpProducts.post(
			`transfers/${transferId}/pdf`,
			body
		);
		console.log('response => ', response);
		const contentType = 'text/html';
		const blob = helper.generateBlob(response.data, contentType);
		helper.showDownloadDialog(blob, 'Reporte Detalle', false);
		this.showNotification('El reporte se generó correctamente.');
	} catch (error) {
		if (error.status === 400) {
			this.showGenericError(error.data.message);
		}
	}
}

function goToReference({ transferId, status }) {
	const statusTransfer = status === 5 ? 2 : 1;
	const url = {
		name: 'pages-transfers-detail',
		params: { id: transferId },
		query: { status: statusTransfer },
	};
	const routeData = this.$router.resolve(url);
	window.open(routeData.href, '_blank');
}

export default {
	name: 'table-invnetory',
	data() {
		return {
			innerWidth: 0,
			isSyncingTop: false,
			isSyncingBottom: false,
			isSyncingVertical: false,
		};
	},
	watch: {
		listDetail: {
			handler() {
				setTimeout(() => {
					this.calculateWidth();
				}, 500);
			},
			deep: true
		}
	},

	mounted() {
		window.addEventListener('resize', this.calculateWidth);
	},
	beforeDestroy() {
		window.removeEventListener('resize', this.calculateWidth);
	},
	updated() {
		this.calculateWidth();
	},

	computed: {
		style,
		totalTeorico() {
			if (!this.listProduct || !this.listProduct.length) return 0;
			return this.listProduct.reduce((total, product) => total + Number(product.quantityTheoretical || 0), 0);
		},
		isKardexConfirmed() {
			return this.consolidation && this.consolidation.additionalInformation &&
				this.consolidation.additionalInformation.flagKardex === true;
		}
	},
	methods: {
		goToReference,
		downloadPdf,
		styleSeccion,
		calculateWidth() {
			this.$nextTick(() => {
				if (this.$refs.bottomScroll) {
					this.innerWidth = this.$refs.bottomScroll.scrollWidth;
				}
			});
			setTimeout(() => {
				if (this.$refs.bottomScroll) {
					this.innerWidth = this.$refs.bottomScroll.scrollWidth;
				}
			}, 300);
		},
		onTopScroll(e) {
			if (!this.isSyncingTop) {
				this.isSyncingBottom = true;
				this.$refs.bottomScroll.scrollLeft = e.target.scrollLeft;
			}
			this.isSyncingTop = false;
		},
		onBottomScroll(e) {
			if (!this.isSyncingBottom) {
				this.isSyncingTop = true;
				this.$refs.topScroll.scrollLeft = e.target.scrollLeft;
			}
			this.isSyncingBottom = false;
		},
		onVerticalScroll(e) {
			if (this.isSyncingVertical) return;

			window.requestAnimationFrame(() => {
				const top = e.target.scrollTop;
				const elements = this.$el.querySelectorAll('.scroll-body');
				elements.forEach(el => {
					if (el !== e.target && el.scrollTop !== top) {
						el.scrollTop = top;
					}
				});
				this.isSyncingVertical = false;
			});
			this.isSyncingVertical = true;
		},

		generateHtmlFile(data) {
			const results = data.products.map((item) => {
				const quantity = item.conversions.reduce(
					(sum, conversion) => sum + (conversion.unitQuantity || conversion.quantityTo),
					0
				);
				return { ...item, quantity };
			});
			const date = new Date(this.consolidation.consolidationDate);
			const formattedDate = `${String(date.getDate()).padStart(
				2,
				'0'
			)}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
			const resultsZero = results.filter((e) => e.quantity);
			const conversionRows = resultsZero
				.map((detail) => {
					const conversions = detail.conversions
						.map((conv) => `** ${conv.quantityTo} - ${conv.codeConversion}`)
						.join('<br>');

					return `
						<tr>
							<td>${detail.codeProduct}</td>
							<td>:: ${detail.nameProduct}</td>
							<td style="text-align:center">${detail.quantity}</td>
							<td>${conversions || 'Sin Conversión'}</td>
						</tr>
						<tr><td colspan="4" style="height:10px;"></td></tr>
					`;
				})
				.join('');

			const htmlContent = `
				<!DOCTYPE html>
				<html>
					<head>
						<meta charset="UTF-8">
						<title>Factura PDF</title>
						<style>
							* {
									box-sizing: border-box;
									font-family: "Arial", Monaco, monospace;
									font-size: 10px;
									font-weight: normal;
									padding: 0px;
									margin: 0px;
							}

							.billing-container {
									margin: 0 auto;
									max-width: 350px;
							}

							.billing-header {
									text-align: center;
							}

							table {
									border-collapse: collapse;
							}

							thead>tr {
									border-bottom: 2px dotted grey;
									border-top: 2px dotted grey;
							}

							thead {
									display: table-row-group;
							}

							h1 {
									font-size: 14px;
							}

							h3 {
									font-size: 9px;
							}

							p {
									margin: 0px;
							}

							table {
									margin-top: 10px;
									padding: 0px;
							}

							td.td-padding-top {
									padding-top: 6px;
							}

							td.td-padding-bottom {
									padding-bottom: 2px;
							}

							.pd-right {
									padding-right: 6px;
							}

							.text-center {
									text-align: center;
							}

							.text-left {
									text-align: left;
							}

							.text-right {
									text-align: right;
							}

							.text-center {
									text-align: center;
							}
						</style>
					</head>
					<body class="billing-container">
						<h1>Detalle de Transferencia Nro - ${data.number}</h1>
						<p><strong>T. Origen:</strong> ${this.consolidation.warehouse.name}</p>
						<p><strong>Última Act.:</strong> ${formattedDate}</p>
						<p><strong>T. Destino:</strong> ${data.warehouseName}</p>
						<p><strong>F. de Creación:</strong> ${formattedDate}</p>

						<table>
							<thead>
								<tr>
									<th>COD</th>
									<th>NOMBRE</th>
									<th>CANT. ENV.</th>
									<th>CONVER.</th>
								</tr>
							</thead>
							<tbody>
								${conversionRows}
							</tbody>
						</table>
					</body>
				</html>
			`;

			const newWindow = window.open('', '_blank');
			newWindow.document.write(htmlContent);
			newWindow.document.close();
		},
	},
	props: {
		padding: {
			default: 'px-5',
			type: String,
		},
		numColum: {
			default: 1,
			type: Number,
		},
		numColumDetails: {
			default: 2,
			type: Number,
		},
		listProduct: {
			default: () => [],
			type: [Array, Object],
		},
		listDetail: {
			default: () => [],
			type: [Array, Object],
		},
		currentPage: {
			type: Number,
			default: 1,
		},
		lastPage: {
			type: Number,
			default: 0,
		},
		disabledSend: {
			type: Boolean,
			default: false,
		},
		showConversion: {
			type: Boolean,
			default: true,
		},
		consolidation: {
			type: Object,
		},
	},
};
</script>
<style lang="scss" scoped>
.wrapper-table-inventory {
	box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
	display: flex;

	.table-name {
		align-items: center;
		background: map-get($colors, primary);
		color: map-get($colors, white);
		display: flex;
		font-size: 13px;
		height: 100px;
		justify-content: center;
		max-width: 350px;
	}

	.table-stock {
		align-items: center;
		background: map-get($colors, primary);
		color: map-get($colors, white);
		display: flex;
		font-size: 13px;
		height: 100px;
		justify-content: center;
		min-width: 85px;

		@media (max-width: 1250px) {
			min-width: 50px;
		}
	}

	.table-theory {
		align-items: center;
		background: map-get($colors, primary);
		color: map-get($colors, white);
		display: flex;
		font-size: 13px;
		height: 100px;
		justify-content: center;
	}

	.width-theory {
		width: 79px;

		@media (max-width: 1250px) {
			width: 50px;
		}
	}

	.item-product {
		align-items: center;
		border-right: 1px solid #b5cadd;
		background: map-get($colors, white);
		display: flex;
		justify-content: center;
		font-size: 11.5px;
		height: 53px;
		min-height: 53px;
		padding: 6px 5px;
		text-align: center;

		&:nth-child(2n) {
			background: map-get($colors, background-table);
		}
	}
}

.top-scrollbar-container {
	position: absolute;
	top: -16px;
	left: 0;
	overflow-x: scroll;
	overflow-y: hidden;
	//height: 16px;
}

.table-list-inventories {
	color: map-get($colors, white);
	display: flex;
	overflow-x: scroll;

	.item-name {
		align-items: center;
		background: map-get($colors, primary);
		display: flex;
		flex-direction: column;
		font-size: 13px;
		height: 50px;
		justify-content: center;
		min-width: 180px;

		@media (min-width: 1350px) {
			height: 55.5px;
		}
	}

	.item-date {
		background: map-get($colors, table-inventory);
		font-size: 10px;
		padding: 5px;
		text-align: center;
	}

	.wrapper-item-detail {
		align-items: center;
		background: map-get($colors, background-sidebar);
		display: flex;
		font-size: 10px;
		font-weight: bold;
		padding: 4px 4.5px;

		@media (min-width: 1440px) {
			padding: 7.5px 4.5px;
		}
	}

	.wrapper-item-information {
		background: map-get($colors, white);
		color: rgba(0, 0, 0, 0.87);
		display: flex;
		font-size: 13px;

		&:nth-child(2n) {
			background: map-get($colors, background-table);
		}
	}

	.item-inventory {
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
	}

	.item-information {
		@include flex-center();
		flex-direction: column;
		border-right: 1px solid map-get($colors, border-item);
		height: 53px;
		min-height: 53px;
	}
}

.text-center {
	text-align: center;
}

.table-slide {
	border-left: 2px solid map-get($colors, success);
	font-size: 13px;
	width: 305px;

	@media (max-width: 1250px) {
		width: 272px;
	}

	.table-slide-header {
		background: map-get($colors, primary);
		color: map-get($colors, white);
		display: flex;
		font-size: 13px;
		height: 100px;
	}

	.table-slide-items {
		background: map-get($colors, white);
		display: flex;

		&:nth-child(2n) {
			background: map-get($colors, background-table);
		}

		.slider-number {
			border-right: 1px solid map-get($colors, border-item);
			flex: 1 1 25%;
			height: 53px;
			padding: 8px 0;
		}
	}

	.slide-item {
		align-items: center;
		display: flex;
		flex: 1 1 25%;
		justify-content: center;
	}
}

// .table-product {
// 	border-right: 2px solid map-get($colors, success);
// }

.footer-table {
	background: map-get($colors, white);
	border-radius: 0 0 20px 20px;
	box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
	height: 34px;
	text-align: center;
	width: 100%;
}

.table-general-inventory {
	margin-top: 13px;
}

.item-100 {
	width: 100%;
}

.footer-table-total {
	background-color: #e2f1f1;
	font-size: 12px;
	position: relative;

	&--select {
		background-color: rgba(195, 231, 232, 0.42);
		color: color(background-sidebar);
		font-size: 13px;
		font-weight: bold;
		text-align: center;
	}

	&--text {
		color: color(paginationText);
		font-size: 10px;
	}
}

.w-86 {
	width: 100%;
}

.content-footer {
	display: flex;
	justify-content: center;
}

.w-120 {
	width: 150px;
}

.pag {
	background: map-get($colors, white) !important;
	box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.2);
	bottom: 0px !important;
	border-bottom-right-radius: 10px;
	border-bottom-left-radius: 10px;
	height: 35px;

	a {
		color: map-get($colors, paginationText) !important;
		font-size: 15px;
		font-weight: lighter;
		line-height: 10px;
		margin-left: 9px;

		&.active-page {
			color: map-get($colors, primary) !important;
		}

		&:hover {
			font-size: 18px;
		}
	}

	span {
		color: map-get($colors, grey-border);
	}
}

.content-footer {
	background-color: color(primary);
	min-height: 77px;
}

.border-left {
	border-right: 2px solid color(success);
}

.scroll-body {
	max-height: calc(100vh - 430px);
	overflow-y: auto;
	min-height: 200px;
}

.table-product .scroll-body,
.table-list-inventories .scroll-body {

	-ms-overflow-style: none;
	scrollbar-width: none;
}

.table-product .scroll-body::-webkit-scrollbar,
.table-list-inventories .scroll-body::-webkit-scrollbar {
	display: none;
}

.row-checked {
	background-color: rgba(178, 221, 0, 0.06) !important;
	border: 1px solid map-get($colors, borderRowSelected) !important;

	td:not(.td-employee) {
		&:first-child {
			border-left: 1px solid map-get($colors, borderRowSelected) !important;
		}

		&:last-child {
			border-right: 1px solid map-get($colors, borderRowSelected) !important;
		}
	}
}

.ft-10 {
	font-size: 9px !important;
}

.url-domain {
	border-bottom: 1px solid white;
	color: white;
	font-weight: bold;
	font-size: 12.5px;
}

.border-none {
	border-right: none !important;
}

.overflow-table {
	height: auto;
	//overflow-y: auto;
}

.ft-14 {
	border-radius: 5px;
	box-shadow: none !important;
	font-size: 12.3px !important;
	margin: 0px;
	text-transform: uppercase !important;
	font-weight: bold;
	height: 30px !important;
}

.content-table {
	padding-left: 48px !important;
	padding-right: 48px !important;

	@media (max-width: 1250px) {
		padding-left: 10px !important;
		padding-right: 10px !important;
	}
}
</style>
