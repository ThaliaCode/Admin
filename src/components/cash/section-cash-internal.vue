<template>
	<div>
		<v-layout align-center wrap pt-2 px-4 class="section-box" mt-4>
			<v-flex xs6>
				<v-layout>
					<v-flex class="text-align-center">
						<v-layout>
							<v-flex xs6 class="label-legend l-green">
								<span
									>Ingresos <br />
									{{ allTotals.totalEntry }}</span
								>
							</v-flex>
							<v-flex xs6 class="label-legend l-red">
								<span>
									Egresos
									<br />
									{{ Math.abs(allTotals.totalEgress) }}</span
								>
							</v-flex>
						</v-layout>
						<v-layout>
							<v-flex xs6 class="label-legend l-balance">
								<span
									>Saldo Anterior <br />
									{{ allTotals.totalLast }}</span
								>
							</v-flex>
							<v-flex xs6 class="label-legend l-employee">
								<span
									>Ingresos otros empleados <br />
									{{ allTotals.totalOtherEmpleyees }}</span
								>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
				<v-layout>
					<v-flex>
						<vue-chart
							type="pie"
							:data="barData"
							class="graphic-container"
							:options="options"
						></vue-chart>
					</v-flex>
				</v-layout>
				<v-layout justify-space-around>
					<v-flex xs6 class="center" v-if="showRefresh">
						<button
							class="btn-border btn-border-green"
							@click="$emit('open-entry', 'ingreso')"
						>
							Nuevo ingreso
						</button>
					</v-flex>
					<v-flex xs6 class="center" v-if="showRefresh && !flagHideCashOutflow">
						<button
							class="btn-border btn-border-red"
							@click="$emit('open-egress', 'egreso')"
						>
							Nuevo egreso
						</button>
					</v-flex>
				</v-layout>
			</v-flex>

			<!-- <div>
				<v-flex xs6 class="center" v-if="showRefresh">
					<button class="btn-border btn-border-red" @click="$emit('open-egress', 'egreso')">
						Agregar
					</button>
				</v-flex>
				<v-flex xs6 class="center" v-if="showRefresh">
					<button class="btn-border btn-border-green" @click="$emit('open-entry', 'ingreso')">
						Agregar
					</button>
				</v-flex>
			</div> -->
			<!-- caja -->
			<v-flex xs6 class="result-items" pb-3 pl-4>
				<section>
					<v-layout justify-space-between align-center mb-2 class="border-green">
						<v-flex xs12>
							<v-layout px-3 align-center class="border-bottom-green">
								<v-flex class="pd semi-bold title-box">Caja</v-flex>
								<v-flex text-xs-right>
									<button class="btn-transaction" @click="goDetail('box')">
										Ver todas las Transacciones
										<v-icon class="icon-transaction">open_in_new</v-icon>
									</button>
								</v-flex>
							</v-layout>
							<v-layout
								class="pd"
								row
								wrap
								align-center
								v-for="(item, index) in transactionBox"
								:key="index"
								:class="[index % 2 === 0 ? 'b-even-list' : 'b-odd-list']"
							>
								<v-flex d-flex align-center pl-2>
									{{ item.name }}
								</v-flex>
								<v-flex d-flex align-center pl-2 class="column-value1">
									{{ item.amount | round }}
								</v-flex>
							</v-layout>
							<v-layout px-3 align-center class="border-top-green">
								<v-flex class="pd semi-bold title-box">Total</v-flex>
								<v-flex class="pd title-box" text-xs-right
									>{{ currencySymbol }} {{ allTotals.totalCash | round }}</v-flex
								>
							</v-layout>
						</v-flex>
					</v-layout>
					<v-layout
						justify-space-between
						align-center
						mb-2
						class="border-green border-bottom-green"
					>
						<v-flex>
							<v-layout px-3 align-center class="border-bottom-green">
								<v-flex class="pd semi-bold title-box">Banco</v-flex>
								<v-flex text-xs-right>
									<!-- <button class="btn-transaction" @click="goDetail('bank')">Ver todas las Transacciones</button> -->
									<button class="btn-transaction" @click="goDetail('bank')">
										Ver todas las Transacciones
										<v-icon class="icon-transaction">open_in_new</v-icon>
									</button>
								</v-flex>
								<!-- transactionBank  -->
							</v-layout>
							<v-layout
								class="pd"
								row
								wrap
								align-center
								v-for="(item, index) in transactionBank"
								:key="index"
								:class="[index % 2 === 0 ? 'b-even-list' : 'b-odd-list']"
							>
								<v-flex d-flex align-center pl-2 class="b-grace2">
									{{ item.name }}
								</v-flex>
								<v-flex d-flex align-center pl-2 class="column-value1">
									{{ item.amount | round }}
								</v-flex>
							</v-layout>
							<v-layout px-3 align-center class="border-top-green">
								<v-flex class="pd semi-bold title-box">Total</v-flex>
								<v-flex text-xs-right
									>{{ currencySymbol }} {{ allTotals.totalBank | round }}</v-flex
								>
							</v-layout>
						</v-flex>
					</v-layout>
				</section>
				<!-- <v-layout py-1 px-3 mt-3 row justify-space-between xs12 class="border-green-light">
					<v-flex class="">Ingresos</v-flex>
					<v-flex class="semi-bold" text-xs-right>Total: <span>{{ currencySymbol }} {{
						totalEntry | round }}</span></v-flex>
				</v-layout> -->
				<v-layout
					py-1
					px-3
					mt-3
					row
					justify-space-between
					xs12
					class="border-green-light"
				>
					<v-flex class="">Saldo Anterior</v-flex>
					<v-flex class="semi-bold" text-xs-right
						>Total:
						<span>{{ currencySymbol }} {{ allTotals.totalLast | round }}</span></v-flex
					>
				</v-layout>
				<!-- <v-layout py-1 px-3 mt-3 row justify-space-between xs12 class="border-red-light">
					<v-flex class="">Egresos</v-flex>
					<v-flex class="semi-bold" text-xs-right>Total: <span>{{ currencySymbol }} {{
						totalEgress | round }}</span></v-flex>
				</v-layout> -->
				<v-layout row wrap class="total-item bold-text b-grace2" mt-3>
					<v-flex xs6 align-center>Total</v-flex>
					<v-flex xs6 align-center text-xs-right
						>{{ currencySymbol }} {{ totalCashGeneral | round }}</v-flex
					>
				</v-layout>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
