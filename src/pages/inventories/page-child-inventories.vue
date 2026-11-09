<template>
	<div>
		<header-page
			name="inventories-list-child"
			:title="`INVENTARIO ${$route.query.inventory}`"
			:limit-title="85"
		></header-page>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
			:value-disabled="actionsDisabled"
		/>
		<general-filter>
			<v-layout>
				<v-flex xs12 sm6 md3 pr-1 class="align-col">
					<app-select
						item-text="name"
						item-value="id"
						:item="warehouse"
						:items="warehouses"
						:label="labelWarehouse()"
						@input="getData"
					/>
				</v-flex>
				<v-flex xs2 pr-1 class="align-col">
					<label class="caption">Fecha Inicial</label>
					<date-component
						:date="params.startDate"
						icon="/static/img/calendar.svg"
						@on-input="onDate({ model: 'startDate', value: $event })"
					></date-component>
					<!-- <app-date-mask
						id="start-date"
						label="Fecha Inicio"
						v-model="startDate"
						@format-date="onDate($event, 'startDate')"
					>
					</app-date-mask> -->
				</v-flex>
				<v-flex xs2 pr-1 class="align-col">
					<label class="caption">Fecha Final</label>
					<date-component
						:date="params.endDate"
						icon="/static/img/calendar.svg"
						@on-input="onDate({ model: 'endDate', value: $event})"
					></date-component>
					<!-- <app-date-mask
						id="end-date"
						label="Fecha Final"
						v-model="endDate"
						@format-date="onDate($event, 'endDate')"
					>
					</app-date-mask> -->
				</v-flex>
				<v-flex xs12 sm6 md1 mt-4 pt-2 ml-2 class="align-col">
					<v-btn
						type="button"
						color="primary"
						class="btn-action btn-action-block"
						@click="searchDataFiltered">
						Buscar
						<v-icon
							color="white"
							size="16">
							check_circle_outline
						</v-icon>
					</v-btn>
				</v-flex>
					<v-flex xs12 sm6 md1 mt-4 pt-2 ml-2 class="align-col">
					<v-btn
						type="button"
						color="error"
						class="btn-action btn-action-block"
						@click="cleanFilter">
						Limpiar Filtros
					</v-btn>
				</v-flex>
			</v-layout>
		</general-filter>
		<div class="overflow-auto">
			<app-table
				name="inventories-list-master"
				:columns="columns"
				selectable
				:rows="rows"
				:current-page="currentPage"
				:last-page="lastPage"
				:check-all="checkAll"
				:items-quantity="rows.length"
				@row-is-selected="rowIsSelected"
				@on-selected-all="selectedAll"
				@on-page="changePage"
				@on-search-event="onSearch"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.createdAt }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.warehouse.name }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.inlineResponsibles }}</td>
					<td v-show="showRow(columns, 4)">
						<router-link 
							v-if="props.row.mode !== 2"
							:to="{ name: 'detail-child-inventory', params: { id: props.row.id } }"
							class="link-icon">
							<v-tooltip top>
								<v-btn
									slot="activator"
									icon
								>
									<v-icon color="primary">remove_red_eye</v-icon>
								</v-btn>
								<span>Detalle de Inventario</span>
							</v-tooltip>
						</router-link>
						<router-link 
							v-if="props.row.mode === 2"
							:to="{ name: 'detail-child-inventory-fast', params: { id: props.row.id } }"
							class="link-icon">
							<v-tooltip top>
								<v-btn
									slot="activator"
									icon
								>
									<v-icon color="primary">remove_red_eye</v-icon>
								</v-btn>
								<span>Detalle de Inventario Rapido</span>
							</v-tooltip>
						</router-link>
						<v-tooltip top>
							<v-btn
								v-if="props.row.mode !== 2"
								slot="activator"
								icon
								@click="openConfirmDelete(props.row.id)"
							>
								<v-icon color="red">delete</v-icon>
							</v-btn>
							<span>Eliminar</span>
						</v-tooltip>
						<v-tooltip top>
							<a
								slot="activator"
								@click.stop.prevent="downloadReport(props.row)"
								class="table-icon">
								<v-icon color="primary">save_alt</v-icon>
							</a>
							<span>
								Descargar Inventario
							</span>
						</v-tooltip>
					</td>
				</template>
			</app-table>
		</div>
		<v-dialog v-model="dialog" persistent max-width="390">
			<v-card>
				<v-card-title class="subheading">¿Desea eliminar inventario?</v-card-title>
				<v-card-actions class="justify-center">
					<v-btn
						class="btn-action"
						color="info"
						dark
						@click.native="closeDialog"
					>
						Cancelar
					</v-btn>
					<v-btn
						class="btn-action"
						color="error"
						dark
						@click.native="deleteInvetories"
					>
						Eliminar
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>
<script>
import appActions from '@/components/shared/app-actions';
import headerPage from '@/components/shared/header-page';
import generalFilter from '@/components/shared/general-filter';
import appTable from '@/components/shared/table/app-table';
import dateComponent from '@/components/shared/date-component';
import appSelect from '@/components/shared/app-select';
import { differenceInDays, format } from 'date-fns';
import helper from '@/shared/helper';

