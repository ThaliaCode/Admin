<template>
	<div>
		<app-loading
			:show-loading="loadingGeneral"
			label="La carga terminará en un momento y podrás ver
			el listado de proovedores"
		/>
		<header-page
			:title="$route.meta.title"
			to-show
			:emit-excel="true"
			@emit-excel="emitExcel"
			@clean-product-filter="cleanFilters"
		/>
		<app-actions
			v-if="$route.name === 'suppliers'"
			:resource-uri="$route.name"
			:value-disabled="actionDisabled"
			@open-help="openHelp"
			@run-action="runAction"
		/>
		<general-filter>
			<v-layout wrap align-end my-3 v-if="groups.length > 0">
				<v-flex xs2>
					<app-select
						:items="groups"
						:item="table.params.groupId"
						item-text="name"
						item-value="id"
						label="Grupo"
						model="groupId"
						@input="getData"
					/>
				</v-flex>
			</v-layout>
		</general-filter>
		<suppliers-list
			:clean-search="cleanSearch"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="rows"
			@on-delete="onDelete"
			@on-page="onPage"
			@on-search="onSearch"
			@open-edit="openEdit"
			@see-detail="seeDetail"
			@row-is-select="onRowSelected"
			@open-document="openDocument"
			@view-list="viewList"
			@repair-supplier="repairSupplier"
		/>
		<action-sidebar
			title="Importar Proveedores"
			:value="action.open"
			:width="400"
			@close-modal="closeModal(true)"
		>
			<people-import
				v-if="isImport"
				type-person="Supplier"
				@close="closeModal(true)"
				@people-imported="closeModal"
			/>
		</action-sidebar>
		<router-view></router-view>
	</div>
</template>

<script>
import appActions from '@/components/shared/app-actions';
import actionSidebar from '@/components/shared/action-sidebar';
import appSelect from '@/components/shared/app-select';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import peopleImport from '@/components/shared/people-import';
import suppliersList from '@/components/purchases/suppliers-list';
import typeEntityId from '@/shared/type-entity';
import { format } from 'date-fns';

function created() {
	this.loadResources();
	this.loadData();
}

function cleanFilters() {
	this.dataSelected = [];
	this.table.params.groupId = null;
	this.table.params.search = null;
	this.cleanSearch = true;
	helper.removeLocalData('suppliers::search');
	this.loadData();
}

function closeModal(cancel) {
	this.action.code = '';
	this.action.open = false;
	if (!cancel) {
		this.loadData();
	}
}

function getData({ model, value }) {
	this.table.params[model] = value.id;
	this.loadData();
}

function isImport() {
	return this.action.code === 'suppliers-import';
}

async function loadData() {
	try {
		this.loadingGeneral = true;
		const params = this.table.params;
		const currency = this.$userInfo.company.currency;
		({ data: this.rows, headers: this.headers } = await this.$httpSales.get(
			'suppliers',
			{ params }
		));
		this.rows = this.rows.map((row) => {
			const newRow = { ...row };
			newRow.document =
				row.typeDocumentName && row.documentNumber
					? `${row.typeDocumentName} ${row.documentNumber}`
					: '';
			newRow.phones = row.phone ? row.phone.join() : row.phone;
			if (row.currencyAmount) {
				Object.keys(row.currencyAmount).forEach((key) => {
					if (key === currency) {
						newRow.totalPurchase = row.currencyAmount[key].amount;
						newRow.totalDebt = row.currencyAmount[key].debt;
						newRow.currencySymbol = row.currencyAmount[key].symbol;
					}
				});
				Object.keys(row.currencyAmount).forEach((key) => {
					if (key === 'USD') {
						const currencyUsd = 'USD';
						newRow.currencySymbolUsd = row.currencyAmount[currencyUsd].symbol;
						newRow.totalPurchaseUsd = row.currencyAmount[currencyUsd].amount;
						newRow.totalDebtUsd = row.currencyAmount[key].debt;
					}
				});
			}
			return newRow;
		});
		this.dataSelected = [];
		this.lastPage = Number(this.headers['x-last-page']);
		this.cleanSearch = false;
	} catch (error) {
		this.showGenericError();
	} finally {
		this.loadingGeneral = false;
	}
}

