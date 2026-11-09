<template>
	<div>
		<header-page
			:title="$route.meta.title"
			:limit-title="40"
			@clean-product-filter="clearFilter"
			to-show
			:show-excel="false"
		/>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<general-filter class="layout wrap justify-start mt-4">
			<v-flex xs12 sm2 pr-2>
				<label class="caption">Tipo de movimiento</label>
				<v-select
					:items="types"
					v-model="params.typeOperation"
					item-text="name"
					item-value="id"
					label="Tipo de movimiento"
					class="filter-select"
					content-class="filter-select-content"
					@input="filterRows($event, 'typeOperation')"
				></v-select>
			</v-flex>
		</general-filter>
		<app-table
			class="my-5"
			name="types-of-inventory-movements"
			:columns="columns"
			:current-page="currentPage"
			:rows="rows"
			:last-page="lastPage"
			:clean-search="isClean"
			@on-search-event="onSearch"
			@on-page="changePage"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.row.code }}</td>
				<td v-show="showRow(columns, 2)">{{ props.row.orderAvgCost }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.typeOperation ? 'Entrada' : 'Salida'}}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.description }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.accountingAccount ? props.row.accountingAccount.code : null }}</td>
				<td v-show="showRow(columns, 6)">
					<span class="text--info bold">{{ props.row.flagAvgCost ? 'SI' : 'NO' }}</span>
				</td>
				<td v-show="showRow(columns, 7)">
					<span class="bold">{{ props.row.flagApplyCostAvg ? 'SI' : 'NO' }}</span>
				</td>
				<td v-show="showRow(columns, 8)">
					<v-tooltip top>
						<v-btn
							slot="activator"
							icon
							@click.stop="openEdit(props.row)"
						>
							<v-icon color="success">edit</v-icon>
						</v-btn>
						<span>Editar</span>
					</v-tooltip>
					<v-tooltip top v-if="!props.row.typeDocumentId">
						<v-btn
							slot="activator"
							icon
							@click.stop="openConfirmDelete(props.row)"
						>
							<v-icon color="error">delete</v-icon>
						</v-btn>
						<span>Eliminar</span>
					</v-tooltip>
				</td>
			</template>
		</app-table>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:header-color="action.color"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			@close-modal="cancelModal"
		>
			<create-new-type 
				v-if="action.code === 'new-account-type'"
				:types="types"
				:accounts="accounts"
				:id="typeEdit.id"
				:type-document-id="typeEdit.typeDocumentId"
				:show-accounting="showAccounting"
				@close-modal="cancelModal"
				@update-list="updateList"
			/>
		</action-sidebar>
		<v-dialog
			v-model="dialog"
			persistent
			max-width="425">
			<v-card>
				<v-card-title class="headline">
					¿Deseas eliminar el tipo de movimiento: {{ typeEdit.name }}?
				</v-card-title>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs6 pr-1
							text-xs-right>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="cancelDelete">
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1
							text-xs-left>
							<v-btn
								color="pink"
								class="btn-action white--text"
								@click.native="deleteType">
								Aceptar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import generalFilter from '@/components/shared/general-filter';
import appTable from '@/components/shared/table/app-table';
import appActions from '@/components/shared/app-actions';
import createNewType from '@/components/inventories/create-new-type';
import actionSidebar from '@/components/shared/action-sidebar';

function runAction({ code }) {
	this.typeEdit = {};
	this.action.title = 'Nuevo Tipo de Movimiento';
	this.action.code = code;
	this.action.open = true;
}

function cancelModal() {
	this.action.open = false;
	this.action.code = null;
	this.typeEdit = {};
}

async function loadData() {
	const requests = [
		this.$httpQuipu.get(`accounting-plan/${this.companyId}/quipu`),
	];
	try {
		const responses = await Promise.all(requests);
		[
			{ data: this.accounts },
		] = responses;
	} catch (error) {
		this.showGenericError();
	}
}

