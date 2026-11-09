<template>
	<div>
		<div v-if="$route.name === 'actions-list'">
			<header-page :title="$route.meta.title"></header-page>
			<app-actions :resource-uri="$route.name" @run-action="runAction" />
			<!-- <v-layout row align-end px-4 mt-4>
				<v-flex xs2>
					<app-select
						label="Estado"
						:items="states"
						item-text="name"
						item-value="id"
					/>
				</v-flex>
			</v-layout> -->
			<div class="mt-3">
				<app-table
					:rows="rows"
					:columns="columns"
					:last-page="lastPage"
					:current-page="currentPage"
					:items-quantity="rows.length"
					:items-total-quantity="itemsTotalQuantity"
					@on-page="changePage"
					@on-search-event="onSearch"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)" class="is-not-selectable">
							{{ props.row.code }}
						</td>
						<td v-show="showRow(columns, 2)">{{ props.row.description }}</td>
						<td v-show="showRow(columns, 3)">{{ props.row.typeActionName }}</td>
						<td v-show="showRow(columns, 4)">{{ countProduct(props.row.products) }}</td>
						<td v-show="showRow(columns, 5)">{{ props.row.quantity }}</td>
						<!-- <td v-show="showRow(columns, 6)">{{ props.row.quantityBase }}</td> -->
						<td v-show="showRow(columns, 7)">{{ props.row.amount }}</td>
						<td v-show="showRow(columns, 8)">
							<v-tooltip top>
								<v-switch
									slot="activator"
									class="switch-inline"
									hide-details
									color="success"
									v-model="props.row.flagActive"
									@change="changeActive(props.row.id, $event)"
								></v-switch>
								<span>{{ stateName(props.row) }}</span>
							</v-tooltip>
						</td>
						<td v-show="showRow(columns, 9)">
							<app-tooltip-button
								text="Editar"
								icon="edit"
								color="success"
								@click-icon="editAction(props.row.id)"
							/>
							<app-tooltip-button
								text="Eliminar"
								icon="close"
								color="error"
								@click-icon="deleteAction(props.row.id)"
							/>
						</td>
					</template>
				</app-table>
			</div>
		</div>
		<router-view></router-view>
	</div>
</template>

<script>
import appActions from '@/components/shared/app-actions';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';

function created() {
	this.loadActions();
}

async function loadActions() {
	const params = this.params;
	this.params.page = this.currentPage;
	this.params.limit = 20;
	try {
		const response = await this.$httpProducts.get('actions', { params });
		this.rows = response.data;
		this.lastPage = Number(response.headers['x-last-page']);
		this.itemsTotalQuantity = Number(response.headers['x-quantity']);
	} catch (error) {
		this.showGenericError();
	}
}

function changePage(page) {
	this.currentPage = page;
	this.loadActions();
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.loadActions();
}

async function changeActive(id, flag) {
	const body = {
		flagActive: flag,
	};
	try {
		await this.$httpProducts.patch(`actions/${id}/active`, body);
		this.showNotification('Se actualizó correctamente');
		this.loadActions();
	} catch (error) {
		this.showGenericError();
	}
}

function stateName({ flagActive }) {
	return flagActive ? 'Activa' : 'Inactiva';
}

function countProduct(products) {
	const productsLength = products.length;
	return productsLength;
}

function runAction({ code }) {
	if (code === 'new-action') {
		this.goTo('page-new-action');
	}
}

async function deleteAction(id) {
	try {
		await this.$httpProducts.delete(`actions/${id}`);
		this.showNotification('Se Elimino correctamente');
		this.loadActions();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'ACTION_CANNOT_DELETED') {
				this.showGenericError('No se pudo Eliminar la Acción.');
			}
		} else {
			this.showGenericError();
		}
		this.showGenericError();
	}
}

function editAction(id) {
	this.goTo('edit-action', { params: { id } });
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Código', visible: true, checked: true },
			{ id: 2, name: 'Descripción', visible: true, checked: true },
			{ id: 3, name: 'Tipo de Acciones', visible: true, checked: true },
			{ id: 4, name: 'Cant. de Productos', visible: true, checked: true },
			{ id: 5, name: 'Cantidad', visible: true, checked: true },
			// { id: 6, name: 'Cant. Base', visible: true, checked: true },
			{ id: 7, name: 'Monto', visible: true, checked: true },
			{ id: 8, name: 'Estado', visible: true, checked: true },
			{ id: 9, name: 'Acciones', visible: true, checked: true },
		],
		currentPage: 1,
		lastPage: 0,
		itemsTotalQuantity: 0,
		params: {},
		rows: [],
		states: [],
	};
}

export default {
	name: 'page-list-actions',
	created,
	data,
	components: {
		appActions,
		appTable,
		headerPage,
	},
	methods: {
		changeActive,
		changePage,
		countProduct,
		deleteAction,
		editAction,
		loadActions,
		runAction,
		stateName,
		onSearch,
	},
};
</script>

<style lang="scss" scoped></style>
