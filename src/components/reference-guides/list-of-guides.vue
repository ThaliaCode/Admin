<template>
	<div>
		<header-page
			:columns="columns"
			name="reference-guides"
			:title="$route.meta.title"
			:rows="dataSelected"
			to-show
			@clean-product-filter="onCleanData"
		/>
		<app-actions
			:value-disabled="actionsDisabled"
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<general-filter class="layout wrap my-4">
			<!-- BUSCAR CLIENTE -->
			<v-flex xs12 sm6 md3>
				<person-search-input
					:search-value="selectedCustomer"
					:flagInputEvent="true"
					@search="openSearchCustomer"
				/>
			</v-flex>
			<!-- BUSCAR EMPLEADO -->
			<v-flex xs12 sm6 md2 px-2>
				<input-autocomplete
					:clean-data="cleanData"
					:value="params.employeeId"
					item-text="fullName"
					item-value="id"
					:items="employees"
					label-value="Empleado"
					@set-data="setData($event, 'employeeId')"
				></input-autocomplete>
			</v-flex>

			<v-flex xs12 sm6 md2 px-2>
				<autocomplete-component
					item-text="name"
					item-value="id"
					:items="sunatStates"
					:label-value="`E. ${labelsByCountry.taxAgency}`"
					resource-url="/taxes/status"
					:http-code="'$httpSales'"
					:item="params.stateDocumentTax"
					@return-data="setData($event, 'stateDocumentTax')"
				></autocomplete-component>
			</v-flex>
			<v-flex xs6 sm6 md2 px-2>
				<label class="caption">Fecha inicial</label>
				<date-component
					:date="params.startDate"
					icon="/static/img/calendar.svg"
					@on-input="setDate({ model: 'startDate', value: $event })"
				></date-component>
			</v-flex>
			<v-flex xs6 sm6 md2 px-2>
				<label class="caption">Fecha Final</label>
				<date-component
					:date="params.endDate"
					icon="/static/img/calendar.svg"
					@on-input="setDate({ model: 'endDate', value: $event })"
				></date-component>
			</v-flex>
			<v-flex xs12 sm6 md1 pl-2 pt-4>
				<v-btn
					block
					type="button"
					color="primary"
					class="btn-action"
					:disabled="applyDisabled"
					v-on:click="filterData"
				>
					Buscar
					<v-icon color="white" size="16"> check_circle_outline </v-icon>
				</v-btn>
			</v-flex>
		</general-filter>
		<div class="overflow-auto">
			<app-table
				:current-page="currentPage"
				isResponsive
				selectable
				local-storage
				name="reference-guides"
				:columns="columns"
				:rows="data"
				:check-all="checkAll"
				:last-page="lastPage"
				:main-list="data.length > 0"
				:clean-search="isClean"
				:items-quantity="data.length"
				:disabled-search="disabledSearch"
				:items-total-quantity="itemsTotalQuantity"
				v-on:on-search-event="callServiceAndSearch"
				v-on:on-page="changePage"
				v-on:row-is-selected="rowIsSelected"
				v-on:on-selected-all="selectedAll"
				@on-toggle-columns="toggleColumns"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">
						{{
							isResponsive
								? 'Cliente: ' + props.row.nameCustomer
								: `${props.row.nameCustomer} - (${props.row.rzSocialAddressee})`
						}}
					</td>
					<td v-show="showRow(columns, 3)">
						{{ isResponsive ? 'Doc: ' : '' }}
						{{ props.row.documentNumber || `${props.row.serie} - ${props.row.number}` }}
					</td>
					<td v-show="showRow(columns, 2)">{{ props.row.destination }}</td>
					<td v-show="showRow(columns, 4)">
						{{ isResponsive ? 'Rep: ' : '' }}
						{{ props.row.deliveryName || '-' }}
					</td>
					<td v-show="showRow(columns, 5)">
						{{ props.row.driverLicensePlate || '-' }}
					</td>
					<td v-show="showRow(columns, 6)">
						{{ props.row.phoneDriver || '-' }}
					</td>
					<td v-show="showRow(columns, 7)">
						{{ props.row.createdAt | formatDate('YYYY-MM-DD') }}
					</td>
					<td v-show="showRow(columns, 8)">
						{{ props.row.numberTransportAgency }}
					</td>
					<td v-show="showRow(columns, 9)">
						{{ props.row.addressTranposrtAgency }}
					</td>
					<td v-show="showRow(columns, 10)">
						{{ props.row.transportAgencyName }}
					</td>
					<td v-show="showRow(columns, 11)">{{ props.row.observation }}</td>
					<td v-show="showRow(columns, 12)">
						{{ isResponsive ? 'SUNAT: ' : '' }}
						<document-state
							:color="
								labelsByCountry.code === 'PER'
									? props.row.statusTaxSunatName.color
									: props.row.statusTaxName.color
							"
							:tooltip="
								labelsByCountry.code === 'PER'
									? props.row.statusTaxSunatName.name
									: props.row.statusTaxName.name
							"
							@click-state="openSunatDetails(props.row)"
						/>
					</td>
					<td v-show="showRow(columns, 13)">
						<document-state
							:color="getKardexStatus(props.row).color"
							:tooltip="getKardexStatus(props.row).tooltip"
						/>
					</td>
					<td v-show="showRow(columns, 14)">
						{{ props.row.typeGuide }}
					</td>
					<td v-show="showRow(columns, 15)">
						{{ props.row.flagGroup ? 'Agrupado' : 'Individual' }}
					</td>
					<td v-show="showRow(columns, 16)">
						<v-btn
							icon
							:to="{
								name: isCarrier
									? 'reference-guide-carrier-detail'
									: 'reference-guide-detail',
								params: {
									id: props.row.id,
									transportId: props.row.transportAgencyId,
								},
							}"
							class="table-icon"
						>
							<v-icon color="primary">visibility</v-icon>
						</v-btn>
						<app-tooltip-button
							icon="picture_as_pdf"
							text="Descarga Guía de Remisión"
							color="success"
							size="20"
							@click-icon="downloadGuideRemision(props.row)"
						/>
					</td>
				</template>
			</app-table>
		</div>
		<action-sidebar
			:title="action.title"
			:value="action.open"
			:width="action.width"
			:code-action="action.code"
			:help-actions="actionsToHelp"
			@close-modal="close"
		>
			<person-search-form
				v-if="action.code === 'customer-searcher'"
				:search-value="searchValCustomer"
				@add-person="setCustomer"
			/>
			<legal-detail
				v-if="action.code === 'FED'"
				:date="guideSelected.authorizationDate"
				:message="guideSelected.msgSri"
				:number="guideSelected.authorizationNumber"
				:xml="guideSelected.urlXml"
				:cdr="guideSelected.authorizationNumber"
			/>
			<sales-sunat
				v-if="actionCodeIs('electronic-billing')"
				reference-guides
				:rows="dataSelected"
				@cancel-modal="close"
				@remove-sales-sunat="remove"
				@reload-sales-sunat="reload"
			></sales-sunat>
		</action-sidebar>
	</div>
