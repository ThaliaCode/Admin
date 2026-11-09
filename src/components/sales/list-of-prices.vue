<template>
	<div>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<app-table
			class="mt-5"
			name="list-of-prices"
			:inputSearch="false"
			:filterColumns="false"
			:columns="columns"
			:current-page="currentPage"
			:rows="priceList"
			:last-page="lastPage"
			@on-page="changePage"
		>
			<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.index + 1 }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.description }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.customerName }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.employeeName }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.warehouseName }}</td>
					<td v-show="showRow(columns, 7)">{{ props.row.statusName }}</td>
					<td v-show="showRow(columns, 8)">{{ props.row.statusDefault }}</td>
					<td v-show="showRow(columns, 9)">
						<app-tooltip-button
							class="table-icon mr-2"
							height="21"
							color="primary"
							icon="mode_edit"
							text="Editar Lista de Precio"
							@click-icon="openSlider(props.row)"
						></app-tooltip-button>
					</td>
			</template>
		</app-table>
		<action-sidebar
			:active="action.active"
			:title="action.title"
			:width="action.width"
			:code-action="action.code"
			:help-actions="actionsToHelp"
			v-model="action.open"
			@close-modal="closeModal">
				<v-container v-if="action.code === 'price-list'">
					<v-layout row wrap my-3>
						<v-flex xs12 mb-4>
							<v-text-field
								required
								class="filter-select shadow-inset"
								name="new-price_list-name"
								label="Nombre"
								v-model="newPriceList.name"
							></v-text-field>
							<span class="form-group__message" v-if="!$v.newPriceList.name.required">
								El nombre de la lista de precios es requerida.
							</span>
						</v-flex>
						<v-flex xs12>
							<v-text-field
								required
								single-line
								multi-line
								class="textarea-content filter-select shadow-inset mt-3"
								name="new-price_list-descripción"
								label="Descripción"
								v-model="newPriceList.description"
							></v-text-field>
							<span class="form-group__message" v-if="!$v.newPriceList.description.required">
								La descripción de la lista de precios es requerida.
							</span>
						</v-flex>
						<v-flex xs10 mb-4>
							<autocomplete-component
								http-code="$httpSales"
								id="auto-customer"
								item-text="name"
								label-value="Buscar Cliente"
								resource-url="customers"
								:items="customers"
								:placeholder-value="selectedCustomerName"
								:propertiesToShow="['name', 'lastname', 'rzSocial']"
								:return-object="false"
								@return-data="setCustomer"
							>
							</autocomplete-component>
						</v-flex>
						<v-flex xs2 mt-4>
							<app-tooltip-button
								color="red"
								icon="delete"
								text="Eliminar cliente de ésta lista de precios"
								@click-icon="deleteFromPriceList('comCustomersId')"
							>
							</app-tooltip-button>
						</v-flex>
						<v-flex xs10 mb-4>
							<app-select
								autocomplete
								label="Empleado"
								model="comEmployeeId"
								item-text="name"
								item-value="id"
								:item="newPriceList.comEmployeeId"
								:items="employees"
								:return-object="false"
								@input="onInput"
							>
							</app-select>
						</v-flex>
						<v-flex xs2 mt-4>
							<app-tooltip-button
								color="red"
								icon="delete"
								text="Eliminar empleado de ésta lista de precios"
								@click-icon="deleteFromPriceList('comEmployeeId')"
							>
							</app-tooltip-button>
						</v-flex>
						<v-flex xs10 mb-4>
							<app-select
								autocomplete
								:label="labelWarehouse()"
								model="warWarehousesId"
								item-text="name"
								item-value="id"
								:item="newPriceList.warWarehousesId"
								:items="warehouses"
								:return-object="false"
								@input="onInput"
							>
							</app-select>
						</v-flex>
						<v-flex xs2 mt-4>
							<app-tooltip-button
								color="red"
								icon="delete"
								:text="`Eliminar ${labelWarehouse()} de ésta lista de precios`"
								@click-icon="deleteFromPriceList('warWarehousesId')"
							>
							</app-tooltip-button>
						</v-flex>
					</v-layout>
					<v-layout d-flex justify-start>
						<v-flex xs12>
							<v-checkbox
								label="Por Defecto"
								v-model="newPriceList.flagDefault"
								:disabled="disabledFlagDefault"
								@change="changeFlagDefault"></v-checkbox>
						</v-flex>
					</v-layout>
					<v-layout 
						d-flex 
						justify-start
						v-if="id">
						<v-flex xs2>
							<v-checkbox
								label="Activa"
								v-model="newPriceList.flagActive"
								:disabled="!!newPriceList.flagDefault"></v-checkbox>
						</v-flex>
					</v-layout>
					<section class="modal-filter-footer">
						<modal-sidebar-button
							@cancel-button-clicked="closeModal"
							@accept-button-clicked="accept"
						/>
					</section>
				</v-container>
		</action-sidebar>
	</div>
