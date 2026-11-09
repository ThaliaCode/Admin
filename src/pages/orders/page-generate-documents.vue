<template>
	<div class="page-content">
		<header-page title="GENERAR DOCUMENTOS DE VENTA MASIVO" :limit-title="48" />
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
			@open-help="openHelp"
		/>
		<v-layout row px-4 pt-4 mb-4>
			<v-flex style="flex-direction: column; display: flex" xs2>
				<v-layout column>
					<v-flex class="caption primary--text"> Sucursal: </v-flex>
					<v-flex class="caption">
						{{ nameSubsidiary }}
					</v-flex>
				</v-layout>
				<app-date-select
					label="Fecha de Periodo"
					model="date"
					:date-formatted="params.date"
					@input="setDate"
				/>
			</v-flex>
			<v-flex xs1>
				<v-layout column>
					<v-flex class="caption primary--text"> Punto de Venta: </v-flex>
					<v-flex class="caption">
						{{ configInfo.terminal ? configInfo.terminal.name : null }}
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs2 ml-2>
				<v-layout row align-end>
					<button
						v-for="(item, index) in typeDocuments"
						:key="index"
						:disabled="params.flagAssignForWarehouse || params.flagAutoAssignForWarehouse"
						class="link-document ml-2"
						:class="{ active: typeDocumentSelected === item.id }"
						@click="selectTypeDocument(item)"
					>
						{{ item.code }}
					</button>
				</v-layout>
			</v-flex>
			<v-flex xs1 ml-1 mr-5>
				<v-layout column>
					<v-flex class="caption primary--text"> Serie - Num.: </v-flex>
					<v-flex class="caption">
						{{ configInfo.serie ? configInfo.serie.serie : null }} -
						{{ configInfo.serie ? configInfo.serie.number : null }}
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs4>
				<span class="primary--text body-2">Generación de documentos por un almacén</span>
				<app-tooltip-button
					class="ml-1"
					:img="'/static/img/new-icons/icon-help-fill.svg'"
					text="Mas información"
					@click-icon="eventInfo('oneWar')"
				></app-tooltip-button>
				<v-layout row align-center>
					<v-flex xs9>
						<v-layout row align-center>
							<v-checkbox
								small
								class="checkbox-customers label-text mr-3"
								color="primary"
								hide-details
								label="Generar Documentos Automático"
								v-model="params.flagAutoDocuments"
								@change="handleCheckboxChange('flagAutoDocuments')"
							/>
						</v-layout>
						<v-layout class="pl-4 ml-2">
							<span class="label description">
								Al convertir los pedidos a ventas se tomará en cuenta el tipo de documento
								seleccionado
								{{
									params.flagAutoDocuments ? 'al crear el pedido.' : 'en esta pantalla.'
								}}
							</span>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>

			<v-flex xs4>
				<span class="body-2 primary--text">Generación de documentos multialmacén</span>
				<app-tooltip-button
					class="ml-1"
					:img="'/static/img/new-icons/icon-help-fill.svg'"
					text="Mas información"
					@click-icon="eventInfo('multiWar')"
				></app-tooltip-button>
				<v-layout row align-center mb-1>
					<v-flex xs9>
						<v-layout row align-center>
							<v-checkbox
								small
								class="checkbox-customers label-text"
								color="primary"
								hide-details
								label="Conversión de múltiples almacenes"
								v-model="params.flagAssignForWarehouse"
								@change="handleCheckboxChange('flagAssignForWarehouse')"
							/>
						</v-layout>
						<v-layout class="pl-4 ml-2">
							<span class="label description">
								Las ventas se generan en función del tipo de documento configurado en el
								almacén.
							</span>
						</v-layout>
					</v-flex>
				</v-layout>
				<v-layout row align-center>
					<v-flex xs9>
						<v-layout row align-center>
							<v-checkbox
								small
								class="checkbox-customers title"
								color="primary"
								hide-details
								label="Conversión automática de múltiples almacenes"
								v-model="params.flagAutoAssignForWarehouse"
								@change="handleCheckboxChange('flagAutoAssignForWarehouse')"
							/>
						</v-layout>
						<v-layout class="pl-4 ml-2">
							<span class="label description">
								Las ventas se generan respetando el tipo de documento seleccionado al
								crear el pedido.
							</span>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<!-- <v-layout row px-4 mt-2 mb-2>
			<v-flex xs2>
				<v-layout row align-end xs3>
					<v-layout column>
						<v-flex class="title-range">Rangos</v-flex>
						<v-flex xs4>
							<app-input-text
								placeholder="Monto Min."
								model="amountMin"
								@input="setData"
								type="number"
								:text="params.amountMin"
							/>
						</v-flex>
					</v-layout>
					<v-flex xs8 ml-1>
						<app-input-text
							placeholder="Monto Max."
							model="amountMax"
							@input="setData"
							type="number"
							:text="params.amountMax"
						/>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex ml-2 xs2>
				<app-select
					model="customerId"
					label="Grupo de Clientes"
					item-text="name"
					item-value="id"
					:return-object="false"
					:item="params.customerId"
					:items="groupClients"
					@input="setCustomer"
				/>
			</v-flex>
			<v-flex ml-2 xs2>
				<app-date-select
					label="Fecha de Periodo"
					model="date"
					:date-formatted="params.date"
					@input="setDate"
				/>
			</v-flex>
		</v-layout> -->
		<v-flex xs12 mt-3 px-1>
			<app-table
				:columns="columns"
				:rows="rows"
				:inputSearch="false"
				:last-page="lastPage"
				:current-page="currentPage"
				:items-quantity="rows.length"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">
						{{ props.row.number }}
					</td>
					<td v-show="showRow(columns, 2)">
						{{
							props.row.customerFullName ||
							(props.row.customer && props.row.customer.typePerson.fullName)
						}}
					</td>
					<td v-show="showRow(columns, 3)">
						{{ props.row.documentNumberComplete }}
					</td>
					<td v-show="showRow(columns, 4)">{{ props.row.total }}</td>
					<td v-show="showRow(columns, 5)">
						<app-tooltip-button
							v-if="
								props.row.orderStateId === 1 ||
								props.row.orderStateId === 8 ||
								props.row.orderStateId === 4
							"
							text="Este pedido no puede ser generado"
							icon="error_outline"
							color="error"
						/>
						{{
							props.row.orderStateName ||
							(props.row.orderState && props.row.orderState.name)
						}}
					</td>
					<td v-show="showRow(columns, 6)">
						<document-state
							:color="props.row.paymentStateColor"
							:tooltip="props.row.paymentStateName"
						/>
					</td>
					<td v-show="showRow(columns, 7)">
						{{ props.row.wayPaymentName || wayPaymentNameRow(props.row) }}
					</td>
					<td v-show="showRow(columns, 8)">
						{{ props.row.createdAt | formatDate('DD/MM/YYYY HH:MM:SS') }}
					</td>
					<td v-show="showRow(columns, 9)">
						{{ props.row.comments || '-' }}
					</td>
					<td v-show="showRow(columns, 10)">
						<app-tooltip-button
							v-if="props.row.orderAnnexId || props.row.flagSale === 1"
							text="El pedido ya se encuentra relacionado"
							icon="info"
							color="info"
						/>
						<app-tooltip-button
							text="Eliminar"
							icon="delete"
							color="error"
							@click-icon="deleteRow(props.row)"
						/>
					</td>
				</template>
				<template slot="footerSemi">
					<td colspan="2" class="footer-table"></td>
					<td class="footer-table--select">
						<div class="footer-table--text">Total Monto</div>
						<div>{{ totalStock }}</div>
					</td>
					<td colspan="5" class="footer-table"></td>
				</template>
			</app-table>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:img="false"
				cancel-text="Atras"
				padding-cancel="px-5"
				padding-success="px-4"
				success-color="primary"
				success-text="Generar Documentos"
				:is-loading="!!validatedSerie || !!validatedNumber || isLoading"
				@accept-button-clicked="generateDocuments"
				@cancel-button-clicked="goBack"
			/>
		</section>
		<action-sidebar
			:code-action="action.code"
			:title="action.title"
			:active="action.active"
			v-model="action.open"
			:width="action.width"
			@close="closeModal"
		>
			<selling-points
				v-if="isAction('selling-points')"
				:serie="configInfo.serie"
				:type-document-id="typeDocumentSelected"
				:subsidiaries="subsidiaries"
				@close="closeModal"
				@save-point="savePoint"
			/>
		</action-sidebar>
		<app-show-dialog
			color-dialog="error"
			color-hex="#D5331A"
			title-header="NO SE PUEDE GENERAR EL DOCUMENTO"
			text-content="Verificar que uno o más pedidos no se encuentren en estado SOLICITADO, BORRADOR o CANCELADO"
			:show-modal-init="showModal"
			@close-dialog="closeDialogInit"
		/>
		<v-dialog v-model="showInfoMore" max-width="550px" persistent>
			<v-card>
				<v-card-title class="headline primary--text">
					{{
						typeInfo === 'oneWar'
							? 'Generación de documentos por un almacén'
							: 'Generación de documentos multialmacén'
					}}
				</v-card-title>

				<v-card-text class="pt-4 px-5">
					<p class="text-info">
						{{
							typeInfo === 'oneWar'
								? 'Esta opción permite convertir los pedidos a ventas, tomando en cuenta el almacén del punto de venta del usuario que inició sesión o, en su defecto, el almacén del punto de venta seleccionado en esta pantalla.'
								: 'Esta opción permite convertir los pedidos separando las ventas por diferentes almacenes, tomando en cuenta el almacén al que pertenecen los productos relacionados al pedido (si un pedido tiene productos de tiendas diferentes, se generará una venta por cada tienda con los productos correspondientes).'
						}}
					</p>
				</v-card-text>

				<v-card-actions class="justify-center">
					<modal-sidebar-button
						hidden
						:height="'70px'"
						@accept-button-clicked="eventInfo"
					/>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="showDetailsError" persistent max-width="625">
			<v-card class="modal">
				<v-card-title class="title-card justify-center text-center">
					<span class="title-text">Error al generar documentos</span>
				</v-card-title>
				<div class="mx-4" style="color: red; font-size: 0.8rem">
					{{ modalMessage }}
				</div>
				<app-table
					class="pa-0 mb-4 mt-2"
					name="products-witchout-stock"
					:inputSearch="false"
					:filterColumns="false"
					:rows="detailErrorWarehouse"
					:selectable="false"
					:show-pagination="true"
					:columns="columnsDetailError"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)">{{ props.row.name || '-' }}</td>
						<td v-show="showRow(columns, 3)">
							{{ props.row.orderNumber && props.row.orderNumber.join(' | ') }}
						</td>
					</template>
				</app-table>
				<v-card-actions class="justify-center pb-3">
					<v-btn
						class="btn-action"
						color="pink"
						type="button"
						@click="closeModalErrorDetails"
						small
					>
						Atras
						<v-icon color="white" size="16" class="ml-1"> highlight_off </v-icon>
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import appActions from '@/components/shared/app-actions';
import appShowDialog from '@/components/shared/app-show-dialog';
import actionSidebar from '@/components/shared/action-sidebar';
import lib from '@/shared/lib';
import helper from '@/shared/helper';
import appTable from '@/components/shared/table/app-table';
import documentState from '@/components/shared/document-state';
import format from 'date-fns/format';
import headerPage from '@/components/shared/header-page';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import sellingPoints from '@/components/shared/sales/selling-points';
import simpleModal from '@/components/field-sale/shared/simple-modal';

