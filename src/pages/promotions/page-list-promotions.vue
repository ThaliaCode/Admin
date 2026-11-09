<template>
	<div>
		<div v-if="$route.name === 'promotions-list'">
			<header-page :title="$route.meta.title"></header-page>
			<app-actions :resource-uri="$route.name" @run-action="runAction" />
			<v-layout row align-end px-4 mt-4>
				<v-flex xs2>
					<app-select
						label="Estado"
						:items="states"
						item-text="name"
						item-value="id"
						:item="params.stateId"
						@input="setParams"
					/>
				</v-flex>
				<v-flex xs2 ml-2>
					<app-date-select
						label="Fecha Inicio"
						model="startDate"
						:date-formatted="params.startDate"
						@input="setParams"
					/>
				</v-flex>
				<v-flex xs2 ml-2>
					<app-date-select
						label="Fecha Fin"
						model="endDate"
						:date-formatted="params.endDate"
						@input="setParams"
					/>
				</v-flex>
				<v-flex ml-2>
					<v-btn
						:disabled="loading"
						type="button"
						class="btn-action mr-3"
						color="primary"
						@click="loadPromotions"
					>
						Buscar
					</v-btn>
				</v-flex>
			</v-layout>
			<div class="mt-3">
				<app-table
					:rows="rows"
					:items-quantity="rows.length"
					:items-total-quantity="itemsTotalQuantity"
					:columns="columns"
					:last-page="lastPage"
					:current-page="currentPage"
					@on-page="changePage"
					@on-search-event="onSearch"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)" class="is-not-selectable">
							{{ props.row.code }}
						</td>
						<td v-show="showRow(columns, 2)">{{ props.row.description }}</td>
						<td v-show="showRow(columns, 3)">{{ props.row.startDate | exactDate }}</td>
						<td v-show="showRow(columns, 4)">{{ props.row.endDate | exactDate }}</td>
						<td v-show="showRow(columns, 5)">{{ props.row.maxAmount }}</td>
						<td v-show="showRow(columns, 6)">{{ props.row.minAmount }}</td>
						<td v-show="showRow(columns, 7)">
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
						<td v-show="showRow(columns, 8)">
							<app-tooltip-button
								text="Editar"
								icon="edit"
								color="success"
								@click-icon="editPromotion(props.row.id)"
							/>
							<app-tooltip-button
								text="Eliminar"
								icon="close"
								color="error"
								@click-icon="deletePromotion(props.row.id)"
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
import { format } from 'date-fns';

function created() {
	this.loadPromotions();
}

async function loadPromotions() {
	this.loading = true;
	const params = this.params;
	this.params.page = this.currentPage;
	this.params.limit = 20;
	try {
		const response = await this.$httpProducts.get('promotions', { params });
		this.rows = response.data;
		this.itemsTotalQuantity = Number(response.headers['x-quantity']);
		this.lastPage = Number(response.headers['x-last-page']);
	} catch (error) {
		this.showGenericError();
	} finally {
		this.loading = false;
	}
}

function setParams({ model, value }) {
	if (model === 'stateId') {
		this.params[model] = value;
	} else {
		this.params[model] = format(value, 'YYYY-MM-DD');
	}
}

function runAction({ code }) {
	if (code === 'new-promotion') {
		this.goTo('page-new-promotion');
	}
}

function changePage(page) {
	this.currentPage = page;
	this.loadPromotions();
}

function onSearch(value) {
	const search = value ? value.trim() : '';
	this.params.search = search || null;
	this.loadPromotions();
}

async function changeActive(id, flag) {
	const body = {
		flagActive: flag,
	};
	try {
		await this.$httpProducts.patch(`promotions/${id}/active`, body);
		this.showNotification('Se actualizó correctamente');
		this.loadPromotions();
	} catch (error) {
		this.showGenericError();
	}
}

function stateName({ flagActive }) {
	return flagActive ? 'Activa' : 'Inactiva';
}

async function deletePromotion(id) {
	try {
		await this.$httpProducts.delete(`promotions/${id}`);
		this.showNotification('Se Elimino correctamente');
		this.loadPromotions();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'PROMOTIONS_CANNOT_DELETED') {
				this.showGenericError('No se pudo Eliminar la Promoción.');
			}
		} else {
			this.showGenericError();
		}
	}
}

function editPromotion(id) {
	this.goTo('edit-promotion', { params: { id } });
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Código', visible: true, checked: true },
			{ id: 2, name: 'Descripción', visible: true, checked: true },
			{ id: 3, name: 'Fecha Inicio', visible: true, checked: true },
			{ id: 4, name: 'Fecha Fin', visible: true, checked: true },
			{ id: 5, name: 'Monto Max', visible: true, checked: true },
			{ id: 6, name: 'Monto Min', visible: true, checked: true },
			{ id: 7, name: 'Estado', visible: true, checked: true },
			{ id: 8, name: 'Acciones', visible: true, checked: true },
		],
		currentPage: 1,
		lastPage: 0,
		loading: true,
		rows: [],
		states: [],
		params: {
			stateId: null,
			startDate: null,
			endDate: null,
		},
		itemsTotalQuantity: 1,
	};
}

export default {
	name: 'page-list-promotions',
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
		deletePromotion,
		editPromotion,
		loadPromotions,
		runAction,
		onSearch,
		setParams,
		stateName,
	},
};
</script>

<style lang="scss" scoped></style>