</template>

<script>
import appActions from '@/components/shared/app-actions';
import { required } from 'vuelidate/lib/validators';
import actionSidebar from '@/components/shared/action-sidebar';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import helper from '@/shared/helper';

function created() {
	const indexWarehouse = this.columns.findIndex(o => o.value === 'warehouse');
	this.columns[indexWarehouse].name = this.labelWarehouse();
	this.loadData();
}

function runAction() {
	this.disabledFlagDefault = false;
	this.action = this.actionPriceList;
}

function setCustomerText(value = '') {
	const autoCustomer = window.document.querySelector('input#auto-customer');
	if (autoCustomer) {
		setTimeout(() => {
			autoCustomer.value = value;
		}, 500);
	}
}

async function setListPriceData() {
	const response = await this.listPricingPromise(this.params);
	this.rows = response.data;
	this.lastPage = Number(response.headers['x-last-page']);
	return response;
}

async function loadData() {
	try {
		const requests = [
			this.globalEmployees(),
			this.$httpProducts.get('warehouses'),
			setListPriceData.call(this),
		];
		const [employees, warehouses] = await Promise.all(requests);
		this.employees = employees.data;
		this.warehouses = warehouses.data;
	} catch (error) {
		this.showGenericError();
	}
}

function onInput({ model, value }) {
	this.newPriceList[model] = value || null;
}

function openSlider(row) {
	this.action = this.actionPriceList;
	if (row.name) {
		this.newPriceList = {
			id: row.id,
			name: row.name,
			description: row.description,
			comCustomersId: row.comCustomersId,
			warWarehousesId: row.warWarehousesId,
			comEmployeeId: row.comEmployeeId,
			flagActive: row.flagActive,
			flagDefault: row.flagDefault,
		};
		setCustomerText(row.customerName);
		if (this.customers.length === 0) {
			this.customers.push({ id: row.comCustomersId || null, name: row.customerName || 'NINGUNO' });
			this.selectedCustomerName = row.customerName;
		}
		this.id = row.id;
		this.action.title = row.name;
		this.disabledFlagDefault = !!row.flagDefault;
	}
}

function closeModal() {
	this.id = null;
	setCustomerText();
	this.newPriceList = {
		description: '',
		flagActive: true,
		name: '',
		comCustomersId: null,
		warWarehousesId: null,
		comEmployeeId: null,
	};
	this.action = {
		active: false,
		open: false,
		title: '',
		width: 350,
		code: null,
	};
	this.actionPriceList = {
		active: true,
		open: true,
		title: 'Crear Lista de precios',
		width: 400,
		code: 'price-list',
	};
}

function changePage(page) {
	this.currentPage = page;
	this.params.page = page;
	setListPriceData.call(this);
}

function deleteFromPriceList(propertyName) {
	this.$set(this.newPriceList, propertyName, null);
	if (propertyName === 'comCustomersId') {
		setCustomerText();
		this.customers = [{ name: '' }];
		this.selectedCustomerName = '';
	}
}

