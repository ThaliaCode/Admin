<template>
	<v-layout row wrap class="customers-report-list">
		<v-flex xs12 px-4 pb-3>
			<v-layout row wrap align-center>
				<v-flex xs11>
					<h3 class="customers-report-list-title primary--text">
						Reporte <span class="text-underline">de Clientes</span>
					</h3>
				</v-flex>
				<v-flex xs1 pr-3 text-xs-right>
					<v-btn
					@click="$emit('download-excel-customer')"
					class="btn-auto btn-excel-graphics ma-0">
						<img src="/static/img/excel.svg" alt="download" height="18">
					</v-btn>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12>
			<app-table
				name="customers-report-list"
				:columns="columns"
				:input-search="false"
				:rows="customers"
				class="is-not-selectable"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">
						{{ props.row.fullName }}
					</td>
					<td v-show="showRow(columns, 2)">{{ props.row.phone }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.salesAmount | round }}</td>
					<td v-show="showRow(columns, 4)">
						<app-tooltip-button
							class="mr-2"
							text="Iniciar conversación"
							img="/static/img/whatsapp.svg"
							height="18"
							@click-icon="$emit('click-icon', props.row)"
						/>
					</td>
				</template>
			</app-table>
		</v-flex>
	</v-layout>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';

	export default {
		name: 'customers-report-list',
		components: {
			appTable,
		},
		props: {
			columns: {
				default: () => [],
				type: Array,
			},
			customers: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.customers-report-list {
		&-title {
			font-family: font(open-semibold);
			font-size: size(medium18);
		}
	}

	.text-underline {
		text-decoration: underline;
	}

	.btn-excel-graphics {
		background-color: color(background-excel) !important;
		border-radius: 5px !important;
		height: 30px !important;
		width: 30px !important;
	}
</style>