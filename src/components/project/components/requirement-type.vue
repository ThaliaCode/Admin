<template>
	<div>
		<header-page :title="$route.meta.title" />
		<div class="overflow-auto">
			<app-table
				:rows="rows"
				:columns="columns"
				:input-search="false"
				:filter-columns="false"
			>
				<template slot="rows" slot-scope="props">
					<td>{{ props.row.name }}</td>
					<td>{{ props.row.code }}</td>
					<td>{{ props.row.description }}</td>
					<td>
						<app-tooltip-button
							color="green"
							icon="edit"
							text="Editar"
							@click-icon="openModal(props.row.id)"
						>
						</app-tooltip-button>
						<app-tooltip-button
							color="red"
							icon="delete"
							text="Eliminar"
							@click="remove(props.row)"
						>
						</app-tooltip-button>
					</td>
				</template>
			</app-table>
		</div>
		<quick-actions

			:actions="actions"
			@open-modal="openModal()" />
		<action-sidebar
			title="Tipo de Requerimiento"
			v-model="showModal"
			:width="500"
		>
			<v-form>
				<v-container class="grid-list-lg">
					<v-layout wrap>
						<v-flex xs12 sm6 md6 lg6>
							<v-text-field
								class="filter-select mb-4"
								label="Nombre"
								single-line
								required
								v-model="model.name"
							>
							</v-text-field>
						</v-flex>
						<v-flex xs12 sm6 md6 lg6>
							<v-text-field
								class="filter-select mb-4"
								label="Código"
								single-line
								required
								v-model="model.code"
							>
							</v-text-field>
							<span
								class="text-not-code-blank"
								v-if="checkBlankCode(model.code)">
								No se permite espacios en blanco
							</span>
						</v-flex>
						<v-flex xs12>
							<v-text-field
								class="filter-select mb-4"
								label="Descripción"
								single-line
								v-model="model.description"
							>
							</v-text-field>
						</v-flex>
					</v-layout>
				</v-container>
				<section class="modal-filter-footer">
					<modal-sidebar-button
						:is-loading="$v.model.$invalid || checkBlankCode(model.code)"
						@cancel-button-clicked="closeModal"
						@accept-button-clicked="save"
					>
					</modal-sidebar-button>
				</section>
			</v-form>
		</action-sidebar>
	</div>
</template>

<script>

import { required } from 'vuelidate/lib/validators';
import actionSidebar from '@/components/shared/action-sidebar';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import quickActions from '@/components/shared/quick-actions';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.loadData();
}

async function loadData() {
	const { data: types } = await this.$httpProduction.get('type-requirements');
	this.rows = types;
}

function closeModal() {
	this.model = { name: '', code: '', description: '' };
	this.selectedTypeRequirement.id = null;
	this.showModal = false;
}

function data() {
	return {
		actions: [
			{
				active: true,
				code: 'CR',
				color: '#2db6f5',
				img: `${this.$imageUrl}/icon-new-requirement.svg`,
				text: 'NUEVO TIPO DE REQUERIMIENTO',
			},
		],
		columns: [
			{ id: 1, name: 'Nombre', visible: true },
			{ id: 2, name: 'Código', visible: true },
			{ id: 3, name: 'Descripción', visible: true },
			{ id: 4, name: 'Acciones', visible: true },
		],
		model: {
			code: '',
			description: '',
			name: '',
		},
		rows: [],
		selectedTypeRequirement: {
			id: null,
		},
		showModal: false,
	};
}

async function openModal(id) {
	if (id) {
		const { data: typeRequirement } = await this.$httpProduction.get(`type-requirements/${id}`);
		this.selectedTypeRequirement.id = typeRequirement.id;
		this.model = {
			name: typeRequirement.name,
			code: typeRequirement.code,
			description: typeRequirement.description,
		};
		this.showModal = true;
	}
	this.showModal = true;
}

async function remove({ id }) {
	await this.$httpProduction.delete(`type-requirements/${id}`);
	this.showNotification('Tipo de requerimiento eliminado');
	this.loadData();
}

async function save() {
	const { id } = this.selectedTypeRequirement;
	const url = id ? `type-requirements/${id}` : 'type-requirements';
	const method = id ? 'patch' : 'post';
	await this.$httpProduction[method](url, this.model);
	this.showModal = false;
	this.model = { name: '', code: '', description: '' };
	this.selectedTypeRequirement.id = null;
	this.loadData();
}

export default {
	name: 'requirement-type',
	components: {
		actionSidebar,
		appTable,
		headerPage,
		modalSidebarButton,
		quickActions,
	},
	created,
	data,
	methods: {
		closeModal,
		loadData,
		openModal,
		remove,
		save,
	},
	validations: {
		model: {
			code: { required },
			name: { required },
		},
	},
};
</script>
