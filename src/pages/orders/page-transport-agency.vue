<template>
	<div>
		<header-page
			:title="$route.meta.title"
		/>
		<app-actions
			:resource-uri="$route.name"
			@open-help="openHelp"
			@run-action="runAction"
		/>
		<v-flex px-4 mt-3>
			<app-table
				name="table-agency"
				:current-page="currentPage"
				:last-page="lastPage"
				:rows="rows"
				:columns="columns"
				class="is-not-selectable"
				:items-quantity="rows.length"
				:items-total-quantity="totalAgency"
				@on-search-event="onSearchEvent"
				@on-page="changePage"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.rzSocial }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.mainAddress }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.typePerson.documentName }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.number }}</td>
					<td v-show="showRow(columns, 7)">{{ props.row.phone }}</td>
					<td v-show="showRow(columns, 8)">
						<app-tooltip-button
							color="success"
							icon="edit"
							text="Editar"
							@click-icon="goToEdit(props.row)"
						/>
						<app-tooltip-button
							color="error"
							icon="close"
							text="Eliminar"
							@click-icon="openDialogDelete(props.row)"
						/>
					</td>
				</template>
			</app-table>
		</v-flex>
		<v-dialog
			v-model="dialogDelete"
			persistent
			max-width="450"
		>
			<v-card>
				<v-card-text class="subtext">
					{{ textDialog }}
				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions class="btn-block">
					<v-layout row wrap>
						<v-flex xs6 pr-1 text-xs-right>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click="closeDialog"
								>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-1
							text-xs-left>
							<v-btn
								color="error"
								class="btn-action white--text"
								@click.native="deleteAgency"
							>
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
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';

function created() {
	this.loadAgencies();
}

async function loadAgencies(page = 1) {
	this.params.page = page;
	try {
		const { data: listAgencies, headers } = await this.$httpSales.get('transport-agency', { params: this.params });
		this.rows = listAgencies;
		this.lastPage = Number(headers['x-last-page']);
		this.totalAgency = Number(headers['x-quantity']);
	} catch (error) {
		this.showGenericError();
	}
}

function onSearchEvent(search) {
	this.params.search = search ? search.trim() : null;
	this.loadAgencies();
}
function changePage(page) {
	this.currentPage = page;
	this.loadAgencies(page);
}

function runAction({ code }) {
	if (code === 'new-agency') {
		this.goTo('page-new-agency');
	}
}

function goToEdit({ id }) {
	this.goTo('page-new-agency', { params: { id } });
}

function openDialogDelete({ name, id }) {
	this.dialogDelete = true;
	this.textDialog = `¿Desea elimina la agencia ${name}?`;
	this.idAgency = id;
}

function closeDialog() {
	this.idAgency = null;
	this.dialogDelete = false;
}

async function deleteAgency() {
	try {
		await this.$httpSales.delete(`transport-agency/${this.idAgency}`);
		this.closeDialog();
		this.showNotification('La agencia se elimino correctamente');
		this.loadAgencies();
	} catch (e) {
		this.showGenericError();
	}
}

function data() {
	return {
		currentPage: 1,
		dialogDelete: false,
		idAgency: null,
		listAgencies: [],
		rows: [],
		columns: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'code', visible: true, checked: true },
			{ id: 3, name: 'Razón Social', value: 'rzSocial', visible: true, checked: false },
			{ id: 4, name: 'Dirección Principal', value: 'direction', visible: true, checked: false },
			{ id: 5, name: 'Tipo Doc', value: 'type', visible: true, checked: false },
			{ id: 6, name: 'Documento', value: 'type', visible: true, checked: false },
			{ id: 7, name: 'Teléfono', value: 'type', visible: true, checked: false },
			{ id: 8, name: 'Acciones', value: 'type', visible: true, checked: false },
		],
		lastPage: 0,
		params: {
			search: null,
			page: 1,
			limit: 20,
		},
		textDialog: '',
		totalAgency: 0,
	};
}

export default {
	name: 'page-transport-agency',
	created,
	data,
	components: {
		actionSidebar,
		appActions,
		appTable,
		headerPage,
	},
	methods: {
		changePage,
		closeDialog,
		deleteAgency,
		goToEdit,
		loadAgencies,
		runAction,
		openDialogDelete,
		onSearchEvent,
	},
};
</script>

<style lang="scss" scoped>

</style>