const { equality, find } = lib;

function validatedSerie() {
	if (this.configInfo) {
		if (this.configInfo.serie) {
			return !this.configInfo.serie.serie;
		}
	}
	return true;
}

function validatedNumber() {
	if (this.configInfo) {
		if (this.configInfo.serie) {
			return !this.configInfo.serie.number;
		}
	}
	return true;
}

function deleteRow(row) {
	const index = this.rows.findIndex((p) => p.id === row.id);
	if (index > -1) {
		this.rows.splice(index, 1);
	}
}

async function created() {
	const orders = helper.getLocalData('orders-selected') || [];
	this.rows = orders.map((order) => {
		const newOrder = { ...order };
		newOrder.documentNumberComplete =
			order.customer && order.customer.typePerson
				? `${order.customer.typePerson.documentName}: ${order.customer.typePerson.documentNumber}`
				: null;
		return newOrder;
	});
	const request = [
		this.getTypeDocuments('sales'),
		this.$httpSales.get('group'),
		this.$httpSales.get('subsidiaries'),
	];
	[
		{ data: this.typeDocuments },
		{ data: this.groupClients },
		{ data: this.subsidiaries },
	] = await Promise.all(request);
	const subsidiary = this.subsidiaries.find((p) => p.id === this.rows[0].subsidiaryId);
	this.nameSubsidiary = subsidiary.sucursalName || '';
	if (this.groupClients.length === 1) {
		this.params.customerId = this.groupClients[0].id;
	}
	this.typeDocuments = this.typeDocuments.reduce((accum, td) => {
		if (
			td.documentType.code === 'BOL' ||
			td.documentType.code === 'FAC' ||
			td.documentType.code === 'NTV'
		) {
			accum.push(td.documentType);
		}
		return accum;
	}, []);
	this.typeDocumentSelected = this.typeDocuments[0].id;
	this.typeDocumentSelectedCode = this.typeDocuments[0].code;
	this.params.date = format(this.$today(), 'YYYY-MM-DD');
	this.totalStock = this.rows.reduce((a, b) => a + b.total || 0, 0);
	this.loadConfigData(this.typeDocumentSelectedCode);
	this.loadBilling();
}

