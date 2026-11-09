<template>
	<div>
		<header-page
			:columns="columns"
			name="products-movement"
			:rows="dataSelected"
			:title="$route.meta.title"
			to-show
			@clean-product-filter="onCleanData"
		/>
		<general-filter class="layout wrap align-start pt-4 pb-3">
			<v-flex xs12 sm6 md3 pl-3>
				<v-select
					:items="warehouses"
					v-model="warehouse"
					label="Almacén"
					item-text="name"
					single-line
					bottom
					hide-details
					class="filter-select"
					content-class="filter-select-content"
					disabled
				></v-select>
			</v-flex>
			<v-flex xs12 sm4 md2 pl-2 mr-5>
				<v-menu
					lazy
					v-model="menu"
					transition="scale-transition"
					offset-y
					full-width
				>
					<v-text-field
						slot="activator"
						label="Fecha de Ingreso"
						v-model="entryDate"
						single-line
						append-icon="event"
						class="filter-select shadow-inset shadow-inset-calendar shadow-inset-calendar-end"
						readonly
					></v-text-field>
					<v-date-picker
						v-model="entryDate"
						no-title
						scrollable
					></v-date-picker>
				</v-menu>
				<span class="form-group__message" v-if="!entryDate">
					La fecha de ingreso es requerida
				</span>
			</v-flex>
			<v-flex xs12 sm4 md5 d-flex pl-2>
				<v-text-field
					label="Control de Lotes"
					v-model="batchControl"
					class="filter-select shadow-inset"
				></v-text-field>
			</v-flex>
		</general-filter>
		<div class="overflow-auto pb-5">
			<app-table
				name="products-movement"
				:columns="columns"
				:rows="rows"
				:key-value="keyValue"
				local-storage
				local-search
				selectable
				:check-all="checkAll"
				:main-list="false"
				:clean-search="isClean"
				@column-input="columnInput"
				@on-toggle-columns="toggleColumns"
				@on-local-search="callServiceAndSearch"
				@row-is-selected="rowIsSelected"
				@on-selected-all="selectedAll"
				class="no-main-list"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">{{ props.row.warehouseName }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.autoBarcode }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.inlineFeatures }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.description }}</td>
					<td v-show="showRow(columns, 7)" @click.stop="() => false">
						<app-select
							:item="props.row.brandId"
							item-text="name"
							item-value="id"
							:items="brands"
							model="brandId"
							@input="getBrand($event, props.row)"
						/>
					</td>
					<td v-show="showRow(columns, 8)">{{ props.row.unitName }}</td>
					<td v-show="showRow(columns, 9)" class="text-xs-center">
						<v-text-field
							label="00"
							type="number"
							v-model.number="props.row.quantity"
							single-line
							hide-details
							@click.stop="() => false"
							@input="updateQuantity(props.row, $event, true)"
							class="filter-select shadow-inset-table"
						></v-text-field>
					</td>
					<td v-show="showRow(columns, 10)">{{ props.row.stock }}</td>
					<td v-show="showRow(columns, 11)">
						<v-text-field
							type="text"
							v-model="props.row.location"
							single-line
							hide-details
							@click.stop="() => false"
							@input="updateQuantity(props.row, $event)"
							class="filter-select shadow-inset-table"
						></v-text-field>
					</td>
					<td v-show="showRow(columns, 12)">
						<v-text-field
							type="number"
							v-model.number="props.row.priceCost"
							single-line
							hide-details
							min="0"
							@click.stop="() => false"
							@input="updateQuantity(props.row, $event)"
							class="filter-select shadow-inset-table"
						></v-text-field>
					</td>
					<td v-show="showRow(columns, 13)">{{ props.row.price | round }}</td>
					<td v-show="showRow(columns, 14)">{{ props.row.weigth }}</td>
					<td v-show="showRow(columns, 15)">
						<v-menu
							lazy
							v-model="props.row.menu"
							transition="scale-transition"
							offset-y
							full-width
						>
							<v-text-field
								slot="activator"
								v-model="props.row.expirationDate"
								single-line
								class="filter-select shadow-inset-table shadow-inset-calendar shadow-inset-calendar-end"
								readonly
								@click.native.stop="props.row.menu = true"
							></v-text-field>
							<v-date-picker
								v-model="props.row.expirationDate"
								no-title
								scrollable
							></v-date-picker>
						</v-menu>
					</td>
					<td v-show="showRow(columns, 16)">
						<v-text-field
							type="number"
							v-model.number="props.row.alertBeforeOf"
							single-line
							hide-details
							@click.stop="() => false"
							@input="updateQuantity(props.row, $event)"
							class="filter-select shadow-inset-table"
						></v-text-field>
					</td>
					<td>
						<v-tooltip top>
							<button
								slot="activator"
								class="table-icon"
								@click="openModal(props.row)"
							>
								<img :src="iconMotive" alt="" />
							</button>
							<span>Motivo y Comentario</span>
						</v-tooltip>
						<v-tooltip top>
							<button
								slot="activator"
								class="table-icon"
								@click.stop="
									deleteRow(props.row.autoBarcode, props.row.warProductId)
								"
							>
								<v-icon color="pink" size="19"> highlight_off </v-icon>
							</button>
							<span>Eliminar producto</span>
						</v-tooltip>
						<app-tooltip-button
							v-if="props.row.flagControlSerie"
							img="/static/img/icons/barcode.svg"
							:height="25"
							text="Control de series"
							@click-icon="openSeries(props.row)"
						/>
					</td>
				</template>
			</app-table>
		</div>
		<div class="companies-btn text-xs-center">
			<v-btn
				type="button"
				color="success"
				class="btn-action"
				title="Debe seleccionar los productos que se van a ingresar"
				:disabled="dataIncomplete || loading"
				@click.native="transferMovement"
			>
				Guardar
				<v-icon color="white" size="16"> check_circle_outline </v-icon>
			</v-btn>
		</div>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:header-color="action.color"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<control-series
				v-if="action.code === 'control-series'"
				:product="productSerie"
				flag="product"
				@send-series="sendSeries"
			/>
			<component-reason-and-comment
				v-if="action.code === 'commentary-reason'"
				@close-modal="closeModal"
				:component="newObject"
				@save="setComponent"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import componentReasonAndComment from '@/components/movements/component-reason-and-comment';
