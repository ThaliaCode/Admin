<template>
	<div>
		<header-page
			name="inventories-list-master"
			:title="title"
			@clean-product-filter="clearFilter"
			to-show
			:show-excel="false"
		></header-page>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
			:value-disabled="actionsDisabled"
		/>
		<general-filter>
			<v-layout>
				<v-flex xs12 sm6 md3 pr-1 class="align-col">
					<v-select
						v-model="warehouse"
						:items="warehouses"
						:label="labelWarehouse()"
						single-line
						item-text="name"
						item-value="id"
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
						@input="filterRows($event, 'warehouse')"
					></v-select>
				</v-flex>
				<v-flex xs12 sm6 md3 pr-1 class="align-col">
					<v-select
						v-model="typeInventory"
						label="Tipo de Inventario"
						:items="inventoriesType"
						single-line
						item-text="name"
						item-value="id"
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
						v-on:input="filterRows($event, 'type')"
					>
					</v-select>
				</v-flex>
				<v-flex xs12 sm6 md3 pr-1 class="align-col">
					<v-select
						v-model="statusInventory"
						label="Estado de Inventario"
						:items="inventoriesStatus"
						single-line
						item-text="name"
						item-value="id"
						bottom
						hide-details
						class="filter-select"
						content-class="filter-select-content"
						v-on:input="filterRows($event, 'status')"
					>
					</v-select>
				</v-flex>
			</v-layout>
		</general-filter>
		<div class="overflow-auto">
			<app-table
				name="inventories-list-master"
				:columns="columns"
				selectable
				:rows="data"
				:current-page="currentPage"
				:last-page="lastPage"
				:check-all="checkAll"
				:items-quantity="data.length"
				@row-is-selected="rowIsSelected"
				@on-selected-all="selectedAll"
				@on-page="changePage"
				@on-search-event="searchEvent"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.startDateFormat }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.endDateFormat }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.warehouseName }}</td>
					<td v-show="showRow(columns, 5)">
						<v-tooltip top>
							<button
								slot="activator"
								v-if="props.row.mode === 2"
								class="btn-list mb-2 pl-3"
							>
								<v-icon color="primary">flight_takeoff</v-icon>
							</button>
							<span>Inventario Rápido</span>
						</v-tooltip>
						{{ props.row.type }}
					</td>
					<td v-show="showRow(columns, 6)">
						{{ props.row.inlineResponsibles }}
					</td>
					<td v-show="showRow(columns, 7)">{{ props.row.statusName }}</td>
					<td v-show="showRow(columns, 8)">{{ props.row.zone }}</td>
					<td v-show="showRow(columns, 9)">
						{{ getValueAddInfo(props.row, 'totalCostInventoryWithTax') }}
					</td>
					<td v-show="showRow(columns, 10)">
						{{ getValueAddInfo(props.row, 'totalPriceSaleInventory') }}
					</td>
					<td v-show="showRow(columns, 11)">
						{{ getValueAddInfo(props.row, 'grossProfit') }}
					</td>
					<td v-show="showRow(columns, 12)">
						{{ getValueAddInfo(props.row, 'grossMarginPercent') }}
					</td>
					<td v-show="showRow(columns, 13)">
						<router-link
							:to="{
								name: 'child-inventory',
								params: {
									id: props.row.id,
									warehouseId: props.row.warehouseId,
								},
								query: { inventory: props.row.name },
							}"
							class="link-icon"
						>
							<v-tooltip top>
								<v-btn slot="activator" icon>
									<v-icon color="primary">reorder</v-icon>
								</v-btn>
								<span>Inventarios Hijos</span>
							</v-tooltip>
						</router-link>
						<v-tooltip top>
							<v-btn slot="activator" icon @click="goTo(props.row)">
								<v-icon color="success">list</v-icon>
							</v-btn>
							<span>Resumen de inventario por Categoría</span>
						</v-tooltip>
						<router-link
							:to="{
								name: 'detail-master-inventory',
								params: {
									id: props.row.id,
									status: props.row.status,
									row: JSON.stringify(props.row),
								},
							}"
							class="link-table"
						>
							<v-tooltip top>
								<v-btn slot="activator" icon>
									<v-icon color="primary">remove_red_eye</v-icon>
								</v-btn>
								<span>Detalle de Inventario</span>
							</v-tooltip>
						</router-link>
						<app-tooltip-button
							v-if="props.row.status === 1"
							text="Eliminar Inventario"
							color="red"
							size="20"
							@click-icon="showModalDelete(props.row)"
							icon="delete"
						/>
					</td>
				</template>
			</app-table>
		</div>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:header-color="action.color"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			@close-modal="cancelModal"
		>
			<close-master
				v-if="action.code === 'close-inventory'"
				:is-loading="isLoading"
				@cancel-modal="cancelModal"
				:inventory="editInventory"
				@close-inventory="deleteInventory"
			/>
			<new-master
				v-if="action.code === 'edit-inventory' || action.code === 'new-inventory'"
				:warehouses="warehouses"
				:inventory="editInventory"
				@cancel-modal="cancelModal"
				@update="updateInventory"
			/>
		</action-sidebar>
		<v-dialog v-model="dialog" persistent max-width="390">
			<v-card>
				<v-card-title class="subheading">¿Desea eliminar inventario?</v-card-title>
				<v-card-actions class="justify-center">
					<v-btn class="btn-action" color="info" dark @click.native="closeModalDelete">
						Cancelar
					</v-btn>
					<v-btn class="btn-action" color="error" dark @click.native="deleteInvetorie">
						Eliminar
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>
<script>
import appActions from '@/components/shared/app-actions';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import actionSidebar from '@/components/shared/action-sidebar';
import newMaster from '@/components/shared/inventories/new-master';
import helper from '@/shared/helper';
import closeMaster from '@/components/shared/inventories/close-inventory';

