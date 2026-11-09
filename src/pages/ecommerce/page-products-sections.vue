<template>
	<div>
		<header-page
			name="products-sections"
			:title="$route.meta.title"
		/>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<products-sections-list
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:loading="loading"
			:rows="rows"
			@on-page="loadData"
			@on-search="onSearch"
			@on-switch="onSwitch"
			@click-icon="onClickIcon"
		/>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:header-color="action.color"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			@close-modal="cancelModal">
			<create-section
				v-if="isActionCode('CSE', 'edit')"
				:id="sectionId"
				:loading="loading"
				@close="cancelModal"
				@save="save"
			/>
			<section-delete-form
				v-if="isActionCode('delete')"
				:name="sectionName"
				:loading="loading"
				@close="cancelModal"
				@on-delete="onDelete"
			/>
		</action-sidebar>
	</div>
</template>
<script>
import appActions from '@/components/shared/app-actions';
import actionSidebar from '@/components/shared/action-sidebar';
import createSection from '@/components/ecommerce/create-sections';
import headerPage from '@/components/shared/header-page';
import productsSectionsList from '@/components/ecommerce/products-sections-list';
import sectionDeleteForm from '@/components/ecommerce/section-delete-form';

function created() {
	this.loadData();
}

function cancelModal() {
	this.action.open = false;
	this.action.code = '';
	this.action.title = '';
	this.sectionId = null;
	this.sectionName = '';
}

function isActionCode(code, anotherCode) {
	return this.action.code === code || this.action.code === anotherCode;
}

async function loadData(page = 1) {
	this.currentPage = page;
	this.params.page = this.currentPage;
	try {
		const { data: response, headers } = await this.$httpProducts.get('sections',
			{ params: this.params });
		this.lastPage = Number(headers['x-last-page']);
		this.rows = [...response];
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function onClickIcon({ code, row }) {
	const name = code === 'edit' ? 'Editar Sección' : 'Eliminar Sección';
	({ id: this.sectionId, name: this.sectionName } = row);
	this.runAction({ code, name });
}

async function onDelete() {
	try {
		await this.$httpProducts.delete(`sections/${this.sectionId}`);
		this.showNotification('La sección ha sido eliminada correctamente.');
		this.cancelModal();
		this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function onSearch(search) {
	this.params.search = search ? search.trim() : null;
	this.loadData();
}

async function onSwitch({ id, flagActive }) {
	this.loading = true;
	const body = { flagActive: !!flagActive };
	try {
		await this.$httpProducts.patch(`sections/${id}/active`, body);
		this.showNotification('El estado de la sección ha sido actualizado correctamente.');
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
		this.loadData();
	}
}

function runAction({ code, name }) {
	this.action.code = code;
	this.action.title = name;
	this.action.width = 450;
	this.action.open = true;
}

async function save(model) {
	this.loading = true;
	const method = this.sectionId ? 'patch' : 'post';
	const url = this.sectionId ? `sections/${this.sectionId}` : 'sections';
	const body = {
		code: model.code,
		description: model.description,
		name: model.name,
		order: model.order,
		urlImage: model.urlImage,
	};
	const message = this.sectionId ? 'actualizada' : 'creada';
	try {
		await this.$httpProducts[method](url, body);
		this.showNotification(`La sección ha sido ${message} correctamente.`);
		this.cancelModal();
		this.loadData();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

function data() {
	return {
		action: {
			code: null,
			open: false,
			title: '',
			width: 500,
		},
		columns: [
			{ id: 1, name: 'Orden', value: 'order', checked: true, visible: true },
			{ id: 2, name: 'Título', value: 'title', checked: true, visible: true },
			{ id: 3, name: 'Descripción', value: 'description', checked: true, visible: true },
			{ id: 4, name: 'Acciones', value: 'action', checked: true, visible: true, flagVisible: true },
		],
		currentPage: 1,
		lastPage: 0,
		loading: false,
		params: {
			limit: 20,
			page: 1,
			search: null,
		},
		rows: [],
		sectionId: null,
		sectionName: '',
	};
}

export default {
	name: 'products-sections',
	components: {
		actionSidebar,
		appActions,
		createSection,
		headerPage,
		productsSectionsList,
		sectionDeleteForm,
	},
	created,
	data,
	methods: {
		cancelModal,
		isActionCode,
		loadData,
		onClickIcon,
		onDelete,
		onSearch,
		onSwitch,
		runAction,
		save,
	},
};
</script>
