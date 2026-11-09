<template>
	<div>
		<header-page :title="$route.meta.title" :limit-title="80" />
		<v-flex xs12 px-2>
			<app-table
				:columns="columns"
				:rows="rows"
				:current-page="currentPage"
				:last-page="lastPage"
				class="mt-3"
				@on-page="onPage"
				@on-search-event="onSearch"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable with-name">
						{{ props.row.name }}
					</td>
					<td v-show="showRow(columns, 2)" class="width-150">
						{{ props.row.maxAmount }} - {{ props.row.minAmount }}
					</td>
					<td v-show="showRow(columns, 3)">{{ props.row.groupClient }}</td>
					<td v-show="showRow(columns, 4)" class="width-amount">
						{{ props.row.dateOperation | exactDate('YYYY-MM-DD') }}
					</td>
					<td v-show="showRow(columns, 5)" class="width-amount">
						<span
							mt-2
							v-for="(item, index) in props.row.documentsRelated.router"
							:key="index"
						>
							<a
								:href="`/orders/detail-distribution/${item.id}`"
								target="_blank"
								>{{ item.name }}</a
							><br />
						</span>
						<span>{{ !props.row.documentsRelated.router ? '-' : null }}</span>
					</td>
					<td v-show="showRow(columns, 6)" class="width-170">
						{{ props.row.amountSummary }}
					</td>
					<td v-show="showRow(columns, 7)" class="width-amount">
						{{ props.row.totalError }}
					</td>
					<td v-show="showRow(columns, 8)">
						<span :class="`${props.row.statusName.color}--text`">
							{{ props.row.statusName ? props.row.statusName.name : null }}
							{{ props.row.totalProcessed }} / {{ props.row.totalDocuments }}
						</span>
					</td>
					<td v-show="showRow(columns, 9)">
						<span 
						v-for="(value, key) in props.row.documentsRelated"
						:key="key"
						>
							<span v-if="isFlag(key) && value">
								{{  formatFlagName(key) }}<br />
							</span>
						</span>
					</td>
					<td v-show="showRow(columns, 10)">
						<app-tooltip-button
							icon="remove_red_eye"
							text="Ver Detalle"
							color="primary"
							size="16"
							@click-icon="goToDetail(props.row)"
						/>
					</td>
				</template>
			</app-table>
		</v-flex>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';

function created() {
	this.loadData();
}

async function loadData() {
	this.params.page = this.currentPage;
	try {
		const response = await this.$httpSales.get('sal-order-annex', {
			params: this.params,
		});
		this.rows = response.data.map((file) => {
			const newFile = { ...file };
			const codes = Object.keys(file.summary || {});
			const summaryCode = codes.filter((item) => item !== 'documents');
			newFile.groupClient =
				file.groupClient && typeof file.groupClient === 'object'
					? file.groupClient.name
					: file.groupClient || '-';
			newFile.amountSummary = summaryCode
				.reduce((acum, att) => {
					acum.push(` ${att}: ${file.summary[att]}`);
					return acum;
				}, [])
				.join();
			return newFile;
		});
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (e) {
		this.showGenericError();
	}
}

function goToDetail(row) {
	this.goTo('massive-tecking', { params: { id: row.id } });
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.loadData();
}

function onPage(page) {
	this.currentPage = page;
	this.loadData();
}

function isFlag(key) {
	return key.startsWith('flag');
}

function formatFlagName(key) {
	if (key === 'flagAssignForWarehouse') return 'Conversión de múltiples almacenes';
	if (key === 'flagAutoAssignForWarehouse') return 'Conversión automática de múltiples almacenes';
	if (key === 'flagAutoDocuments') return 'Generar Documentos Automático';
	return '';
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Nombre', value: 'name', visible: true, checked: true },
			{
				id: 2,
				name: 'Monto max - min',
				value: 'name',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Gpo. de Clte.',
				tooltip: 'Grupo de Cliente',
				value: 'name',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Fecha de Op.',
				tooltip: 'Fecha de Operación',
				value: 'name',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Ruta',
				tooltip: 'Nombre de la Ruta',
				value: 'route',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Doc. Gen.',
				tooltip: 'Documentos Generados',
				value: 'name',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Doc. Err.',
				tooltip: 'Documento con Error',
				value: 'name',
				visible: true,
				checked: true,
			},
			{ id: 8, name: 'Estado', value: 'name', visible: true, checked: true },
			{ id: 9, name: 'Conversió masiva', value: 'documentsRelated', visible: true, checked: true },
			{ id: 10, name: 'Acción', value: 'name', visible: true, checked: true },
		],
		currentPage: 1,
		lastPage: 0,
		params: {
			search: null,
			page: 1,
			limit: 15,
		},
		rows: [],
	};
}

export default {
	name: 'page-resumen-documents',
	created,
	components: {
		appTable,
	},
	methods: {
		goToDetail,
		loadData,
		onSearch,
		onPage,
		isFlag,
		formatFlagName,
	},
	data,
};
</script>

<style lang="scss" scoped>
.with-name {
	width: 180px !important;
}

.width-amount {
	width: 100px !important;
}

.width-150 {
	width: 160px !important;
}

.width-170 {
	width: 170px !important;
}
</style>
