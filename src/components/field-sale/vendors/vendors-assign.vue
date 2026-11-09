<template>
	<v-layout wrap>
		<v-layout>
			<v-flex xs3 ml-4 mt-2>
				<autocomplete-component
					local-search
					item-text="name"
					item-value="id"
					:items="warehouses"
					:label-value="labelWarehouse()"
					return-object
					:item="warehouseIds"
					@return-data="filterByWarehouse"
				/>
			</v-flex>
			<v-spacer></v-spacer>
			<v-flex xs3 ml-5 mt-4>
				<v-btn
					type="button"
					color="error"
					class="btn-action"
					@click="cleanParams"
				>
					<v-icon color="white" size="20">cleaning_services</v-icon>
				</v-btn>
			</v-flex>
		</v-layout>
		<v-flex xs12 pt-3>
			<app-table
				:check-all="checkAll"
				class="is-not-selectable"
				:columns="columns"
				:current-page="currentPage"
				:filter-columns="false"
				:last-page="lastPage"
				local-storage
				name="supervisor-assign-form"
				:rows="dataVendors"
				selectable
				:clean-search="isCleanSearch"
				@on-selected-all="selectedAll"
				@on-search-event="searchData"
				@row-is-selected="rowIsSelected"
				disabled-value="disabled"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.fullname }}</td>
					<td v-show="showRow(columns, 2)">
						{{ props.row.documentNumber }}
					</td>
					<td v-show="showRow(columns, 3)">{{ props.row.codeTypeRol }}</td>
				</template>
			</app-table>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:isLoading="!selectedVendors.length > 0"
				success-text="Asignar"
				@accept-button-clicked="saveVendors"
				@cancel-button-clicked="$emit('close-modal')"
			></modal-sidebar-button>
		</section>
	</v-layout>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.warehouses = JSON.parse(localStorage.getItem('admin::warehouses'));
	this.loadDataEmployees();
}

function data() {
	return {
		checkAll: false,
		warehouses: [],
		warehouseIds: null,
		columns: [
			{ id: 1, name: 'Nombre', value: 'name', visible: true, checked: true },
			{
				id: 2,
				name: 'Documento',
				value: 'documentNumber',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Rol',
				value: 'rol',
				visible: true,
				checked: true,
			},
		],
		currentPage: 1,
		lastPage: 0,
		params: {
			page: 1,
		},
		dataVendors: [],
		search: null,
		rol: [],
		isCleanSearch: false,
	};
}

export default {
	name: 'vendors-assign',
	components: {
		appTable,
		modalSidebarButton,
	},
	created,
	data,
	computed: {
		selectedVendors() {
			return this.dataVendors.filter(
				(d) => d.isSelected === true && !d.disabledRowApply
			);
		},
	},
	methods: {
		cleanParams() {
			this.warehouseIds = null;
			this.search = null;
			this.currentPage = 1;
			this.isCleanSearch = true;
			this.loadDataEmployees();
		},
		async loadDataEmployees() {
			try {
				const params = {
					search: this.search,
					codeTypeRoles: 'MAKI_VENDOR,RESELLER',
					warehouseId: this.warehouseIds,
					relationAdd: 'terminal',
				};
				({ data: this.dataVendors } = await this.$httpSales.get('employees', {
					params,
				}));
				this.dataVendors = this.dataVendors.map((row, index) => {
					const newRow = {
						...row,
						number: index + 1,
						disabledRowApply: 0,
						isSelected: 0,
					};
					const exist = this.existEmployee.find(
						(ex) => ex.employeeId === row.id
					);
					if (exist) {
						newRow.disabledRowApply = 1;
						newRow.isSelected = 1;
					}

					return newRow;
				});
			} catch (error) {
				this.$showError(error);
			} finally {
				this.isCleanSearch = false;
			}
		},
		rowIsSelected({ number, isSelected }) {
			// if (isSelected) {
			// 	// this.selectedVendor.push(
			// 	// 	this.dataVendors.find((v) => v.number === number)
			// 	// );
			// } else {
			// 	const index = this.selectedVendor.findIndex((v) => v.number === number);
			// 	this.selectedVendor.splice(index, 1);
			// }
			this.dataVendors = this.dataVendors.map((d) => {
				const newR = { ...d };
				if (d.number === number && d.disabledRowApply) {
					if (!d.disabledRowApply) {
						newR.isSelected = isSelected;
					} else {
						newR.isSelected = true;
					}
					return newR;
				}
				return d;
			});
		},
		selectedAll(value) {
			this.checkAll = value;
			this.dataVendors = this.dataVendors.map((row) => {
				const newRow = { ...row };
				newRow.isSelected = value;
				return newRow;
			});
			// if (value) {
			// 	this.selectedVendor = this.dataVendors;
			// } else {
			// 	this.selectedVendor = [];
			// }
		},
		filterByWarehouse(warehouse) {
			if (warehouse) {
				({ id: this.warehouseIds } = warehouse);
				this.loadDataEmployees();
			}
		},
		async saveVendors() {
			const idsVendors = this.dataVendors
				.filter((d) => d.isSelected === true && !d.disabledRowApply)
				.map((v) => v.id);
			const params = {
				employeesId: idsVendors,
			};
			this.$emit('save-vendors', params);
		},
		searchData(value) {
			this.search = value;
			this.loadDataEmployees();
		},
	},
	props: {
		existEmployee: {
			type: Array,
			default: () => [],
		},
	},
};
</script>
