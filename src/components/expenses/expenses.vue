<template>
	<div>
		<header-page :title="$route.meta.title"/>
		<general-filter>
			<v-layout row wrap>
				<v-flex xs12 md6>
					<v-layout row wrap justify-start>
						<v-flex xs5 px-1 class="align-col">
							<v-menu
								lazy
								v-model="menuStart"
								transition="scale-transition"
								offset-y
								full-width
								:nudge-right="50">
								<v-text-field
									slot="activator"
									label="Fecha de inicio"
									v-model="filter.startDate"
									single-line
									append-icon="event"
									class="filter-select shadow-inset-calendar shadow-inset-calendar-start"
									readonly
								></v-text-field>
								<v-date-picker
									v-model="filter.startDate"
									no-title
									scrollable
								></v-date-picker>
							</v-menu>
						</v-flex>
						<v-flex xs5 px-1 class="align-col">
							<v-menu
								lazy
								v-model="menuEnd"
								transition="scale-transition"
								offset-y
								full-width
								:nudge-right="50">
								<v-text-field
									slot="activator"
									label="Fecha de fin"
									v-model="filter.endDate"
									single-line
									append-icon="event"
									class="filter-select shadow-inset-calendar shadow-inset-calendar-end"
									readonly
								></v-text-field>
								<v-date-picker
									v-model="filter.endDate"
									no-title
									scrollable
								></v-date-picker>
							</v-menu>
						</v-flex>
						<v-flex xs5 px-1 class="align-col">
							<v-select
								v-bind:items="expenseTypes"
								v-model="filter.type"
								label="Tipo de gasto"
								item-text="name"
								item-value="code"
								single-line
								bottom
								hide-details
								class="filter-select"
								content-class="filter-select-content"
							></v-select>
						</v-flex>
						<v-flex xs5 px-1 mt-2 class="align-col">
							<v-btn
								type="button"
								color="primary"
								class="btn-action mr-2"
								@click="loadData(1)"
							>
								Buscar
							</v-btn>
							<v-btn
								type="button"
								color="error"
								class="btn-action"
								@click="cleanFilter"
							>
								Limpiar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12 md6>
					<v-layout row wrap justify-end pt-3>
						<v-flex xs12 md4 mx-2 class="add-expense">
							<span>Nuevo gasto</span>
							<v-btn xs12 sm6 md1
								color="primary"
								icon
								@click="goToRoute('new-expenses')"
							>
								<v-icon>
									add
								</v-icon>
							</v-btn>
						</v-flex>
						<v-flex xs12 md5 mx-2 class="add-expense">
							<span >Agregar tipo de Gasto</span>
							<v-btn
								xs12
								sm6
								md1
								color="primary"
								icon
								@click="action.open = true;"
							>
								<v-icon>
									add
								</v-icon>
							</v-btn>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</general-filter>
		<app-table
			name="expenses"
			:columns="columns"
			:current-page="currentPage"
			:rows="data"
			local-storage
			:last-page="lastPage"
			@on-toggle-columns="toggleColumns"
			v-on:on-search-event="callServiceAndSearch"
			v-on:on-page="changePage">
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)">
					<img :src="props.row.urlImage" alt="img-gasto" height="31">
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.description }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.amount }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.typeExpense.name }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.expenseDate | formatDate('YYYY-MM-DD') }}</td>
				<td v-show="showRow(columns, 7)">
					<v-btn
						class="table-icon green--text"
						icon
						@click.prevent="goToRoute('edit-expense', props.row)"
					>
						<v-icon>
							edit
						</v-icon>
					</v-btn>
					<v-btn
						class="table-icon red--text"
						icon
						@click="deleteExpense(props.row)"
					>
						<v-icon>
							delete
						</v-icon>
					</v-btn>
				</td>
			</template>
		</app-table>
		<action-sidebar
			:title="action.title"
			:width="action.width"
			:help-actions="actionsToHelp"
			v-model="action.open"
		>
			<v-layout row wrap pt-3 justify-center>
				<v-flex class="xs10 my-2 input-heigth">
					<v-text-field
						class="filter-select"
						label="Nombre"
						v-model="newTypeExpense.name"
					></v-text-field>
					<small class="form-group__message"
						v-if="$v.newTypeExpense.name.$invalid">El nombre es requerido</small>
				</v-flex>
				<v-flex class="xs10 my-2 input-heigth">
					<v-text-field
						class="filter-select"
						label="Descripción"
						v-model="newTypeExpense.description"
					></v-text-field>
					<small class="form-group__message"
						v-if="$v.newTypeExpense.description.$invalid">La descripción es requerida</small>
				</v-flex>
				<v-flex class="xs10 my-2 input-heigth">
					<v-text-field
						class="filter-select"
						label="Código"
						v-model="newTypeExpense.code"
					></v-text-field>
					<small class="form-group__message"
						v-if="$v.newTypeExpense.code.$invalid">El código es requerido</small>
					<span
						class="text-not-code-blank"
						v-if="checkBlankCode(newTypeExpense.code)">
						No se permite espacios en blanco
					</span>	
				</v-flex>
			</v-layout>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					:is-loading="$v.newTypeExpense.name.$invalid
						|| $v.newTypeExpense.code.$invalid
						|| $v.newTypeExpense.description.$invalid
						|| checkBlankCode(newTypeExpense.code)"
					@accept-button-clicked="saveTypeExpense"
					@cancel-button-clicked="closeModal"/>
			</section>
		</action-sidebar>
	</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import headerPage from './../shared/header-page';
