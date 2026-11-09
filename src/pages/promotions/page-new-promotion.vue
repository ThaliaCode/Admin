<template>
	<div>
		<header-page :title="$route.meta.title"></header-page>
		<v-layout justify-space-between row pt-5 px-5>
			<v-flex xs5>
				<v-flex class="title-header">DATOS GENERALES</v-flex>
				<v-layout column wrap>
					<v-flex mt-3 xs5>
						<app-input-text
							label="Código"
							:text="promotionModel.code"
							:disabled="idPromotion ? true : false"
							model="code"
							@input="setData"
						/>
						<span class="form-group__message" v-if="checkBlankCode(promotionModel.code)">
							No se permite espacios en blanco
						</span>
					</v-flex>
					<v-flex mt-3>
						<app-input-text
							label="Descripción"
							:text="promotionModel.description"
							model="description"
							@input="setData"
						/>
					</v-flex>
					<v-flex mt-3>
						<v-layout row>
							<v-flex xs6>
								<app-date-select
									:key="`startDate-${dateKey}`"
									:date-formatted="promotionModel.startDate"
									:max-date="promotionModel.endDate || undefined"
									label="Fecha Inicio"
									model="startDate"
									@input="setDate"
								/>
							</v-flex>
							<v-flex ml-2 xs6>
								<app-date-select
									:key="`endDate-${dateKey}`"
									:date-formatted="promotionModel.endDate"
									:min-date="promotionModel.startDate || undefined"
									label="Fecha Fin"
									model="endDate"
									@input="setDate"
								/>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex mt-3>
						<v-layout row>
							<v-flex>
								<app-input-text
									label="Monto max de Venta"
									model="maxAmount"
									type="number"
									:text="promotionModel.maxAmount"
									@input="setData"
								/>
							</v-flex>
							<v-flex ml-2>
								<app-input-text
									label="Monto min de Venta"
									model="minAmount"
									type="number"
									:text="promotionModel.minAmount"
									@input="setData"
								/>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex mt-3>
						<v-layout row>
							<v-flex xs6>
								<app-input-text
									label="Cantidad"
									type="number"
									model="quantity"
									:text="promotionModel.quantity"
									@input="setData"
								/>
								<span v-if="decimalError" style="color: red; font-size: 12px">
									Solo se permiten hasta dos decimales.
								</span>
							</v-flex>
							<v-flex ml-2 xs6>
								<app-select
									item-text="name"
									item-value="id"
									label="Unidad"
									model="unitId"
									:items="units"
									:item="promotionModel.unitId"
									:return-object="false"
									@input="setData"
								/>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex mt-2>
						<v-switch
							class="mt-2"
							color="success"
							hide-details
							:false-value="0"
							:true-value="1"
							label="Activar limite de promociones"
							v-model="promotionModel.flagLimitPromotions"
						></v-switch>
					</v-flex>
					<v-flex mt-3 xs6 v-if="promotionModel.flagLimitPromotions">
						<app-input-text
							label="Cantidad de promociones"
							type="number"
							model="promotionsAmount"
							:text="promotionModel.promotionsAmount"
							@input="setData"
						/>
					</v-flex>
					<v-flex mt-3 v-if="!idPromotion">
						<v-switch
							class="mt-2"
							color="success"
							hide-details
							:false-value="0"
							:true-value="1"
							label="Activa"
							v-model="promotionModel.flagActive"
						></v-switch>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs5>
				<v-flex class="title-header">CONDICIÓN</v-flex>
				<v-flex xs8 md6 mt-3>
					<button
						class="product-add-btn mt-1"
						type="button"
						@click="addRow('conditions')"
					>
						<span>Seleccionar Condición</span>
						<v-icon class="product-add-btn-icon" color="primary" size="17">
							add_circle
						</v-icon>
					</button>
				</v-flex>
				<v-flex xs12 mt-2 v-if="selectedTerm.length">
					<v-layout align-center row justify-space-between>
						<v-flex xs3>
							<span class="title-for">Cod</span>
						</v-flex>
						<v-flex xs8 ml-1>
							<span class="title-for">Descripción</span>
						</v-flex>
					</v-layout>
					<v-layout
						mt-1
						align-center
						row
						justify-space-between
						v-for="(condition, index) in selectedTerm"
						:key="index"
					>
						<v-flex xs3>
							<p class="content-for">
								{{ condition.code }}
							</p>
						</v-flex>
						<v-flex xs8 ml-1>
							<p class="content-for">
								{{ condition.description }}
							</p>
						</v-flex>
						<v-flex xs1 ml-1>
							<app-tooltip-button
								text="Eliminar Condicion"
								icon="highlight_off"
								color="error"
								@click-icon="deleteCondition(index)"
							/>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex class="title-header" mt-3>ACCIÓN</v-flex>
				<v-flex xs8 md6 mt-3>
					<button class="product-add-btn mt-1" type="button" @click="addRow('action')">
						<span>Seleccionar Acción</span>
						<v-icon class="product-add-btn-icon" color="primary" size="17">
							add_circle
						</v-icon>
					</button>
				</v-flex>
				<v-flex xs12 mt-2 v-if="selectedAction.length">
					<v-layout align-center row justify-space-between>
						<v-flex xs3>
							<span class="title-for">Cod</span>
						</v-flex>
						<v-flex xs8 ml-1>
							<span class="title-for">Descripción</span>
						</v-flex>
					</v-layout>
					<v-layout
						mt-1
						align-center
						row
						justify-space-between
						v-for="(action, index) in selectedAction"
						:key="index"
					>
						<v-flex xs3>
							<p class="content-for">
								{{ action.code }}
							</p>
						</v-flex>
						<v-flex xs8 ml-1>
							<p class="content-for">
								{{ action.description }}
							</p>
						</v-flex>
						<v-flex xs1 ml-1>
							<app-tooltip-button
								text="Eliminar Accion"
								icon="highlight_off"
								color="error"
								@click-icon="deleteAction(index)"
							/>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-flex>
		</v-layout>
		<action-sidebar
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<v-layout pt-3 px-3 v-if="action.code === 'conditions'">
				<v-flex xs12>
					<app-table
						:columns="columns"
						:rows="conditions"
						:filter-columns="false"
						:current-page="currentPage"
						:items-quantity="conditions.length"
						:items-total-quantity="itemsTotalQuantity"
						:last-page="lastPage"
						@on-search-event="onSearch"
						@on-page="changePage"
					>
						<template slot="rows" slot-scope="props">
							<td class="is-not-selectable">{{ props.row.code }}</td>
							<td class="is-not-selectable">{{ props.row.description }}</td>
							<td class="is-not-selectable">
								<v-btn
									class="btn-action btn-auto btn-width-auto px-2 py-1"
									:color="props.row.aggregate ? 'lightBlue' : 'success'"
									small
									@click.stop="setCondition(props.row)"
								>
									{{ props.row.aggregate ? 'Agregado' : 'Seleccionar' }}
								</v-btn>
							</td>
						</template>
					</app-table>
				</v-flex>
			</v-layout>
			<v-layout v-if="action.code === 'action'">
				<v-flex>
					<app-table
						:columns="columns"
						:rows="actions"
						:filter-columns="false"
						:current-page="currentPage"
						:last-page="lastPage"
						:items-quantity="actions.length"
						:items-total-quantity="itemsTotalQuantity"
						@on-search-event="onSearchAction"
						@on-page="changePageAction"
					>
						<template slot="rows" slot-scope="props">
							<td class="is-not-selectable">{{ props.row.code }}</td>
							<td class="is-not-selectable">{{ props.row.description }}</td>
							<td class="is-not-selectable">
								<v-btn
									class="btn-action btn-auto btn-width-auto px-2 py-1"
									:color="props.row.aggregate ? 'lightBlue' : 'success'"
									small
									@click.stop="setAction(props.row)"
								>
									{{ props.row.aggregate ? 'Agregado' : 'Seleccionar' }}
								</v-btn>
							</td>
						</template>
					</app-table>
				</v-flex>
			</v-layout>
		</action-sidebar>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid || checkBlankCode(promotionModel.code) || decimalError"
				cancel-text="Atras"
				success-color="primary"
				@cancel-button-clicked="goBack"
				@accept-button-clicked="savePromotion"
			/>
		</section>
	</div>
