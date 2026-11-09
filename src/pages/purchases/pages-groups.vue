<template>
	<div>
		<header-page :title="$route.meta.title" />
		<app-actions
			:resource-uri="$route.name"
			@open-help="openHelp"
			@run-action="runAction"
		/>
		<general-filter>
			<v-layout wrap align-end my-3>
				<v-flex xs2>
					<app-select
						:items="entities"
						:item="table.params.typeEntityId"
						item-text="name"
						item-value="id"
						label="Tipo de Entidad"
						model="typeEntityId"
						@input="getData"
					/>
				</v-flex>
			</v-layout>
		</general-filter>
		<groups-list
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="rows"
			@on-delete="onDelete"
			@on-page="onPage"
			@open-edit="openEdit"
		/>
		<router-view></router-view>
		<action-sidebar
			:width="action.width"
			:title="action.title"
			:code-action="action.code"
			v-model="action.open"
		>
			<create-group
				:group="groupBody"
				v-if="action.code === 'NG'"
				@cancel-modal="closeModal"
				@create-group="createGroupCustomers"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import appSelect from '@/components/shared/app-select';
import createGroup from '@/components/customers/create-group';
import generalFilter from '@/components/shared/general-filter';
import groupsList from '@/components/purchases/groups-list';
import headerPage from '@/components/shared/header-page';

function created() {
	this.loadResources();
}

function getData({ model, value }) {
	this.table.params[model] = value.id;
	this.loadData();
}

async function loadData(page = 1) {
	this.table.params.page = page;
	this.currentPage = this.table.params.page;
	const params = this.table.params;
	const { data: rows, headers } = await this.$httpSales.get('group', {
		params,
	});
	this.rows = [...rows];
	this.lastPage = Number(headers['x-last-page']);
}

async function loadResources() {
	({ data: this.entities } = await this.$httpSales.get('type-entity'));
	const model = 'typeEntityId';
	const value = this.entities.find((ent) => ent.code === 'CLI');
	this.getData({ model, value });
}

function onDelete({ id, name }) {
	this.goTo('groups-delete', { params: { id, name } });
}

function onPage(page) {
	this.table.params.page = page;
	this.loadData(page);
}

function openEdit({ id }) {
	this.goTo('groups-edit', { params: { id } });
}

function openHelp() {}

function runAction({ code }) {
	if (code === 'NG') {
		this.action.code = code;
		this.action.title = 'Crear Grupo';
		this.action.width = 400;
		this.action.open = true;
	}
}

function closeModal() {
	this.action.open = false;
	this.action.code = '';
	this.groupBody = {
		name: '',
		code: null,
		description: '',
	};
}

async function createGroupCustomers() {
	const body = {
		name: this.groupBody.name,
		code: this.groupBody.code,
		description: this.groupBody.description,
		typeEntityId: this.table.params.typeEntityId,
	};
	try {
		await this.$httpSales.post('group', body);
		this.showNotification('El grupo fue creado correctamente');
		this.closeModal();
		this.loadData();
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'GROUP_EXISTS') {
				this.showGenericError('Codigo ya existe.');
			}
		} else {
			this.showGenericError();
		}
	}
}

function data() {
	return {
		action: {
			active: false,
			code: '',
			open: false,
			title: '',
			width: 600,
		},
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
				name: 'Nombre',
				value: 'name',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Descripción',
				value: 'description',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Acción',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		currentPage: 1,
		groupBody: {
			description: '',
			name: '',
			code: null,
		},
		entities: [],
		lastPage: 0,
		rows: [],
		typeEntityId: 0,
	};
}

export default {
	name: 'groups',
	components: {
		actionSidebar,
		appActions,
		appSelect,
		createGroup,
		generalFilter,
		groupsList,
		headerPage,
	},
	created,
	data,
	methods: {
		closeModal,
		createGroupCustomers,
		getData,
		loadData,
		loadResources,
		onDelete,
		onPage,
		openEdit,
		openHelp,
		runAction,
	},
	watch: {
		$route(newVal) {
			if (newVal) {
				if (newVal.name === 'groups') {
					this.loadData();
				}
			}
		},
	},
};
</script>
