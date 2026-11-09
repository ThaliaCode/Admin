<template>
	<v-layout wrap>
		<v-flex xs12 pt-3>
			<app-table
				:check-all="checkAll"
				class="is-not-selectable"
				:clean-search="isClean"
				:columns="columns"
				:current-page="currentPage"
				:filter-columns="false"
				:last-page="lastPage"
				local-storage
				name="supervisor-assign-form"
				:rows="vendors"
				selectable
				@on-page="loadData"
				@on-search-event="search"
				@on-selected-all="selectedAll"
				@row-is-selected="rowIsSelected"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)"
						class="is-not-selectable">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.documentNumber }}</td>
					<td v-show="showRow(columns, 4)">
						<v-btn
							class="btn-action btn-auto btn-width-auto px-2 py-1"
							color="success"
							small
							@click="$emit('select-supervisor', props.row)"
						>
							Seleccionar
						</v-btn>
					</td>
				</template>
			</app-table>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:isLoading="disabledButton"
				success-text="Asignar"
				@accept-button-clicked="$emit('save-modal', selectedSupervisor)"
				@cancel-button-clicked="$emit('close-modal')"
			></modal-sidebar-button>
		</section>
	</v-layout>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';
	import helper from '@/shared/helper';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
	import TypeSeller from '@/shared/type-seller';

	function created() {
		this.params.search = null;
		this.isClean = true;
		helper.removeLocalData('supervisor-assign-form::search');
		this.loadData();
	}

	function disabledButton() {
		return !this.selectedSupervisor.length > 0;
	}

	async function loadData(page = 1) {
		this.currentPage = page;
		this.params.page = this.currentPage;
		this.params.search = this.params.search || this.searchValue || null;
		const params = { ...this.params, typeSeller: TypeSeller.Supervisor };
		try {
			({ data: this.vendors } = await this.$httpSales.get('sellers', { params }));
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		} finally {
			this.isClean = false;
		}
	}

	function rowIsSelected(row) {
		({ products: this.vendors, productsSelected: this.selectedSupervisor, check: this.checkAll }
		= this.selectedRows(row, this.vendors, this.selectedSupervisor));
	}

	function search(searchData) {
		if (searchData) {
			const searchVal = searchData.replace(/\?/g, '_');
			this.params.search = searchVal || null;
		}
		this.loadData();
	}

	function selectedAll(value) {
		({ products: this.vendors, productsSelected: this.selectedSupervisor, checkAll: this.checkAll }
		= this.selecteAll(value, this.vendors, this.selectedSupervisor));
	}

	function data() {
		return {
			checkAll: false,
			columns: [
				{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
				{ id: 2, name: 'Nombre', value: 'name', visible: true, checked: true },
				{ id: 3, name: 'Documento', value: 'documentNumber', visible: true, checked: true },
				{ id: 4, name: 'Acciones', visible: true, checked: true, flagVisible: true },
			],
			currentPage: 1,
			isClean: false,
			lastPage: 0,
			params: {
				page: 1,
				search: null,
			},
			selectedSupervisor: [],
			vendors: [],
		};
	}

	export default {
		name: 'vendors-supervisor-assign',
		components: {
			appTable,
			modalSidebarButton,
		},
		computed: {
			disabledButton,
		},
		created,
		data,
		methods: {
			loadData,
			rowIsSelected,
			search,
			selectedAll,
		},
		props: {
			searchValue: String,
		},
	};
</script>