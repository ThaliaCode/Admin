<template>
  <div>
		<header-page title="Relacion de Trabajo"></header-page>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<div class="mt-5">
			<app-table
				:rows="rows"
				:filter-columns="false"
				:columns="columns"
				class="is-not-selectable"
				:last-page="lastPage"
				:current-page="currentPage"
				@on-page="changePage"
				@on-search-event="onSearch"
			>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)" class="is-not-selectable">
					{{ props.row.name }}
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.code }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.description }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.typeIes.name }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.observation }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.iesValid.name }}</td>
				<td v-show="showRow(columns, 7)">{{ valueIece(props.row) }}</td>
				<td v-show="showRow(columns, 8)">{{ valueSecap(props.row) }}</td>
				<td v-show="showRow(columns, 9)">
					<v-tooltip top>
						<v-btn
							slot="activator"
							@click="editRelationship(props.row.id)"
							icon>
							<v-icon color="green">create</v-icon>
						</v-btn>
						<span>Editar</span>
					</v-tooltip>
					<v-tooltip top>
						<v-btn
							slot="activator"
							icon
							@click="openConfirmDelete(props.row)"
						>
							<v-icon color="red">delete</v-icon>
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
				@close-modal="closeModal">
				<create-working-relationship
					v-if="action.code === 'new-create-working-relationship'"
					@close-modal="closeModal"
					:id="id"
					:id-working="idRelationship"
					@update="updateWorking"
					:name="code"
				></create-working-relationship>
			</action-sidebar>
			<v-dialog v-model="dialog" persistent max-width="390">
				<modal-items
					:title="dialogMessage"
					name-action="Eliminar"
					name-cancel="Cerrar"
					v-if="dialog"
					show-slot
					@close-modal="closeDialog"
					@action-modal="deleteRelationship"
				></modal-items>
			</v-dialog>
		</div>
	</div>
</template>

<script>
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import createWorkingRelationship from '@/components/payroll/create-working-relationship';
import modalItems from '@/components/shared/modal-items';

async function deleteRelationship() {
	try {
		await this.$httpSales.delete(`type-employer/${this.id}/type-working/${this.idWork}`);
		this.showNotification('Se elimino correctamente');
		this.closeDialog();
		this.listWorking();
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'TYPE_WORKING_RELATIONSIP_ASSOCIATED') {
				this.showGenericError('Esta relacionado a un empleado');
			}
		} else {
			this.showGenericError();
		}
	}
}

function closeDialog() {
	this.dialog = false;
	this.idWork = '';
}

function editRelationship(value) {
	this.action.code = 'new-create-working-relationship';
	this.action.open = true;
	this.action.title = 'Editar Relacion';
	this.action.width = 570;
	this.idRelationship = value;
}

function openConfirmDelete({ id, name }) {
	this.dialogMessage = `¿Desea eliminar '${name}'?`;
	this.dialog = true;
	this.idWork = id;
}

function changePage(page) {
	this.currentPage = page;
	this.listWorking();
}

function updateWorking() {
	this.closeModal();
	this.listWorking();
}

function created() {
	this.listWorking();
}

async function listWorking() {
	this.params.page = this.currentPage;
	const response = await this.$httpSales.get(`/type-employer/${this.id}/type-working`, { params: this.params });
	this.rows = response.data.map((row) => {
		const newRow = { ...row };
		newRow.typeIes = row.typeIes || {};
		newRow.iesValid = row.iesValid || {};
		return newRow;
	});
	this.lastPage = Number(response.headers['x-last-page']);
}

function runAction({ code, name }) {
	if (code === 'new-create-working-relationship') {
		this.action.code = code;
		this.action.open = true;
		this.action.title = name;
		this.action.width = 570;
	}
}

function closeModal() {
	this.idRelationship = null;
	this.action.open = false;
	this.action.code = null;
	this.action.title = '';
}

function valueIece({ flagIece }) {
	return flagIece ? 'Sí' : 'No';
}

function valueSecap({ flagSecap }) {
	return flagSecap ? 'Sí' : 'No';
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.currentPage = 1;
	this.listWorking();
}

function data() {
	return {
		dialogMessage: '',
		dialog: false,
		idWork: '',
		idRelationship: null,
		lastPage: 0,
		currentPage: 1,
		params: {
			page: null,
			search: null,
		},
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 570,
		},
		rows: [],
		columns: [
			{ id: 1, name: 'Nombre de la Empresa', value: 'name', visible: true, checked: true },
			{ id: 2, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 3, name: 'Descripción', value: 'description', visible: true, checked: true },
			{ id: 4, name: 'Tipo', value: 'iesTypeId', visible: true, checked: true },
			{ id: 5, name: 'Aporte', value: 'observation', visible: true, checked: true },
			{ id: 6, name: 'Válida', value: 'value', visible: true, checked: true },
			{ id: 7, name: 'IECE', value: 'flagIece', visible: true, checked: true },
			{ id: 8, name: 'SECAP', value: 'flagSecap', visible: true, checked: true },
			{ id: 9, name: 'Acciones', value: 'action', visible: true, checked: true },
		],
	};
}

export default {
	name: 'page-working-relationship',
	data,
	created,
	props: {
		id: {
			type: [Number, String],
		},
		code: {
			type: [Number, String],
		},
	},
	methods: {
		deleteRelationship,
		closeDialog,
		openConfirmDelete,
		editRelationship,
		changePage,
		closeModal,
		listWorking,
		runAction,
		updateWorking,
		valueIece,
		valueSecap,
		onSearch,
	},
	components: {
		actionSidebar,
		appActions,
		appTable,
		headerPage,
		createWorkingRelationship,
		modalItems,
	},
};
</script>