import VueChart from 'vuechart';

function dataGraphic(value) {
	this.barData = value;
}

function goDetail(type) {
	const query = {
		currency: this.currency,
		type: type === 'egress' ? 'box' : type,
		cashName: this.cashName,
		cashId: this.cashId,
		subsidiaryId: this.subsidiaryId,
		cashDeskClosingId: this.cashClosing,
		typeMovement: type === 'egress' ? 2 : null,
	};
	const routeData = this.$router.resolve({
		name: 'box-detail',
		params: { id: this.cashId },
		query,
	});
	window.open(routeData.href, '_blank');
}

function clickGraphic(context, value, item) {
	/* eslint-disable dot-notation  */
	const flag = item[0]['_model'].label;
	if (flag === 'Ingresos' || flag === 'Egresos') {
		context.goDetail(context, flag);
	}
}

function data() {
	return {
		barData: {
			datasets: [
				{
					data: [],
					backgroundColor: [],
				},
			],
			labels: [],
		},
		flagHideCashOutflow:
			this.$userInfo &&
			this.$userInfo.additionalInformation &&
			this.$userInfo.additionalInformation.flagHideCashOutflow,
		options: {
			legend: {
				display: false,
			},
			// onClick: (value, item) => this.clickGraphic(this, value, item),
		},
	};
}

export default {
	name: 'section-cash-internal',
	data,
	components: {
		[VueChart.name]: VueChart,
	},
	watch: {
		dataGraphic,
	},
	props: {
		cashBoxesAll: {
			default: () => [],
			type: Array,
		},
		cashBoxes: {
			default: () => [],
			type: Array,
		},
		dataGraphic: {
			default: () => {},
			type: Object,
		},
		transactionBox: {
			default: () => [],
			type: Array,
		},
		transactionBank: {
			default: () => [],
			type: Array,
		},
		transactionOut: {
			default: () => [],
			type: Array,
		},
		transactionBankExpense: {
			default: () => [],
			type: Array,
		},
		totalEntry: [String, Number],
		totalEgress: [String, Number],
		transactionBankExpenseTotal: [String, Number],
		currencySymbol: [String, Number],
		totalCash: [String, Number],
		totalBank: [String, Number],
		cashId: [String, Number],
		cashName: [String, Number],
		subsidiaryId: [String, Number],
		currency: [String, Number],
		totalLast: [String, Number],
		totalEntryEmployee: [String, Number],
		cashClosing: [String, Number],
		totalCashGeneral: [String, Number],
		totalOutCash: [String, Number],
		showRefresh: {
			type: Boolean,
			default: true,
		},
		allTotals: {
			type: Object,
			default: () => ({}),
		},
	},
	methods: {
		clickGraphic,
		goDetail,
	},
};
</script>

<style lang="scss" scoped>
.title-box {
	font-weight: bolder;
	color: #000000;
}
.max-with {
	max-width: 30px;
}
.pd {
	padding: 8px 0;
}
.b-radius {
	border-radius: 50%;
}
.border-green {
	overflow: hidden;
	border-radius: 5px;
	border: 1px solidcolor(primary);
}

.border-top-green {
	border-top: 1px solidcolor(primary);
}
.border-bottom-green {
	border-bottom: 1px solidcolor(primary);
}
.b-even-list {
	background-color: #f5f5f5;
}

.b-odd-list {
	background-color: #ffffff;
}

.b-grace {
	background-color: #f5f5f5;
}