</template>

<script>
import { format, subDays } from 'date-fns';
import helper from '@/shared/helper';
import actionSidebar from '@/components/shared/action-sidebar';
import appTable from '@/components/shared/table/app-table';
import appActions from '@/components/shared/app-actions';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import dateComponent from '@/components/shared/date-component';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import inputAutocomplete from '@/components/shared/autocomplete/input-autocomplete';
import salesSunat from '@/components/sales/sales-sunat';
import legalDetail from '@/components/reference-guides/legal-detail';
import documentState from '@/components/shared/document-state';
import typeStatusKardex from '@/shared/type-status-kardex';
import TypeGuides from '@/shared/type-guides';
import personSearchForm from '@/components/shared/searcher/person-search-form';
import personSearchInput from '@/components/shared/searcher/person-search-input';
import lib from '@/shared/lib';

const isResponsive = window.innerWidth < 800;

const { getDeeper } = lib;

function created() {
	this.loadResources();
	this.loadData();
	this.columns[11].name = this.isEcuador ? 'SRI' : 'E.Sunat';
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
}

function actionCodeIs(code) {
	return this.action.code === code;
}

function actionsDisabled() {
	const disabledEletronic = !(
		this.dataSelected.every((p) => p.subsidiary.flagTaxes === 1) &&
		this.dataSelected.every((p) => p.salSerie.typeBilling === 1)
	);
	const disabledGuide = this.dataSelected.length > 0;
	return [
		{ code: 'electronic-billing', disabled: disabledEletronic },
		{ code: 'dispatch-guide-remision', disabledGuide },
		{ code: 'send-to-kardex', disabled: !this.dataSelected.length },
	];
}

function applyDisabled() {
	return this.params.startDate && !this.params.endDate;
}

