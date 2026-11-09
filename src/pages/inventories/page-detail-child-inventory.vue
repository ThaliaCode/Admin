<template>
	<div>
		<header-page
			name="detalle-inventario"
			show-excel
			to-show
			:columns="columns"
			:rows="inventory.details"
			:title="`DETALLE DE INVENTARIO #${$route.params.id}`"
			:show-clean="false"
		/>
		<app-actions
			:resource-uri="$route.name"
			@run-action="runAction"
			:value-disabled="actionsDisabled"
		/>
		<general-filter class="filter-inventory">
			<v-layout row wrap>
				<v-flex xs12 sm4 px-1 class="align-col">
					<label>Creado:</label>
					<span>{{
						inventory.inventoryDate | exactDate('DD-MM-YYYY HH:mm:ss', true)
					}}</span>
				</v-flex>
				<v-flex xs12 sm4 px-1 class="align-col">
					<label>Tipo:</label>
					<span>{{ inventory.typeName }}</span>
				</v-flex>
				<v-flex xs12 sm4 px-1 class="align-col">
					<label>Responsable:</label>
					<span>{{ inventory.inlineResponsibles }}</span>
				</v-flex>
				<v-flex xs12 sm4 px-1 class="align-col">
					<label>Almacén:</label>
					<span v-if="inventory.warehouse">{{ inventory.warehouse.name }}</span>
				</v-flex>
				<v-flex xs12 sm4 px-1 class="align-col">
					<label>Estado:</label>
					<span>
						{{ inventory.stateName }}
						<span v-show="inventory.status === 2">
							{{ inventory.closedAt | formatDate('DD/MM/YYYY, HH:MM:SS a') }}
						</span>
					</span>
				</v-flex>
				<v-flex xs12>
					<v-switch
						class="mt-2 mb-2"
						color="primary"
						:hide-details="true"
						label="Forzar crear registro en inventario con productos sin ajuste"
						v-model="flagForceResetAll"
						@change="changeForce"
					></v-switch>
				</v-flex>
			</v-layout>
		</general-filter>
		<app-table
			selectable
			:checkAll="checkAll"
			@row-is-selected="rowIsSelected"
			@on-selected-all="selectedAll"
			name="detail-inventory"
			:columns="columns"
			:rows="inventory.details"
			local-storage
			:input-search="false"
			:main-list="false"
			@on-toggle-columns="toggleColumns"
			class="is-not-selectable no-main-list"
			:stickyHeader="true"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">
					{{ props.row.productName }}
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.productCode }}</td>
				<td v-show="showRow(columns, 3)">
					{{ props.row.productAutoBarcode }}
				</td>
				<td v-show="showRow(columns, 4)">{{ props.row.brandName }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.productFeatures }}</td>
				<td v-show="showRow(columns, 6)">{{ props.row.stock }}</td>
				<td v-show="showRow(columns, 7)">{{ props.row.computed }}</td>
				<td v-show="showRow(columns, 8)">{{ props.row.diff }}</td>
				<td v-show="showRow(columns, 9)">{{ props.row.documentType }}</td>
				<td v-show="showRow(columns, 10)">
					{{ props.row.documentNumberBe }}
				</td>
			</template>
			<template slot="footerSemi">
				<td colspan="6" class="footer-table"></td>
				<td class="footer-table--select">
					<div class="footer-table--text">Total de Stock</div>
					<div>{{ totalStock }}</div>
				</td>
				<td class="footer-table--select">
					<div class="footer-table--text">Total Conteo</div>
					<div>
						{{ totalCont }}
					</div>
				</td>
				<td class="footer-table" colspan="3"></td>
			</template>
		</app-table>
		<div style="height: 50px"></div>
		<v-dialog v-model="dialogCalculate" persistent max-width="530">
			<v-card class="modal-items">
				<v-card-title class="modal-items-title">
					Selecciona las opciones a realizar:
				</v-card-title>
				<v-divider></v-divider>
				<v-card-text>
					<v-layout column align-items px-3>
						<v-flex>
							<v-layout row align-center>
								<v-flex xs5>
									<v-switch
										color="success"
										hide-details
										label="Calcular Saldos"
										v-model="calculateBalanceStock"
									></v-switch>
								</v-flex>
								<v-flex ml-2 text-xs-right>
									<app-tooltip-button
										:img="'/static/img/new-icons/icon-help-fill.svg'"
										text="Esta opción le permite calcular los saldos de su productos a partir de este inventario."
									></app-tooltip-button>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex>
							<v-layout row align-center>
								<v-flex xs7>
									<v-switch
										class="mt-2"
										color="success"
										hide-details
										label="Calcular Costo Promedio"
										v-model="calculateAverageCost"
									></v-switch>
								</v-flex>
								<v-flex ml-2 text-xs-right>
									<app-tooltip-button
										:img="'/static/img/new-icons/icon-help-fill.svg'"
										text="Esta opción le permite calcular su costo promedio a partir de los saldos incluidos en el inventario."
									></app-tooltip-button>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex>
							<v-layout row align-center>
								<v-flex xs7>
									<v-switch
										:disabled="flagForceResetAll"
										class="mt-2"
										color="success"
										hide-details
										label="Inhabilitar registros anteriores"
										v-model="flagReset"
									></v-switch>
								</v-flex>
								<v-flex ml-2 text-xs-right>
									<app-tooltip-button
										:img="'/static/img/new-icons/icon-help-fill.svg'"
										text="Esta opción le permite inhabilitar los registros anteriores."
									></app-tooltip-button>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions class="modal-items-action pt-2 pb-2">
					<v-layout row wrap>
						<v-flex xs6 pr-2 text-xs-right>
							<v-btn
								color="error"
								class="btn-action white--text"
								@click="closeDialog"
							>
								Cancelar
							</v-btn>
						</v-flex>
						<v-flex xs6 pl-2 text-xs-left>
							<v-btn
								color="primary"
								class="btn-action white--text"
								@click="updateCalculate"
							>
								Guardar
							</v-btn>
						</v-flex>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>
