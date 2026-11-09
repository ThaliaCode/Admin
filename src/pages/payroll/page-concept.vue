<template>
	<div>
		<header-page
			:title="$route.meta.title"
			name="concept"
			to-show
			:show-excel="false"
			@clean-product-filter="clearFilter"
		/>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<div class="overflow-auto mt-5">
			<app-table
				name="control-employee"
				:columns="columns"
				:rows="rows"
				:current-page="currentPage"
				:last-page="lastPage"
				@on-page="changePage"
				@on-search-event="onSearch"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.description }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 4)">{{ getValueByProp(props.row.conceptType) }}</td>
					<td v-show="showRow(columns, 5)">{{ getValueByProp(props.row.formulaType) }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.value }}</td>
					<td v-show="showRow(columns, 7)">{{ props.row.order }}</td>
					<td v-show="showRow(columns, 8)">{{ props.row.accountingExt }}</td>
					<td v-show="showRow(columns, 9)">{{ getValueByProp(props.row.methodCode) }}</td>
					<td v-show="showRow(columns, 10)">{{ getValueByProp(props.row.conceptType, 'code') }}</td>
					<td v-show="showRow(columns, 11)">
						<v-tooltip top>
							<v-switch
								slot="activator"
								class="switch-inline"
								hide-details
								color="success"
								v-model="props.row.flagActive"
								@change="updateFlag($event, props.row.id)"
							></v-switch>
							<span>{{ stateName(props.row) }}</span>
						</v-tooltip>
						<v-tooltip top>
							<v-btn
								slot="activator"
								icon
								@click.native="goToConcept(props.row.id)">
								<v-icon color="success">create</v-icon>
							</v-btn>
							<span>Editar</span>
						</v-tooltip>
					</td>
				</template>
			</app-table>
		</div>
		<action-sidebar
			:width="action.width"
			v-model="action.open"
			:code-action="action.code"
			:title="action.title"
			:active="action.active"
			@close-modal="closeModal">
			<filter-concept 
				v-if="action.code === 'active-items'"
				@close-modal="closeModal"
				@update-params="filters"
				:selects="params"
				/>
		</action-sidebar>
	</div>
</template>
<script>
import appActions from '@/components/shared/app-actions';
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import actionSidebar from '@/components/shared/action-sidebar';
import filterConcept from '@/components/payroll/filter-concept';

function runAction({ code }) {
	if (code === 'create-items') {
		this.goTo('new-concept');
	} else {
		this.action.open = true;
		this.action.title = 'Filtrar por';
		this.action.code = code;
	}
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Código', visible: true, checked: true },
			{ id: 2, name: 'Descripción', visible: true, checked: true },
			{ id: 3, name: 'Nombre corto', visible: true, checked: true },
			{ id: 4, name: 'Tipo de rubro', visible: true, checked: true },
			{ id: 5, name: 'Tipo de fórmula', visible: true, checked: true },
			{ id: 6, name: 'Valor defecto', visible: true, checked: true },
			{ id: 7, name: 'Orden', visible: true, checked: true },
			{ id: 8, name: 'Ext. contable ', visible: true, checked: true },
			{ id: 9, name: 'Nombre contable', visible: true, checked: true },
			{ id: 10, name: 'Cod. contable', visible: true, checked: true },
			{ id: 11, name: 'Acciones', visible: true, checked: true },
		],
		rows: [],
		params: {
			page: '',
			flagActive: 1,
		},
		lastPage: 0,
		currentPage: 1,
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 400,
		},
	};
}

function created() {
	this.loadData();
}

async function loadData() {
	this.params.page = this.currentPage;
	try {
		const response = await this.$httpSales.get('concepts', { params: this.params });
		this.rows = response.data;
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError('Error');
	}
}

function goToConcept(id) {
	this.goTo('new-concept', { params: { id } });
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

function stateName({ flagActive }) {
	return flagActive ? 'Activa' : 'Inactiva';
}

function closeModal() {
	this.action.open = false;
	this.action.code = null;
	this.action.title = '';
}

function filters(params) {
	this.closeModal();
	const updateParams = { ...params };
	updateParams.search = this.params.search || null;
	this.params = updateParams;
	this.params.flagActive = Number(updateParams.flagActive);
	this.params.flagProvision = Number(updateParams.flagProvision) || null;
	this.loadData();
}

function clearFilter() {
	this.params = {
		conceptTypeId: null,
		flagActive: 1,
		flagProvision: null,
		search: null,
	};
	this.loadData();
}

function getValueByProp(row, prop = 'name') {
	return row ? row[prop] : null;
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.currentPage = 1;
	this.loadData();
}

async function updateFlag(value, id) {
	const body = {
		flagActive: value,
	};
	try {
		await this.$httpSales.patch(`concepts/${id}/flag-active`, body);
		this.showNotification('Se actualizó correctamente');
		this.clearFilter();
	} catch (error) {
		this.showGenericError('Error');
	}
}

export default {
	name: 'concept',
	data,
	created,
	components: {
		appActions,
		headerPage,
		appTable,
		actionSidebar,
		filterConcept,
	},
	methods: {
		loadData,
		runAction,
		goToConcept,
		changePage,
		stateName,
		closeModal,
		filters,
		clearFilter,
		getValueByProp,
		onSearch,
		updateFlag,
	},
};
</script>

