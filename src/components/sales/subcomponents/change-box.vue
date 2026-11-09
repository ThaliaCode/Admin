<template>
	<app-table
		class="mt-5"
		name="change-box"
		:columns="columns"
		:current-page="currentPage"
		:rows="cashs"
		:last-page="lastPage"
		@on-page="$emit('on-page')"
		@on-search-event="searchCash"
	>
		<template slot="rows" slot-scope="props">
			<td v-show="showRow(columns, 1)" class="is-not-selectable w-40">
				{{ props.row.name }}
			</td>
			<td v-show="showRow(columns, 2)">
				{{ countryCurrencySymbol }} {{ props.row.balance[$userInfo.company.currency] }}
			</td>
			<td v-show="showRow(columns, 3)">
				<document-state
					:color="props.row.terminalId ? 'error' : 'primary'"
					:tooltip="
						props.row.terminalId && props.row.cashTerminal
							? `La caja ${props.row.name} esta relacionada a la terminal ${props.row.cashTerminal.name}`
							: 'No se encuentra relacionada la caja'
					"
				/>
			</td>
			<td v-show="showRow(columns, 4)">
				<button
					:disabled="props.row.terminalId"
					class="btn-select"
					@click="selectBox(props.row)"
				>
					Seleccionar
				</button>
			</td>
		</template>
	</app-table>
</template>
<script>
import appTable from '@/components/shared/table/app-table';
import documentState from '@/components/shared/document-state';

async function created() {
	this.loadData();
}

function selectBox(item) {
	this.$emit('close', item);
}

function searchCash(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.loadData();
}

async function loadData() {
	const params = { ...this.params };
	const { data: response } = await this.$httpSales.get('cash', { params });
	this.cashs = response;
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Nombre', value: 'name', visible: true },
			{ id: 2, name: 'Saldo', value: 'balance', visible: true },
			{ id: 3, name: 'Status', value: 'status', visible: true },
			{ id: 4, name: '', value: 'action', visible: true },
		],
		currentPage: 1,
		lastPage: 0,
		cashs: [],
		params: {
			flagActive: 1,
		},
	};
}
export default {
	name: 'change-box',
	components: {
		appTable,
		documentState,
	},
	created,
	data,
	methods: {
		selectBox,
		searchCash,
		loadData,
	},
};
</script>
<style lang="scss" scoped>
.btn-select {
	background: map-get($colors, success);
	border-radius: 5px;
	color: map-get($colors, white);
	font-size: 10px;
	padding: 5px;
}

.w-40 {
	width: 40%;
}
</style>
