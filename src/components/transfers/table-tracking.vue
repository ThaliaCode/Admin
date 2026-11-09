<template>
	<div>
		<v-layout row>
			<v-flex>
				<table class="table-tracking-small">
					<thead>
						<tr rowspan="2" class="head-small-table" :style="`height: ${height}px;`">
							<th>Código</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in details" :key="item.id">
							<td>{{item.product.code}}</td>
						</tr>
					</tbody>
					<tfoot>
						<tr class="table-footer">
							<th></th>
						</tr>
					</tfoot>
				</table>
			</v-flex>
			<v-flex v-if="isCreate">
				<table class="table-tracking">
					<thead class="tracking-head">
						<tr>
							<th colspan="3" class="py-10">{{employees.createdUserName}}/{{employees.createdAt}}</th>
						</tr>
					</thead>
					<tbody>
						<tr class="t-body-head">
							<td class="title-body">
								<p>{{warehouses.origin}}<br/>Stock Origen</p>
							</td>
							<td class="title-body">
								<p>{{warehouses.destination}}<br/>Stock Destino</p>
							</td>
							<td class="title-body">
								<p>Cant. Solicitada</p>
							</td>
						</tr>
						<tr v-for="item in details" :key="item.id">
							<td>{{ item.createdStockOrigin}}</td>
							<td>{{ item.createdStockSource}}</td>
							<td>{{ item.quantity }}</td>
						</tr>
					</tbody>
					<tfoot>
						<tr class="table-footer">
							<th>Total {{ total.totalCreatedStockOrigin }}</th>
							<th>Total {{ total.totalCreatedStockSource}}</th>
							<th>Total {{ total.totalCreatedRequestedAmount }}</th>
						</tr>
					</tfoot>
				</table>
			</v-flex>
			<v-flex>
				<table class="table-tracking">
					<thead class="tracking-head">
						<tr>
							<th colspan="3" class="py-10">{{employees.clearanceUserName}}/{{employees.clearanceDate}}</th>
						</tr>
					</thead>
					<tbody>
						<tr class="t-body-head">
							<td class="title-body">
								<p>{{warehouses.origin}}<br/>Stock Origen</p>
							</td>
							<td class="title-body">
								<p>{{warehouses.destination}}<br/>Stock Destino</p>
							</td>
							<td class="title-body">
								<p>Cant. Enviada</p>
							</td>
						</tr>
						<tr v-for="item in details" :key="item.id">
							<td>{{item.clearanceStockOrigin}}</td>
							<td>{{item.clearanceStockSource}}</td>
							<td>{{item.clearanceAmountSent}}</td>
						</tr>
					</tbody>
					<tfoot>
						<tr class="table-footer">
							<th>Total {{total.totalClearenceStockOrigin}}</th>
							<th>Total {{total.totalClearenceStockSource}}</th>
							<th>Total {{total.totalClearenceAmountSent}}</th>
						</tr>
					</tfoot>
				</table>
			</v-flex>	
			<v-flex>
				<table class="table-tracking">
					<thead class="tracking-head">
						<tr>
							<th colspan="4" class="py-10">{{employees.deliveryUserName}}/{{employees.deliveryDate}}</th>
						</tr>
					</thead>
					<tbody>
						<tr class="t-body-head">
							<td class="title-body">
								<p>{{warehouses.origin}}<br/>Stock Origen</p>
							</td>
							<td class="title-body">
								<p>{{warehouses.destination}}<br/>Stock Destino</p>
							</td>
							<td class="title-body">
								<p>Cant. Recibida</p>
							</td>
							<td class="title-body">
								<p>Rechazados</p>
							</td>
						</tr>
						<tr v-for="item in details" :key="item.id">
							<td>{{item.deliveryStockOrigin}}</td>
							<td>{{item.deliveryStockSource}}</td>
							<td>{{item.delivery}}</td>
							<td>{{item.devolution}}</td>
						</tr>
					</tbody>
					<tfoot>
						<tr class="table-footer">
							<th>Total {{total.totalDeliveryStockOrigin}}</th>
							<th>Total {{total.totalDeliveryStockSource}}</th>
							<th>Total {{total.totalDelivery}}</th>
							<th>Total {{total.totalDevolution}}</th>
						</tr>
					</tfoot>
				</table>
			</v-flex>
		</v-layout>
	</div>
</template>
<script>

function data() {
	return {
		isCreate: false,
		height: 0,
	};
}

function created() {
	this.isCreate = this.type !== 'MPA';
}

function mounted() {
	const heightOne = document.getElementsByClassName('tracking-head')[0].clientHeight;
	const heightTwo = document.getElementsByClassName('t-body-head')[0].clientHeight;
	this.height = (heightOne + heightTwo) - 2;
}

export default {
	name: 'table-tracking',
	data,
	created,
	mounted,
	props: {
		status: [Number, String],
		type: String,
		details: {
			type: Array,
			default: () => [],
		},
		total: {
			type: Object,
			default: () => {},
		},
		employees: {
			type: Object,
			default: () => {},
		},
		warehouses: {
			type: Object,
			default: () => {},
		},
	},
};
</script>
<style lang="scss" scoped>
	.tracking-head {
		background: map-get($colors, blue-transfers);
		color: map-get($colors, white);
	}

	.py-10 {
		padding: 10px 0;
	}

	.t-body-head {
		background: map-get($colors, primary);
		color: map-get($colors, white);
	}

	.title-body {
		padding: 10px 0px;
    text-align: center;
	}

	.table-tracking {
		width: 100%;

		tr:nth-child(even) {
			background: map-get($colors,white);
		}

		tr {
			text-align: center;
		}
	}

	.head-small-table {
		background: map-get($colors, background-sidebar) !important;
		color: map-get($colors, white);
	}

	.table-tracking-small {
		width: 100%;

		tr:nth-child(odd) {
			background: map-get($colors,white);
		}

		tr {
			text-align: center;
		}
	}

	.table-footer {
		background: map-get($colors, summary) !important;
		height: 48px;
	}
</style>


