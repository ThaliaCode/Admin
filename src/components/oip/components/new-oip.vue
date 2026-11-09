<template>
	<div>
		<header-page :title="$route.meta.title" />
		<div class="request-form pl-5">
			<v-tabs v-model="activeTab" icons-and-text dark color="primary">
				<v-tabs-slider color="success"></v-tabs-slider>
				<v-tab href="#products">
					Productos
					<v-icon>work</v-icon>
				</v-tab>
				<v-tab href="#work-data">
					Datos del trabajo
					<v-icon>work</v-icon>
				</v-tab>
				<v-tab href="#notes">
					Notas
					<v-icon>notes</v-icon>
				</v-tab>
				<template v-if="id">
					<v-tab href="#tasks">
						Actividades
						<v-icon>playlist_add_check</v-icon>
					</v-tab>
				</template>
				<v-tab-item id="products">
					<v-card class="pt-3 pa-3" style="min-height: 50vh">
						<v-layout row wrap pa-2>
							<v-flex xs6 sm2 pr-2>
								<label class="caption">Almacén:</label>
								<v-select
									:items="warehouses"
									v-model="form.warehouse"
									item-text="name"
									item-value="id"
									autocomplete
									class="filter-select"
									content-class="filter-select-content"
								/>
							</v-flex>
							<v-flex xs6 sm3 pr-2>
								<label class="caption">Producto a fabricar:</label>
								<products-search-input
									:disabled="!form.warehouse"
									ref="productSearcher"
									ref-value="productSearcher"
									id="productSearcher"
									:clean-input="cleanInput"
									:search-value="form.search"
									:flagInputEvent="true"
									:labelSearching="null"
									@search="openSearchProduct"
								/>
							</v-flex>
							<v-flex xs6 sm1 pr-2>
								<label class="caption">Cantidad:</label>
								<v-text-field
									type="number"
									single-line
									v-model.number="form.quantity"
									class="filter-select input-right input-chip"
								/>
							</v-flex>
							<v-flex xs6 sm2 pr-2>
								<label class="caption">Unidad:</label>
								<v-select
									:items="unitsOptions"
									:disabled="!unitsOptions.length"
									v-model="form.unitSelected"
									single-line
									item-text="name"
									item-value="id"
									return-object
									autocomplete
									class="filter-select"
									content-class="filter-select-content"
								/>
							</v-flex>
							<v-flex xs1 pt-3>
								<label class="caption"></label>
								<v-btn
									round
									small
									class="bordered w100 caption primary btnAddLote white--text"
									:disabled="disabledConfirm || disabledConfirmBtn"
									@click="confirmProduct"
								>
									Confirmar
								</v-btn>
							</v-flex>
						</v-layout>
						<v-layout row wrap pa-2>
							<span class="error--text" style="font-size: 0.7rem">{{
								messageValidation
							}}</span>
						</v-layout>
						<v-layout row wrap pa-2>
							<v-flex xs12 class="supplies">
								<h3>Fórmula</h3>
								<div v-for="(supply, idx) in supplies" :key="idx" class="grid-supplies">
									<div class="">
										<v-icon color="success">{{ supply.added ? 'done' : 'add' }}</v-icon>
									</div>
									<div class="item-grid-supply">{{ supply.name }}</div>
									<div class="item-grid-supply">
										{{ supply.quantityFormula }} {{ supply.unitName }}
									</div>
									<div class="item-grid-supply">
										<v-btn
											v-if="supply.flagLotsEnabled"
											class="primary btn-action btn-auto px-2 py-1"
											style="text-transform: none; border-radius: 5px"
											:disabled="!!supply.added"
											@click="toogleModalLots(supply)"
										>
											Seleccionar lote
										</v-btn>
										<v-btn
											v-else
											class="primary btn-action btn-auto px-2 py-1"
											style="text-transform: none; border-radius: 5px"
											@click="toogleModalWarehouse(supply)"
											:disabled="!!supply.added"
										>
											Seleccionar Almacén
										</v-btn>
										<!-- <v-btn
												class="primary btn-action btn-auto px-2 py-1"
												style="text-transform: none; border-radius: 5px"
												@click="printData(supply)"
											>
												LogData
											</v-btn> -->
									</div>
								</div>
							</v-flex>
						</v-layout>
						<v-layout row wrap pa-1>
							<v-flex xs12>
								<app-table
									class="mb-0"
									name="oit-new-production"
									selectable
									local-storage
									:input-search="false"
									:columns="columns"
									:current-page="currentPage"
									:rows="rows"
									:check-all="checkAll"
								>
									<template slot="rows" slot-scope="props">
										<td class="is-not-selectable" v-show="showRow(columns, 1)">
											{{ props.row.code }}
										</td>
										<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
										<td v-show="showRow(columns, 3)">{{ props.row.quantity }}</td>
										<td v-show="showRow(columns, 4)">
											{{ props.row.priceCost | round }}
										</td>
										<td v-show="showRow(columns, 5)">{{ props.row.cost }}</td>
										<td v-show="showRow(columns, 6)">{{ props.row.unitName }}</td>
										<td v-show="showRow(columns, 7)">
											<template v-if="props.row.productLots">
												{{ props.row.productLots.code }}
											</template>
										</td>
										<td v-show="showRow(columns, 8)">
											<app-tooltip-button
												color="error"
												icon="delete"
												text="Eliminar"
												@click-icon="removeRow(props.index)"
											/>
											<!-- <app-tooltip-button
												color="primary"
												icon="home"
												text="data"
												@click-icon="printData(props.row)"
											/> -->
										</td>
									</template>
								</app-table>
							</v-flex>
						</v-layout>
						<v-layout>
							<v-flex xs12 px-4>
								<!-- <span class="error--text" style="font-size: 0.8rem;" >{{ invalidState ? 'Nuevo estado invalido' : ''}}</span> <br> -->
								<span
									class="error--text"
									style="font-size: 0.7rem"
									v-html="messageErrorProduct"
								></span>
							</v-flex>
						</v-layout>
						<v-layout>
							<v-flex xs12 text-xs-center>
								<v-btn
									type="button"
									color="success"
									class="btn-action mt-4"
									:disabled="!!messageErrorProduct"
									v-on:click="goTab('work-data')"
								>
									Continuar
								</v-btn>
							</v-flex>
						</v-layout>
					</v-card>
				</v-tab-item>

				<!-- TAB DE DATOS DE TRABAJO -->
				<v-tab-item id="work-data">
					<v-card class="pa-4">
						<v-layout row wrap>
							<v-flex xs12 sm6 pr-4>
								<span class="request-title-client">Información</span>
								<v-layout row wrap mt-3>
									<v-flex xs12 sm6 pr-1>
										<v-text-field
											class="filter-select shadow-inset mb-4"
											label="Referencia"
											v-model="form.workData.reference"
										>
										</v-text-field>
									</v-flex>
									<v-flex xs12 sm6 pl-1>
										<v-text-field
											class="filter-select shadow-inset mb-4"
											label="Tiempo de ejecución"
											v-model="form.workData.timeExecution"
										>
										</v-text-field>
									</v-flex>
								</v-layout>
								<v-layout row wrap mt-3>
									<v-flex xs12 pr-1>
										<v-select
											multiple
											chips
											label="Empleados"
											:items="employees"
											v-model="form.workData.employees"
											item-text="name"
											item-value="id"
											autocomplete
											class="filter-select"
											return-object
											content-class="filter-select-content"
										/>
									</v-flex>
								</v-layout>
								<v-layout row wrap mt-3 v-if="this.id">
									<v-flex xs12 pr-1>
										<v-select
											:items="statesOIP"
											v-model="form.states"
											label="Estado"
											item-text="name"
											item-value="id"
											autocomplete
											class="filter-select"
											content-class="filter-select-content"
										/>
									</v-flex>
									<span class="error--text">{{
										invalidState ? 'Nuevo estado invalido' : ''
									}}</span>
								</v-layout>
							</v-flex>
							<v-flex xs12 sm6 pl-4>
								<v-layout row wrap mt-4 pt-3>
									<v-flex xs6 pr-1>
										<v-menu
											lazy
											v-model="menuInit"
											transition="scale-transition"
											full-width
										>
											<v-text-field
												slot="activator"
												label="Fecha de inicio"
												v-model="form.workData.dateStart"
												append-icon="event"
												class="filter-select shadow-inset shadow-inset-calendar shadow-inset-calendar-requirement"
											></v-text-field>
											<v-date-picker
												v-model="form.workData.dateStart"
												no-title
												:min="$today()"
												@input="validateEndDate"
												scrollable
											></v-date-picker>
										</v-menu>
									</v-flex>
									<v-flex xs6 pl-1>
										<v-menu
											lazy
											v-model="menuEnd"
											transition="scale-transition"
											full-width
										>
											<v-text-field
												slot="activator"
												label="Fecha fin"
												v-model="form.workData.dateEnd"
												append-icon="event"
												class="filter-select shadow-inset shadow-inset-calendar shadow-inset-calendar-requirement"
											></v-text-field>
											<v-date-picker
												v-model="form.workData.dateEnd"
												no-title
												:min="form.workData.dateStart"
												scrollable
											></v-date-picker>
										</v-menu>
									</v-flex>
									<v-flex xs12 sm12 pl-1>
										<v-layout row wrap mt-3 v-if="registerLot">
											<v-flex xs12 pr-1>
												<label class="caption-gray"
													>Registrar Lote para producto fabricado:</label
												>
												<br />
												<v-btn
													class="primary"
													small
													style="text-transform: none"
													@click="toggleRegisterLot()"
												>
													Registrar Lote <v-icon colol="white">add</v-icon>
												</v-btn>
											</v-flex>
										</v-layout>
									</v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
						<v-layout mt-5>
							<v-flex xs12 text-xs-center>
								<v-btn
									type="button"
									color="success"
									class="btn-action mt-4"
									v-on:click="goTab('notes')"
								>
									Continuar
								</v-btn>
							</v-flex>
						</v-layout>
					</v-card>
				</v-tab-item>
				<!-- TAB de NOTAS -->
				<v-tab-item id="notes">
					<v-card class="pa-4">
						<v-layout row wrap>
							<v-flex xs12 sm6 pr-4>
								<span class="request-title-client">Agregar Nota</span>
							</v-flex>
							<v-flex xs12 pr-1 mt-1>
								<v-text-field
									v-model="form.notes"
									hide-details
									textarea
									no-resize
									single-line
									class="shadow-inset"
								></v-text-field>
							</v-flex>
						</v-layout>
						<v-layout>
							<v-flex xs12 px-4>
								<span class="error--text" style="font-size: 0.7rem">{{
									invalidState ? 'Nuevo estado invalido' : ''
								}}</span>
								<br />
								<span class="error--text" style="font-size: 0.7rem">{{
									messageErrorProduct && 'Verfique los campos del producto a fabricar'
								}}</span>
							</v-flex>
						</v-layout>
						<v-layout>
							<v-flex xs12 text-xs-center>
								<v-btn
									type="button"
									color="success"
									:disabled="!!invalidState || !!messageErrorProduct || disabledBtn"
									class="btn-action mt-4"
									v-on:click="saveOIP"
								>
									Guardar
								</v-btn>
							</v-flex>
						</v-layout>
					</v-card>
				</v-tab-item>

				<!-- TAB de ACTIVIDADES -->
				<v-tab-item id="tasks">
					<v-card class="pa-4">
						<v-layout row wrap>
							<v-flex xs12 pr-4>
								<span class="request-title-client">Agregar Actividad</span>
							</v-flex>
						</v-layout>
						<v-layout row wrap>
							<v-flex xs12 pr-1 mt-4>
								<v-layout row wrap align-center>
									<v-flex xs9>
										<v-text-field
											label="Actividad"
											v-model="activitiesData.description"
											hide-details
											single-line
											textarea
											no-resize
											class="shadow-inset"
										></v-text-field>
									</v-flex>
									<v-flex xs2>
										<v-checkbox
											label="Realizado"
											color="primary"
											size="small"
											:true-value="2"
											:false-value="1"
											class="min-checkbox min-checkbox-label"
											v-model="activitiesData.status"
											hide-details
										>
										</v-checkbox>
									</v-flex>
									<v-flex xs1>
										<v-btn
											color="primary"
											class="table-icon white--text"
											@click="addTask"
										>
											<v-icon>add</v-icon>
										</v-btn>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 mt-4>
								<app-table
									name="tasks-oip"
									:columns="columnsTask"
									:rows="tasks"
									:input-search="false"
									:filter-columns="false"
									:main-list="false"
									local-storage
									class="no-main-list is-not-selectable"
								>
									<template slot="rows" slot-scope="props">
										<td class="is-not-selectable py-2" v-show="showRow(columns, 1)">
											<v-text-field
												v-model="props.row.description"
												hide-details
												single-line
												@keyup.enter="updateTask(props.row)"
												class="filter-select shadow-inset"
											></v-text-field>
										</td>
										<td v-show="showRow(columns, 2)">
											<v-checkbox
												color="primary"
												size="small"
												class="min-checkbox"
												:true-value="2"
												:false-value="1"
												v-model="props.row.status"
												@change="updateState(props.row)"
												hide-details
											>
											</v-checkbox>
										</td>
										<td v-show="showRow(columns, 3)">
											<v-tooltip top>
												<v-btn
													slot="activator"
													icon
													class="red--text"
													@click.native="openConfirm(props.row)"
												>
													<v-icon>delete</v-icon>
												</v-btn>
												<span>Eliminar Actividad</span>
											</v-tooltip>
										</td>
									</template>
								</app-table>
							</v-flex>
						</v-layout>
					</v-card>
				</v-tab-item>
			</v-tabs>
		</div>
		<action-sidebar
			:width="action.width"
			:code-action="action.code"
			:title="action.title"
			:active="action.active"
			:img-src="action.imgSrc"
			:is-loading="loading"
			:header-color="action.color"
			:help-actions="actionsToHelp"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<products-search-form
				v-if="action.code === 'product-searcher'"
				:warehouseId="form.warehouse"
				:selectable="false"
				:search-value="searchProduct"
				:showFilter="false"
				@add-product="setProduct"
				is-sale
			/>
		</action-sidebar>
		<v-dialog persistent v-model="viewModalLots" max-width="600px">
			<modal-lotes-sales
				v-if="viewModalLots"
				:product-data="supplySelected"
				:quantity="supplySelected.quantity"
				isDischarge
				@close-modal-lotes="toogleModalLots"
				@confirm-modal-lotes="addProductWithLot"
			/>
		</v-dialog>
		<v-dialog persistent v-model="modalRegisterLot" max-width="600px">
			<modal-lotes
				:lotInfo="newLotData"
				:newObject="newProductFabric.product"
				:showAddModal="true"
				@closeModalLotes="toggleRegisterLot"
				@addProductModal="addProductModalLot"
			/>
		</v-dialog>
		<v-dialog persistent v-model="viewModalWarehouse" max-width="600px">
			<modal-warehouse-selector
				v-if="viewModalWarehouse"
				:product-data="supplySelected"
				:quantity="supplySelected.quantity"
				isDischarge
				@close-modal="toogleModalWarehouse"
				@confirm-modal="addProductWithWarehouse"
			/>
		</v-dialog>
		<simple-modal
			:open="modalConfirm"
			@cancel="toggleModalConfirm"
			@close="toggleModalConfirm"
			@confirm="changeState"
		>
			<span slot="title"
				>¿Está seguro que desea cambiar el estado a <b>{{ newNameStates }}</b> la
				producción del siguiente producto?</span
			>
			<span slot="subtitle" class="uppercase">"{{ newProductFabric.name }}"</span>
		</simple-modal>
		<modal
			:dialog="!!errorFetch"
			max-width="500"
			error
			persistent
			title="Verifque los siguientes productos"
			@close-modal="
				() => {
					errorFetch = null;
				}
			"
		>
			<div class="body-2p pa-4">
				<h4>Los siguientes productos no tienen stock suficiente: <br /></h4>
				<div v-html="errorFetch"></div>
				<!-- <div>
					<v-btn
						type="button"
						color= "error"
						class="btn-action mt-4"
						@click="errorFetch = null">
						Cerrar
					</v-btn>
				</div> -->
			</div>
		</modal>
	</div>