import actionBar from '@/components/shared/action-bar/bar';
import actionSidebar from '@/components/shared/action-sidebar';
import helper from '@/shared/helper';
import lib from '@/shared/lib';
import appSelect from '@/components/shared/app-select';
import controlSeries from '@/components/products/control-series';
import appTable from './../shared/table/app-table';
import generalFilter from './../shared/general-filter';
import headerPage from './../shared/header-page';

const { setNewProperty, updateAllItemInCollection } = lib;

function isComponentReason() {
	return this.action.code === 'isComponentReason';
}

function setComponent({ reason, commentary }) {
	this.newObject.reason = reason;
	this.newObject.commentary = commentary;
	this.rows = updateAllItemInCollection('id', this.newObject, this.rows);
	this.dataSelected = updateAllItemInCollection(
		'id',
		this.newObject,
		this.dataSelected
	);
}

function closeModalReason() {
	this.action.open = false;
}

function saveModal() {
	this.closeModalReason();
}

function openModal(value) {
	this.action.title = 'Motivo y Comentario';
	this.action.open = true;
	this.action.code = 'commentary-reason';
	this.newObject = value;
}

function runAction({ code }) {
	this.action.code = code;
	this.action.open = true;
}

function callServiceAndSearch(search) {
	this.localSearch = search ? search.trim() : '';
	if (this.localSearch) {
		this.isClean = false;
		const rowsFilter = this.rows.filter(
			(item) =>
				(item.name.toLowerCase().indexOf(search.toLowerCase()) > -1 &&
					!item.isDeleted) ||
				(item.code.toLowerCase().indexOf(search.toLowerCase()) > -1 &&
					!item.isDeleted)
		);
		this.rows = rowsFilter;
	} else {
		const rowsQuantity = this.rows.filter(
			(row) => row.quantity && row.quantity !== 0
		);
		const newRows = this.data.map((row) => {
			const newRow = Object.assign({}, row);
			rowsQuantity.forEach((rowQuantity) => {
				if (
					row.autoBarcode === rowQuantity.autoBarcode &&
					row.warProductId === rowQuantity.warProductId
				) {
					newRow.quantity = rowQuantity.quantity;
				}
			});
			return newRow;
		});
		this.rows = newRows.filter((newRow) => !newRow.isDeleted);
	}
}

