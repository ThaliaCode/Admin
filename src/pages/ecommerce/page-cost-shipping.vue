<template>
	<div>
		<header-page
			:title="$route.meta.title"
			name="cost-shipping"
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
				:last-page="lastPage"
				:current-page="currentPage"
				@on-page="changePage"
				@on-search-event="onSearch"
				class="is-not-selectable"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.row.from }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.to }}</td>
					<td v-show="showRow(columns, 3)">{{ props.row.price + (props.row.taxAmount || 0) | round }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.ubigeoName ?  props.row.ubigeoName.provincesName : null }}</td>
					<td v-show="showRow(columns, 5)">{{ props.row.ubigeoName ?  props.row.ubigeoName.citiesName : null }}</td>
					<td v-show="showRow(columns, 6)">{{ props.row.ubigeoName ?  props.row.ubigeoName.parishesName : null }}</td>
					<td v-show="showRow(columns, 7)">
						<v-tooltip top>
							<v-btn
								slot="activator"
								icon
								@click.native="editCost(props.row.id)"
							>
								<v-icon color="success">create</v-icon>
							</v-btn>
							<span>Editar</span>
						</v-tooltip>
						<v-tooltip top>
							<v-btn
								slot="activator"
								icon
								@click.native="openDialog(props.row.id)"
							>
								<v-icon color="error">delete</v-icon>
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
				<cost-new
					v-if="action.code === 'COS'"
					:department="departaments"
					:currencies="currencies"
					:id="editId"
					@update="updateCost"
					@close-modal="closeModal"
				/>
		</action-sidebar>
		<v-dialog
			v-model="dialog"
			persistent
			max-width="360">
			<v-card>
				<v-card-title class="headline">Eliminar Costo de Envió</v-card-title>
				<v-divider></v-divider>
				<v-card-text>
					¿Desea eliminar el costo de envió?
				</v-card-text>
				<v-card-actions>
					<v-layout row wrap>
						<v-flex xs6 pr-2
							text-xs-right>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="cancelDelete">
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-2
							text-xs-left>
							<v-btn
								color="error"
								class="btn-action white--text"
								@click.native="deleteCost">
								Eliminar
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
import appTable from '@/components/shared/table/app-table';
import appActions from '@/components/shared/app-actions';
import actionSidebar from '@/components/shared/action-sidebar';
import costNew from '@/components/ecommerce/cost-new';

function changePage(page) {
	this.currentPage = page;
	this.loadCost();
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.currentPage = 1;
	this.loadCost();
}

function runAction({ code }) {
	this.action.open = true;
	this.action.title = 'Costo de Envío';
	this.action.code = code;
}

function closeModal() {
	this.action.open = false;
	this.action.code = null;
	this.action.title = '';
	this.editId = null;
	this.dialog = false;
}

function created() {
	this.loadData();
	this.loadCost();
}

async function loadData() {
	const requests = [
		this.getCurrencies(),
		this.$httpSales.get('province'),
	];
	try {
		[
			{ data: this.currencies },
			{ data: this.departaments },
		] = await Promise.all(requests);
	} catch (error) {
		this.showGenericError();
	}
}

async function loadCost() {
	this.params.page = this.currentPage;
	try {
		const response = await this.$httpProducts.get('weight', { params: this.params });
		this.rows = response.data;
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

function editCost(id) {
	this.editId = id;
	this.action.open = true;
	this.action.title = 'Editar Costo de Envió';
	this.action.code = 'COS';
}

function openDialog(id) {
	this.dialog = true;
	this.editId = id;
}

function cancelDelete() {
	this.dialog = false;
	this.editId = null;
}

async function deleteCost() {
	try {
		await this.$httpProducts.delete(`weight/${this.editId}`);
		this.showNotification('Se eliminó correctamente');
		this.closeModal();
		this.loadCost();
	} catch (error) {
		this.showGenericError();
	}
}

function updateCost() {
	this.closeModal();
	this.loadCost();
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Peso Minimo', visible: true, checked: true },
			{ id: 2, name: 'Peso Maximo', visible: true, checked: true },
			{ id: 3, name: 'Precio', visible: true, checked: true },
			{ id: 4, name: 'Departamento', visible: true, checked: true },
			{ id: 5, name: 'Provincia', visible: true, checked: true },
			{ id: 6, name: 'Distrito', visible: true, checked: true },
			{ id: 7, name: 'Acciones', visible: true, checked: true },
		],
		rows: [],
		params: {
			page: '',
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
		currencies: [],
		departaments: [],
		editId: null,
		dialog: false,
	};
}
export default {
	name: 'cost-shipping',
	data,
	components: {
		headerPage,
		appActions,
		appTable,
		actionSidebar,
		costNew,
	},
	created,
	methods: {
		changePage,
		onSearch,
		runAction,
		closeModal,
		loadData,
		loadCost,
		editCost,
		openDialog,
		cancelDelete,
		deleteCost,
		updateCost,
	},
};
</script>