function data() {
	return {
		warehouses: [],
		warehouse: '',
		typeInventory: '',
		lastPage: 0,
		currentPage: 1,
		params: {
			endDate: null,
			startDate: null,
			page: '',
		},
		data: [],
		rows: [],
		columns: [
			{ id: 1, name: 'Fecha de Creación', value: 'date-start', visible: true, checked: true },
			{ id: 2, name: 'Tienda', value: 'warehouseName', visible: true, checked: true },
			{ id: 3, name: 'Inventariadores', value: 'inventories', visible: true, checked: true },
			{ id: 4, name: 'Acción', value: 'action', visible: true, checked: true },
		],
		checkAll: false,
		dataSelected: [],
		startDate: null,
		endDate: null,
		warehouseSelect: {},
		inventory: {},
		dialog: false,
		dialogMessage: '',
		typeId: '',
	};
}

function created() {
	this.loadWarehouses();
	this.loadInventoriesChild();
}

async function loadWarehouses() {
	const response = await this.$httpProducts.get('warehouses');
	this.warehouses = response.data;
	this.loadInventory();
}

async function loadInventoriesChild() {
	this.params.page = this.currentPage;
	const idInventory = this.$route.params.id;
	this.params.warehouseId = this.warehouse === '' ? null : this.warehouse;
	try {
		const response = await this.$httpProducts.get(`inventories/${idInventory}/children`, { params: this.params });
		this.rows = response.data.map((inventory) => {
			const newInventory = { ...inventory };
			newInventory.inlineResponsibles = inventory.responsible.join(', ');
			newInventory.createdAt = format(inventory.createdAt, 'YYYY-MM-DD');
			return newInventory;
		});
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError('Error');
	} finally {
		this.checkAll = this.rows.every(d => d.isSelected);
	}
}

function getData({ value }) {
	this.warehouse = value.id;
	this.warehouseSelect = this.warehouses.find(w => w.id === Number(value.id));
}

function selectedAll(value) {
	({ products: this.rows, productsSelected: this.dataSelected, checkAll: this.checkAll }
	= this.selecteAll(value, this.rows, this.dataSelected));
}

function rowIsSelected(row) {
	({ products: this.rows, productsSelected: this.dataSelected, checkAll: this.checkAll }
	= this.selectedRows(row, this.rows, this.dataSelected));
}

function changePage(page) {
	this.currentPage = page;
	this.loadInventoriesChild();
}

function onDate({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
}

function runAction({ code }) {
	if (code === 'create-inventory') {
		this.goTo('new-inventory', { params: { id: this.id } });
		helper.setLocalData('warehouse-selected', this.warehouseSelect);
	}
}

function searchDataFiltered() {
	if (this.startDate && this.endDate) {
		const datesValid = differenceInDays(this.params.endDate, this.params.startDate) >= 0;
		if (datesValid) {
			this.currentPage = 1;
			this.loadInventoriesChild();
		} else {
			this.showNotification('La fecha inicial no debe ser mayor a la final', 'info');
		}
	} else {
		this.loadInventoriesChild();
	}
}

function cleanFilter() {
	this.warehouse = '';
	this.startDate = null;
	this.params.startDate = null;
	this.endDate = null;
	this.params.endDate = null;
	this.loadInventoriesChild();
}

function onSearch(searchValue) {
	const searchTrim = searchValue ? searchValue.trim() : null;
	this.params.search = searchTrim;
	this.loadInventoriesChild();
}

function downloadReport({ id }) {
	const originName = 'Reporte de Inventario Rapido';
	const codeReport = 'child-inventory-details';
	const params = {
		inventoryId: id,
	};
	this.onEmitExcel(codeReport, originName, params);
}

async function loadInventory() {
	const response = await this.$httpProducts.get(`inventories/${this.id}`);
	this.inventory = response.data;
	this.warehouse = response.data.warehouseId;
	this.warehouseSelect = this.warehouses.find(w => w.id === Number(response.data.warehouseId));
}

function actionsDisabled() {
	const flag = this.inventory.status === 2;
	const disabledActions = [
		{ code: 'create-inventory', disabled: flag },
	];
	return disabledActions;
}

function openConfirmDelete(id) {
	this.dialog = true;
	this.typeId = id;
}

function closeDialog() {
	this.dialog = false;
	this.typeId = '';
}

async function deleteInvetories() {
	try {
		await this.$httpProducts.delete(`inventories/${this.typeId}`);
		this.showNotification('Se eliminó correctamente.');
		this.closeDialog();
		this.loadInventoriesChild();
	} catch (error) {
		if (error.data.message === 'INVENTORY_ALREADY_CLOSED') {
			this.showGenericError('El inventario esta cerrado');
		} else if (error.data.message === 'INVENTORY_CHILD_NOT_FOUND') {
			this.showGenericError('No se encuentra el inventario');
		} else {
			this.showGenericError('Error');
		}
	}
}

export default {
	name: 'list-child-inventories',
	components: {
		appActions,
		headerPage,
		generalFilter,
		appTable,
		appSelect,
		dateComponent,
	},
	created,
	data,
	methods: {
		downloadReport,
		loadWarehouses,
		loadInventoriesChild,
		onDate,
		getData,
		selectedAll,
		rowIsSelected,
		changePage,
		runAction,
		searchDataFiltered,
		cleanFilter,
		loadInventory,
		openConfirmDelete,
		closeDialog,
		deleteInvetories,
		onSearch,
	},
	computed: {
		actionsDisabled,
	},
	props: {
		id: {
			type: [String, Number],
		},
		warehouseId: {
			type: [String, Number],
		},
	},
};
</script>

<style lang="scss" scoped>
	.link-icon {
		text-decoration: none;
	}

	.btn-excel-graphics {
		background-color: color(background-excel) !important;
		border-radius: 5px !important;
		height: 27px !important;
		width: 27px !important;
	}
</style>