function runAction({ code, name }) {
	if (code === 'new-inventory') {
		this.editInventory = {};
	} else {
		this.editInventory = this.dataSelected[0];
	}
	if (code === 'close-inventory') {
		this.action.width = 400;
	} else {
		this.action.width = 570;
	}
	this.action.code = code;
	this.action.open = true;
	this.action.title = name;
}

function cancelModal() {
	this.action.open = false;
	this.action.code = '';
	this.editInventory = {};
}

function created() {
	this.columns[3].name = this.labelWarehouse();
	this.loadWarehouses();
	this.title = this.isPeru ? 'Inventarios Maestros' : 'Toma Física';
}

async function loadWarehouses() {
	try {
		const response = await this.$httpProducts.get('warehouses');
		this.warehouses = response.data;
		if (this.warehouses.length === 1) {
			this.warehouse = this.warehouses[0];
			this.params.warehouseId = this.warehouses[0].id;
		}
	} finally {
		this.loadInventories();
	}
}

async function deleteInvetorie() {
	try {
		await this.$httpProducts.delete(`inventories/father/${this.inventoryId}`);
		this.showNotification('Se elimino el inventario correctamente.');
		this.closeModalDelete();
		this.loadInventories();
	} catch (error) {
		if (error.data.message === 'INVENTORY_CHILD_NOT_FOUND') {
			this.showGenericError('No se realizó el conteo');
		} else if (error.data.message === 'INVENTORY_ALREADY_CLOSED') {
			this.showGenericError('El inventario hijo se encuentra cerrado');
		} else {
			this.showGenericError();
		}
	}
}

function showModalDelete({ id }) {
	this.dialog = true;
	this.inventoryId = id;
}

function closeModalDelete() {
	this.dialog = false;
	this.inventoryId = null;
}

async function loadInventories() {
	this.params.page = this.currentPage;
	try {
		const response = await this.$httpProducts.get('inventories/father-v2', {
			params: this.params,
		});
		this.data = response.data.map((inventory) => {
			const newInventory = { ...inventory };
			newInventory.startDateFormat = helper.exactDate(inventory.startDate, 'DD-MM-YYYY');
			newInventory.endDateFormat = helper.exactDate(inventory.endDate, 'DD-MM-YYYY');
			newInventory.type = newInventory.type === 1 ? 'Parcial' : 'Completo';
			newInventory.inlineResponsibles = inventory.responsible.join(', ');
			return newInventory;
		});
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError('Error');
	} finally {
		this.checkAll = this.data.every((d) => d.isSelected);
	}
}

function changePage(page) {
	this.currentPage = page;
	this.loadInventories();
}

function filterRows(filter, value) {
	if (value === 'type') {
		this.params.type = filter;
	} else if (value === 'warehouse') {
		this.params.warehouseId = filter;
	} else {
		this.params.status = filter;
	}
	this.currentPage = 1;
	this.loadInventories();
}

function actionsDisabled() {
	const disabledSelected = this.dataSelected.length === 1;
	const close =
		this.dataSelected.length === 1 ? this.dataSelected[0].status === 2 : false;
	const disabledActions = [
		{ code: 'close-inventory', disabled: !disabledSelected || close },
		{ code: 'new-inventory', disabled: false },
		{ code: 'edit-inventory', disabled: !disabledSelected || close },
	];
	return disabledActions;
}

