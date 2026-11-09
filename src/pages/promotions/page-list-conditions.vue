<template>
	<div>
		<div v-if="$route.name === 'conditions-list'">
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
						<td v-show="showRow(columns, 3)">{{ props.row.typeTermName }}</td>
						<td v-show="showRow(columns, 4)">{{ countProduct(props.row.products) }}</td>
						<td v-show="showRow(columns, 5)">{{ props.row.termName }}</td>
						<td v-show="showRow(columns, 6)">{{ props.row.quantity }}</td>
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
								@click-icon="editCondition(props.row.id)"
							/>
							<app-tooltip-button
								text="Eliminar"
								icon="close"
								color="error"
								@click-icon="deleteCondition(props.row.id)"
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
	this.loadConditions();
}

async function loadConditions() {
	const params = this.params;
	this.params.page = this.currentPage;
	this.params.limit = 20;
	try {
		const response = await this.$httpProducts.get('terms', { params });
		this.rows = response.data;
		this.itemsTotalQuantity = Number(response.headers['x-quantity']);
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	}
}

function onSearch(value) {
	const search = value ? value.trim() : '';
	this.params.search = search || null;
	this.loadConditions();
}

function changePage(page) {
	this.currentPage = page;
	this.loadConditions();
}

async function changeActive(id, flag) {
	const body = {
		flagActive: flag,
	};
	try {
		await this.$httpProducts.patch(`terms/${id}/active`, body);
		this.showNotification('Se actualizó correctamente');
		this.loadConditions();
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
	if (code === 'new-condition') {
		this.goTo('page-new-condition');
	}
}

async function deleteCondition(id) {
	try {
		await this.$httpProducts.delete(`terms/${id}`);
		this.showNotification('Se Elimino correctamente');
		this.loadConditions();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'TERMS_CANNOT_DELETED') {
				this.showGenericError('No se pudo Eliminar la Condición.');
			}
		} else {
			this.showGenericError();
		}
	}
}

function editCondition(id) {
	this.goTo('edit-condition', { params: { id } });
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Código', visible: true, checked: true },
			{ id: 2, name: 'Descripción', visible: true, checked: true },
			{ id: 3, name: 'Tipo de Condición', visible: true, checked: true },
			{ id: 4, name: 'Cant Producto', visible: true, checked: true },
			{ id: 5, name: 'Condición', visible: true, checked: true },
			{ id: 6, name: 'Cant', visible: true, checked: true },
			{ id: 7, name: 'Monto', visible: true, checked: true },
			{ id: 8, name: 'Estado', visible: true, checked: true },
			{ id: 9, name: 'Acciones', visible: true, checked: true },
		],
		currentPage: 1,
		lastPage: 0,
		idCondition: null,
		params: {},
		rows: [],
		states: [],
		itemsTotalQuantity: 1,
	};
}

export default {
	name: 'page-list-conditions',
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
		deleteCondition,
		editCondition,
		loadConditions,
		runAction,
		stateName,
		onSearch,
	},
};
</script>

<style lang="scss" scoped></style>
