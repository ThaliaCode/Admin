<template>
	<div class="page-customers">
		<header-page
			name="page-customers"
			title="Clientes"
		/>
		<v-layout column pt-3>
			<v-flex xs3 px-5>
				<label class="label-header">Rango de Puntos</label>
			</v-flex>
			<v-flex>
				<v-flex xs3 class="flex">
					<v-layout row wrap my-2 px-5 align-center >
						<v-flex xs4>
							<app-input-text
								model="initialPoint"
								type="number"
								:text="params.initialPoint"
								@input="setDataPoint"
							/>
						</v-flex>
						<v-flex xs1 class="label-header" text-xs-center>a</v-flex>
						<v-flex xs4>
							<app-input-text
								model="lastPoint"
								type="number"
								:text="params.lastPoint"
								:disabled="!params.initialPoint"
								@input="setDataPoint"
							/>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-flex>
		</v-layout>
		<div class="px-4 mt-4">
			<app-table
				name="loyalty-products"
				:columns="columns"
				:current-page="currentPage"
				:last-page="lastPage"
				:rows="rows"
				:clean-search="isClean"
				:items-total-quantity="totalItems"
				:items-quantity="totalItemsVisible"
				@on-page="loadClients($event)"
				@on-search-event="searchEvent"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">{{ props.row.typePerson ? props.row.typePerson.fullName : null }}</td>
					<td v-show="showRow(columns, 2)">{{ props.row.point }}</td>
					<!-- <td v-show="showRow(columns, 3)" class="py-2">
						<app-tooltip-button
							img="/static/img/gift-box.svg"
							text="Canjear"
							color="success"
							height="18"
							@click-icon="openModal"
						/>
						<app-tooltip-button
							color="error"
							icon="delete"
							text="Eliminar"
							@click="openDialogDelete(propw.row)"
						></app-tooltip-button>
					</td> -->
				</template>
			</app-table>
		</div>
		<v-dialog
			v-model="dialogFilter"
			persistent
			max-width="410"
		>
			<modal-items
				v-if="dialogFilter"
				title="Canjear"
				name-action="Guardar"
				show-slot
				@close-modal="closeModal"
				@action-modal="saveFilter"
			>
				<div class="py-3 px-4 modal-customers">
					<p class="mb-0 modal__text">Premios</p>
					<v-radio-group
						colums
						v-model="selectPrize"
						hide-details
					>
						<v-radio
							v-for="p in prizes"
							class="mb-2"
							:key="p.id"
							:label="p.name"
							:value="p.id"
							color="success"
						>
						</v-radio>
				</v-radio-group>
				</div>
			</modal-items>
		</v-dialog>
		<v-dialog
			v-model="dialogDeleteCustomer"
			persistent
			max-width="360"
		>
			<v-card>
				<v-card-title class="headline">Eliminar Cliente</v-card-title>
				<v-divider></v-divider>
				<v-card-text>
					{{ deleteMessage }}
				</v-card-text>
				<v-card-actions>
					<v-layout row wrap>
						<v-flex xs6 pr-2
							text-xs-right>
							<v-btn
								color="info"
								class="btn-action white--text"
								@click.native="closeDialog">
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-2
							text-xs-left>
							<v-btn
								color="error"
								class="btn-action white--text">
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
import modalItems from '@/components/shared/modal-items';

function created() {
	this.loadClients();
}

async function loadClients(page = 1) {
	this.currentPage = page;
	this.params.page = this.currentPage;
	this.params.subsidiaryId = this.$userInfo.subsidiary.id;
	const params = { ...this.params };
	try {
		const { data: customers, headers } = await this.$httpSales.get('customers', { params });
		this.rows = [...customers];
		this.lastPage = Number(headers['x-last-page']);
		this.totalItems = Number(headers['x-quantity']);
	} catch (error) {
		this.showGenericError();
	}
}

function totalItemsVisible() {
	return this.rows.length;
}

function searchEvent(search) {
	this.params.search = search ? search.trim() : null;
	this.loadClients();
}

function saveFilter() {}

function openModal() {
	this.dialogFilter = true;
}

function closeModal() {
	this.dialogFilter = false;
}

function setDataPoint({ model, value }) {
	this.params[model] = value;
	if (this.params.initialPoint && !this.params.lastPoint) {
		this.showNotification('Es necesario elegir un rango de puntos para realizar el filtro por puntos.', 'warning');
	} else {
		this.loadClients();
	}
}

function openDialogDelete({ id, name }) {
	this.clientId = id;
	this.deleteMessage = `¿Desea eliminar el cliente ${name}?`;
	this.dialogDeleteCustomer = true;
}

function closeDialog() {
	this.dialogDeleteCustomer = false;
	this.clientId = null;
}

function data() {
	return {
		clientId: null,
		columns: [
			{
				id: 1,
				name: 'Nombre/Razón Social',
				value: 'name',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Puntos',
				value: 'point',
				checked: true,
				visible: true,
			},
			// {
			// 	id: 3,
			// 	name: 'Acciones',
			// 	value: 'actions',
			// 	checked: true,
			// 	visible: true,
			// },
		],
		currentPage: 1,
		deleteMessage: null,
		dialogDeleteCustomer: false,
		lastPage: 0,
		params: {
			initialPoint: 0,
			lastPoint: 0,
			points: null,
			desac: false,
			subsidiaryId: null,
		},
		rows: [],
		isClean: false,
		totalItems: 0,
		dialogFilter: false,
		prizes: [
			{
				id: 1,
				name: 'Premio 1',
			},
			{
				id: 2,
				name: 'Premio 2',
			},
		],
		selectPrize: null,
	};
}

export default {
	name: 'page-prizes',
	data,
	created,
	components: {
		appTable,
		headerPage,
		modalItems,
	},
	computed: {
		totalItemsVisible,
	},
	methods: {
		closeDialog,
		loadClients,
		searchEvent,
		setDataPoint,
		openDialogDelete,
		openModal,
		saveFilter,
		closeModal,
	},
};
</script>
<style lang="scss" scoped>
	.modal__text {
		color: color(primary);
		font-weight: bold;
	}

	.label-header {
		color: color(brown-grey);
		font-size: map-get($sizes, small13);
	}
</style>