.section-box {
	background: map-get($colors, rgb(255, 255, 255));
	border-radius: 27px;
	box-shadow: 0 2px 11px 0 rgba(0, 0, 0, 0.09);
	height: 700px;
	margin-bottom: 80px;
	overflow-y: scroll;
}

.btn-border-red {
	padding: 1px 5px;
	font-size: 12px;
	border-radius: 21px;
	border: 1px solid #ee5454;
	color: #ee5454;
}
.btn-border-green {
	padding: 1px 5px;
	font-size: 12px;
	border-radius: 21px;
	border: 1px solid color(primary);
	color: color(primary);
}
.btn-border {
	padding: 5px 10px;
	font-size: 1rem;
	border-radius: 8px;
}
.btn-more {
	border-radius: 5px;
	height: 24px;
	width: 24px;
}

.wrapper-legend {
	// display: flex;
	// flex-direction: column;
	// align-items: flex-start;
}

.l-red {
	color: map-get($colors, notifications);
	&::before {
		background-color: map-get($colors, notifications);
	}
}

.l-green {
	color: color(primary);
	&::before {
		background-color: color(primary);
	}
}

$icon-size: 12px; // Tamaño fijo de 24 píxeles

.label-legend {
	font-size: 0.9rem;
	text-align: center;
	padding: 5px 15px;
	&::before {
		content: '';
		display: inline-block;
		width: $icon-size;
		height: $icon-size;
		border-radius: 50%; // Hacer que el icono sea una bola
		// background-color: rgb(233, 0, 0); // Color de la bola
		margin-right: 5px;
	}
}

.legend {
	display: inline-block;
	height: 20px;
	width: 20px;
}

.b-green {
	background: color(primary);
}
.b-red {
	background: map-get($colors, notifications);
}

.b-employee {
	background-color: #ffb74c;
}

.l-employee {
	color: #ffb74c;
	&::before {
		background-color: #ffb74c;
	}
}

.center {
	text-align: center;
}

.result-items {
	overflow-y: hidden;
}

.border-green {
	border: 1px solid color(primary);
	border-radius: 5px;
	color: color(primary);
	font-family: map-get($fonts, open-bold);
	font-size: 14px;
}

.border-green-light {
	color: #000000;
	border: 1px solid color(primary);
	border-radius: 5px;
	font-family: map-get($fonts, open-bold);
	font-size: 14px;
}

.border-yellow {
	border: 1px solid #ffb74c;
	border-radius: 5px;
	color: #ffb74c;
	font-family: map-get($fonts, open-bold);
	font-size: 14px;
}

.border-yellow-light {
	color: #000000;
	border: 1px solid #ffb74c;
	border-radius: 5px;
	font-family: map-get($fonts, open-bold);
	font-size: 14px;
}

.border-red {
	border: 1px solid;
	border-radius: 5px;
	color: map-get($colors, notifications);
	font-family: map-get($fonts, open-bold);
	font-size: 14px;
}

.border-red-light {
	color: #000000;
	border: 1px solid map-get($colors, notifications);
	border-radius: 5px;
	font-family: map-get($fonts, open-bold);
	font-size: 14px;
}

.semi-bold {
	font-family: map-get($fonts, open-semibold);
}

.border-red {
	border: 1px solid #d5331a;
	color: #d5331a;
	border-radius: 5px;
	font-size: 14px;
	font-family: map-get($fonts, open-bold);
}

.border-yellow {
	border: 1px solid #ffb74c;
	color: #ffb74c;
	border-radius: 5px;
	font-size: 14px;
	font-family: map-get($fonts, open-bold);
}

.btn-transaction {
	color: color(primary);
	font-family: 'Opens_semibold';
	font-size: 13px;
	text-decoration: underline;
	padding: 7px 5px 9px 7px;

	.icon-transaction {
		color: color(primary);
		// text-decoration: underline;
		font-size: 16px;
	}
}
.content-in {
	background-color: color(sidebar);
	border-radius: 3px;
	color: #ffffff;
	font-family: map-get($fonts, open-bold);
	font-size: 12px;
	padding: 4px;
}
.l-balance {
	color: #68e7aa;
	&::before {
		background-color: #68e7aa;
	}
}
.b-balance {
	background-color: #68e7aa;
}
.line-dashboard {
	border: 0.3px solid #e0f3f3;
}
.content-in-banck {
	background-color: color(primary);
	border-radius: 3px;
	color: #ffffff;
	font-family: map-get($fonts, open-bold);
	font-size: 12px;
	padding: 4px;
}
.content-in-red {
	background-color: #d5331a;
	border-radius: 3px;
	color: #ffffff;
	font-family: map-get($fonts, open-bold);
	font-size: 12px;
	padding: 4px;
}

.total-item {
	background-color: #f5f5f5;
	border-radius: 5px;
	padding: 6px 16px 5px 17px;
}

.bold-text {
	font-weight: bold;
}
.column-value1 {
	justify-content: flex-end;
	padding-right: 16px;
	font-size: 12px;
	font-family: 'Opens_regular';
	color: #000000;
}
.contend-items {
	background-color: #ffb74c;
}
</style>
