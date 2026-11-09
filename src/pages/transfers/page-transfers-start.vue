<template>
	<div>
		<header-page :limit-title="80" :title="`${$route.meta.title} ${transferNumber}`" />
		<general-filter class="layout pt-2 pb-3">
			<v-layout row wrap>
				<v-flex xs12 mb-3>
					<v-layout row wrap>
						<v-flex xs2>
							<label class="item-transfer-start">Número: </label>{{ transferNumber }}
						</v-flex>
						<v-flex xs2>
							<label class="item-transfer-start">T.Origen: </label>
							{{ transfer.warehouseOrigin.name }}
						</v-flex>
						<v-flex xs2>
							<label class="item-transfer-start">T.Destino: </label
							>{{ transfer.warehouseDestination.name }}
						</v-flex>
						<v-flex xs2>
							<label class="item-transfer-start">Estado: </label>{{ transfer.statusName }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs12>
					<v-layout row wrap>
						<v-flex xs2>
							<label class="item-transfer-start">Tipo de Doc: </label
							>{{ transfer.typeDocument.code }}
						</v-flex>
						<v-flex xs2>
							<label class="item-transfer-start">Fecha de Creación: </label
							>{{ transfer.createdAt | formatDate('YYYY-MM-DD') }}
						</v-flex>
						<v-flex xs2>
							<label class="item-transfer-start">Ultima Act.: </label
							>{{ transfer.updatedAt | formatDate('YYYY-MM-DD') }}
						</v-flex>
						<v-flex xs2>
							<label class="item-transfer-start">Fecha Anul: </label
							>{{ transfer.cancelDate | formatDate('YYYY-MM-DD') }}
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</general-filter>
		<div class="border-bottom mt-3"></div>
		<div class="mt-5">
			<app-table
				class="is-not-selectable no-main-list table-transfers"
				:current-page="currentPage"
				:last-page="lastPage"
				name="page-transfers-start"
				:columns="columns"
				:filter-columns="false"
				:input-search="false"
				:rows="rows"
				:items-quantity="rows.length"
				:items-total-quantity="itemsTotalQuantity"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">
						{{ props.row.product.code }}
					</td>
					<td v-show="showRow(columns, 2)">
						{{ props.row.product.autoBarcode }}
					</td>
					<td v-show="showRow(columns, 3)">{{ props.row.product.name }}</td>
					<td v-show="showRow(columns, 4)">
						{{ props.row.product.inlineFeatures }}
					</td>
					<td v-show="showRow(columns, 5)">
						{{ props.row.product.description }}
					</td>
					<td v-show="showRow(columns, 6)">{{ props.row.brand.name }}</td>
					<td v-show="showRow(columns, 7)">{{ props.row.quantity }}</td>
					<td v-show="showRow(columns, 8)">
						<v-text-field
							type="number"
							class="filter-select shadow-inset-table"
							@click.stop="stopClick"
							single-line
							hide-details
							:readonly="!isMyWarehouse"
							v-model="props.row.quantitySent"
							:disabled="props.row.disabled"
							@input="setQuantitySent($event, props.row.id)"
						>
						</v-text-field>
					</td>
					<td v-show="showRow(columns, 9)">
						<v-text-field
							type="text"
							class="filter-select shadow-inset-table"
							@click.stop="stopClick"
							single-line
							hide-details
							:readonly="!isMyWarehouse"
							:disabled="props.row.disabled"
							v-model="props.row.reason"
						>
						</v-text-field>
					</td>
					<td v-show="showRow(columns, 10)">{{ props.row.stockAvaible }}</td>
					<td v-show="showRow(columns, 11)">
						<app-tooltip-button
							class="table-icon mr-2"
							height="21"
							color="error"
							icon="close"
							text="Cancelar"
							@click-icon="openModal(props.row)"
						>
						</app-tooltip-button>
						<app-tooltip-button
							v-if="props.row.product.flagControlSerie"
							img="/static/img/icons/barcode.svg"
							:height="25"
							text="Control de series"
							@click-icon="openSeries(props.row)"
						/>
					</td>
				</template>
			</app-table>
		</div>
		<v-layout wrap justify-center px-4>
			<v-flex xs12>
				<v-text-field
					no-resize
					multi-line
					single-line
					class="textarea-content filter-select shadow-inset"
					label="Comentario"
					v-model="commentary"
				></v-text-field>
			</v-flex>
		</v-layout>
		<v-dialog v-model="dialog" persistent max-width="360">
			<modal-items
				title="¿Desea cancelar registro?"
				name-action="Aceptar"
				name-cancel="Cancelar"
				v-if="dialog"
				show-slot
				@close-modal="noCancelRegistration"
				@action-modal="cancelRegistration"
			></modal-items>
		</v-dialog>
		<app-show-dialog
			:valid-warehouse="false"
			:show-products="true"
			:products="productsNotStock"
			color-dialog="error"
			color-hex="#D5331A"
			title-header="Realizar Transferencia"
			:show-modal-init="dialogNotStock"
			:text-content="textNotStock"
			@close-dialog="closeDialogNot"
		/>
		<v-layout justify-center mt-5>
			<v-btn
				class="btn-action caption white--text"
				color="pink"
				@click="cancelTransfersStart"
			>
				Cancelar
			</v-btn>
			<v-btn
				class="btn-action caption white--text ml-4"
				color="primary"
				@click="startTransfers"
				:disabled="disabled"
			>
				Iniciar
			</v-btn>
		</v-layout>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			:help-actions="actionsToHelp"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<view-series
				v-if="action.code === 'view-series'"
				:product="saleSeriesProduct"
				:serie="saleSeries"
				@send-series="sendSeries"
				@close="closeModal"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import appShowDialog from '@/components/shared/app-show-dialog';
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import generalFilter from '@/components/shared/general-filter';
import helper from '@/shared/helper';
import modalItems from '@/components/shared/modal-items';
import actionSidebar from '@/components/shared/action-sidebar';
import viewSeries from '@/components/transfers/view-series';

function cancelTransfersStart() {
	this.goTo('list-of-transfers');
}

async function loadData() {
	try {
		({ data: this.transfer, headers: this.headers } = await this.$httpProducts.get(
			`transfers/${this.id}`
		));
		this.transfer.typeDocument = this.transfer.typeDocument || {
			id: this.transfer.typeDocumentId,
		};
		this.transferNumber = `${this.transfer.serie}-${this.transfer.number}`;
		this.transfer.warehouseOrigin = this.transfer.warehouseOrigin || '';
		this.rows = [
			...this.transfer.details.map((detail) => {
				const newDetail = { ...detail };
				newDetail.stockAvaible = detail.product ? detail.product.stockWarehouse : 0;
				newDetail.brand = newDetail.brand || {};
				newDetail.quantitySent = newDetail.quantity;
				newDetail.line = false;
				newDetail.flagUse = 0;
				newDetail.disabled = false;
				newDetail.dateOnline = this.dateOnline;
				return newDetail;
			}),
		];
		this.lastPage = Number(this.headers['x-last-page']);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function created() {
	const newDate = new Date();
	this.dateOnline = newDate.getTime().toString();
	this.loadData();
}

async function startTransfers() {
	this.disabled = true;
	const array = this.rows
		.filter((r) => !r.line)
		.map((r) => {
			const newRow = {
				idDetail: r.id || undefined,
				dateOnline: r.dateOnline,
				productId: r.productId,
				quantitySent: Number(r.quantitySent),
				status: r.status,
				reason: r.reason,
				additionalInformation: {
					seriesSend: r.seriesSend || r.additionalInformation.series,
				},
			};
			return newRow;
		});
	const body = {
		comment: this.commentary,
		details: array,
	};
	try {
		await this.$httpProducts.patch(`transfers/${this.id}/start`, body);
		this.disabled = false;
		helper.removeLocalData('list-transfer');
		this.cancelTransfersStart();
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'STOCK_NOT_ENOUGH') {
				this.dialogNotStock = true;
				this.productsNotStock = error.data.details;
				this.textNotStock = 'Uno o más productos no cuentan con stock.';
				this.showGenericError(error.data.messageError);
			} else if (error.data.message === 'TRANSFER_SERIE_IS_ACTIVE') {
				this.showNotification(
					'Ya existe una transferencia activa para esta serie. Finalízala antes de iniciar una nueva..',
					'error'
				);
			} else {
				this.showGenericError(error.data.messageError);
			}
		} else {
			this.showGenericError();
		}
	}
	this.disabled = false;
}

function closeDialogNot() {
	this.dialogNotStock = false;
}

function isMyWarehouse() {
	const user = helper.getLocalData('admin-user');
	const warehouseId = user.warWarehousesId;
	const flagInitTransfers = user.additionalInformation && user.additionalInformation.flagInitTransfers;

	if (flagInitTransfers) {
		return true;
	}

	return warehouseId === this.transfer.warehouseOriginId;
}

function noCancelRegistration() {
	this.dialog = false;
	this.idCancel = null;
}

function cancelRegistration() {
	const index = this.rows.findIndex((r) => r.id === this.idCancel);
	if (index > -1) {
		this.showNotification('Se canceló registro correctamente');
		this.noCancelRegistration();
		this.rows[index].line = true;
		this.rows[index].flagUse = 1;
		this.rows[index].disabled = true;
	}
}

function openModal({ id }) {
	this.dialog = true;
	this.idCancel = id;
}

function setQuantitySent(value, id) {
	if (value !== '') {
		if (Number(value) === 0) {
			this.showGenericError(
				'No puede enviar 0 cantidad de productos en todo caso tiene la opción de cancelar el envió de ese producto'
			);
			const index = this.rows.findIndex((r) => r.id === id);
			if (index > -1) {
				this.rows[index].quantitySent = 1;
			}
		}
	}
}

function data() {
	return {
		dialogNotStock: false,
		rows: [],
		currentPage: 1,
		lastPage: 0,
		productsNotStock: [],
		columns: [
			{
				id: 1,
				name: 'Código',
				value: 'code',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Código interno',
				value: 'codeBar',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Nombre',
				value: 'name',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Caracteristicas',
				value: 'characteristics',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Descripción',
				value: 'description',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'Marca',
				value: 'brand',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'Cant. Solicitado',
				value: 'quantity',
				checked: true,
				visible: true,
			},
			{
				id: 8,
				name: 'Cant. Enviados',
				value: 'quantitySend',
				checked: true,
				visible: true,
			},
			{
				id: 9,
				name: 'Observación',
				value: 'observation',
				checked: true,
				visible: true,
			},
			{
				id: 10,
				name: 'Stock',
				value: 'stock',
				checked: true,
				visible: true,
			},
			{
				id: 11,
				name: 'Acciones',
				value: 'stock',
				checked: true,
				visible: true,
			},
		],
		itemsTotalQuantity: 0,
		transfer: {
			typeDocument: {},
			warehouseDestination: {},
			warehouseOrigin: {},
		},
		textNotStock: '',
		transferNumber: '',
		dialog: false,
		idCancel: null,
		commentary: null,
		disabled: false,
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 0,
		},
		actionDefault: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 0,
		},
		saleSeriesProduct: {},
		saleSeries: {},
	};
}