</template>

<script>
import { isAfter } from 'date-fns';
import productsSearchInput from '@/components/shared/searcher/products-search-input';
// import { required } from 'vuelidate/lib/validators';
// import format from 'date-fns/format';
import modal from '@/components/field-sale/shared/modal';
import appTable from '@/components/shared/table/app-table';
import actionSidebar from '@/components/shared/action-sidebar';
import productsSearchForm from '@/components/shared/searcher/products-search-form';
import modalLotesSales from '@/components/modal-lotes-sales';
import simpleModal from '@/components/field-sale/shared/simple-modal';
import modalWarehouseSelector from '@/components/modal-warehouse-selector';
import modalLotes from '@/components/modal-lotes';
import headerPage from './../../shared/header-page';
import helper from '../../../shared/helper';

const dateOnline = Date.now().toString();

export default {
	name: 'production-new',
	components: {
		appTable,
		headerPage,
		productsSearchInput,
		productsSearchForm,
		actionSidebar,
		modalLotesSales,
		modalWarehouseSelector,
		simpleModal,
		modalLotes,
		modal,
	},
	mounted() {
		this.loadData();
	},
	data() {
		return {
			activeTab: 'products',
			warehouses: helper.getLocalData('warehouses') || [],
			employees: [],
			cleanInput: false,
			messageValidation: '',
			currentPage: 1,
			// id: this.$route.params.id || null,
			menuInit: false,
			menuEnd: false,
			activitiesData: {},
			messageErrorProduct: '',
			originalStates: 8,
			dateOnlineOIP: Date.now().toString(),
			newLotData: undefined,
			errorFetch: '',
			statesOIP: [
				{
					id: 8,
					name: 'Pendiente',
				},
				{
					id: 7,
					name: 'En proceso',
				},
				{
					id: 2,
					name: 'Finalizado',
				},
			],
			tasks: [],
			params: {
				page: 1,
			},
			form: {
				search: '',
				quantity: 0,
				unitSelected: null,
				warehouse: null,
				states: 8,
				workData: {},
				notes: '',
			},
			cleanInputProduct: false,
			searchProduct: '',
			newProductFabric: {},
			supplySelected: null,
			supplies: [],
			action: {
				active: false,
				code: '',
				open: false,
				title: '',
				width: 600,
			},
			checkAll: false,

			loading: false,
			viewModalLots: false,
			viewModalWarehouse: false,
			rows: [],
			statesEnum: {
				pending: 8,
				process: 7,
				finished: 2,
			},
			columns: [
				{
					id: 1,
					name: 'Código',
					value: 'code',
					visible: true,
					checked: true,
				},
				{
					id: 2,
					name: 'Nombre',
					value: 'name',
					visible: true,
					checked: true,
				},
				{
					id: 3,
					name: 'Cantidad',
					value: 'quantity',
					visible: true,
					checked: true,
				},
				{
					id: 4,
					name: 'Precio Cost',
					value: 'priceCost',
					visible: true,
					checked: true,
				},
				{
					id: 5,
					name: 'Costo Unit.',
					value: 'priceCost',
					visible: true,
					checked: true,
				},
				{
					id: 6,
					name: 'Unidad',
					value: 'unitName',
					visible: true,
					checked: true,
				},
				{
					id: 7,
					name: 'Cod. Lote',
					value: 'codeLote',
					visible: true,
					checked: true,
				},
				{
					id: 8,
					name: 'Acciones',
					value: 'actions',
					visible: true,
					checked: true,
				},
			],
			columnsTask: [
				{ id: 1, name: 'Actividad', visible: true },
				{ id: 2, name: 'Realizado', visible: true },
				{ id: 3, name: 'Acciones', visible: true },
			],
			customersMultiple: [],
			cusMultipleSelect: [],
			modalConfirm: false,
			modalRegisterLot: false,
			disabledBtn: false,
			disabledConfirmBtn: false,
		};
	},
	props: {
		id: {
			default: null,
			type: [String, Number],
		},
	},
	computed: {
		unitsOptions() {
			if (!this.newProductFabric.product) return [];
			const { conversions, unit } = this.newProductFabric.product;
			const units = Object.keys(conversions).reduce((result, key) => {
				const item = conversions[key];
				result.push({
					id: Number(key),
					name: item.name,
					code: item.code,
					quantity: item.quantity,
				});
				return result;
			}, []);
			units.push({
				id: unit.id,
				name: unit.name,
				code: unit.code,
				quantity: 1,
			});
			return units;
		},
		disabledConfirm() {
			this.messageValidation = '';
			if (
				this.form.quantity <= 0 ||
				!this.form.unitSelected ||
				!this.newProductFabric.product
			) {
				return true;
			}
			if (
				this.newProductFabric.product &&
				!this.newProductFabric.product.flagFlowManufactured
			) {
				this.messageValidation = '*Seleccione un producto manofacturado';
				return true;
			}
			return false;
		},
		newNameStates() {
			const state = this.statesOIP.find((s) => s.id === this.form.states) || {};
			return state.name || '';
		},
		invalidState() {
			if (this.originalStates === 8) {
				return this.form.states === 2;
			}
			if (this.originalStates === 7) {
				return this.form.states === 8;
			}
			if (this.originalStates === 2) {
				return this.form.states !== 2;
			}
			return false;
		},
		registerLot() {
			return (
				this.originalStates === this.statesEnum.process &&
				this.form.states === this.statesEnum.finished &&
				this.id &&
				this.newProductFabric.product &&
				this.newProductFabric.product.flagLotsEnabled
			);
		},
	},
	watch: {
		'form.warehouse': {
			inmeediate: true,
			handler() {
				this.newProductFabric = {};
				this.unitSelected = null;
				this.messageValidation = '';
				this.quantity = null;
				this.form.search = '';
			},
		},
		rows(newRows) {
			// if (!this.rows.length) return;
			// const rows = this.rows;
			let txt = '';
			const missingToAdd = [];
			const incorrectQuantities = [];
			this.supplies.forEach((supply, idx) => {
				// console.log(productId, newRows.map(i => i.productId));
				const added = newRows.filter((row) => supply.productId === row.productId);
				// if (!added.length) this.messageError =
				//  `Aún no se añadierons los insumos del producto ${name}`;
				const totalAdd = added.reduce((acc, item) => acc + item.quantity, 0);
				if (!added.length) {
					missingToAdd.push(supply.name);
				} else if (this.supplies[idx].quantity !== totalAdd) {
					incorrectQuantities.push(supply.name);
				}
				this.supplies[idx].added = Boolean(added.length);
			});
			txt += missingToAdd.length
				? `Falta añadir los insumos ${missingToAdd.join(', ')}</br>`
				: '';
			txt += incorrectQuantities.length
				? `La cantidad de los insumos ${incorrectQuantities.join(
						', '
				  )} es incorrecta</br>`
				: '';
			this.messageErrorProduct = txt;
		},
	},
	methods: {
		printData(a) {
			console.log(a);
		},
		toggleRegisterLot() {
			this.modalRegisterLot = !this.modalRegisterLot;
		},
		toggleModalConfirm() {
			this.modalConfirm = !this.modalConfirm;
		},
		addProductModalLot(newObject) {
			this.newLotData = newObject;
			setTimeout(() => {
				this.modalRegisterLot = false;
			}, 100);
		},
		async loadData() {
			try {
				const { data: employees } = await this.globalEmployees();
				this.employees = employees.map(({ id, name }) => ({ id, name }));
				// LOAD DATA FOR EDIT
				if (this.id) {
					const { data: oip } = await this.$httpProduction.get(`projects/${this.id}`);
					this.loadTasks();
					const workData = {
						reference: '',
						timeExecution: '',
						numberTechnical: null,
						contactTechnical: '',
						contactExecution: '',
						dateStart: '',
						dateEnd: '',
					};
					this.form.workData = oip.workData ? oip.workData : workData;
					this.dateOnlineOIP = oip.workData.dateOnlineOIP;
					this.form.notes = oip.notes ? oip.notes : '';
					this.form.states = oip.states;
					this.originalStates = oip.states;
					this.form.requirementId = oip.requirement.id;
					this.form.code = oip.code;
					const productFabric = oip.requirement.details[0];
					const {
						name,
						groups,
						unitId,
						code,
						warehouseId,
						productId,
						quantity,
						brandId,
					} = productFabric;
					this.form.warehouse = warehouseId;
					const { data: product } = await this.$httpProducts.get(
						`products/master/${productId}`
					);
					const newProductFabric = {
						code,
						unitId,
						name,
						warehouseId,
						productId,
						product,
						brandId,
					};
					await this.setProduct(newProductFabric);
					this.form.search = name;
					this.form.quantity = quantity;
					this.form.unitSelected = this.unitsOptions.find(({ id }) => id === unitId);
					await this.confirmProduct();
					this.rows = groups.map((g) => ({
						...g,
						productLots: g.additionalInformation.productLots || null,
					}));
				}
			} catch (err) {
				console.error(err);
				this.showGenericError();
			}
		},
		openSearchProduct(val) {
			this.cleanInputProduct = false;
			this.searchProduct = val ? val.trim() : '';
			if (this.searchProduct) {
				this.action.code = 'product-searcher';
				this.action.title = 'Productos';
				this.action.width = 930;
				this.action.open = true;
			}
		},
		closeModal() {
			this.action.open = false;
			this.action.code = null;
			this.action.title = '';
			this.feeError = false;
			this.searchProduct = null;
			this.indexProduct = null;
			this.arrayNew = [];
			if (this.action.code === 'AI') {
				this.newIssue = false;
			} else if (this.action.code === 'AC') {
				this.newConsideration = false;
			}
		},
		setProduct(product) {
			this.form.search = product.product.name;
			this.newProductFabric = product;
			this.searchProduct = product.product.name;
			this.closeModal();
		},
		async confirmProduct() {
			this.disabledConfirmBtn = true;
			try {
				this.rows = [];
				// this.supplies = [];
				const productId = this.newProductFabric.productId;
				const { quantity, unitSelected } = this.form;
				const quantityProportion = quantity * unitSelected.quantity;
				const { data: groups } = await this.$httpProducts.get(
					`/products/master/${productId}/groups?relationAdd=products`
				);
				groups.forEach((item) => {
					// Insumo -> item
					const {
						name,
						cost,
						code,
						flagLotsEnabled,
						warehouseProductDetails,
						brandId,
						unit,
					} = item.product;
					const quantityFormula = quantityProportion * item.quantity;
					const supply = {
						name,
						cost,
						brandId,
						code,
						unit,
						warehouseProductDetails,
						unitId: item.unitId,
						unitName: item.unitName,
						flagLotsEnabled: flagLotsEnabled || 0,
						productId: item.productId,
						quantityFormula,
						quantity: quantityProportion * item.unitQuantity,
						added: false,
					};
					this.supplies.push(supply);
				});
			} catch (error) {
				console.error(error);
				this.showGenericError();
			} finally {
				this.disabledConfirmBtn = false;
			}
		},
		toogleModalLots(supply = null) {
			this.supplySelected = this.viewModalLots ? null : supply;
			this.viewModalLots = !this.viewModalLots;
		},
		toogleModalWarehouse(supply = null) {
			this.supplySelected = this.viewModalWarehouse ? null : supply;
			this.viewModalWarehouse = !this.viewModalWarehouse;
		},
		addProductWithLot(dataLot) {
			dataLot.forEach((lot) => {
				if (lot.quantity > 0) {
					const {
						code,
						date,
						dateDue,
						location,
						codeEan,
						selectedQuantity,
						warehouseId,
					} = lot;
					const productLots = {
						location,
						code,
						codeEan,
						date,
						dateDue,
						quantity: selectedQuantity,
					};
					const wh = this.supplySelected.warehouseProductDetails.find(
						({ id }) => warehouseId === id
					);
					const brandId = wh ? wh.brandId : null;
					const unit = this.supplySelected.unit;
					const newRow = {
						...this.supplySelected,
						unitName: unit.name,
						unitId: unit.id,
						warehouseId,
						brandId,
						productLots,
						quantity: selectedQuantity,
						priceCost: this.supplySelected.cost * selectedQuantity,
					};
					this.rows.push(newRow);
				}
			});
			this.toogleModalLots();
		},
		addProductWithWarehouse(dataWarehouse) {
			dataWarehouse.forEach((warehouseSelected) => {
				if (warehouseSelected.stockWarehouse > 0) {
					const {
						name: warehouseName,
						id: warehouseId,
						selectedQuantity,
						brandId,
					} = warehouseSelected;
					const unit = this.supplySelected.unit;
					const newRow = {
						...this.supplySelected,
						brandId,
						unitName: unit.name,
						unitId: unit.id,
						warehouseName,
						warehouseId,
						quantity: selectedQuantity,
						priceCost: this.supplySelected.cost * selectedQuantity,
					};
					this.rows.push(newRow);
				}
			});
			this.toogleModalWarehouse();
		},
		removeRow(idx) {
			this.rows.splice(idx, 1);
		},
		isTypeLot(prod) {
			return Boolean(prod.flagLotsEnabled);
		},
		validateEndDate(date) {
			this.form.workData.dateEnd = isAfter(this.form.workData.dateEnd, date)
				? this.form.workData.dateEnd
				: '';
		},
		async loadTasks() {
			try {
				const { data: tasks } = await this.$httpProduction.get(`activities/${this.id}`);
				this.tasks = tasks;
			} catch (err) {
				this.showGenericError();
			}
		},
		saveOIP() {
			if (this.form.states === this.statesEnum.process) {
				this.modalConfirm = true;
			} else if (this.form.states === this.statesEnum.finished) {
				this.modalConfirm = true;
			} else {
				this.saveData();
			}
		},
		async saveData(newDO) {
			this.disabledBtn = true;
			try {
				// como kardex
				const groups = this.rows.map((item) => {
					const additionalInformation = {
						productLots: item.productLots,
						warehouseName: item.warehouseName,
						// location: '',
					};
					return {
						productId: item.productId,
						code: item.code,
						name: item.name,
						cost: item.cost,
						unitName: item.unitName,
						unitId: item.unitId,
						brandId: item.brandId,
						priceCost: item.priceCost,
						warehouseId: item.warehouseId,
						quantity: item.quantity,
						additionalInformation,
					};
				});
				const { warehouseId, productId, name, brandId } = this.newProductFabric;
				const { quantity, unitSelected } = this.form;
				const details = [
					{
						productId,
						warehouseId,
						quantity,
						groups,
						name,
						brandId,
						unitName: unitSelected.name,
						unitId: unitSelected.id,
					},
				];
				const user = helper.getLocalData('admin-user');

				const body = {
					name: this.form.name || `${name} - ${this.form.workData.dateStart}`,
					code: this.id ? this.form.code : Date.now().toString(),
					description: this.form.description || 'Descripción de la OIP',
					states: this.form.states,
					dateStart: this.form.workData.dateStart,
					dateEnd: this.form.workData.dateEnd,
					workData: {
						...this.form.workData,
						dateOnline: newDO || this.dateOnlineOIP,
					},
					employeeId: user.id,
					notes: this.form.notes,
					requirementId: this.id ? this.form.requirementId : undefined,
					requirement: {
						requirementCode: this.id ? undefined : 'Codigo ejemplo',
						title: this.id ? undefined : 'titulo ejemplo',
						description: this.id ? undefined : '',
						details,
					},
				};
				const method = this.id ? 'patch' : 'post';
				await this.$httpProduction[method](
					`projects${this.id ? `/${this.id}` : ''}`,
					body
				);
				this.showNotification('La OIP se creó correctamente.');
				// this.loadData();
				this.goTo('list-oip');
			} catch (err) {
				console.error(err);
				this.showGenericError('Error al crear la OIP. Por favor verifique los datos');
			} finally {
				this.disabledBtn = false;
			}
		},
		async addTask() {
			this.disabledBtn = true;
			this.activitiesData.projectId = this.id;
			try {
				await this.$httpProduction.post('activities', this.activitiesData);
				this.loadTasks();
				this.activitiesData = {
					description: '',
					status: 1,
				};
			} catch (err) {
				this.showGenericError();
			} finally {
				this.disabledBtn = false;
			}
		},
		goTab(id) {
			this.activeTab = id || 'products';
		},
		addSupply(supply) {
			this.rows.push({
				...supply,
			});
		},
		async updateState({ id, status }) {
			try {
				await this.$httpProduction.patch(`activities-status/${id}/${status}`);
				this.showNotification('El estado de la actividad se actualizó correctamente.');
				this.loadTasks();
			} catch (err) {
				this.showGenericError();
			}
		},
		async updateTask(row) {
			const id = row.id;
			const task = { ...row };
			delete task.id;
			delete task.statusName;
			try {
				await this.$httpProduction.patch(`activities/${id}`, task);
				this.showNotification('La actividad ha sido actualizada correctamente.');
				this.loadTasks();
			} catch (err) {
				this.showGenericError();
			}
		},
		async changeState() {
			let body;
			if (this.form.states === this.statesEnum.process) {
				// pending -> process => egress
				body = {
					typeOperation: 0,
					description: '',
					createdAt: this.form.workData.dateStart,
					dateOnline,
					documentNumber: this.form.code,
					documentId: this.id,
					kardex: this.rows.map((supply) => ({
						brandId: supply.brandId,
						warehouseId: supply.warehouseId,
						productId: supply.productId,
						quantity: supply.quantity,
						priceCost: supply.priceCost,
						additionalInformation: {
							productLots: supply.productLots ? supply.productLots : undefined,
							warehouseName: supply.warehouseName,
						},
					})),
				};
			} else if (this.form.states === this.statesEnum.finished) {
				// process ->  => finished => entry
				const { warehouseId, productId, brandId, product } = this.newProductFabric;
				const { unitSelected = {} } = this.form;
				const quantity = this.form.quantity * (unitSelected.quantity || 1);
				const additionalInformation = {
					productLots: {
						...this.newLotData,
						quantity,
					},
				};
				body = {
					typeOperation: 1,
					description: '',
					createdAt: this.form.workData.dateEnd,
					dateOnline,
					documentNumber: this.form.code,
					documentId: this.id,
					kardex: [
						{
							additionalInformation: this.newLotData ? additionalInformation : undefined,
							priceCost: product.cost,
							quantity,
							brandId,
							warehouseId,
							productId,
						},
					],
				};
			}
			this.disabledBtn = true;
			try {
				await this.$httpProducts.post('kardex/product-manufactured', body);
				const newDO = Date.now().toString();
				await this.saveData(newDO);
				this.showNotification('La OIP se actualizó correctamente');
				this.goTo('list-oip');
			} catch (error) {
				if (error.status === 400) {
					if (error.data.message === 'STOCK_NOT_ENOUGH') {
						let txt = '';
						txt += '<ul>';
						error.data.details.forEach(({ name, stock }) => {
							txt += `<li> ${name} - Stock: ${stock} </li>`;
						});
						txt += '</ul>';
						this.errorFetch = txt;
						// this.showGenericError(txt);
					}
				}
				// this.showGenericError('Ocurrio un error, por favor contacte con soporte');
				this.toggleModalConfirm();
			} finally {
				this.disabledBtn = false;
			}
		},
	},
};
</script>
<style lang="scss" scoped>
.caption-gray {
	color: color(brown-grey);
	font-size: 12px;
	&.c-error {
		color: color(error);
	}
}
.buttons {
	color: white;
	border-radius: 5px;
	font-weight: 600;
	padding: 4px 1.2rem;
	margin: 0 0.5rem;
	width: 200px;
	text-transform: capitalize;
}

.supplies {
	h3 {
		font-size: 0.8rem;
		color: var(--primary);
	}

	.grid-supplies {
		font-size: 0.75rem;
		// text-decoration: upper;
		text-transform: uppercase;
		// display: flex;
		// align-items: center;
		display: flex;
		flex-wrap: wrap; /* Permite que los elementos se envuelvan en varias líneas */
		gap: 5px; /* Espacio entre los elementos */

		.item-grid-supply {
			padding-right: 5px;
			// flex: 1 1 calc(15% - 20px); /* Divide el espacio en 4 columnas */
			width: 130px;
			justify-content: center;
		}

		.small {
			font-size: 0.7rem;
		}
	}
}
</style>