async function loadResources() {
	const params = { typeEntityId: typeEntityId.Supplier };
	({ data: this.groups } = await this.$httpSales.get('group', { params }));
}

function onDelete({ id, name }) {
	this.goTo('suppliers-delete', { params: { id, name } });
}

function onPage(page) {
	this.table.params.page = page;
	this.currentPage = page;
	this.loadData();
}

function onSearch(search) {
	this.table.params.search = search;
	this.loadData();
}

function openEdit({ id }) {
	this.goTo('suppliers-edit', { params: { id } });
}

function openHelp() {}

function runAction(item) {
	if (item.code === 'NS') {
		this.goTo(item.codeWeb);
	} else if (item.code === 'NG') {
		this.goTo('suppliers-group');
	} else if (item.code === 'suppliers-import') {
		this.action.code = item.code;
		this.action.open = true;
	}
}

function seeDetail({ id, name }) {
	this.goTo('suppliers-purchases-details', { params: { id, name } });
}

function openDocument({ id }) {
	this.goTo('suppliers-documents', { params: { id } });
}

function data() {
	return {
		action: {
			code: '',
			open: false,
		},
		cleanSearch: false,
		dataSelected: [],
		columns: [
			{
				id: 1,
				name: 'Cód.',
				value: 'code',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Nombre/Razón Social',
				value: 'name',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Document',
				value: 'documentNumber',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Dirección',
				value: 'address',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Contacto',
				value: 'contactName',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Teléfono',
				value: 'phones',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Total Compra',
				value: 'totalPurchase',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Total Deuda',
				value: 'totalDebt',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Centro de Costo',
				value: 'centerOfCost',
				visible: false,
				checked: false,
			},
			{
				id: 10,
				name: 'Acción',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		currentPage: 1,
		loadingGeneral: false,
		groups: [],
		headers: {},
		lastPage: 1,
		rows: [],
	};
}

export default {
	name: 'suppliers',
	components: {
		appActions,
		actionSidebar,
		appSelect,
		generalFilter,
		headerPage,
		peopleImport,
		suppliersList,
	},
	computed: {
		isImport,
		actionDisabled() {
			const disabledProducts = this.dataSelected.length !== 1;
			return [{ code: 'list-product-purchases', disabled: disabledProducts }];
		},
	},
	created,
	data,
	methods: {
		cleanFilters,
		closeModal,
		getData,
		loadData,
		loadResources,
		onDelete,
		onPage,
		onSearch,
		openEdit,
		openHelp,
		runAction,
		seeDetail,
		openDocument,
		onRowSelected(row) {
			if (row.isSelected) {
				this.dataSelected.push(row);
			} else {
				const index = this.dataSelected.findIndex((r) => r.id === row.id);
				this.dataSelected.splice(index, 1);
			}
		},
		viewList(row) {
			this.goTo('suppliers-list-product', { params: { id: row.id } });
		},
		async repairSupplier(row) {
			const body = {
				supplierId: row.id,
				flagGenerateScript: true,
			};
			try {
				await this.$httpSales.post('amortizations-purchase-repair', body);
				this.showNotification(
					'Se reparó los datos correctamente del proveedor.'
				);
				this.loadData();
			} catch (error) {
				this.showGenericError();
			}
		},
		async emitExcel() {
			const params = Object.fromEntries(
				Object.entries(this.table.params).filter(([, value]) => value !== null)
			);
			delete params.search;
			if (this.table.params.search) {
				params.search = this.table.params.search;
			}
			const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
			const { name, lastname } = this.$userInfo;
			const documentData = {
				filename: `Reporte de proveedores ${now}`,
				extension: 'xlsx',
				comment: `Reporte de proveedores generado por ${name} ${lastname}`,
				params,
			};
			try {
				await this.$httpReports.post('documents/list-suppliers-xlsx', documentData);
				this.notificationReport();
			} catch (error) {
				if (error.data && error.data.statusCode === 400) {
					this.showGenericError(
						'No esta habilitado el reporte, activelo en la sección de reporte externo'
					);
				} else {
					this.showGenericError();
				}
			}
		},
	},
	watch: {
		$route(newVal) {
			if (newVal) {
				if (newVal.name === 'suppliers') {
					this.loadResources();
					this.loadData();
				}
			}
		},
	},
};
</script>