function isAction(code) {
	return this.action.code === code;
}

async function loadTerminals() {
	const params = {
		comSubsidiariesId: this.rows[0].subsidiaryId,
		typeBilling: this.typeBillingSelected,
		typeDocumentId: this.typeDocuments[0].id,
	};
	try {
		const response = await this.$httpSales.get('terminals', { params });
		this.terminals = response.data.reduce((acum, r) => {
			const newAcum = [...acum];
			if (r.series.length) {
				const newPoint = { ...r };
				newPoint.serie = r.series[0];
				newAcum.push(newPoint);
			}
			return newAcum;
		}, []);
		if (this.terminals.length === 1) {
			this.terminalId = this.terminals[0].id;
			this.params.serie = this.terminals[0].serie.number;
		}
	} catch (e) {
		this.showGenericError();
	}
}

async function loadBilling() {
	const params = {
		comSubsidiariesId: this.rows[0].subsidiaryId,
	};
	try {
		const response = await this.$httpSales.get('type-billing', { params });
		this.billings = response.data;
		this.typeBillingSelected = this.billings[0].id;
	} catch (e) {
		this.showGenericError();
	}
}

function closeDialogInit() {
	this.showModal = false;
}

async function generateDocuments() {
	const validOrder = this.rows.some(
		(p) => p.orderStateId === 1 || p.orderStateId === 8 || p.orderStateId === 4
	);
	if (validOrder) {
		this.showModal = true;
	} else {
		this.isLoading = true;
		const body = {
			comSubsidiariesId: this.configInfo.serie.comSubsidiariesId,
			name: `${this.typeDocumentSelectedCode} - ${this.params.date}`,
			dateOperation: this.params.date,
			terminalId: this.configInfo.terminal.id || undefined,
			serieId: this.configInfo.serie.id || undefined,
			// groupClientId: this.params.customerId,
			// maxAmount: this.params.amountMax,
			// minAmount: this.params.amountMin,
			description: '',
			flagAutoDocuments: this.params.flagAutoDocuments,
			flagAssignForWarehouse: this.params.flagAssignForWarehouse,
			flagAutoAssignForWarehouse: this.params.flagAutoAssignForWarehouse,
			typeDocumentCode: this.typeDocumentSelectedCode,
			orderIds: this.rows.map((p) => p.id),
		};
		try {
			await this.$httpSales.post('sal-order-annex', body);
			this.showNotification('Se genero los documentos correctamente.');
			helper.removeLocalData('orders-selected');
			this.goTo('page-resumen-documents');
		} catch (e) {
			if (e.status === 400) {
				this.showGenericError(e.data.messageError);
				if (e.data.message === 'BANK_ACCOUNT_NOT_FOUND') {
					this.showGenericError(e.data.messageError);
				}
				if (e.data.message === 'WAREHOUSE_ID_NEEDED') {
					this.showGenericError(e.data.messageError);
					this.detailErrorWarehouse = e.data.details;
					this.modalMessage = e.data.messageError;
					this.showDetailsError = true;
				}
			} else {
				this.showGenericError();
			}
		} finally {
			this.isLoading = false;
		}
	}
}