async function accept() {
	const editUrl = `sal-price-lists/${this.id}`;
	const createUrl = 'sal-price-lists';
	const url = this.id ? editUrl : createUrl;
	const editMessage = 'Lista de precios actualizada';
	const createMessage = 'Lista de precios creada';
	const message = this.id ? editMessage : createMessage;
	const editMethod = 'patch';
	const createMethod = 'post';
	const method = this.id ? editMethod : createMethod;
	const body = {
		warWarehousesId: this.newPriceList.warWarehousesId || null,
		comEmployeeId: this.newPriceList.comEmployeeId || null,
		comCustomersId: this.newPriceList.comCustomersId || null,
		name: this.newPriceList.name,
		description: this.newPriceList.description,
		flagDefault: !!this.newPriceList.flagDefault,
	};
	if (this.id) {
		body.flagActive = this.newPriceList.flagActive;
	}
	try {
		await this.$httpSales[method](url, body);
		this.showNotification(message);
		this.loadData();
		if (body.flagDefault) {
			this.updateCurrent();
		}
		this.closeModal();
	} catch (error) {
		this.showGenericError();
	}
}

async function updateCurrent() {
	const response = await this.$httpSales.get('/employees/current');
	helper.setLocalData('admin-user', response.data);
}

function validations() {
	return {
		newPriceList: {
			description: {
				required,
			},
			name: {
				required,
			},
		},
	};
}

function data() {
	return {
		action: {
			active: false,
			open: false,
			title: '',
			width: 400,
			code: null,
		},
		actionPriceList: {
			active: true,
			open: true,
			title: 'Crear Lista de precios',
			width: 400,
			code: 'price-list',
		},
		columns: [
			{ id: 1, name: 'Posición', visible: true, checked: true },
			{ id: 2, name: 'Nombre', visible: true, checked: true },
			{ id: 3, name: 'Descripción', visible: true, checked: true },
			{ id: 4, name: 'Cliente', visible: true, checked: true },
			{ id: 5, name: 'Empleado', visible: true, checked: true },
			{ id: 6, name: 'Tienda', value: 'warehouse', visible: true, checked: true },
			{ id: 7, name: 'Estado', visible: true, checked: true },
			{ id: 8, name: 'Por Defecto', visible: true, checked: true },
			{ id: 9, name: 'Acciones', visible: true, checked: true, flagVisible: true },
		],
		params: {
			page: 1,
			limit: 10,
			sortDirection: 'desc',
			sortField: 'created_at',
		},
		currentPage: 1,
		customers: [],
		employees: [],
		lastPage: 0,
		newPriceList: {
			comCustomersId: null,
			comEmployeeId: null,
			warWarehousesId: null,
			description: '',
			flagActive: true,
			name: '',
		},
		rows: [],
		selectedCustomerName: '',
		search: '',
		warehouses: [],
		disabledFlagDefault: false,
		id: null,
		changeDefault: false,
	};
}

function priceList() {
	const label = 'NINGUNO';
	return this.rows.map((row) => {
		const newRow = { ...row };
		newRow.customerName = row.customer ? row.customer.typePerson.fullName : label;
		newRow.employeeName = row.employee ? row.employee.name : label;
		newRow.warehouseName = row.warehouse ? row.warehouse.name : label;
		newRow.statusName = row.flagActive === 1 ? 'Activa' : 'Desactivada';
		newRow.statusDefault = row.flagDefault === 1 ? 'Si' : 'No';
		return newRow;
	});
}

function setCustomer(value) {
	this.newPriceList.comCustomersId = value.id;
}

function changeFlagDefault(value) {
	if (value) {
		this.newPriceList.flagActive = true;
	}
}

export default {
	name: 'list-of-prices',
	components: {
		actionSidebar,
		appTable,
		appActions,
		autocompleteComponent,
		modalSidebarButton,
	},
	created,
	computed: {
		priceList,
	},
	data,
	methods: {
		accept,
		changePage,
		changeFlagDefault,
		closeModal,
		deleteFromPriceList,
		loadData,
		onInput,
		openSlider,
		runAction,
		setCustomer,
		updateCurrent,
	},
	validations,
};
</script>
