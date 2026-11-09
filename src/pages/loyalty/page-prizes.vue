<template>
	<div>
		<header-page
			name="page-prizes"
			title="Premios"
		/>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
		/>
		<v-layout row wrap my-3 px-5>
			<v-flex xs3>
				<app-select
					label="Rango de Puntos"
					item-text="name"
					item-value="id"
					:item="params.points"
					:items="points"
					@input="setData"
					model="points"
				></app-select>
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
				include-filter
				@on-page="changePage"
				@on-search-event="searchEvent"
				@table-option-event="openModal"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable"></td>
					<td v-show="showRow(columns, 2)">{{ props.row.code }}</td>
					<td v-show="showRow(columns, 3)"></td>
					<td v-show="showRow(columns, 4)"></td>
					<td v-show="showRow(columns, 5)"></td>
					<td v-show="showRow(columns, 6)"></td>
					<td v-show="showRow(columns, 7)" class="layout justify-space-around">
						<app-tooltip-button
							icon="edit"
							text="Editar"
							color="success"
							size="20"
						/>
						<v-tooltip top>
							<v-switch
								slot="activator"
								color="success"
								hide-details
								v-model="props.row.flag"
								@click.stop="stopClick"
							></v-switch>
							<span>Inactivo</span>
						</v-tooltip>
						<app-tooltip-button
							icon="delete"
							text="Eliminar"
							color="error"
							size="20"
						/>
					</td>
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
				title="Asignar Puntos"
				name-action="Guardar"
				show-slot
				@close-modal="closeModal"
				@action-modal="saveFilter"
			>
				<div class="pa-4">
					<v-checkbox
						color="primary"
						hide-details
						label="Mostrar Premios Desactivados"
						v-model="params.desac"
					></v-checkbox>
				</div>
			</modal-items>
		</v-dialog>
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import appActions from '@/components/shared/app-actions';
import modalItems from '@/components/shared/modal-items';

function setData() {}

function totalItemsVisible() {
	return 0;
}

function changePage() {}

function searchEvent() {}

function runAction({ code }) {
	if (code === 'new-prize') {
		this.goTo('new-prizes');
	}
}

function saveFilter() {}

function openModal() {
	this.dialogFilter = true;
}

function closeModal() {
	this.dialogFilter = false;
}

function data() {
	return {
		columns: [
			{
				id: 1,
				name: 'Imagen',
				value: 'image',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Nombre',
				value: 'name',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Puntos',
				value: 'points',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Cod. Producto',
				value: 'code-product',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Nombre deProducto',
				value: 'name-product',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'Fecha de Válidez',
				value: 'date',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'Acciones',
				value: 'actions',
				checked: true,
				visible: true,
			},
		],
		currentPage: 1,
		lastPage: 0,
		params: {
			points: null,
			desac: false,
		},
		points: [],
		rows: [
			{
				code: 1,
				flag: false,
			},
		],
		isClean: false,
		totalItems: 0,
		dialogFilter: false,
	};
}

export default {
	name: 'page-prizes',
	data,
	components: {
		appTable,
		headerPage,
		appActions,
		modalItems,
	},
	computed: {
		totalItemsVisible,
	},
	methods: {
		changePage,
		searchEvent,
		setData,
		runAction,
		openModal,
		saveFilter,
		closeModal,
	},
};
</script>