</template>

<script>
import { differenceInDays, format } from 'date-fns';
import { required, requiredIf } from 'vuelidate/lib/validators';
import actionSidebar from '@/components/shared/action-sidebar';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import helper from '@/shared/helper';

const { exactDate } = helper;

function created() {
	this.idPromotion = this.$route.params.id;
	this.loadUnits();
	if (this.idPromotion) {
		this.loadPromotion();
	}
}

async function loadPromotion() {
	try {
		const response = await this.$httpProducts.get(`promotions/${this.idPromotion}`);
		this.promotionModel.code = response.data.code;
		this.promotionModel.description = response.data.description;
		this.promotionModel.minAmount = response.data.minAmount;
		this.promotionModel.maxAmount = response.data.maxAmount;
		this.promotionModel.startDate = exactDate(response.data.startDate, 'YYYY-MM-DD');
		this.promotionModel.endDate = exactDate(response.data.endDate, 'YYYY-MM-DD');
		this.promotionModel.quantity = response.data.quantity;
		this.promotionModel.unitId = response.data.unitId;
		this.promotionModel.flagLimitPromotions = response.data.flagLimitPromotions;
		this.promotionModel.promotionsAmount = response.data.promotionsAmount;
		response.data.actions.forEach((action) => {
			this.setAction(action);
		});
		response.data.terms.forEach((term) => {
			this.setCondition(term);
		});
	} catch (error) {
		this.showGenericError();
	}
}

