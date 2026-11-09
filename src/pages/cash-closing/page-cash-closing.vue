<template>
	<section>
		<div class="overflow-auto">
			<app-table
				name="cash-closing"
				class="is-not-selectable"
				:current-page="table.params.page"
				:columns="columns"
				:input-search="false"
				:last-page="table.lastPage"
				:rows="table.rows"
				@on-page="onPage"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">{{ props.row.employee.name }} {{ props.row.employee.lastname }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.closedAt | formatDate('DD-MM-YYYY HH:mm:ss') }}</td>
					<td>
						<app-tooltip-button
							color="blue"
							icon="money"
							text="Ver Ventas"
							@click-icon="openSales(props.row)"
						>
						</app-tooltip-button>
					</td>
				</template>
			</app-table>
		</div>
	</section>
</template>

<script>

import format from 'date-fns/format';
import appTable from '@/components/shared/table/app-table';

function data() {
	return {
		columns: [
			{ id: 1, name: 'Empleado', value: 'employee.name', visible: true, checked: true },
			{ id: 2, name: 'Fecha de Cierre', value: 'closedAt', visible: true, checked: true },
			{ id: 3, name: 'Acciones', visible: true, checked: true, flagVisible: true },
		],
	};
}

async function fetchData(url) {
	const { data: records, headers } = await this.$httpSales.get(url, { params: this.table.params });
	this.table.rows = records;
	this.table.lastPage = Number(headers['x-last-page']);
	return { data, headers };
}

function created() {
	this.fetchData('cash-closing');
}

function onPage(page) {
	this.table.params.page = page;
	this.fetchData('cash-closing');
}

function openSales({ id, closedAt }) {
	const withFormatDate = format(closedAt, 'DD-MM-YYYY HH:mm:ss');
	this.goTo('list-of-sales', {
		query: { cashDeskClosingId: id, closedAt: withFormatDate },
	});
}

export default {
	name: 'page-cash-closing',
	created,
	components: {
		appTable,
	},
	data,
	methods: {
		fetchData,
		onPage,
		openSales,
	},
};
</script>