function selectedAll(value) {
	({
		products: this.data,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selecteAll(value, this.data, this.dataSelected));
}

function rowIsSelected(row) {
	({
		products: this.data,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selectedRows(row, this.data, this.dataSelected));
}

function clearFilter() {
	this.params.status = null;
	this.params.warehouseId = null;
	this.params.type = null;
	this.warehouse = '';
	this.typeInventory = '';
	this.statusInventory = '';
	this.loadInventories();
}

async function deleteInventory(closeId) {
	this.flagDisabled = true;
	try {
		this.isLoading = true;
		await this.$httpProducts.patch(`inventories/${closeId}/close-father`);
		this.showNotification('El inventario se cerró correctamente');
		this.action.open = false;
		this.action.code = '';
		this.loadInventories();
		this.flagDisabled = false;
	} catch (error) {
		if (error.data.message === 'INVENTORY_CHILD_NOT_FOUND') {
			this.showGenericError('No se realizó el conteo');
		} else if (error.data.message === 'INVENTORY_ALREADY_CLOSED') {
			this.showGenericError('El inventario se encuentra cerrado');
		} else {
			this.showGenericError('Error');
		}
		this.flagDisabled = false;
	} finally {
		this.isLoading = false;
	}
}

function updateInventory() {
	this.action.open = false;
	this.action.code = '';
	this.editInventory = {};
	this.dataSelected = [];
	this.loadInventories();
}

function goTo(row) {
	if (row.status === 1) {
		this.showNotification(
			'Este inventario se encuentra abierto. Debe cerrarlo para acceder al resumen',
			'error'
		);
	} else {
		this.$router.push({
			name: 'summary-inventory-category',
			params: { id: row.id },
		});
	}
}

function searchEvent(search) {
	this.params.search = search ? search.trim() : null;
	this.loadInventories();
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Nombre', value: 'name', visible: true, checked: true },
			{
				id: 2,
				name: 'Fecha de inicio',
				value: 'date-start',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Fecha Final',
				value: 'date-end',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Tienda',
				value: 'warehouseName',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Tipo de Invent.',
				value: 'type-inventories',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Inventariadores',
				value: 'inventories',
				visible: true,
				checked: true,
			},
			{ id: 7, name: 'Estado', value: 'Estado', visible: true, checked: true },
			{ id: 8, name: 'Zona', value: 'zone', visible: true, checked: true },
			{
				id: 9,
				name: 'Costo total',
				value: 'totalCostInventoryWithTax',
				visible: true,
				checked: true,
			},
			{
				id: 10,
				name: 'Valor de venta',
				value: 'totalPriceSaleInventory',
				visible: true,
				checked: true,
			},
			{
				id: 11,
				name: 'Ganacia bruta',
				value: 'grossProfit',
				visible: true,
				checked: true,
			},
			{
				id: 12,
				name: 'Margen est. (%)',
				value: 'grossMarginPercent',
				visible: true,
				checked: true,
			},
			{ id: 13, name: 'Acción', value: 'action', visible: true, checked: true },
		],
		data: [],
		dialog: false,
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 500,
		},
		isLoading: false,
		inventoryId: null,
		warehouses: [],
		warehouse: '',
		typeInventory: '',
		lastPage: 0,
		currentPage: 1,
		params: {
			page: '',
			search: null,
		},
		dataSelected: [],
		checkAll: false,
		inventoriesStatus: [
			{
				id: 1,
				name: 'Abierto',
			},
			{
				id: 2,
				name: 'Cerrado',
			},
		],
		statusInventory: '',
		editInventory: {},
		title: '',
	};
}
export default {
	name: 'list-master-inventories',
	components: {
		appActions,
		generalFilter,
		headerPage,
		appTable,
		actionSidebar,
		newMaster,
		closeMaster,
	},
	data,
	methods: {
		closeModalDelete,
		deleteInvetorie,
		deleteInventory,
		runAction,
		cancelModal,
		loadWarehouses,
		loadInventories,
		changePage,
		filterRows,
		goTo,
		rowIsSelected,
		selectedAll,
		searchEvent,
		clearFilter,
		showModalDelete,
		updateInventory,
		getValueAddInfo(row, prop) {
			const { additionalInformation, status } = row;

			if (status === 1 || !additionalInformation) {
				return 'Aún no calculado';
			}
			if (prop) {
				return Number(additionalInformation[prop]).toFixed(2);
			}
			return '-';
		},
	},
	created,
	computed: {
		actionsDisabled,
	},
};
</script>
<style lang="scss" scoped>
.link-icon,
.link-table {
	text-decoration: none;
}
</style>
