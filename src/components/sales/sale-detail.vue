<template>
	<div>
		<header-page :title="$route.meta.title" />
		<div class="overflow-auto mt-4">
			<div class="sale-detail" v-if="sale">
				<v-layout wrap px-4 py-2 align-center>
					<v-flex xs9 sm6>
						<h2 v-if="sale.typeDocument">
							#{{ sale.typeDocument.name }} {{ sale.serie }}-{{ sale.number }}
						</h2>
					</v-flex>
					<v-flex xs9 sm4 text-xs-center>
						<p v-if="sale.employee" class="mb-0">
							Vendedor: {{ sale.employee.name }} {{ sale.employee.lastname }}
						</p>
					</v-flex>
					<v-flex xs3 sm2 text-xs-right>
						<a
							@click.prevent="downloadSale(sale)"
							class="table-icon">
							<img :src="`${$imageUrl}/download.svg`" alt="" class="align-img">
						</a>
						<a
							@click.prevent="printDocument"
							class="table-icon print ml-2">
							<img :src="`${$imageUrl}/print.svg`" alt="" class="align-img">
						</a>
					</v-flex>
				</v-layout>
				<v-divider></v-divider>
				<v-layout wrap pt-4 px-5>
					<v-flex xs12 sm6>
						<p v-if="sale.customer">
							Cliente: {{ sale.customer.typePerson.fullName }}
						</p>
					</v-flex>
					<v-flex xs12 sm6>
						<p v-if="sale.payment">
							Modo de pago: {{ sale.payment.name }}
						</p>
					</v-flex>
				</v-layout>
				<v-layout wrap px-5>
					<v-flex xs12 sm6>
						<p v-if="sale.customer">DNI/RUC:
							<span v-if="sale.customer.flagTypePerson === 1">
								{{ sale.customer.dni }}
							</span>
							<span v-else>{{ sale.customer.ruc }}</span>
						</p>
					</v-flex>
					<v-flex xs12 sm6>
						<p v-if="sale.typeDocument">
							Tipo de documento: {{ sale.typeDocument.name }}
						</p>
					</v-flex>
				</v-layout>
				<v-layout wrap px-5>
					<v-flex xs12 sm6>
						<p>Dirección del cliente: {{customerDirection}}</p>
					</v-flex>
					<v-flex xs12 sm6>
						<p>Estado {{ labelsByCountry.taxAgency }}: {{ sale.statusTaxName.name }}</p>
					</v-flex>
				</v-layout>
				<v-layout wrap px-4 justify-end>
					<v-flex xs12 sm6>
						<p>Fecha: {{ sale.createdAt | formatDate }}</p>
					</v-flex>
				</v-layout>
				<v-layout wrap px-4>
					<v-flex xs12>
						<h3>Lista de productos</h3>
					</v-flex>
				</v-layout>
				<app-table
					name="saleDetail"
					:columns="columns"
					:rows="sale.details"
					local-storage
					:filter-columns="false"
					:input-search="false"
					:main-list="false"
					padding="px-0"
					class="is-not-selectable no-main-list mb-0">
					<template slot="rows" slot-scope="props">
						<td class="is-not-selectable">
							{{ props.row.product.code }}
						</td>
						<td>{{ props.row.product.name }}</td>
						<td>{{ props.row.product.inlineFeatures }}</td>
						<td>{{ props.row.quantity }}</td>
						<td>{{ props.row.unitName }}</td>
						<td>{{ props.row.price | round }}</td>
						<td>{{ props.row.discountPercentage }}</td>
						<td>{{ props.row.subTotal | round }}</td>
					</template>
				</app-table>
				<v-layout wrap mb-3>
					<v-flex xs6>
						<v-card class="white--text card-grey" height="61">
							<v-layout row wrap justify-space-around
								mb-2 class="row-text row-text-title">
								<v-flex xs5 text-xs-center>
									Subtotal
								</v-flex>
								<v-flex xs2 text-xs-center>
									+
								</v-flex>
								<v-flex xs5 text-xs-center>
									{{ getTaxByCountry($userInfo) }}:
								</v-flex>
							</v-layout>
							<v-layout row wrap justify-space-around
								class="row-text row-text-price">
								<v-flex xs5 text-xs-center>
									{{ sale.subtotal | round }}
								</v-flex>
								<v-flex xs2></v-flex>
								<v-flex xs5 text-xs-center>
									{{ sale.taxes | round }}
								</v-flex>
							</v-layout>
						</v-card>
					</v-flex>
					<v-flex xs3>
						<v-card class="text-xs-center card-pink" height="61">
							<v-layout column wrap class="row-text">
								<v-flex xs12 text-xs-center mb-2 class="row-text-title white--text">
									-dsct
								</v-flex>
								<v-flex xs12 text-xs-center class="row-text-price white--text">
									{{ discount | round }}
								</v-flex>
							</v-layout>
						</v-card>
					</v-flex>
					<v-flex xs3>
						<v-card class="text-xs-center card-blue" height="61">
							<v-layout column wrap class="row-text">
								<v-flex xs12 text-xs-center mb-2 class="row-text-title white--text">
									Total
								</v-flex>
								<v-flex xs12 text-xs-center class="row-text-price white--text">
									{{sale.currencySymbol}} {{ sale.amount | round }}
								</v-flex>
							</v-layout>
						</v-card>
					</v-flex>
				</v-layout>
				<v-layout wrap mb-3 px-4>
					<v-flex xs12>
						<p class="my-0">
							Comentario: <span class="commentary-text">{{ sale.commentary }}</span>
						</p>
					</v-flex>
				</v-layout>
				<v-layout wrap px-4 class="transactions-container">
					<v-flex xs12>
						<transactions-detail :transactions="transactions" />
					</v-flex>
				</v-layout>
				<v-layout wrap justify-center class="buttons-bottom">
					<v-flex xs2>
						<v-btn
							type="button"
							color="primary"
							class="btn-action"
							:to="{ name: 'sales' }">
							Regresar
						</v-btn>
					</v-flex>
				</v-layout>
			</div>
		</div>
	</div>
