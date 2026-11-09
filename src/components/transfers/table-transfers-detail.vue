<template>
  <div>
		<table>
			<tr>
				<td class="col-1" rowspan="2">Código</td>
				<td v-for="(item, index) in rows" :key="index" :colspan="item.rowspan" class="col-2"><span class="text-bold">{{item.name}}</span><span class="text-ligth">/{{item.date}}</span></td>
			</tr>
			<tr>
				<td class="td-transfers" v-for="(item, index) in headers" :key="index"> 
					<p class="title-td">{{item.title}}</p>
					{{item.name}}
				</td>	
			</tr>
			<tr v-for="(row, index) in rowsDetail" :key="index">
				<td>{{row.id}}</td>
				<td>{{row.code}}</td>
				<td>{{row.destination}}</td>
				<td>{{row.quantiyAmount}}</td>
				<td>{{row.employeeInit}}</td>
				<td>{{row.destinationInit}}</td>
				<td>{{row.quantity}}</td>
				<td>{{row.stockFin}}</td>
				<td>{{row.destinationFin}}</td>
				<td>{{row.quantityReceived}}</td>
				<td>{{row.rejected}}</td>
			</tr>
			<tr class="background-end">
				<td></td>
				<td class="total-transfers">Total: 12</td>
				<td class="total-transfers">Total: 12</td>
				<td class="total-transfers">Total: 12</td>
				<td class="total-transfers">Total: 12</td>
				<td class="total-transfers">Total: 12</td>
				<td class="total-transfers">Total: 12</td>
				<td class="total-transfers">Total: 12</td>
				<td class="total-transfers">Total: 12</td>
				<td class="total-transfers">Total: 12</td>
				<td class="total-transfers">Total: 1</td>
			</tr>
		</table>
	</div>  
</template>

<script>
function data() {
	return {
		rows: [
			{
				rowspan: 3,
				name: 'Marcelo',
				date: '25-06-09',
			},
			{
				rowspan: 3,
				name: 'Luis',
				date: '23-12-10',
			},
			{
				rowspan: 4,
				name: 'Keila',
				date: '12-12-12',
			},
		],
		headers: [
			{
				id: 1,
				title: 'XAB',
				name: 'Stock Origen',
				value: 12,
			},
			{
				id: 2,
				title: 'ABC',
				name: 'Stock Destino',
				value: 12,
			},
			{
				id: 3,
				title: 'Cant. Solicitada',
				value: 22,
			},
			{
				id: 4,
				title: 'DCF',
				name: 'Stock Origen',
				value: 34,
			},
			{
				id: 5,
				title: 'BCD',
				name: 'Stock Destino',
				value: 45,
			},
			{
				id: 6,
				title: 'Cant. Enviada',
				value: 66,
			},
			{
				id: 7,
				title: 'HOK',
				name: 'Stock Origen',
				value: 77,
			},
			{
				id: 8,
				title: 'BCV',
				name: 'Stock Destino',
				value: 88,
			},
			{
				id: 9,
				title: '',
				name: 'Cant. recibida',
			},
			{
				id: 10,
				title: 'Rechazados',
				value: 33,
			},
		],
		rowsDetail: [
			{
				id: 1,
				code: '213',
				stock: 12,
				destination: 12,
				quantiyAmount: 33,
				employeeInit: 12,
				destinationInit: 23,
				quantity: 12,
				stockFin: 45,
				destinationFin: 6,
				quantityReceived: 11,
				rejected: 0,
			},
			{
				id: 2,
				code: '213',
				stock: 12,
				destination: 12,
				quantiyAmount: 33,
				employeeInit: 12,
				destinationInit: 23,
				quantity: 12,
				stockFin: 45,
				destinationFin: 6,
				quantityReceived: 11,
				rejected: 0,
			},
		],
	};
}

export default {
	name: 'table-transfers-detail',
	data,
};
</script>

<style lang="scss" scoped>
.col-1 {
	background-color: map-get($colors, background-sidebar);
	color: map-get($colors, white);
	font-family: map-get($fonts, open-semibold);
	font-size: 13px;
}

tr:nth-child(even) {
  background-color: map-get($colors, background-sidebar);
}

.col-2 {
	background-color: map-get($colors, blue-transfers);
}

table, tbody, tr {
	background-color: map-get($colors, white);
	border-collapse: collapse;
	width: 100%;
}

td, th {
	border: 1px solid map-get($colors, background-table);
	padding: 10px;
	text-align: center;
}

td {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, open-semibold);
	font-size: 14px;
}

.text-bold {
	color: map-get($colors, white);
	font-family: map-get($fonts, open-bold);
	font-size: map-get($sizes, small13);
}

.text-ligth {
	color: map-get($colors, white);
	font-family: map-get($fonts, open-regular);
	font-size: map-get($sizes, small13);
	margin-left: 3px;
}

.td-transfers {
	background-color: map-get($colors, primary);
	border-right: 1px solid map-get($colors, white);
	color: map-get($colors, white);
}

.background-end {
	background-color: map-get($colors, summary);
	color: map-get($colors, black);
	font-family: map-get($fonts, open-bold);
	font-size: 12px;
	padding-left: 115px;
}

.title-td {
	margin: 17px 0 0 0;
}

.total-transfers {
	color:map-get($colors, black);
	font-family: map-get($fonts, open-bold);
	font-size: map-get($sizes, small);
}
</style>