function setData({ model, value }) {
	this.params[model] = value;
}

function setCustomer({ model, value }) {
	this.params[model] = value;
}

function setDate({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
}

function goBack() {
	this.$router.back();
}

function filterTypeDocuments(...args) {
	const [flag, ...rest] = args;
	return this.typeDocuments.reduce((list, item) => {
		const { documentType } = item;
		const { code, flagType } = documentType;
		const documentExist = find(equality(code), rest);
		if (flagType === flag && documentExist) {
			return list.concat(item);
		}
		return list;
	}, []);
}

function selectDocument(item) {
	this.typeBillingSelected = item.id;
	this.loadTerminals();
}

function selectTypeDocument(item) {
	this.typeDocumentSelected = item.id;
	this.typeDocumentSelectedCode = item.code;
	this.loadConfigData(item.code);
	this.typeDocumentId = item.code;
}

async function loadConfigData(documentCode) {
	try {
		({ data: this.configInfo } = await this.$httpSales.get(
			`terminals/${documentCode}/user`
		));
		const { typeBilling } = this.configInfo.serie;
		this.configInfo.cash = this.configInfo.terminal.cash || {};
		this.configInfo.cash.balance = this.configInfo.terminal.cash.balance || {};
		this.configInfo.serie.typeBillingTooltip =
			typeBilling === 1 ? 'Electrónica' : 'Física';
		this.configInfo.serie.typeBillingName = typeBilling === 1 ? 'Elec.' : 'Fís.';
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'SERIE_EXIST') {
				this.showGenericError(
					'El documento seleccionado no cuenta con una serie para crear ventas.'
				);
			}
		}
	}
}

