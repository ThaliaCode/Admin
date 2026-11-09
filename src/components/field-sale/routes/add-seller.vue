<template>
	<div class="px-2 mt-3">
		<div class="mt-3">
			<app-table
				class="no-main-list"
				:check-all="checkAll"
				:columns="columns"
				:filter-columns="false"
				:include-filter="false"
				:rows="rows"
				:main-list="false"
				selectable
				@on-page="loadEmployees"
				@on-search-event="onSearch"
				@on-selected-all="selectedAll"
				@row-is-selected="rowIsSelected"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.documentNumber }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.fullname }}</td>
				</template>
			</app-table>
		</div>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabledAssign"
				success-text="Asignar"
				@accept-button-clicked="$emit('save-modal', dataSelected)"
				@cancel-button-clicked="$emit('close-modal')"
			/>
		</section>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.loadEmployees();
}

async function loadEmployees(page = 1) {
	this.currentPage = page;
	this.params.page = this.currentPage;
	const params = { ...this.params };
	try {
		const { data: rows, headers } = await this.$httpSales.get('sellers', { params });
		this.rows = rows;
		this.lastPage = Number(headers['x-last-page']);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function selectedAll(value) {
	({ products: this.rows, productsSelected: this.dataSelected, checkAll: this.checkAll }
	= this.selecteAll(value, this.rows, this.dataSelected));
}

function rowIsSelected(row) {
	({ products: this.rows, productsSelected: this.dataSelected, checkAll: this.checkAll }
	= this.selectedRows(row, this.rows, this.dataSelected, true));
}

function disabledAssign() {
	return !this.dataSelected.length > 0 || this.loading;
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : null;
	this.params.search = searchTrim;
	this.loadEmployees();
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Número de documento', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Nombre y Apellido', value: 'fullname', visible: true, checked: true },
		],
		checkAll: false,
		currentPage: 1,
		dataSelected: [],
		lastPage: 0,
		rows: [],
		params: {
			limit: 20,
			page: 1,
			search: null,
			typeSeller: 2,
		},
	};
}

export default {
	name: 'add-seller',
	created,
	data,
	components: {
		appTable,
		modalSidebarButton,
	},
	computed: {
		disabledAssign,
	},
	methods: {
		loadEmployees,
		onSearch,
		rowIsSelected,
		selectedAll,
	},
	props: {
		customers: {
			default: () => [],
			type: Array,
		},
		loading: {
			default: false,
			type: Boolean,
		},
	},
};
</script>