async function loadTypes() {
	this.params.page = this.currentPage;
	try {
		const response = await this.$httpProducts.get('type-documents', { params: this.params });
		this.rows = response.data;
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	} finally {
		this.isClean = false;
	}
}

function updateList() {
	this.cancelModal();
	this.loadTypes();
}

function openEdit(row) {
	this.typeEdit = row;
	this.action.title = 'Editar Tipo de Movimiento';
	this.action.code = 'new-account-type';
	this.action.open = true;
}

function created() {
	this.companyId = this.$userInfo.companyId;
	const { configIntegrations } = this.$userInfo.subsidiary;
	const { accountingPlan, accountingConfiguration } = configIntegrations || {};
	const valueValid = accountingPlan || accountingConfiguration;
	this.showAccounting = valueValid ? !!valueValid.flagConfig : false;
	this.loadTypes();
	if (this.showAccounting) {
		this.loadData();
	}
}

function openConfirmDelete(row) {
	this.typeEdit = { ...row };
	this.dialog = true;
}

function cancelDelete() {
	this.dialog = false;
	this.typeEdit = {};
}

async function deleteType() {
	try {
		await this.$httpProducts.delete(`type-documents/${this.typeEdit.id}`);
		this.showNotification('Se eliminó correctamente');
		this.dialog = false;
		this.loadTypes();
	} catch (err) {
		if (err.data.message === 'KARDEX_EXIST_NOT_DELETE') {
			this.showNotification('El tipo de movimiento tiene registros en el kardex relacionados');
		} else if (err.data.message === 'TRANSFER_EXIST_NOT_DELETE') {
			this.showNotification('El tipo de movimiento tiene tiene transferencias relacionados');
		} else {
			this.showGenericError();
		}
	}
}

function filterRows(filter, value) {
	this.params[value] = filter;
	this.currentPage = 1;
	this.loadTypes();
}

function clearFilter() {
	this.params.typeOperation = null;
	this.params.search = null;
	this.isClean = true;
	this.loadTypes();
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.loadTypes();
}

function changePage(page) {
	this.currentPage = page;
	this.loadTypes();
}

function data() {
	return {
		accounts: [],
		action: {
			active: false,
			code: '',
			open: false,
			title: '',
			width: 450,
		},
		companyId: 0,
		lastPage: 0,
		currentPage: 1,
		data: [],
		types: [
			{
				id: 1,
				name: 'Entrada',
			},
			{
				id: 0,
				name: 'Salida',
			},
		],
		rows: [],
		columns: [
			{
				id: 1,
				name: 'Código',
				value: 'code',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Order',
				value: 'order',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Tipo Mov.',
				value: 'type',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Descripción de Tipo',
				value: 'description',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Cod. Contable',
				value: 'code',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Recalc',
				value: 'recalculate',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Activo',
				value: 'active',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Acciones',
				value: 'action',
				visible: true,
				checked: true,
			},
		],
		params: {
			typeOperation: null,
		},
		typeEdit: {},
		dialog: false,
		isClean: false,
	};
}

export default {
	name: 'page-types-of-inventory-movements',
	data,
	created,
	components: {
		actionSidebar,
		appActions,
		appTable,
		headerPage,
		generalFilter,
		createNewType,
	},
	methods: {
		cancelModal,
		runAction,
		loadData,
		loadTypes,
		updateList,
		openEdit,
		openConfirmDelete,
		cancelDelete,
		deleteType,
		filterRows,
		clearFilter,
		onSearch,
		changePage,
	},
};
</script>
<style lang="scss" scoped>
	.text--info {
		color: map-get($colors, primary);
	}

	.bold {
		font-weight: bold;
	}

	.headline {
		color: color(paginationText);
		font-family: font(open-semibold);
		font-size: size(medium) !important;
		letter-spacing: normal !important;
		line-height: 1 !important;
		margin: auto;
		max-width: 340px;
		padding-top: 37px !important;
		text-align: center;
	}

	.btn-block {
		padding-bottom: 24px !important;
		padding-top: 28px !important;
	}
</style>