export default {
	data,
	name: 'page-transfers-start',
	created,
	methods: {
		cancelTransfersStart,
		closeDialogNot,
		loadData,
		startTransfers,
		noCancelRegistration,
		cancelRegistration,
		openModal,
		setQuantitySent,
		openSeries(row) {
			this.action.code = 'view-series';
			this.action.open = true;
			this.action.title = `${row.product.code}-${row.product.name} - SERIES`;
			this.action.width = 770;
			this.saleSeries = row;
			this.saleSeriesProduct = row.product;
		},
		closeModal() {
			this.idRow = null;
			this.action = { ...this.actionDefault };
		},
		sendSeries(rowSeries, id, sumSeries) {
			const index = this.rows.findIndex((p) => p.productId === id);
			if (index > -1) {
				this.rows[index].seriesSend = rowSeries;
				this.rows[index].quantity = sumSeries;
				this.rows[index].quantitySent = sumSeries;
			}
			this.closeModal();
		},
	},
	components: {
		actionSidebar,
		appShowDialog,
		appTable,
		headerPage,
		generalFilter,
		modalItems,
		viewSeries,
	},
	computed: {
		isMyWarehouse,
	},
	props: {
		id: [Number, String],
	},
};
</script>

<style lang="scss" scoped>
.item-transfer-start {
	color: map-get($colors, background-sidebar);
	font-family: map-get($fonts, open-semibold);
	font-size: 14px;
}

.text-gray {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, open-regular);
	font-size: 14px;
}

.border-bottom {
	border: 0.5px solid map-get($colors, grey-border);
	height: 1px;
}

.center {
	justify-content: center;
}
</style>
