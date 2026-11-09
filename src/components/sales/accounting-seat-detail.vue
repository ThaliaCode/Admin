<template>
	<div class="detail-in-table pr-0'">
		<v-layout wrap align-center primary py-3 px-4>
			<v-flex xs6>
				<span class="title white--text">
					{{ detail.document }}
				</span>
			</v-flex>
			<v-flex xs6 text-xs-right pl-4>
				<button @click="$emit('close')" class="border-l pl-2">
					<v-icon color="white">clear</v-icon>
				</button>
			</v-flex>
		</v-layout>
		<div class="min-height white">
			<v-layout wrap px-4 py-2>
				<v-flex xs6 mb-3 body-1 pr-1>
					<v-layout>
						<v-flex xs4 class="content-green">Fecha</v-flex>
						<v-flex xs8 class="c-text-green">{{
							detail.date | exactDate
						}}</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs6 mb-3 body-1 pl-1>
					<v-layout>
						<v-flex xs4 class="content-green">Asiento</v-flex>
						<v-flex xs8 class="c-text-green">{{ detail.code }}</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 mb-3 body-1>
					<div class="content-green">Detalle</div>
					<div class="c-text-green">{{ detail.gloss }}</div>
				</v-flex>
				<v-flex xs12 mb-0 mt-1 body-1 v-if="detail.details.length">
					<app-table
						class="is-not-selectable no-main-list mb-0"
						padding="px-0"
						name="account-seat-detail"
						:main-list="false"
						:columns="columns"
						:input-search="false"
						:rows="detail.details"
						:filter-columns="false"
					>
						<template slot="rows" slot-scope="props">
							<td v-show="showRow(columns, 1)" class="is-not-selectable">
								{{ props.row.code }}
							</td>
							<td v-show="showRow(columns, 2)">{{ props.row.account }}</td>
							<td v-show="showRow(columns, 3)">
								{{ props.row.reference }}
							</td>
							<td v-show="showRow(columns, 4)">{{ props.row.concept }}</td>
							<td v-show="showRow(columns, 5)" class="text-blue bold">
								{{ props.row.amountDebe }}
							</td>
							<td v-show="showRow(columns, 6)" class="text-red bold">
								{{ props.row.amountHaber }}
							</td>
							<td v-show="showRow(columns, 7)" :class="getColorText(props.row)">
								{{
									props.row.type === 1
										? props.row.amountDebe
										: props.row.amountHaber
								}}
							</td>
						</template>
					</app-table>
				</v-flex>
				<v-layout justify-end>
					<v-flex xs2 py-1 class="blue-debe" text-xs-center>
						Debe: {{ detail.currency }}{{ detail.totalDebe | round }}
					</v-flex>
					<v-flex xs2 ml-1 py-1 class="red-haber" text-xs-center>
						Haber: {{ detail.currency }}{{ detail.totalHaber | round }}
					</v-flex>
					<v-flex xs2 ml-1 py-1 class="green-saldo" text-xs-center>
						Saldo: {{ detail.currency
						}}{{ (detail.totalDebe - detail.totalHaber) | round }}
					</v-flex>
				</v-layout>
			</v-layout>
		</div>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';

function getColorText({ type }) {
	return type === 1 ? 'text-blue' : 'text-red';
}

function data() {
	return {
		columns: [
			{
				id: 1,
				name: 'Cod. Cta',
				value: 'code',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Cta.Contable',
				value: 'account',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Referencia',
				value: 'reference',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Cto. de Movimiento',
				value: 'concept',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Debe',
				value: 'debe',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Haber',
				value: 'haber',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Centr.Costo',
				value: 'amount',
				visible: true,
				checked: true,
			},
		],
	};
}
export default {
	data,
	name: 'ecommerce-details-in-table',
	components: {
		appTable,
	},
	methods: {
		getColorText,
	},
	props: {
		detail: {
			default: () => {},
			type: Object,
		},
	},
};
</script>

<style lang="scss" scoped>
.min-height {
	min-height: calc(100vh - 450px);
	position: relative;
}

.bottom {
	bottom: 10%;
	left: 0;
	position: absolute;
	right: 0;
}

.detail-in-table {
	position: sticky;
	top: 100px;
}

.block {
	display: block;
}

.title-details-table {
	color: map-get($colors, blue-card);
	font-family: map-get($fonts, open-bold);
}

.total-order {
	font-family: font(open-bold);
	font-size: map-get($sizes, medium20);
}

.gray-detail-table {
	color: map-get($colors, paginationText);
}

.content-details-table {
	display: flex;
	justify-content: space-between;
	width: 80%;
}

.detail-close-button {
	background-color: transparent;
	margin-right: 15px;
	position: absolute;
	right: 0;
	top: 0;
}

.content-green {
	background: map-get($colors, title-green);
	color: map-get($colors, background-sidebar);
	font-weight: 700;
	padding: 4px 12px;
}

.c-text-green {
	background: map-get($colors, text-green);
	color: map-get($colors, paginationText);
	padding: 4px 12px;
}

.border-l {
	border-left: 1px solid map-get($colors, white);
}

.bold {
	font-family: font(open-bold);
}

.text-blue {
	color: map-get($colors, table-header);
}

.text-red {
	color: map-get($colors, error);
}

.red-haber {
	border: 1px solid #ff0900;
	color: #ff0900;
	font-size: 10px;
	font-weight: 900;
}

.blue-debe {
	border: 1px solid #006edb;
	color: #006edb;
	font-size: 10px;
	font-weight: 900;
}

.green-saldo {
	background-color: rgba(2, 151, 155, 0.11);
	color: color(primary);
	font-size: 10px;
	font-weight: 900;
}
</style>