function setTerminal({ model, value }) {
	this[model] = value.id;
	this.params.serie = value.serie.number;
}

function runAction({ code }) {
	if (code === 'selling-points') {
		this.action.title = 'SELECCIONE UNA SUCURSAL Y TERMINAL';
		this.action.code = code;
		this.action.open = true;
		this.action.width = 488;
	}
}

function closeModal() {
	this.action.open = false;
	this.action.code = null;
	this.action.title = '';
}

function savePoint(point) {
	this.configInfo.serie.salTerminalsId = point.id;
	this.configInfo.serie.salTerminalsId = point.id;
	this.configInfo.cash.id = point.cash.id;
	this.configInfo.cash.name = point.cash.name;
	this.configInfo.cash.balance = point.cash.balance;
	this.configInfo.terminal.name = point.name;
	this.configInfo.terminal.id = point.id;
	this.configInfo.serie.typeBilling = point.serie.typeBilling;
	this.configInfo.serie.typeBillingTooltip =
		point.serie.typeBilling === 1 ? 'Electrónica' : 'Física';
	this.configInfo.serie.typeBillingName =
		point.serie.typeBilling === 1 ? 'Elec.' : 'Fís.';
	this.configInfo.serie.id = point.serie.id;
	this.configInfo.serie.serie = point.serie.serie;
	this.configInfo.serie.number = point.serie.number;
	this.configInfo.serie.comSubsidiariesId = point.serie.comSubsidiariesId;
	this.nameSubsidiary = point.subsidiary.sucursalName;
	this.closeModal();
}

function wayPaymentNameRow({ wayPaymentId }) {
	if (wayPaymentId === 2) {
		return 'Pago al Recibir';
	} else if (wayPaymentId === 1) {
		return 'Tarjeta de Credito o Debito';
	}
	return 'Banca por Internet o Deposito';
}

