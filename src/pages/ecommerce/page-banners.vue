<template>
	<div>
		<header-page
			name="banners-ecommerce"
			:title="titlePage"
		></header-page>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<v-layout wrap pa-4 v-if="!id">
			<v-flex xs2 pr-3>
				<v-select
					class="filter-select shadow-inset mt-3"
					item-text="name"
					item-value="id"
					label="Comercio"
					v-model="params.commerceId"
					:items="listCommerce"
				></v-select>
			</v-flex>
			<v-flex xs1 mr-3 pt-3>
				<v-btn
					class="btn-action white--text"
					color="success"
					@click="loadData(1)"
				>
					Filtrar
				</v-btn>
			</v-flex>	
			<v-flex xs1 pt-3>
				<v-btn
					class="btn-action white--text"
					color="error"
					@click="clearData"
				>
					Limpiar
				</v-btn>
			</v-flex>
		</v-layout>
		<div class="overflow-auto mt-4">
			<app-table
				name="banners-ecommerce-table"
				:columns="columns"
				:rows="data"
				:current-page="currentPage"
				:last-page="lastPage"
				class="is-not-selectable"
				@on-page="changePage"
				@on-search-event="onSearch"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.row.order }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.title }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.description }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.mobileLink }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.webLink }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.typeName }}</td>
					<td v-show="showRow(columns, 7)">{{ props.row.commerceName }}</td>
					<td
						class="td-action"
						v-show="showRow(columns, 8)"
						@click.stop="stopClick"
					>
						<v-tooltip top>
							<v-switch
								slot="activator"
								class="switch-inline"
								hide-details
								color="success"
								v-model="props.row.virtualActive"
								@change="flagBanner($event,props.row.id)"
							></v-switch>
							<span>{{ stateName(props.row) }}</span>
						</v-tooltip>
						<app-tooltip-button
							color="success"
							icon="edit"
							text="Editar"
							@click-icon="editBanner(props.row.id)"
						/>
						<app-tooltip-button
							color="error"
							icon="delete"
							text="Eliminar"
							@click-icon="runAction({ code: 'delete' }, props.row)"
						/>
					</td>	
				</template>
			</app-table>
		</div>
		<action-sidebar
			:title="action.title"
			:value="action.open"
			:width="action.width"
			@close-modal="closeModal"
		>
			<delete-banner-form
				v-if="isActionCode('delete')"
				:name="bannerName"
				@on-close="closeModal"
				@on-delete="deleteBanner"
			/>
		</action-sidebar>
	</div>
</template>
<script>
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import appTable from '@/components/shared/table/app-table';
import deleteBannerForm from '@/components/ecommerce/delete-banner-form';
import headerPage from '@/components/shared/header-page';

function data() {
	return {
		action: {
			code: '',
			open: false,
			title: '',
			width: 400,
		},
		bannerId: null,
		bannerName: '',
		columns: [
			{ id: 1, name: 'Orden', value: 'order', visible: true },
			{ id: 2, name: 'Título', value: 'title', visible: true },
			{ id: 3, name: 'Descripción', value: 'description', visible: true },
			{ id: 4, name: 'Link(App)', value: 'mobileLink', visible: true },
			{ id: 5, name: 'Link(Web)', value: 'webLink', visible: true },
			{ id: 6, name: 'Tipo', value: 'typeName', visible: true },
			{ id: 7, name: 'Comercio', value: 'commerceId', visible: true },
			{ id: 8, name: 'Acciones', value: 'Action', visible: true },
		],
		data: [],
		params: {
			page: '',
			commerceId: null,
		},
		currentPage: 1,
		lastPage: 0,
		listCommerce: [],
	};
}

function created() {
	this.params.commerceId = this.id ? Number(this.id) : null;
	this.loadData();
	this.loadCommerce();
}

function changePage(page) {
	this.loadData(page);
}

function closeModal() {
	this.action.open = false;
	this.action.code = '';
	this.action.title = '';
	this.action.width = 400;
	this.bannerId = null;
	this.bannerName = '';
}

async function deleteBanner() {
	try {
		await this.$httpProducts.delete(`banners/${this.bannerId}`);
		this.showNotification('El banner eliminó correctamente');
		this.closeModal();
		this.loadData();
	} catch (error) {
		this.showGenericError();
	}
}

function editBanner(id) {
	const query = {
		origin: { name: 'banner' },
		name: this.$route.query.name,
		navigationValidation: 1,
	};
	if (this.id) {
		query.back = this.$route.query.origin;
		query.origin = {
			name: 'banner',
			params: { id: this.id },
			query: { origin: this.$route.query.origin, name: this.$route.query.name },
		};
		delete query.navigationValidation;
	}
	this.goTo('edit-banner', { params: { id, commerceId: this.id }, query: { ...query } });
}

async function flagBanner(flagActive, id) {
	const body = { flagActive };
	try {
		await this.$httpProducts.patch(`banners/${id}/active`, body);
		this.showNotification('El estado ha sido modificado correctamente.');
		this.loadData();
	} catch (error) {
		if (error.status === 500) {
			this.showGenericError();
		}
	}
}

function isActionCode(code) {
	return this.action.code === code;
}

async function loadData(page = 1) {
	this.currentPage = page;
	this.params.page = page;
	try {
		const { data: response, headers } = await this.$httpProducts.get('banners',
			{ params: this.params });
		this.data = [...response];
		this.lastPage = Number(headers['x-last-page']);
	} catch (error) {
		this.showGenericError('Error');
	}
}

function onSearch(search) {
	this.params.search = search ? search.trim() : null;
	this.loadData();
}

function runAction({ code }, row) {
	if (code === 'BE') {
		const query = {
			origin: { name: 'banner' },
			name: this.$route.query.name,
			navigationValidation: 1,
		};
		if (this.id) {
			query.back = this.$route.query.origin;
			query.origin = {
				name: 'banner',
				params: { id: this.id },
				query: { origin: this.$route.query.origin, name: this.$route.query.name },
			};
			delete query.navigationValidation;
		}
		this.goTo('new-banner', { params: { commerceId: this.id }, query: { ...query } });
	} else if (code === 'delete') {
		this.action.code = code;
		this.action.title = 'Eliminar Banner';
		this.action.width = 400;
		this.action.open = true;
		this.bannerId = row.id;
		this.bannerName = row.title;
	}
}

function stateName({ virtualActive }) {
	return virtualActive ? 'Activo' : 'Inactivo';
}

async function loadCommerce() {
	({ data: this.listCommerce } = await this.$httpSales.get('com-ecommerce-companies'));
}

function clearData() {
	this.params.commerceId = null;
	this.loadData(1);
}

function titlePage() {
	if (this.id && this.$route.query.name) {
		return `Banners - ${this.$route.query.name}`;
	}
	return 'Banners';
}

function watchRoute(value) {
	if (value) {
		this.params.commerceId = value.params.id ? this.id : null;
		this.loadData();
	}
}

export default {
	name: 'banners',
	components: {
		actionSidebar,
		appTable,
		appActions,
		deleteBannerForm,
		headerPage,
	},
	computed: {
		titlePage,
	},
	created,
	data,
	methods: {
		changePage,
		closeModal,
		deleteBanner,
		editBanner,
		flagBanner,
		isActionCode,
		loadData,
		onSearch,
		runAction,
		stateName,
		loadCommerce,
		clearData,
	},
	props: {
		id: [Number, String],
	},
	watch: {
		$route: {
			deep: true,
			handler: watchRoute,
		},
	},
};
</script>

