<template>
	<section>
		<app-table
			class="mt-4"
			:columns="columns"
			:inputSearch="false"
			:rows="rows"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">{{ props.row.serie }}</td>
				<td v-show="showRow(columns, 2)">{{ props.row.number }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.terminal.name }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.typeDocument.name }}</td>
			</template>
		</app-table>
	</section>
</template>

<script>
import appTable from '@/components/shared/table/app-table';

function created() {
	const terminalIndex = this.columns.findIndex(h => h.value === 'terminal');
	this.columns[terminalIndex].name = this.labelTerminal();
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Serie', value: 'serie', visible: true, checked: true },
			{ id: 2, name: 'Número', value: 'number', visible: true, checked: true },
			{ id: 3, name: 'Terminal', value: 'terminal', visible: true, checked: true },
			{ id: 4, name: 'Tipo de Doc.', value: 'typeDocument.name', visible: true, checked: true },
		],
		rows: [],
	};
}

async function loadSeries() {
	const { data: series } = await this.$httpSales.get(`series?subsidiaryId=${this.subsidiaryId}`);
	this.rows = series;
}

export default {
	name: 'subsidiaries-series',
	components: {
		appTable,
	},
	created,
	data,
	props: {
		subsidiaryId: {
			type: Number,
			required: true,
		},
	},
	watch: {
		subsidiaryId: {
			handler: loadSeries,
			immediate: true,
		},
	},
};
</script>