<script>
import appActions from '@/components/shared/app-actions';
import headerPage from '@/components/shared/header-page';
import generalFilter from '@/components/shared/general-filter';
import appTable from '@/components/shared/table/app-table';

function created() {
	this.loadData();
}

async function loadData() {
	const id = this.$route.params.id;
	try {
		const response = await this.$httpProducts.get(`inventories/${id}`);
		const inventoryData = response.data;
		inventoryData.typeName =
			response.data.type && response.data.type === 1 ? 'Parcial' : 'Completo';
		inventoryData.inlineResponsibles =
			response.data.responsible && response.data.responsible.length > 0
				? response.data.responsible.join(', ')
				: '';
		inventoryData.stateName =
			response.data.status && response.data.status === 1
				? 'Inventariado'
				: 'Cerrado';
		inventoryData.details = response.data.details.map((detail) => {
			const newDetail = { ...detail };
			newDetail.productName = detail.product ? detail.product.name : '';
			newDetail.productCode = detail.product ? detail.product.code : '';
			newDetail.productAutoBarcode = detail.product
				? detail.product.autoBarcode
				: '';
			newDetail.brandName = detail.brand ? detail.brand.name : '';
			newDetail.productFeatures = detail.product
				? detail.product.inlineFeatures
				: '';
			newDetail.documentType =
				detail.document &&
				detail.document.serie &&
				detail.document.serie.typeDocument
					? detail.document.serie.typeDocument.name
					: '';
			if (!this.flagForceResetAll) {
				newDetail.documentNumberBe =
					detail.document && detail.document.serie
						? `${detail.document.serie || ''}-${detail.document.number}`
						: '';
			} else {
				newDetail.documentNumberBe =
					detail.document && detail.document.serie
						? `${detail.document.serie || ''}-${detail.document.number}`
						: null;
			}
			return newDetail;
		});
		this.inventory = inventoryData;
		this.totalCont = this.inventory.details.reduce(
			(a, b) => a + b.computed || 0,
			0
		);
		this.totalStock = this.inventory.details.reduce(
			(a, b) => a + b.stock || 0,
			0
		);
		if (!this.flagForceResetAll) {
			this.rowDisabled = this.inventory.details.some(
				(row) => row.documentNumberBe === '' || null
			);
		}
	} catch (error) {
		this.showGenericError();
	}
}

function toggleColumns() {
	return true;
}

function runAction(item) {
	if (item.code === 'recalculate-stock-prom') {
		this.dialogCalculate = true;
	}
}

function rowIsSelected(row) {
	if (
		(row.documentNumberBe === '' || row.documentNumberBe === null) &&
		!this.flagForceResetAll
	) {
		this.rowIsDisabled(row);
	} else {
		({
			products: this.inventory.details,
			productsSelected: this.dataSelected,
			check: this.checkAll,
		} = this.selectedRows(row, this.inventory.details, this.dataSelected));
	}
}