function columnInput(header) {
	const value = Number(header.event.target.value);
	const fieldName = header.column.value;
	this.data.forEach((row) => {
		this.$set(row, fieldName, value);
	});
}

function created() {
	const indexWarehouse = this.columns.findIndex(
		(p) => p.value === 'warehouseName'
	);
	this.columns[indexWarehouse].name = this.labelWarehouse();
	this.loadWarehouses();
	this.loadBrands();
	this.loadData();
	this.entryDate = helper.formatDate(new Date(), 'YYYY-MM-DD');
	this.columns[6].visible = this.$userInfo.company.settings.flagImport;
}

function dataIncomplete() {
	let isIncomplete = true;
	if (this.dataSelected.length > 0) {
		const rowsQuantity = this.dataSelected.every(
			(row) => row.quantity && row.quantity > 0
		);
		if (this.warehouse && this.entryDate && rowsQuantity) {
			isIncomplete = false;
		}
	}
	return isIncomplete;
}

function deleteRow(code, id) {
	const index = this.rows.findIndex(
		(rowData) => rowData.autoBarcode === code && rowData.warProductId === id
	);
	this.data = this.data.map((row) => {
		const newRow = Object.assign({}, row);
		if (row.autoBarcode === code && row.warProductId === id) {
			newRow.isDeleted = true;
		}
		return newRow;
	});
	this.rows.splice(index, 1);
	if (this.dataSelected && this.dataSelected.length > 0) {
		const indexSelected = this.dataSelected.findIndex(
			(rowData) => rowData.autoBarcode === code && rowData.warProductId === id
		);
		if (indexSelected > -1) {
			this.dataSelected.splice(indexSelected, 1);
		}
	}
}

function getBrand({ model, value }, row) {
	this.$set(row, model, value.id);
}

async function loadBrands() {
	({ data: this.brands } = await this.$httpProducts('brands'));
}

function loadData() {
	const localData = helper.getLocalData('products-selected');
	this.data = localData.map((rowData) => {
		const newData = Object.assign({}, rowData);
		newData.alertBeforeOf = null;
		newData.expirationDate = null;
		newData.isDeleted = false;
		newData.isSelected = false;
		newData.menu = false;
		newData.quantity = 1;
		newData.commentary = null;
		newData.reason = null;
		return newData;
	});
	this.rows = Object.assign([], this.data);
}

async function loadWarehouses() {
	try {
		const response = await this.$httpProducts.get('warehouses');
		this.warehouses = response.data;
		const warehouseId = this.$route.query.warehouseId;
		if (warehouseId) {
			const defaultWarehouse = this.warehouses.find(
				(w) => w.id === Number(warehouseId)
			);
			if (defaultWarehouse) {
				this.warehouse = defaultWarehouse;
			}
		}
	} catch (err) {
		this.showNotification(
			'Ocurrió un error al intentar cargar las almacenes',
			'error'
		);
	}
}

function onCleanData() {
	this.date = null;
	this.warehouse = 0;
	this.localSearch = '';
	this.isClean = true;
	helper.removeLocalData('products-movement::search');
	this.callServiceAndSearch();
}