async function loadUnits() {
	try {
		const url = 'units';
		const { data: response } = await this.$httpProducts.get(url);
		this.units = response.map((unit) => {
			const newUnit = { ...unit };
			return newUnit;
		});
		if (this.units.length === 0) {
			this.showNotification('No se han encontrado coincidencias.', 'info');
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadActionsTable() {
	this.params.page = this.currentPage;
	try {
		const url = 'actions';
		const { data: response, headers } = await this.$httpProducts.get(url, {
			params: this.params,
		});
		this.actions = response.map((action) => {
			const newAction = { ...action };
			const match = this.selectedAction.find((item) => item.id === action.id);
			if (match) {
				newAction.aggregate = 1;
			} else {
				newAction.aggregate = 0;
			}
			return newAction;
		});
		this.itemsTotalQuantity = Number(headers['x-quantity']);
		this.lastPage = Number(headers['x-last-page']);
		if (this.actions.length === 0) {
			this.showNotification('No se han encontrado coincidencias.', 'info');
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

async function loadConditionsTable() {
	this.params.page = this.currentPage;
	try {
		const url = 'terms';
		const { data: response, headers } = await this.$httpProducts.get(url, {
			params: this.params,
		});
		this.conditions = response.map((condition) => {
			const newCondition = { ...condition };
			const match = this.selectedTerm.find((item) => item.id === condition.id);
			if (match) {
				newCondition.aggregate = 1;
			} else {
				newCondition.aggregate = 0;
			}
			return newCondition;
		});
		this.itemsTotalQuantity = Number(headers['x-quantity']);
		this.lastPage = Number(headers['x-last-page']);
		if (this.conditions.length === 0) {
			this.showNotification('No se han encontrado coincidencias.', 'info');
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function goBack() {
	this.$router.back();
}

function addRow(code) {
	if (code === 'conditions') {
		this.loadConditionsTable();
	} else {
		this.loadActionsTable();
	}
	this.action = {
		code,
		title: code === 'conditions' ? 'Condición' : 'Acción',
		width: 580,
		open: true,
	};
}

function closeModal() {
	this.actions = [];
	this.conditions = [];
	this.action = {
		active: false,
		open: false,
		code: '',
		title: '',
		width: 0,
	};
	this.itemsTotalQuantity = 1;
	this.lastPage = 1;
	this.currentPage = 1;
}

async function savePromotion() {
	this.isLoading = true;
	const method = this.idPromotion ? 'patch' : 'post';
	const url = this.idPromotion ? `promotions/${this.idPromotion}` : 'promotions';
	const update = 'se actualizó';
	const create = 'ha sido creado';
	const message = this.idPromotion ? update : create;
	const body = this.getData();
	try {
		await this.$httpProducts[method](url, body);
		this.showNotification(`La promocion ${message} de manera exitosa`);
		this.goTo('promotions-list');
		this.isLoading = false;
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'PROMOTIONS_DUPLICATE_CODE') {
				this.showGenericError('El código ya está asignado a otra Promocion.');
			}
		} else {
			this.showGenericError();
		}
		this.isLoading = false;
	}
}

function getData() {
	const promotionData = {
		description: this.promotionModel.description,
		minAmount: this.promotionModel.minAmount ? Number(this.promotionModel.minAmount) : 0,
		maxAmount: this.promotionModel.maxAmount ? Number(this.promotionModel.maxAmount) : 0,
		startDate: this.promotionModel.startDate,
		endDate: this.promotionModel.endDate,
		quantity: this.promotionModel.quantity ? Number(this.promotionModel.quantity) : 0,
		actionIds: this.promotionModel.actionIds,
		termIds: this.promotionModel.termIds,
		flagLimitPromotions: Boolean(this.promotionModel.flagLimitPromotions),
		promotionsAmount: this.promotionModel.flagLimitPromotions
			? Number(this.promotionModel.promotionsAmount)
			: undefined,
	};

	if (this.promotionModel.unitId !== null) {
		promotionData.unitId = this.promotionModel.unitId;
	}

	if (!this.idPromotion) {
		promotionData.code = this.promotionModel.code;
	}
	return promotionData;
}

function setData({ model, value }) {
	this.promotionModel[model] = value;
	if (model === 'quantity') {
		const regex = /^\d+(\.\d{1,2})?$/;
		this.decimalError = this.promotionModel.quantity && !regex.test(value);
	}
}

function setCondition(conditionList) {
	const newCondition = {
		id: conditionList.id,
		code: conditionList.code,
		description: conditionList.description,
	};

	const existCondition = this.promotionModel.termIds.filter(
		(item) => item === newCondition.id
	);
	if (!existCondition.length) {
		this.promotionModel.termIds.push(newCondition.id);
		this.selectedTerm.push(newCondition);
	}
	const index = this.conditions.findIndex((sc) => sc.id === newCondition.id);
	if (index !== -1) {
		this.conditions[index].aggregate = 1;
	}
}

function deleteCondition(index) {
	this.selectedTerm.splice(index, 1);
	this.promotionModel.termIds.splice(index, 1);
}

function setAction(actionList) {
	const newAction = {
		id: actionList.id,
		code: actionList.code,
		description: actionList.description,
	};
	const existAction = this.promotionModel.actionIds.filter(
		(item) => item === newAction.id
	);
	if (!existAction.length) {
		this.promotionModel.actionIds.push(newAction.id);
		this.selectedAction.push(newAction);
	}
	const index = this.actions.findIndex((sc) => sc.id === newAction.id);
	if (index !== -1) {
		this.actions[index].aggregate = 1;
	}
}

function deleteAction(index) {
	this.selectedAction.splice(index, 1);
	this.promotionModel.actionIds.splice(index, 1);
}

function setDate({ model, value }) {
	const newDate = format(value, 'YYYY-MM-DD');
	const { startDate, endDate } = { ...this.promotionModel, [model]: newDate };
	if (startDate && endDate && differenceInDays(endDate, startDate) < 0) {
		this.showNotification('La fecha de inicio no puede ser mayor a la fecha fin.', 'warning');
		// El componente guarda la fecha elegida internamente; se re-crea para volver al valor anterior.
		this.dateKey += 1;
		return;
	}
	this.promotionModel[model] = newDate;
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.loadConditionsTable();
}

function onSearchAction(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.loadActionsTable();
}

function changePage(page) {
	this.currentPage = page;
	this.loadConditionsTable();
}

function changePageAction(page) {
	this.currentPage = page;
	this.loadActionsTable();
}

function validations() {
	return {
		promotionModel: {
			code: {
				required: requiredIf(() => !this.idPromotion),
			},
			description: { required },
			startDate: { required },
			endDate: { required },
			actionIds: { required },
			termIds: { required },
		},
	};
}

function data() {
	return {
		action: {
			active: false,
			open: false,
			code: '',
			title: '',
			width: 0,
		},
		actions: [],
		conditions: [],
		columns: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{
				id: 2,
				name: 'Descripción',
				value: 'description',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Acción',
				value: 'description',
				visible: true,
				checked: true,
			},
		],
		currentPage: 1,
		lastPage: 1,
		dateKey: 0,
		promotionModel: {
			code: '',
			description: '',
			startDate: '',
			endDate: '',
			maxAmount: 0,
			minAmount: 0,
			quantity: 0,
			unitId: null,
			actionIds: [],
			termIds: [],
			flagLimitPromotions: false,
			promotionsAmount: null,
		},
		params: {
			page: 1,
			limit: 30,
		},
		itemsTotalQuantity: 0,
		selectedAction: [],
		selectedTerm: [],
		units: [],
		rows: [],
		decimalError: false,
	};
}

export default {
	name: 'page-new-promotion',
	created,
	data,
	components: {
		actionSidebar,
		appTable,
		headerPage,
		modalSidebarButton,
	},
	methods: {
		addRow,
		changePage,
		changePageAction,
		closeModal,
		deleteAction,
		deleteCondition,
		getData,
		goBack,
		loadActionsTable,
		loadConditionsTable,
		loadPromotion,
		loadUnits,
		savePromotion,
		setAction,
		setCondition,
		setData,
		setDate,
		onSearch,
		onSearchAction,
	},
	validations,
};
</script>

<style lang="scss" scoped>
.title-for {
	color: color(primary);
	font-size: 10px;
}

.title-header {
	border-bottom: 1px solid #d9e8e9;
	color: color(sidebar);
	font-family: font(open-bold);
	font-size: 13px;
	padding-bottom: 8px;
}

.product-add-btn {
	align-items: center;
	border-color: color(primary);
	border-style: solid;
	border-width: 1px;
	border-radius: 2px;
	color: color(primary);
	cursor: pointer;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	font-family: font(open-semibold);
	font-size: size(small);
	height: 27px;
	justify-content: space-between;
	padding: 0px 9px;
	width: 100%;

	span {
		text-align: center;
		width: calc(100% - 23px);
	}

	&.product-add-btn-active {
		background-color: color(primary);
		color: color(white);
	}
}

.content-for {
	border-radius: 2px;
	background-color: rgba(195, 231, 232, 0.29);
	color: #4a4a4a;
	font-size: 12px;
	margin: 0;
	padding: 4px 14px;
}
</style>