function data() {
	return {
		action: {
			active: false,
			code: '',
			open: false,
			title: '',
			width: 600,
		},
		billings: [],
		columns: [
			{ id: 1, name: '#', visible: true, checked: true },
			{
				id: 2,
				name: 'Cliente',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Tipo-Nro de Doc.',
				tooltip: 'Tipo y Número de Documento',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Monto',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'E. Ped.',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'E. Pago.',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'M.Pago',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'F.Creación',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Comentario',
				visible: false,
				checked: false,
			},
			{
				id: 10,
				name: 'Acciones',
				visible: true,
				checked: true,
			},
		],
		configInfo: {
			cash: {
				balance: {},
			},
			serie: {},
			terminal: {},
		},
		groupClients: [],
		idTypeDocumentSelect: null,
		typeBillingSelected: null,
		typeDocumentSelected: null,
		typeDocumentSelectedCode: null,
		currentPage: 1,
		customers: [],
		lastPage: 0,
		subsidiaries: [],
		nameSubsidiary: null,
		params: {
			flagAutoDocuments: false,
			flagAssignForWarehouse: false,
			flagAutoAssignForWarehouse: false,
			amountMin: null,
			amountMax: null,
			date: null,
			serie: null,
		},
		rows: [],
		showModal: false,
		totalStock: 0,
		terminalId: null,
		terminals: [],
		typeDocuments: [],
		typeDocumentId: null,
		showInfoMore: false,
		typeInfo: null,
		showDetailsError: false,
		modalMessage: '',
		detailErrorWarehouse: [],
		columnsDetailError: [
			{
				id: 1,
				name: 'Nombre',
				value: 'name',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Pedido',
				value: 'orderNumber',
				checked: true,
				visible: true,
			},
		],
		isLoading: false,
	};
}

export default {
	name: 'page-generate-documents',
	created,
	components: {
		appActions,
		appShowDialog,
		actionSidebar,
		appTable,
		documentState,
		headerPage,
		modalSidebarButton,
		sellingPoints,
		simpleModal,
	},
	computed: {
		validatedSerie,
		validatedNumber,
		// validateParams() {
		// 	return (
		// 		!this.params.flagAutoDocuments &&
		// 		!this.params.flagAssignForWarehouse &&
		// 		!this.params.flagAutoAssignForWarehouse
		// 	);
		// },
	},
	methods: {
		wayPaymentNameRow,
		closeDialogInit,
		closeModal,
		deleteRow,
		goBack,
		generateDocuments,
		filterTypeDocuments,
		isAction,
		loadBilling,
		loadConfigData,
		loadTerminals,
		runAction,
		savePoint,
		selectTypeDocument,
		selectDocument,
		setCustomer,
		setData,
		setDate,
		setTerminal,
		eventInfo(type) {
			this.typeInfo = type;
			this.showInfoMore = !this.showInfoMore;
		},
		handleCheckboxChange(checkedCheckbox) {
			this.typeDocumentSelected = this.typeDocuments[0].id;
			if (checkedCheckbox === 'flagAutoDocuments') {
				this.params.flagAssignForWarehouse = false;
				this.params.flagAutoAssignForWarehouse = false;
			}
			if (checkedCheckbox === 'flagAssignForWarehouse') {
				this.typeDocumentSelected = null;
				this.params.flagAutoDocuments = false;
				this.params.flagAutoAssignForWarehouse = false;
			}
			if (checkedCheckbox === 'flagAutoAssignForWarehouse') {
				this.typeDocumentSelected = null;
				this.params.flagAutoDocuments = false;
				this.params.flagAssignForWarehouse = false;
			}
		},
		closeModalErrorDetails() {
			this.showDetailsError = false;
			this.detailErrorWarehouse = [];
			this.modalMessage = '';
		},
	},
	data,
};
</script>

<style lang="scss" scoped>
.page-content {
	padding-bottom: 12%;
}
.text-serie {
	color: color(primary);
	font-family: font(open-bold);
	font-size: 13px;
}

.title-range {
	color: #8f8f8f;
	font-size: 13px;
}

.link-document {
	background: #fff;
	border-radius: 3px;
	font-size: 12px;
	height: 32px;
	padding: 0 4px;
	width: 32px;

	&.active {
		background: color(background-sidebar);
		color: color(white);
	}
}

.label {
	font-family: font(open-regular);
	font-size: size(small13);
	margin-bottom: 1px;
}

.description {
	color: color(brown-grey);
	font-size: 12px;
}

.headline {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(medium) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 340px;
	padding-top: 17px !important;
	text-align: center;
}

.text-info {
	font-size: 14px;
	margin-bottom: 0;
}
</style>