function callServiceAndSearch(searchValue) {
	this.searchData = searchValue;
	if (searchValue) {
		this.params.search = searchValue;
	} else {
		this.params.search = null;
	}
	this.currentPage = 1;
	this.loadData();
}

function changePage(page) {
	this.currentPage = page;
	this.loadData(page);
}

function close() {
	this.action.open = false;
	this.action.code = '';
	this.action.title = '';
}

function filterData() {
	this.currentPage = 1;
	this.checkAll = false;
	this.dataSelected = [];
	this.loadData();
}

async function loadData(page = 1) {
	this.disabledSearch = true;
	this.params.page = page;
	this.currentPage = page;
	this.params.type = this.isCarrier ? TypeGuides.Carrier : TypeGuides.Sender;
	this.params.relationAdd = [
		'transportAgency',
		'delivery',
		'salSerie',
		'subsidiary',
		'customer',
	].join(',');
	try {
		const response = await this.$httpSales.get('remission-guides', {
			params: this.params,
		});
		this.data = response.data.map((p) => {
			const newRow = { ...p };
			newRow.deliveryName = p.delivery ? p.delivery.fullname : '';
			newRow.phoneDriver = p.delivery ? p.delivery.phone : p.driverCelphone;
			newRow.transportAgencyName = p.transportAgency ? p.transportAgency.name : '-';
			newRow.numberTransportAgency = p.transportAgency ? p.transportAgency.number : '-';
			newRow.addressTranposrtAgency = p.transportAgency
				? p.transportAgency.mainAddress
				: '-';
			newRow.nameCustomer =
				p.customer && p.customer.typePerson ? p.customer.typePerson.fullName : '';
			newRow.typeGuide =
				p.salSerie && p.salSerie.typeBilling === 1 ? 'Electrónica' : 'Fisica';
			return newRow;
		});
		this.itemsTotalQuantity = Number(response.headers['x-quantity']);
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (err) {
		this.showGenericError();
	} finally {
		this.isClean = false;
		this.disabledSearch = false;
	}
}

async function loadResources() {
	const request = [this.globalEmployees(), this.$httpSales.get('taxes/status')];
	try {
		[{ data: this.employees }, { data: this.sunatStates }] = await Promise.all(request);
		this.employees = this.employees.map((employee) => {
			const newEmployee = { ...employee };
			newEmployee.fullName = `${employee.name} ${employee.lastname}`;
			return newEmployee;
		});
	} catch (err) {
		this.showGenericError();
	}
}

function onCleanData() {
	this.params = {
		customerId: null,
		employeeId: undefined,
		endDate: null,
		page: null,
		startDate: null,
		stateDocumentTax: null,
		search: null,
		sortField: 'created_at',
	};
	this.dataSelected = [];
	this.selectedCustomer = null;
	this.searchData = null;
	this.checkAll = false;
	this.cleanData = true;
	this.isClean = true;
	helper.removeLocalData('reference-guides::search');
	this.callServiceAndSearch();
}

function reload() {
	this.close();
	this.dataSelected = [];
	this.loadData();
}

function remove({ id }) {
	const index = this.dataSelected.findIndex((d) => d.id === id);
	const indexTable = this.data.findIndex((d) => d.id === id);
	this.dataSelected.splice(index, 1);
	if (indexTable > -1) {
		this.data[indexTable].isSelected = false;
	}
}

function rowIsSelected(row, all) {
	if (row.isSelected) {
		if (this.dataSelected.length > 0 && all) {
			const dataToAdd = this.dataSelected.find(
				(rowSelected) => rowSelected && rowSelected.id === row.id
			);
			if (!dataToAdd) {
				this.dataSelected.push(row);
			}
		} else {
			this.dataSelected.push(row);
		}
	} else {
		const index = this.dataSelected.findIndex((rowData) => rowData.id === row.id);
		this.dataSelected.splice(index, 1);
	}
	this.checkAll = this.data.every((check) => check.isSelected);
}

function runAction({ code }) {
	if (code === 'new-reference-guide') {
		// GUIA DE REMISION REMITENTE
		this.goTo('reference-guide-detail');
	} else if (code === 'new-guide-transport') {
		// GUIA DE REMISION TRANSPORTISTA
		this.goTo('reference-guide-carrier-detail');
	} else if (code === 'electronic-billing') {
		this.action.code = code;
		this.action.title = 'Facturación Electrónica';
		this.action.open = true;
	} else if (code === 'dispatch-guide-remision') {
		this.generateDispatchRemision();
	} else if (code === 'send-to-kardex') {
		this.onSendToKardex();
	}
}

async function generateDispatchRemision() {
	const body = {
		ids: this.dataSelected.map((d) => d.id),
	};
	try {
		this.$httpSales.post('remission-guides/dispach', body);
		this.showNotification('La acción se realizó correctamente');
		this.dataSelected = [];
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function selectedAll(value) {
	this.checkAll = value;
	if (this.data.length > 0) {
		this.data = this.data.map((dataSingle) => {
			const newData = Object.assign({}, dataSingle);
			newData.isSelected = value;
			if (newData.isSelected) {
				if (this.dataSelected.length > 0) {
					const dataToAdd = this.dataSelected.find(
						(rowSelected) => rowSelected && rowSelected.id === newData.id
					);
					if (!dataToAdd) {
						this.dataSelected.push(newData);
					}
				} else {
					this.dataSelected.push(newData);
				}
			} else {
				const index = this.dataSelected.findIndex((rowData) => rowData.id === newData.id);
				this.dataSelected.splice(index, 1);
			}
			return newData;
		});
	}
}

function setData(value, model) {
	if (value) {
		if (model === 'customerId') {
			this.params[model] = value.id;
		} else {
			this.params[model] = value;
		}
	}
}

function toggleColumns() {
	return true;
}

function getNameTax(row) {
	return getDeeper('statusTaxName', 'name')(row);
}

function openSunatDetails(guide) {
	if (this.labelsByCountry.code === 'PER') {
		if (guide.statusTaxName && guide.statusTaxName.showDetails) {
			this.guideSelected = guide;
			this.action.code = 'FED';
			this.action.title = `Guía #${guide.documentNumber}`;
			this.action.open = true;
			this.action.width = 400;
		}
	} else if (guide.statusTaxName && guide.statusTaxName.showDetails) {
		this.guideSelected = guide;
		this.action.code = 'FED';
		this.action.title = `Guía #${guide.documentNumber}`;
		this.action.open = true;
		this.action.width = 400;
	}
}

function setDate({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
}

async function downloadGuideRemision({ id, number }) {
	try {
		const downloadDialog = this.$userInfo.company.settings.downloadSale;
		const model = { code: 'remission-guides-pdf' };
		const responseType = 'blob';
		const contentType = downloadDialog ? 'application/pdf' : 'text/html';
		const response = await this.$httpReportSales.post(
			`remission-guide/${id}/pdf`,
			model,
			{ responseType }
		);
		const blob = helper.generateBlob(response.data, contentType);
		helper.showDownloadDialog(blob, number, downloadDialog);
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'GUIDE_NOT_FOUND') {
				this.showNotification('La guía no existe.', 'error');
			}
		} else if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function getKardexStatus(row) {
	let color = 'red';
	let tooltip = 'Pendiente de envió';
	if (row.sendKardexStatus === typeStatusKardex.Inprocesses) {
		color = 'warning';
		tooltip = 'En proceso';
	} else if (row.sendKardexStatus === typeStatusKardex.Send) {
		color = 'success';
		tooltip = 'Enviado al kardex';
	} else if (row.sendKardexStatus === typeStatusKardex.NotSend) {
		color = 'gray';
		tooltip = 'Venta no despachable';
	}
	return {
		color,
		tooltip,
	};
}

function openSearchCustomer(value) {
	this.searchValCustomer = value ? value.trim() : '';
	this.action.code = 'customer-searcher';
	this.action.title = 'Clientes';
	this.action.width = 739;
	this.action.open = true;
}

function setCustomer(customer) {
	const { id, typePerson } = customer;
	this.params.customerId = id;
	this.selectedCustomer = `${typePerson.fullName} - ${typePerson.documentNumber}` || '';
	this.close();
}

function data() {
	return {
		guideSelected: {
			authorizationDate: null,
			msgSri: '',
			authorizationNumber: null,
			urlXml: null,
			isSelected: false,
		},
		action: {
			active: false,
			code: '',
			open: false,
			title: '',
			width: 800,
		},
		checkAll: false,
		cleanData: false,
		isResponsive,
		columns: [
			{
				id: 1,
				name: 'Cliente',
				value: 'customerName',
				visible: true,
				checked: true,
			},
			{ id: 2, name: '# DOC', value: 'number', visible: true, checked: true },
			{
				id: 3,
				name: 'Destino',
				value: 'destination',
				visible: !isResponsive,
				checked: !isResponsive,
			},
			{
				id: 4,
				name: 'Nombre del Repartidor',
				value: 'driverName',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: '# Placa',
				value: 'driverLicensePlate',
				visible: !isResponsive,
				checked: !isResponsive,
			},
			{
				id: 6,
				name: '# Tel. del Repartidor',
				value: 'driverCelphone',
				visible: !isResponsive,
				checked: !isResponsive,
			},
			{ id: 7, name: 'Fecha', value: 'date', visible: true, checked: true },
			{
				id: 8,
				name: '# Tel. Agenc.',
				tooltip: 'Telefono Agencia',
				value: 'driverCelphone',
				visible: !isResponsive,
				checked: !isResponsive,
			},
			{
				id: 9,
				name: 'Direc. Agenc.',
				tooltip: 'Dirección Agencia',
				value: 'driverCelphone',
				visible: !isResponsive,
				checked: !isResponsive,
			},
			{
				id: 10,
				name: 'Nombre Agenc.',
				tooltip: 'Nombre Agencia de Transporte',
				value: 'driverName',
				visible: true,
				checked: true,
			},
			{
				id: 11,
				name: 'Observaciones',
				value: 'observation',
				visible: !isResponsive,
				checked: !isResponsive,
			},
			{
				id: 12,
				name: 'E.Sunat',
				value: 'status',
				visible: true,
				checked: true,
			},
			{
				id: 13,
				name: 'E. Kardex',
				tooltip: 'Estado de Kardex',
				value: 'status',
				visible: !isResponsive,
				checked: !isResponsive,
			},
			{
				id: 14,
				name: 'T. Facuración',
				tooltip: 'Tipo de Facturación',
				value: 'typeGuide',
				visible: true,
				checked: true,
			},
			{
				id: 15,
				name: 'Tipo Guía',
				tooltip: 'Tipo de Guía',
				value: 'flagGroup',
				visible: true,
				checked: true,
			},
			{
				id: 16,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		currentPage: 1,
		data: [],
		dataSelected: [],
		disabledSearch: false,
		employees: [],
		isClean: false,
		itemsTotalQuantity: 0,
		lastPage: 0,
		menuEnd: false,
		menuStart: false,
		selectedCustomer: null,
		searchValCustomer: null,
		params: {
			customerId: null,
			relationAdd: null,
			employeeId: null,
			endDate: null,
			page: null,
			startDate: null,
			stateDocumentTax: null,
			search: null,
			sortField: 'created_at',
		},
		properties: ['id'],
		search: null,
		searchData: null,
		sunatStates: [],
		isCarrier: this.$route.meta.isCarrier,
	};
}

export default {
	name: 'list-of-guides',
	components: {
		actionSidebar,
		appTable,
		appActions,
		autocompleteComponent,
		dateComponent,
		generalFilter,
		headerPage,
		inputAutocomplete,
		salesSunat,
		documentState,
		legalDetail,
		personSearchInput,
		personSearchForm,
	},
	computed: {
		actionsDisabled,
		applyDisabled,
	},
	created,
	data,
	methods: {
		actionCodeIs,
		callServiceAndSearch,
		close,
		changePage,
		downloadGuideRemision,
		generateDispatchRemision,
		getKardexStatus,
		filterData,
		loadData,
		loadResources,
		onCleanData,
		reload,
		remove,
		rowIsSelected,
		runAction,
		selectedAll,
		setData,
		setCustomer,
		openSearchCustomer,
		toggleColumns,
		getNameTax,
		openSunatDetails,
		setDate,
		async onSendToKardex() {
			const body = {
				ids: this.dataSelected.map((d) => d.id),
				typeOperation: 2,
				moduleCode: 'GUIDE',
				typeDocumentCode: this.$route.name === 'list-of-guides-carrier' ? 'GTR' : 'GRM',
			};
			try {
				await this.$httpSales.post('kardex-movement-insert', body);
				this.showNotification(
					'La guias de remision seleccionadas se enviaron correctamente al kardex'
				);
				this.dataSelected = [];
				this.loadData();
			} catch (error) {
				if (error.status === 400 && error.data && error.data.messageError) {
					this.showNotification(error.data.messageError, 'error');
				} else {
					this.showGenericError();
				}
			}
		},
	},
};
</script>