function rowIsDisabled({ id }) {
	this.inventory.details = this.inventory.details.map((row) => {
		const newRow = { ...row };
		if (row.id === id) {
			newRow.isSelected = false;
		}
		return newRow;
	});
}

function closeDialog() {
	this.dialogCalculate = false;
	this.calculateAverageCost = false;
	this.calculateBalanceStock = false;
}

async function updateCalculate() {
	const body = {
		flagForceResetAll: this.flagForceResetAll,
		flagReset: this.flagReset,
		warInventoryId: this.$route.params.id,
		calculateAverageCost: this.calculateAverageCost,
		calculateBalanceStock: this.calculateBalanceStock,
		productIds: this.dataSelected.map((p) => p.productId),
	};
	try {
		await this.$httpProducts.post('kardex/inventory-reset', body);
		this.closeDialog();
		this.loadData();
		this.showNotification(
			'La acción fue realizado correctamente, su saldos / costo promedio serán calculados en breve.'
		);
	} catch (error) {
		this.showGenericError();
	}
}

function selectedAll(value) {
	({
		products: this.inventory.details,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selecteAll(value, this.inventory.details, this.dataSelected));
}

function actionsDisabled() {
	const disabledAction = this.flagForceResetAll
		? false
		: !this.dataSelected.every((p) => p.documentNumberBe);
	return [{ code: 'recalculate-stock-prom', disabled: disabledAction }];
}

function changeForce() {
	this.flagReset = true;
	this.loadData();
}

function data() {
	return {
		rowDisabled: false,
		calculateAverageCost: false,
		calculateBalanceStock: false,
		flagReset: false,
		flagForceResetAll: false,
		columns: [
			{
				id: 1,
				name: 'Nombre',
				value: 'productName',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Código',
				value: 'productCode',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Cod. interno',
				value: 'productAutoBarcode',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Marca',
				value: 'brandName',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Características',
				value: 'productFeatures',
				visible: true,
				checked: true,
			},
			{ id: 6, name: 'Stock', value: 'stock', visible: true, checked: true },
			{
				id: 7,
				name: 'Conteo',
				value: 'computed',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Diferencia',
				value: 'diff',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Tipo de documento',
				value: 'documentType',
				visible: true,
				checked: true,
			},
			{
				id: 10,
				name: 'Número',
				value: 'documentNumber',
				visible: true,
				checked: true,
			},
		],
		totalStock: 0,
		totalCont: 0,
		checkAll: false,
		dataSelected: [],
		dialogCalculate: false,
		inventory: {
			details: [],
		},
	};
}
export default {
	name: 'detail-child-inventory',
	components: {
		appActions,
		headerPage,
		generalFilter,
		appTable,
	},
	computed: {
		actionsDisabled,
	},
	created,
	data,
	methods: {
		changeForce,
		closeDialog,
		loadData,
		rowIsSelected,
		rowIsDisabled,
		runAction,
		selectedAll,
		toggleColumns,
		updateCalculate,
	},
};
</script>
<style lang="scss" scoped>
.filter-inventory {
	label {
		color: map-get($colors, paginationText);
		font-family: map-get($fonts, open-semibold);
		font-size: map-get($sizes, medium);
	}

	span {
		color: map-get($colors, paginationText);
		font-family: map-get($fonts, open-regular);
		font-size: map-get($sizes, medium);
	}
}

.close-action {
	cursor: pointer;
}

.modal-items {
	background: color(white);
	box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.5);
	color: color(paginationText);
	font-size: 14px;

	&-title {
		background-color: rgba(195, 231, 232, 0.21);
		color: color(primary);
		font-weight: 600;
		padding: 13px 29px;
		text-transform: uppercase;
	}

	&-all {
		background-color: rgba(195, 231, 232, 0.5);
		padding: 9px 0;
	}

	&-btn {
		border: 1px solid color(primary);
		border-radius: 5px;
		color: color(primary);
		font-weight: 600;
		padding: 4px 15px;

		&--cancel {
			border: 1px solid color(error);
			border-radius: 5px;
			color: color(error);
			font-weight: 600;
			margin-right: 20px;
			padding: 4px 15px;
		}
	}
	&-action {
		background-color: rgba(195, 231, 232, 0.21);
	}
}
</style>