</template>

<script>
	import helper from '@/shared/helper';
	import appTable from '@/components/shared/table/app-table';
	import headerPage from '@/components/shared/header-page';
	import transactionsDetail from '@/components/sales/subcomponents/transactions-detail';

	function created() {
		this.loadData();
	}

	function closeModal() {
		this.action.open = false;
		this.action.code = '';
	}

	function customerDirection() {
		return this.sale.customer.address || 'No tiene dirección registrada.';
	}

	function discount() {
		return this.sale.details.reduce((acum, detail) => acum + detail.discount, 0);
	}

	async function downloadSale({ id, serie, number }) {
		try {
			const downloadDialog = this.$userInfo.company.settings.downloadSale;
			const params = { html: downloadDialog || null };
			const model = { code: 'pdf' };
			const responseType = 'blob';
			const response = await this.$httpReportSales.post(`sale-documents/${id}/pdf`, model, { params, responseType });
			const contentType = downloadDialog ? 'application/pdf' : 'text/html';
			const blob = helper.generateBlob(response.data, contentType);
			helper.showDownloadDialog(blob, `${serie}-${number}`, 'pdf', downloadDialog);
		} catch (error) {
			this.showGenericError();
		}
	}

	function isCancel() {
		return this.action.code === 'sale-cancel';
	}

	function isSaleCanceled() {
		return this.sale.state.code === 'ANU';
	}

	async function loadData() {
		try {
			({ data: this.sale } = await this.$httpSales.get(`sale-documents/${this.saleId}`));
			const newTransactions = this.sale.transactions || [];
			this.transactions = newTransactions.map((transaction) => {
				const newTransaction = { ...transaction };
				newTransaction.additionalInformation = newTransaction.additionalInformation || {};
				return newTransaction;
			});
		} catch (err) {
			this.showGenericError();
		}
	}

	function printDocument() {
		window.print();
	}

	function salesCanceled() {
		this.closeModal();
		this.loadData();
	}

	function showCancelButton() {
		const allowedDocs = ['BOL', 'NTV', 'FAC'];
		return !this.isSaleCanceled && allowedDocs.includes(this.sale.typeDocument.code);
	}

	function getTaxByCountry(user) {
		return user.company && user.company.country ? user.company.country.taxName : null;
	}

	function data() {
		return {
			action: {
				code: '',
				open: false,
			},
			columns: [
				{ id: 1, name: 'Código', visible: true },
				{ id: 2, name: 'Nombre', visible: true },
				{ id: 3, name: 'Características', visible: true },
				{ id: 4, name: 'Cantidad', visible: true },
				{ id: 5, name: 'Unidad', visible: true },
				{ id: 6, name: 'Precio', visible: true },
				{ id: 7, name: 'Descuento (%)', visible: true },
				{ id: 8, name: 'Total', visible: true },
			],
			isLoading: false,
			sale: {
				customer: {
					address: '',
					typePerson: {
						fullName: '',
					},
				},
				details: [
					{ product: {} },
				],
				state: {},
				statusTaxName: {},
				typeDocument: {},
			},
			transactions: [],
		};
	}

	export default {
		name: 'sale-detail',
		components: {
			appTable,
			headerPage,
			transactionsDetail,
		},
		computed: {
			customerDirection,
			discount,
			isCancel,
			isSaleCanceled,
			showCancelButton,
		},
		created,
		data,
		methods: {
			closeModal,
			downloadSale,
			getTaxByCountry,
			loadData,
			printDocument,
			salesCanceled,
		},
		props: {
			saleId: [Number, String],
		},
	};
</script>

<style lang="scss" scoped>
	.overflow-auto {
		&.overflow-background {
			background-color: map-get($colors, background-table);
			border-top: 2px solid map-get($colors, header);
			min-height: calc(100vh - 145px);
			padding: 30px 11.5px;
		}
	}

	.sale-detail {
		background-color: white;
		border-radius: 5px;
		color: map-get($colors, paginationText);
		font-family: map-get($fonts, open-semibold);
		margin: 19px auto 0;
		max-width: 600px;
		min-height: 607px;
		position: relative;

		h2 {
			font-size: map-get($sizes, large);
			font-weight: normal;
		}

		p {
			font-size: map-get($sizes, small);
		}

		.buttons-bottom {
			height: 40px;
		}
	}

	.divider {
		background-color: map-get($colors, subheaderText);
		height: 2px;
	}

	.table-icon {
		&.print {
			.align-img {
				height: 16px;
			}
		}
	}

	.card {
		border-radius: 0px;
		box-shadow: none;

		&-blue {
			background-color: map-get($colors, blue-card);
		}

		&-grey {
			background-color: map-get($colors, background-card);
		}

		&-pink {
			background-color: map-get($colors, orange-btn);
		}

		.row-text {
			color: map-get($colors, paginationText);
			font-size: map-get($sizes, medium);

			&-title {
				font-family: map-get($fonts, open-bold);
			}

			&-price {
				font-family: map-get($fonts, open-semibold);
				font-size: map-get($sizes, medium16);
			}
		}
	}

	.customer-address {
		margin-bottom: 0;
	}

	.transactions-container {
		margin-bottom: 25px;
		max-height: 155px;
		overflow: auto;
	}

	.commentary-text {
		font-family: map-get($fonts, open-regular);
	}
</style>