import generalFilter from './../shared/general-filter';
import appTable from './../shared/table/app-table';
import helper from './../../shared/helper';
import modalSidebarButton from './../shared/utils/modal-sidebar-button';
import actionSidebar from './../shared/action-sidebar';


function created() {
	this.currentPage = helper.getLocalData('current-page::expenses') || 1;
	this.loadData(this.currentPage);
}

async function loadData(page) {
	this.currentPage = page;
	const host = this.projectId ? '$httpProduction' : '$httpSales';
	const url = this.projectId ? `expenses/${this.projectId}` : 'expenses';
	const requests = [
		this.typeExpensesList(),
		this.expensesList(this.filter, host, url),
	];
	try {
		[{ data: this.expenseTypes }, { data: this.data }] = await Promise.all(requests);
	} catch (error) {
		this.showGenericError();
	}
}

function toggleColumns() {
	return true;
}

function changePage(page) {
	this.currentPage = page;
}

function callServiceAndSearch(search) {
	this.searchData = search;
	if (search) {
		this.params.search = search;
	} else {
		this.params.search = null;
	}
	this.currentPage = 1;
}

function cleanFilter() {
	this.filter = {};
	this.loadData(1);
}

async function deleteExpense({ id }) {
	const url = `expenses/${id}`;
	try {
		await this.$httpSales.delete(url);
		this.loadData(this.currentPage);
	} catch (error) {
		this.showGenericError();
	}
}

function closeModal() {
	this.action.open = false;
	this.newTypeExpense.name = '';
	this.newTypeExpense.description = '';
}

async function saveTypeExpense() {
	this.action.open = false;
	const url = 'type-expenses';
	try {
		await this.$httpSales.post(url, this.newTypeExpense);
		this.showNotification('¡Registro exitoso!');
		this.newTypeExpense.name = '';
		this.newTypeExpense.description = '';
		this.newTypeExpense.code = '';
		this.loadData(this.currentPage);
	} catch (error) {
		this.showGenericError();
	}
}

function beforeDestroy() {
	helper.setLocalData('current-page::expenses', this.currentPage);
}

function projectId() {
	return this.$route.query.projectId;
}

function goToRoute(name, { id } = {}) {
	this.goTo(name, { params: { id }, query: { projectId: this.projectId } });
}

function validations() {
	return {
		newTypeExpense: {
			name: {
				type: required,
			},
			code: {
				type: required,
			},
			description: {
				type: required,
			},
		},
	};
}

function data() {
	return {
		action: {
			active: false,
			open: false,
			title: 'Nuevo Tipo de Gasto',
			width: 500,
		},
		columns: [
			{ id: 1, name: 'Imagen', value: 'image', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'name', visible: true, checked: true },
			{ id: 3, name: 'Descripción', value: 'description', visible: true, checked: true },
			{ id: 4, name: 'Monto', value: 'amount', visible: true, checked: true },
			{ id: 5, name: 'Tipo de gasto', value: 'expense', visible: true, checked: true },
			{ id: 6, name: 'Última actualización', value: 'expenseDate', visible: true, checked: true },
			{ id: 7, name: 'Acción', visible: true, checked: true, flagVisible: true },
		],
		currentPage: 1,
		data: [
			{
				typeExpense: {
					name: '',
				},
			},
		],
		entryDate: '',
		expenseTypes: [],
		filter: {},
		lastPage: 1,
		menuEnd: false,
		menuStart: false,
		newTypeExpense: {
			code: '',
			description: '',
			name: '',
		},
		params: {},
		searchData: '',
	};
}

export default {
	name: 'expenses',
	beforeDestroy,
	components: {
		actionSidebar,
		appTable,
		generalFilter,
		headerPage,
		modalSidebarButton,
	},
	computed: {
		projectId,
	},
	created,
	data,
	methods: {
		callServiceAndSearch,
		changePage,
		cleanFilter,
		deleteExpense,
		loadData,
		toggleColumns,
		saveTypeExpense,
		closeModal,
		goToRoute,
	},
	validations,
};
</script>

<style lang="scss" scoped>
.chip-exchange {
	border-radius: 5px;
	font-family: map-get($fonts, open-semibold);
	font-size: map-get($sizes, small10);
	height: 30px;
	margin: 0px;
	text-align: left;
	width: 84px;
	z-index: 1;

	span:not(.chip__content) {
		align-self: flex-end;
		display: flex;
		font-size: map-get($sizes, medium);
	}
}

.expenses-add{
	color: map-get($colors, tableText );
	text-decoration: none;
	img{
		margin-bottom: -10px;
	}
}
.text-expenses{
	padding-top: 0px;
}
.help-box{
	margin-top: 10px;
}
.card {
	border-radius: 0px;
	box-shadow: none;

	&-blue {
		background-color: map-get($colors, blue-card);
	}

	&-grey {
		background-color: map-get($colors, background-card);
	}

	&-pink {
		background-color: map-get($colors, orange-btn);
	}

	.row-text {
		color: map-get($colors, paginationText);
		font-size: map-get($sizes, medium);

		&-title {
			font-family: map-get($fonts, open-bold);
		}

		&-price {
			font-family: map-get($fonts, open-semibold);
			font-size: map-get($sizes, medium16);
		}
	}
}
.add-expense {
	align-items: center;
	display: flex;
	justify-content: space-around;
	margin-bottom: 10px;
}
.input-heigth {
	height: 45px;
}
</style>