function rowIsSelected(row) {
	this.rows.forEach((p) => {
		const newP = p;
		if (newP.warProductId === row.warProductId) {
			newP.isSelected = row.isSelected;
			this.$set(newP, 'isSelected', row.isSelected);
		}
	});
	if (row.isSelected) {
		if (this.dataSelected.length > 0) {
			const dataToAdd = this.dataSelected.find(
				(rowSelected) =>
					rowSelected.autoBarcode === row.autoBarcode &&
					rowSelected.warProductId === row.warProductId
			);
			if (!dataToAdd) {
				this.dataSelected.push(row);
			} else {
				this.dataSelected = this.dataSelected.map((rowSelected) => {
					let newRowSelected = Object.assign({}, rowSelected);
					newRowSelected =
						newRowSelected.warProductId === row.warProductId
							? row
							: newRowSelected;
					return newRowSelected;
				});
			}
		} else {
			this.dataSelected.push(row);
		}
	} else {
		const index = this.dataSelected.findIndex(
			(rowData) => rowData[this.keyValue] === row[this.keyValue]
		);
		if (index !== -1) {
			this.dataSelected.splice(index, 1);
		}
	}
	this.checkAll = this.rows.every((check) => check.isSelected);
}

function updateQuantity(row, value, flag) {
	const newRow = Object.assign({}, row);
	if (flag) {
		newRow.isSelected = Number(value) >= 0;
	}
	if (newRow.action) {
		delete newRow.action;
	}
	this.rowIsSelected(newRow);
}

function selectedAll(value) {
	this.checkAll = value;
	this.rows = this.rows.map((dataSingle) => {
		const newData = Object.assign({}, dataSingle);
		newData.isSelected = value;
		if (newData.isSelected) {
			if (this.dataSelected.length > 0) {
				const dataToAdd = this.dataSelected.find(
					(rowSelected) =>
						rowSelected.autoBarcode === newData.autoBarcode &&
						rowSelected.warProductId === newData.warProductId
				);
				if (!dataToAdd) {
					this.dataSelected.push(newData);
				}
			} else {
				this.dataSelected.push(newData);
			}
		} else {
			const index = this.dataSelected.findIndex(
				(rowData) => rowData[this.keyValue] === newData[this.keyValue]
			);
			this.dataSelected.splice(index, 1);
		}
		return newData;
	});
}

function toggleColumns() {
	return true;
}

async function transferMovement() {
	this.loading = true;
	const modelDetails = this.dataSelected.map((item) => {
		const newItem = { ...item };
		newItem.dataToSend = {
			productId: item.id,
			quantity: item.quantity,
			brandId: item.brandId,
			priceList: item.priceList,
			location: item.location || '',
			expirationDate: item.expirationDate,
			alertBeforeOf: item.alertBeforeOf,
			priceCost: item.priceCost,
			reason: item.reason,
			commentary: item.commentary,
			detailSeries: item.detailSeries ? item.detailSeries : null,
		};
		return newItem.dataToSend;
	});
	const model = {
		warehouseId: this.warehouse.id,
		entryDate: this.entryDate,
		details: modelDetails,
		lot: this.batchControl,
	};
	try {
		await this.$httpProducts.post('v2/transfer-movement', model);
		this.showNotification('El ingreso de productos se realizó correctamente');
		this.goTo('products');
		helper.removeLocalData('products-selected');
		this.loading = false;
	} catch (err) {
		this.loading = false;
		if (err.data.statusCode === 400) {
			if (err.data.message === 'SERIES_QUANTITY_NOT_EQUAL_PRODUCT_QUANTITY') {
				this.showNotification(
					'La cantidad de un producto no es igual a la cantidad de su series',
					'error'
				);
			}
		} else {
			this.showNotification(
				'Ocurrió un error al intentar ingresar la productos',
				'error'
			);
		}
	}
}
function updateDataSelected(dataSelected) {
	const someProductSelected = dataSelected.find((d) => d.isSelected);
	return function inner(list, row) {
		const newList = list.slice();
		if (someProductSelected && row.isSelected) {
			return newList.concat(row);
		}
		return newList;
	};
}

function setQuantityToAll(value) {
	const newValue = Number(value) || 0;
	this.rows = this.rows.map(setNewProperty('quantity', newValue));
	this.dataSelected = this.rows.reduce(
		updateDataSelected(this.dataSelected),
		[]
	);
}

function openSeries(row) {
	this.action.code = 'control-series';
	this.action.open = true;
	this.action.title = `Control de Series ${row.code}`;
	this.action.width = 700;
	this.productSerie = row;
}

