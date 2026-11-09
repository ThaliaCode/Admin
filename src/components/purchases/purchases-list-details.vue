<template>
	<div>
		<div class="sale-detail">
			<v-layout wrap px-4 py-2 align-center>
				<v-flex xs9 sm6>
					<h2 v-if="purchase.typeDocument">
						#{{ purchase.typeDocument.name }} {{ purchase.documentNumber }}
					</h2>
				</v-flex>
				<v-flex xs9 sm6 text-xs-right>
					<p v-if="purchase.employee" class="mb-0">
						Vendedor: {{ purchase.employee.name }} {{ purchase.employee.lastname }}
					</p>
				</v-flex>
			</v-layout>
			<v-divider></v-divider>
			<v-layout wrap pt-4 px-5>
				<v-flex xs12 sm8 v-if="purchase.supplier">
					<p>
						Proveedor: {{ purchase.supplier.name }}
					</p>
					<p>
						<span v-if="purchase.supplier.msTypePerson">
							{{ purchase.supplier.msTypePerson.name }}:
						</span>
						{{ purchase.supplier.documentNumber }}
					</p>
				</v-flex>
				<v-flex xs12 sm4>
					<p v-if="purchase.payment">
						Modo de pago: {{ purchase.payment.name }}
					</p>
					<p v-if="purchase.typeDocument">
						Tipo de documento: {{ purchase.typeDocument.name }}
					</p>
				</v-flex>
				<v-flex xs12>
					<p>
						Dirección del proveedor: 
						<span v-if="purchase.supplier">
							{{ purchase.supplier.address }}
						</span>
					</p>
				</v-flex>
				<v-flex xs12>
					<p>
						Fecha: {{ purchase.createdAt | formatDate }}
					</p>
				</v-flex>
			</v-layout>
			<v-layout wrap px-4 py-2 align-center>
				<v-flex xs12 sm6>
					<h3>Lista de productos</h3>
				</v-flex>
			</v-layout>
			<v-layout wrap>
				<v-flex xs12>
					<div class="overflow-auto pb-0">
						<app-table
							name="purchase-detail"
							:columns="columns"
							:rows="details"
							local-storage
							:filter-columns="false"
							:input-search="false"
							:main-list="false"
							class="is-not-selectable no-main-list">
							<template slot="rows" slot-scope="props">
								<td class="is-not-selectable">
									{{ props.row.product.code }}
								</td>
								<td>{{ props.row.product.name }}</td>
								<td>{{ props.row.product.inlineFeatures }}</td>
								<td>{{ props.row.quantity }}</td>
								<td>{{ props.row.price | round }}</td>
								<td>{{ props.row.subTotal | round }}</td>
							</template>
						</app-table>
					</div>
				</v-flex>
			</v-layout>
			<v-layout wrap mb-3 px-4>
				<v-flex xs6>
					<v-card class="white--text card-grey" height="61">
						<v-layout wrap justify-space-around
							mb-2 class="row-text row-text-title">
							<v-flex xs5 text-xs-center>
								Subtotal
							</v-flex>
							<v-flex xs2 text-xs-center>
								+
							</v-flex>
							<v-flex xs5 text-xs-center>
								Impuesto
							</v-flex>
						</v-layout>
						<v-layout row wrap justify-space-around
							class="row-text row-text-price">
							<v-flex xs5 text-xs-center>
								{{ purchase.subTotal | round }}
							</v-flex>
							<v-flex xs2></v-flex>
							<v-flex xs5 text-xs-center>
								{{ purchase.taxes | round }}
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
								{{ purchase.discountAmount | round }}
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
								{{ purchase.currencySymbol }} {{ purchase.amount | round }}
							</v-flex>
						</v-layout>
					</v-card>
				</v-flex>
			</v-layout>
			<v-layout wrap justify-center class="buttons-bottom">
				<v-flex xs6 text-xs-center>
					<v-btn
						type="button"
						color="primary"
						class="btn-action mr-2"
						:to="{ name: 'purchases' }">
						Regresar
					</v-btn>
				</v-flex>
			</v-layout>
		</div>
	</div>
</template>

<script>
	import appTable from './../shared/table/app-table';

	export default {
		name: 'purchases-list-details',
		components: {
			appTable,
		},
		props: {
			columns: {
				default: () => [],
				type: Array,
			},
			details: {
				default: () => [],
				type: Array,
			},
			purchase: {
				default: () => {},
				required: true,
				type: Object,
			},
		},
	};
</script>

<style lang="scss" scoped>
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
</style>