function closeModal() {
	if (this.action.code === 'control-series') {
		this.action.open = false;
		this.action.code = null;
		this.action.title = '';
		this.productSerie = null;
	} else {
		this.action.open = false;
		this.action.code = null;
		this.action.title = '';
	}
}

function sendSeries(series) {
	this.closeModal();
	this.updateSerie('rows', series);
	if (this.dataSelected.length) {
		this.updateSerie('dataSelected', series);
	}
}

function updateSerie(model, series) {
	this[model] = this[model].map((row) => {
		const newRow = { ...row };
		if (row.warProductId === series.warehouseProductId) {
			newRow.detailSeries = series;
		}
		return newRow;
	});
}

function data() {
	return {
		newObject: {},
		saveReasonandComment: {
			reason: null,
			commentary: null,
		},
		iconMotive:
			'https://s3.amazonaws.com/apprunn-acl/COM-PRU-01/ARQ88/image/chat-box.svg',
		allProductsQuantity: false,
		brands: [],
		checkAll: false,
		columns: [
			{
				id: 1,
				name: 'Tienda',
				value: 'warehouseName',
				visible: false,
				checked: false,
			},
			{ id: 2, name: 'Código', value: 'code', visible: true, checked: true },
			{
				id: 3,
				name: 'Cod. interno',
				value: 'autoBarcode',
				visible: false,
				checked: false,
			},
			{ id: 4, name: 'Nombre', value: 'name', visible: true, checked: true },
			{
				id: 5,
				name: 'Características',
				value: 'inlineFeatures',
				visible: false,
				checked: false,
			},
			{
				id: 6,
				name: 'Descripción',
				value: 'description',
				visible: false,
				checked: false,
			},
			{
				id: 7,
				name: 'Marca',
				value: 'brandName',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Unidad',
				value: 'unitName',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Cantidad',
				value: 'quantity',
				visible: true,
				checked: true,
				isEditable: true,
				showInput: false,
			},
			{ id: 10, name: 'Stock', value: 'stock', visible: true, checked: true },
			{
				id: 11,
				name: 'Ubicación',
				value: 'location',
				visible: true,
				checked: true,
			},
			{
				id: 12,
				name: 'P. costo',
				value: 'priceCost',
				visible: true,
				checked: false,
				isEditable: true,
				showInput: false,
			},
			{
				id: 13,
				name: 'P. venta',
				value: 'price',
				visible: false,
				checked: false,
			},
			{ id: 14, name: 'Kg', value: 'weigth', visible: false, checked: false },
			{
				id: 15,
				name: 'Vencimiento',
				value: 'expirationDate',
				visible: true,
				checked: true,
			},
			{
				id: 16,
				name: 'Alerta',
				value: 'alertBeforeOf',
				visible: true,
				checked: true,
			},
			{
				id: 17,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		data: [],
		dataSelected: [],
		entryDate: null,
		isClean: false,
		keyValue: 'warProductId',
		loading: false,
		localSearch: '',
		menu: false,
		params: {
			page: null,
		},
		rows: [],
		warehouse: 0,
		warehouses: [],
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 570,
		},
		batchControl: '',
		productSerie: {},
	};
}

export default {
	name: 'products-movement',
	components: {
		actionBar,
		actionSidebar,
		appSelect,
		appTable,
		generalFilter,
		headerPage,
		componentReasonAndComment,
		controlSeries,
	},
	computed: {
		dataIncomplete,
	},
	created,
	data,
	methods: {
		isComponentReason,
		setComponent,
		closeModalReason,
		saveModal,
		openModal,
		runAction,
		callServiceAndSearch,
		columnInput,
		deleteRow,
		getBrand,
		loadBrands,
		loadData,
		loadWarehouses,
		onCleanData,
		rowIsSelected,
		selectedAll,
		setQuantityToAll,
		toggleColumns,
		transferMovement,
		updateQuantity,
		openSeries,
		closeModal,
		sendSeries,
		updateSerie,
	},
};
</script>

<style lang="scss" scoped>
.align-start {
	align-items: flex-start !important;
}
</style>
