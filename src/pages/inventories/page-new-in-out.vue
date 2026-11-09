<template>
	<div>
		<header-page
			column-class="xs12"
			justify-class="justify-start"
			:show-clean="false"
			:show-excel="false"
			:title="$route.meta.title"
			to-show
		>
			<v-flex>
				<v-layout wrap justify-end align-center class="lh-regular">
					<v-flex xs6 md3 xl3 mb-1>
						<app-date-select
							:date-formatted="createdAt"
							model="createdAt"
							@input="getDate"
						/>
					</v-flex>
					<span class="px-2"> | </span>
					<span>
						<label class="caption">Grupos</label>
						<v-tooltip left>
							<p slot="activator" class="body-2 ma-0 primary--text">
								{{ headerPage.groupName | limitTo }}
							</p>
							<span>{{ headerPage.groupName }}</span>
						</v-tooltip>
					</span>
					<span class="px-2"> | </span>
					<span>
						<label class="caption">Tipo de Movimiento</label>
						<v-tooltip left>
							<p slot="activator" class="body-2 ma-0 primary--text">
								{{ headerPage.typeDocument | limitTo }}
							</p>
							<span>{{ headerPage.typeDocument }}</span>
						</v-tooltip>
					</span>
					<span class="px-2"> | </span>
					<span>
						<label class="caption">Secuencia</label>
						<p class="body-2 ma-0">{{ headerPage.serie }} - {{ headerPage.number }}</p>
					</span>
				</v-layout>
			</v-flex>
		</header-page>
		<app-actions :resource-uri="$route.name" @run-action="runAction" />
		<general-filter class="layout wrap justify-start mt-4">
			<v-flex xs12 sm3 pr-2>
				<products-search-input
					ref="productSearcher"
					:search-value="selectedProduct"
					@search="openSearch"
				/>
			</v-flex>
			<v-flex xs12 sm1 pr-2 pt-4>
				<v-layout row justify-space-between align-center>
					<v-flex>
						<span mr-1 class="text-info">Cant:</span>
					</v-flex>
					<v-flex ml-1>
						<v-text-field
							bottom
							single-line
							hide-details
							ref="productQuantity"
							type="number"
							@keyup.enter="addProduct"
							label="0"
							class="filter-select"
							content-class="filter-select-content"
							v-model="quantityProduct"
						></v-text-field>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 sm2 pr-2>
				<app-select
					:item="warehouse"
					item-text="name"
					item-value="id"
					:items="warehouses"
					label="Almacén"
					model="warehouse"
					@input="getData($event, 'warehouse')"
				/>
				<!-- <label class="caption">Almacén</label>
				<v-select
					bottom
					single-line
					hide-details
					:items="warehouses"
					item-text="name"
					return-object
					label="Almacén"
					class="filter-select"
					content-class="filter-select-content"
					v-model="warehouse"
				></v-select> -->
			</v-flex>
			<!-- <v-flex xs2 pr-2 v-if="showLot">
				<app-input-text
					:disabled="!!lot"
					label="Lote"
					model="lot"
					:text="lot"
					type="text"
					@input="getData($event, 'lot')"
				/>
			</v-flex> -->
			<v-flex xs2 pr-2 v-if="showLot">
				<app-date-select
					:readonly="!!dueDate"
					:date-formatted="dueDate"
					label="Fecha de Vencimiento"
					model="dueDate"
					@input="getData($event, 'dueDate')"
				/>
			</v-flex>
			<v-flex xs12 sm2 pr-2 v-if="showAccountingEngine">
				<label class="caption">Centro de Costos</label>
				<v-layout>
					<v-select
						bottom
						single-line
						hide-details
						:items="costsCenter"
						item-text="name"
						item-value="id"
						return-object
						label="Centro de Costos"
						class="filter-select"
						content-class="filter-select-content"
						v-model="costCenter"
					></v-select>
				</v-layout>
			</v-flex>
			<v-layout row>
				<button
					mt-4
					type="button"
					class="btn-price-sale size ml-1"
					@click="openDialogLotes"
					:disabled="!flagLot"
					v-if="flagLot"
				>
					<span class="ml-2"
						>{{
							headerPage.typeOperation === 1 ? 'Seleccionar o añadir' : 'Seleccionar'
						}}
						lote</span
					>
				</button>
				<v-flex sm2 mt-4>
					<button
						class="pl-add-container size ml-2"
						:disabled="!disabledAdd"
						@click="addProduct('add')"
					>
						<v-icon id="add-icon" color="white">add</v-icon>
					</button>
				</v-flex>
			</v-layout>
		</general-filter>
		<app-table
			:add-col-value="1"
			class="mt-4"
			name="new-in-out"
			selectable
			:columns="columns"
			:current-page="currentPage"
			:rows="data"
			:items-quantity="data.length"
			:items-total-quantity="data.length"
			:check-all="checkAll"
			:last-page="lastPage"
			@row-is-selected="rowIsSelected"
			@on-selected-all="selectedAll"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)">{{ props.row.code }}</td>
				<td v-show="showRow(columns, 2)">
					{{ props.row.warehouseSelectName }}
				</td>
				<td v-show="showRow(columns, 3)">
					<v-layout>
						<v-flex text-xs-center xs9>
							{{ props.row.name }}
						</v-flex>
						<document-state
							v-if="props.row.product && props.row.product.flagControlSerie"
							img="/static/img/product-serie.svg"
							:tooltip="'Producto con serie'"
							height="13"
						/>
					</v-layout>
				</td>
				<td v-show="showRow(columns, 4)">{{ props.row.unitName }}</td>
				<td v-show="showRow(columns, 5)" class="w-8">
					<v-text-field
						v-if="props.row.series"
						class="filter-select input-max-width"
						type="number"
						:value="totalSerieValue(props.row)"
						@input="changeValue(props.row, $event, 'quantity')"
						:disabled="validateNewEntry || sumSeries"
					></v-text-field>
					<v-text-field
						v-else
						hide-details
						single-line
						type="number"
						:value="props.row.quantity"
						class="filter-select input-max-width"
						@input="changeValue(props.row, $event, 'quantity', props.index)"
						@click.stop="stopClick"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 6)" class="w-8">
					<v-text-field
						hide-details
						single-line
						type="number"
						:value="props.row.cost || 0"
						class="filter-select input-max-width"
						@input="changeValue(props.row, $event, 'cost', props.index)"
						@click.stop="stopClick"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 7)">{{ props.row.taxProduct }}</td>
				<td v-show="showRow(columns, 8)" class="w-8">
					<v-text-field
						hide-details
						single-line
						type="number"
						:value="props.row.priceCost || 0"
						class="filter-select input-max-width"
						@input="editPriceCost(props.row, $event, 'priceCost')"
						@click.stop="stopClick"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 9)">{{ props.row.price | round }}</td>
				<td v-show="showRow(columns, 10)">{{ props.row.total | round }}</td>
				<!-- <td v-show="showRow(columns, 8)">{{ props.row.brandIdSelectName }}</td> -->
				<td v-show="showRow(columns, 11)">{{ props.row.inlineFeatures }}</td>
				<td v-show="showRow(columns, 12)">{{ props.row.categoryName }}</td>
				<td v-show="showRow(columns, 13)">
					<v-text-field
						hide-details
						single-line
						type="text"
						:value="props.row.location"
						class="filter-select input-max-width"
						@input="changeLocation(props.row, $event, 'location')"
						@click.stop="stopClick"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 14)">
					{{ props.row.costCenterSelectName }}
				</td>
				<td v-show="showRow(columns, 15)">
					{{ props.row.stock }}
				</td>
				<td v-show="showRow(columns, 16)">
					<v-text-field
						hide-details
						single-line
						type="text"
						disabled
						:value="props.row.productLots ? props.row.productLots.lot : props.row.lot"
						class="filter-select input-max-width"
						@input="changeLocation(props.row, $event, 'lot')"
						@click.stop="stopClick"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 17)" class="width-date">
					<app-date-select
						:date-formatted="props.row.dueDate"
						model="dueDate"
						@input="changeLocation(props.row, $event, 'dueDate')"
					/>
				</td>
				<td v-show="showRow(columns, 18)">
					<app-tooltip-button
						v-if="
							props.row.product && props.row.product.flagControlSerie && validateNewEntry
						"
						img="/static/img/icons/barcode.svg"
						:height="30"
						text="Control de series"
						@click-icon="openSeries(props.row)"
					/>
					<app-tooltip-button
						v-else-if="props.row.product && props.row.product.flagControlSerie"
						img="/static/img/icons/barcode.svg"
						:height="30"
						text="Control de series"
						@click-icon="openSeriesDischarge(props.row)"
					/>
					<app-tooltip-button
						size="18"
						color="error"
						icon="delete"
						text="Eliminar"
						@click-icon="openConfirmDelete(props.row)"
					/>
					<app-tooltip-button
						size="18"
						color="primary"
						icon="comment"
						text="Agregar comentario e información adicional"
						@click-icon="makeCommentary(props.row)"
					/>
				</td>
			</template>
		</app-table>
		<v-layout
			row
			pa-1
			px-4
			:justify-center="resumenVisible.length <= 2"
			:justify-space-between="resumenVisible.length > 2"
		>
			<v-flex
				v-for="(item, i) in resumen"
				v-if="!item.flagVisible"
				:key="i"
				:style="{ flex: `0 0 ${100 / resumenVisible.length}%` }"
				class="text-xs-center totals-section subtotal"
			>
				<span>{{ item.label }}</span>
				<span class="ml-1">{{ item.value | round }}</span>
			</v-flex>
		</v-layout>
		<v-layout wrap justify-center px-4 mb-4>
			<v-flex xs12>
				<v-text-field
					no-resize
					multi-line
					single-line
					textarea
					class="textarea-content filter-select shadow-inset"
					name="new-product-description"
					label="Comentario"
					v-model="commentary"
				></v-text-field>
			</v-flex>
		</v-layout>
		<v-layout wrap justify-center align-center mb-5>
			<v-flex xs12 text-xs-center>
				<v-btn
					type="button"
					color="pink"
					class="btn-action mr-1"
					@click="cancelCreateNewInOut"
				>
					Cancelar
					<v-icon color="white" size="16"> highlight_off </v-icon>
				</v-btn>
				<v-btn
					type="button"
					color="primary"
					class="btn-action ml-1"
					:disabled="$v.$invalid || isLoading || validateQuantityZero"
					@click="checkAverageCost"
				>
					Aceptar
					<v-icon color="white" size="16"> check_circle_outline </v-icon>
				</v-btn>
				<btn-average-cost
					class="ml-1"
					big
					:disabled-btn="data.length === 0"
					:products="data"
					:code-module="codePurchases"
					v-if="$route.name === 'new-entry' && isFlagKardexValued && false"
					@average-cost-error="openDialoErrorAverage"
				/>
			</v-flex>
		</v-layout>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:header-color="action.color"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			@close-modal="cancelModal"
		>
			<control-series
				v-if="action.code === 'control-series'"
				:product="productSerie"
				:detail="detailSeries"
				@send-series="sendSeries"
				@close-modal="cancelModal"
			/>
			<view-series
				v-if="action.code === 'view-series'"
				:product="productDischarge"
				@close="cancelModal"
				@send-series="sendSeriesExit"
			/>
			<group
				v-if="action.code === 'edit-group-movement'"
				:group="groupId"
				:groups="groups"
				@close="cancelModal"
				@detail-group="detailGroup"
			/>
			<products-search-form
				v-if="action.code === 'product-searcher'"
				:not-valid-negative-stock="$route.name === 'new-entry'"
				:search-value="searchVal"
				:only-types="[typeProduct.Products, typeProduct.Supplies]"
				@add-product="setProduct"
			/>
			<app-commentaries-lotes
				v-if="action.code === 'COMMELOTS'"
				show-additional
				:disabledEdit="true"
				:product="currentProduct"
				@set-add="setCommentaryLotes"
				@close-modal="closeSidebar"
			/>
			<app-commentaries
				v-if="action.code === 'COMME'"
				:product="currentProduct"
				@set-add="setComentary"
				@close-modal="closeSidebar"
			/>
		</action-sidebar>
		<v-dialog persistent v-model="dialogmodalNewLotes" max-width="515px">
			<modalLotes
				v-if="dialogmodalNewLotes"
				:newObject="newProduct.product"
				:disabledEdit="disabledEdit"
				:showAddModal="showAddModal"
				@closeModalLotes="handleCloseModalNewLot"
				@addProductModal="addNewLot"
			/>
		</v-dialog>
		<v-dialog persistent v-model="dialogmodalLotes" max-width="575px">
			<modal-lotes-sales
				v-if="dialogmodalLotes"
				ref="modalLotList"
				:product-data="newProduct"
				:quantity="Number(quantityProduct)"
				:isEntry="$route.name === 'new-entry'"
				:isDischarge="$route.name === 'new-discharge'"
				:newLots="createdLots"
				:warehouseId="headerPage.typeOperation === 1 ? undefined : warehouse.id"
				@close-modal-lotes="handlecloseModalLotes"
				@confirm-modal-lotes="addProductWithLot"
				@open-modal-new-lot="handleOpenModalNewLot"
				@set-quantity="setQuantity"
			/>
		</v-dialog>
		<v-dialog v-model="dialog" persistent max-width="390">
			<v-card>
				<v-card-title class="subheading">{{ dialogMessage }}</v-card-title>
				<v-card-actions class="justify-center">
					<v-btn class="btn-action" color="info" dark @click.native="closeDialog">
						Cancelar
					</v-btn>
					<v-btn class="btn-action" color="error" dark @click.native="deleteProduct">
						Eliminar
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="showErrorAverage" persistent max-width="400px">
			<modal-items
				v-if="showErrorAverage"
				name-action="Seguir con el nuevo ingreso"
				name-cancel="Cerrar"
				show-slot
				title="Costo Promedio"
				@close-modal="closeModalAverage"
				@action-modal="validToCreate"
			>
				<div class="pa-3">
					<p>Los siguientes productos tienen un precio por debajo del costo promedio:</p>
					<p class="pl-1 mb-1" v-for="(item, index) in sendProducts" :key="index">
						- {{ item.productName }}
					</p>
					<p class="mb-0 mt-3">
						<v-icon color="info" mr-1>info</v-icon>
						Las comparaciones se están realizando con la lista de precio por defecto.
					</p>
				</div>
			</modal-items>
		</v-dialog>
		<v-dialog v-model="showConfirmOut" persistent max-width="450px">
			<v-card>
				<v-card-title class="subheading"
					>¿ Esta seguro que desea continuar, hay algunos productos que no fueron
					seleccionados ?</v-card-title
				>
				<v-card-actions class="justify-center">
					<v-btn class="btn-action" color="error" dark @click.native="closeDialogConfirm">
						Cancelar
					</v-btn>
					<v-btn
						class="btn-action"
						color="primary"
						dark
						@click.native="acceptProductDialog"
					>
						Aceptar
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="showCost" persistent max-width="500px">
			<modal-items
				show-slot
				@close-modal="closeModalCost"
				@action-modal="validToCreate"
				v-if="showCost"
				name-cancel="Cancelar"
				name-action="Seguir con el Nuevo Ingreso"
				title="El precio de costo de uno o mas productos es mayor al precio de venta"
			>
				<div class="pa-3">
					<p class="pl-1 mb-1" v-for="(item, index) in productsAddCost" :key="index">
						- {{ item.name }}
					</p>
				</div>
			</modal-items>
		</v-dialog>
	</div>
</template>
<script>
import { format } from 'date-fns';
import { required } from 'vuelidate/lib/validators';
import appDateSelect from '@/components/shared/app-date-select';
import helper from '@/shared/helper';
import l from '@/shared/lib';
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import generalFilter from '@/components/shared/general-filter';
import productsSearchInput from '@/components/shared/searcher/products-search-input';
import group from '@/components/inventories/group';
import productsSearchForm from '@/components/shared/searcher/products-search-form';
import btnAverageCost from '@/components/shared/sales/btn-average-cost';
import flagType from '@/shared/flag-type';
import modalItems from '@/components/shared/modal-items';
import modalLotes from '@/components/modal-lotes';
import modalLotesSales from '@/components/modal-lotes-sales';
import appCommentariesLotes from '@/components/sales/subcomponents/commentaries-lotes';
import appCommentaries from '@/components/sales/subcomponents/commentaries';
import controlSeries from '@/components/purchases/control-series';
import documentState from '@/components/shared/document-state';
import viewSeries from '@/components/transfers/view-series';
import typeProduct from '@/shared/type-product';

const fourDecimals = l.round(4);

// create the set Commentary function
function setComentary(values) {
	const { location, expirationDate, lot, commentary } = values;
	const index = this.data.findIndex((p) => p === this.currentProduct);
	const updatedProduct = {
		...this.currentProduct,
		location,
		dueDate: expirationDate,
		lot,
		commentary,
	};
	if (index !== -1) {
		this.$set(this.data, index, updatedProduct);
		this.currentProduct = this.data[index];
	}
}

function setCommentaryLotes(productLots, commentary) {
	const index = this.data.findIndex((p) => p === this.currentProduct);
	const updatedProduct = {
		...this.currentProduct,
		commentary,
		productLots,
	};
	if (index !== -1) {
		this.$set(this.data, index, updatedProduct);
		this.currentProduct = this.data[index];
	}
}

function closeSidebar(formClosed) {
	this.action.code = '';
	this.action.open = false;
	this.showSupplier = false;
	this.showPayments = false;
	this.showTransactions = false;
	this.showQuotes = false;
	this.showNewProduct = false;
	if (!this.retentionExist && formClosed && this.isEcuador) {
		this.alertRetention();
	}
	this.filtersChange = {
		year: null,
		month: null,
	};
}

async function addNewLot(newObject) {
	const checkDuplicateCode = this.$refs.modalLotList.selectedLots.find(
		(lot) => lot.code === newObject.code
	);
	if (checkDuplicateCode) {
		this.showGenericError(`El lote con código ${newObject.code} ya existe`);
	} else {
		this.createdLots.push({
			...newObject,
			oldQuantity: 0,
			quantity: 0,
			selectedQuantity: 0,
		});
	}
}

function makeCommentary(product) {
	this.currentProduct = product;
	if (product.product.flagLotsEnabled === 1) {
		this.action = {
			active: true,
			code: 'COMMELOTS',
			open: true,
			title: 'COMENTARIOS E INFORMACIÓN ADICIONAL',
			width: 450,
		};
	} else {
		this.action = {
			active: true,
			code: 'COMME',
			open: true,
			title: 'COMENTARIOS',
			width: 450,
		};
	}
}

function created() {
	this.newObject = {};
	const newDate = new Date();
	this.dateOnline = newDate.getTime().toString();
	this.showBrandConfig = this.$userInfo.company.settings.flagUseSimpleBrand || false;
	this.codePurchases = flagType.Purchases;
	helper.removeLocalData('products-selected');
	this.createdAt = helper.exactDate(this.$today(), 'YYYY-MM-DD');
	this.loadData();
	this.showAccountingEngine =
		this.$userInfo.company.settings.flagShowAccountingEngine || false;
	this.showLot = this.$userInfo.company.settings.flagWorkWithBatches || false;
	this.columns[15].visible = this.showLot;
	this.columns[15].checked = this.showLot;
	this.columns[16].visible = this.showLot;
	this.columns[16].checked = this.showLot;
	if (this.isWarehouse) {
		// ocultar columna de costo para rol almacen
		this.columns[5].flagVisible = true;
		this.columns[5].visible = false;
		this.columns[5].checked = false;
	}
	this.resumenVisible = this.resumen.filter((item) => !item.flagVisible);
}

function openDialogLotes() {
	this.dialogmodalLotes = true;
}

function handlecloseModalLotes() {
	this.dialogmodalLotes = false;
	this.createdLots = [];
}

function openSearch(value) {
	this.searchVal = value ? value.trim() : '';
	this.action.code = 'product-searcher';
	this.action.title = 'Productos';
	this.action.width = 790;
	this.action.open = true;
}

function stopClick() {
	return false;
}

function rowIsSelected({ isSelected, id, product, productLots }) {
	this.checkAll = this.data.every((row) => row.isSelected);
	const lotCode = product.flagLotsEnabled ? productLots.lot : undefined;
	if (isSelected) {
		this.dataSelected.push(
			this.data.find((p) => {
				if (lotCode && p.product.flagLotsEnabled) {
					return p.id === id && p.productLots.lot === lotCode;
				}
				return p.id === id;
			})
		);
	} else {
		const idxSelect = this.dataSelected.findIndex((p) => {
			if (lotCode && p.product.flagLotsEnabled) {
				return p.id === id && p.productLots.lot === lotCode;
			}
			return p.id === id;
		});
		this.dataSelected.splice(idxSelect, 1);
	}
}

function selectedAll(value) {
	({
		products: this.data,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selecteAll(value, this.data, this.dataSelected));
}

function cancelModal() {
	this.action.open = false;
	this.action.code = '';
}

function runAction({ code }) {
	this.action.code = code;
	if (code === 'edit-group-movement') {
		this.action.title = 'Grupos';
		this.action.width = 380;
	}
	this.action.open = true;
}

async function loadData() {
	if (this.productIdSerie) {
		const productSerie = this.productIdSerie.product.name;
		this.selectedProduct = productSerie || '';
		this.openSearch(this.selectedProduct);
	}
	const requests = [
		this.$httpProducts.get('groups'),
		this.$httpSales.get('cost-center'),
		this.$httpProducts.get('warehouses'),
		this.$httpProducts.get('brands'),
	];
	[
		{ data: this.groups },
		{ data: this.costsCenter },
		{ data: this.warehouses },
		{ data: this.brands },
	] = await Promise.all(requests);
	if (helper.getLocalData(this.routeNameValidated)) {
		this.data = helper.getLocalData(this.routeNameValidated);
		this.dataSelected = helper.getLocalData(this.routeNameValidated);
	}
	if (this.productIdEdit) {
		const productSelected = helper.getLocalData('product-selected');
		this.quantityProduct = 1;
		if (!productSelected) return;
		productSelected.product = {
			...productSelected,
			unitName: productSelected.unit ? productSelected.unit.name : '',
		};
		this.setProduct(productSelected);
	}
	const { company, flagNotShowCostPrice } = this.$userInfo;
	this.columns[7].visible = company.settings.flagImport && !flagNotShowCostPrice;
	this.columns[7].checked = company.settings.flagImport && !flagNotShowCostPrice;
	if (this.brands.length === 1) {
		this.brand = this.brands[0].id;
	}
	if (this.groups.length) {
		this.groupId = this.groups[0].id;
		if (this.$route.name === 'new-entry') {
			this.movementId = this.groups[0].typeIn[0].id;
			if (this.groups[0].typeIn.length) {
				this.detailHeader();
			}
		} else {
			this.movementId = this.groups[0].typeOut[0].id;
			if (this.groups[0].typeOut.length) {
				this.detailHeader();
			}
		}
	}
	this.validateNewEntry = this.$route.name === 'new-entry';
}

async function detailHeader() {
	const params = {
		typeDocumentId: this.movementId,
	};
	try {
		const { data: response } = await this.$httpProducts.get(`groups/${this.groupId}`, {
			params,
		});
		this.headerPage.groupName = response.name;
		this.headerPage.typeDocument = response.typeDocument
			? `${response.typeDocument.code} - ${response.typeDocument.name}`
			: null;
		this.headerPage.serie = response.typeDocument ? response.typeDocument.serie : null;
		this.headerPage.number = response.typeDocument ? response.typeDocument.number : null;
		this.headerPage.documentTypeId = response.typeDocument
			? response.typeDocument.documentTypeId
			: null;
		this.headerPage.typeOperation = response.typeDocument
			? response.typeDocument.typeOperation
			: null;
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'SERIES_NOT_FOUND') {
				this.showGenericError(
					'Contactar a soporte para configurar el tipo de serie a su empresa.'
				);
			} else {
				this.showGenericError();
			}
		}
	}
}

async function detailGroup(id, typeDocumentId) {
	try {
		const params = { typeDocumentId };
		const { data: response } = await this.$httpProducts.get(`groups/${id}`, {
			params,
		});
		this.headerPage.groupName = response.name;
		this.headerPage.typeDocument = response.typeDocument
			? `${response.typeDocument.code} - ${response.typeDocument.name}`
			: null;
		this.headerPage.serie = response.typeDocument ? response.typeDocument.serie : null;
		this.headerPage.number = response.typeDocument ? response.typeDocument.number : null;
		this.headerPage.documentTypeId = response.typeDocument
			? response.typeDocument.documentTypeId
			: null;
		this.headerPage.typeOperation = response.typeDocument
			? response.typeDocument.typeOperation
			: null;
		this.cancelModal();
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'SERIES_NOT_FOUND') {
				this.showGenericError('El tipo de movimiento no tiene serie');
			}
		} else {
			this.showGenericError();
		}
	}
}

function setProduct(prod) {
	const prodWarehouseId = prod.warehouse
		? prod.warehouse.id
		: Number(this.warehouseId) || null;
	const prodBrand = prod.warehouseProduct ? prod.warehouseProduct.brandId : prod.brandId;
	this.newProduct = { ...prod };
	this.selectedProduct = `${prod.code} - ${prod.name}`;
	this.warehouse = this.warehouses.find((w) => w.id === prodWarehouseId) || null;
	if (this.$route.query.origin === 'edit-master-product' || this.$route.query.origin === 'products') {
		this.brand = prod.warehouseProduct
			? prod.warehouseProduct.brand ||
			  this.brands.find((b) => b.id === prod.warehouseProduct.brandId)
			: null;
	} else {
		this.brand = this.showBrandConfig
			? prod.brand
			: this.brands.find((b) => b.id === prodBrand) || null;
	}
	this.lot = prod.product ? prod.product.lot : null;
	this.dueDate = prod.product ? prod.product.dueDate : null;
	this.cancelModal();
	this.$refs.productQuantity.$el.children[1].children[0].focus();
}
function openSeries(row) {
	this.action.code = 'control-series';
	this.action.open = true;
	this.action.title = `${row.code || row.productCode} - SERIES`;
	this.action.width = 770;
	this.productSerie = row;
	// if (this.seriesObject) {
	// 	this.productSerie = row.map((rowProduct) => {
	// 		console.log(rowProduct);
	// 		console.log('eewrtgjfhtdrewqrt');
	// 		const newProduct = { ...rowProduct };
	// 		if (rowProduct.warehouseSelectId === this.seriesObject.warehouseSelectId) {
	// 			console.log('bnvcvbnhjkhgnbcvbnhmjkl');
	// 			newProduct.series = this.seriesObject;
	// 		}
	// 		return newProduct;
	// 	});
	// 	this.seriesObject = null;
	// }
}

function openSeriesDischarge(row) {
	this.action.code = 'view-series';
	this.action.open = true;
	this.action.title = `${row.code || row.productCode} - SERIES`;
	this.action.width = 770;
	this.productDischarge = row;
}

function disabledAdd() {
	return (
		!!(this.brand && this.warehouse && this.quantityProduct > 0) &&
		// eslint-disable-next-line
		(!this.newProduct.product ||
			!this.newProduct.product.flagLotsEnabled ||
			this.newProduct.productLots)
	);
}

function getData({ model, value }) {
	if (value) {
		if (model === 'dueDate') {
			this[model] = format(value, 'YYYY-MM-DD');
		} else {
			this[model] = value;
		}
	}
}

function handleCloseModalNewLot() {
	this.dialogmodalNewLotes = false;
}

function handleOpenModalNewLot() {
	this.dialogmodalNewLotes = true;
}

async function addProductWithLot(dataLot) {
	dataLot.forEach(async (lot) => {
		const { code, date, dateDue, location, codeEan, productLotId, selectedQuantity } =
			lot;
		const newProduct = JSON.parse(JSON.stringify(this.newProduct));
		newProduct.quantity = selectedQuantity;
		newProduct.productLots = {
			productLotId: productLotId || undefined,
			location,
			lot: code,
			codeEan,
			date,
			expirationDate: dateDue,
			quantity: selectedQuantity,
		};
		this.newProduct = newProduct;
		await this.addProduct({ ...newProduct });
	});
	this.createdLots = [];
	this.handlecloseModalLotes();
	this.clearFilter(null);
}

function addProduct(add, newObject) {
	if (this.newProduct.product.flagLotsEnabled && !this.newProduct.productLots) {
		this.showGenericError('Debe seleccionar un lote');
		return;
	}
	if (!this.newProduct.productLots) {
		this.newProduct.quantity = Number(this.quantityProduct);
	}
	this.newProduct.series = this.series;
	this.newProduct.warehouseSelectName = this.warehouse.name;
	this.newProduct.warehouseSelectId = this.warehouse.id;
	this.newProduct.id = `${this.newProduct.productId}${this.warehouse.id}`;
	this.newProduct.costCenterSelectName = this.costCenter ? this.costCenter.name : null;
	this.newProduct.costCenterSelectId = this.costCenter ? this.costCenter.id : null;
	this.newProduct.brandIdSelectName = this.brand.name;
	this.newProduct.brandIdSelectId = this.brand.id;
	this.newProduct.cost = this.newProduct.product ? this.newProduct.product.cost : 0;
	this.newProduct.total = this.newProduct.quantity * this.newProduct.cost;
	this.newProduct.createdAt = this.createdAt;
	this.newProduct.priceCost = this.newProduct.product
		? this.newProduct.product.totalCost
		: 0;
	this.newProduct.priceCost = this.newProduct.warehouseProduct
		? this.newProduct.warehouseProduct.priceCost || 0
		: this.newProduct.priceCost || 0;
	this.newProduct.isSelected = true;
	this.newProduct.lot = this.lot;
	this.newProduct.taxProduct = this.newProduct.product
		? this.newProduct.product.taxCostPercentage
		: 0;
	this.newProduct.dueDate = this.dueDate;
	const index = this.data.findIndex(
		(prod) =>
			prod.productId === this.newProduct.productId &&
			prod.warehouseId === this.warehouse.id
	);
	if (index < 0 || this.flagLot) {
		if (this.newProduct.product.flagLotsEnabled === 1) {
			const indexLot = this.data.findIndex(
				(prod) =>
					prod.productId === this.newProduct.productId &&
					prod.warehouseId === this.warehouse.id &&
					prod.productLots.lot === this.newProduct.productLots.lot
			);
			if (indexLot > -1) {
				this.showNotification(
					`El producto: ${this.newProduct.name}, ya se encuentra agregado con el lote con código ${newObject.lot}`,
					'info',
					9000
				);
				return;
			}
		}
		this.data.push(this.newProduct);
		helper.setLocalData(this.routeNameValidated, this.data);
		this.rowIsSelected(this.newProduct, this.data.length - 1);
		this.selectedAll(true);
		if (!this.newProduct.product.flagLotsEnabled) this.clearFilter(add);
		setTimeout(() => {
			this.$refs.productSearcher.$el.children[0].children[0].children[0].children[0].children[0].focus();
		}, 0);
	} else {
		this.showNotification(
			`El producto: ${this.newProduct.name}, ya se encuentra agregado con el almacen: ${this.warehouse.name}`,
			'info',
			9000
		);
	}
}

function changeValue(row, value, flag, indexRow) {
	const isLot = row.product.flagLotsEnabled;
	const numericValue = Number(value);
	const index = isLot ? indexRow : this.data.findIndex((d) => d.id === row.id);

	if (index === -1) return;

	const current = this.data[index];
	const updates = { [flag]: numericValue };

	if (flag === 'quantity') {
		updates.total = numericValue * current.cost;
		if (isLot && current.productLots) {
			updates.productLots = { ...current.productLots, quantity: numericValue };
		}
	} else if (flag === 'cost') {
		updates.priceCost = fourDecimals(numericValue * (1 + row.taxProduct / 100));
		updates.total = current.quantity * numericValue;
	}

	this.$set(this.data, index, { ...current, ...updates });

	const indexSelect = this.dataSelected.findIndex((p) => p.id === row.id);
	if (indexSelect > -1 && !isLot) {
		this.$set(this.dataSelected, indexSelect, {
			...this.dataSelected[indexSelect],
			...updates,
		});
	}

	helper.setLocalData(this.routeNameValidated, this.data);
}

function editPriceCost(row, value, flag) {
	const index = this.data.findIndex((d) => d.id === row.id);
	const indexSelect = this.dataSelected.findIndex((p) => p.id === row.id);
	const cost = fourDecimals(value / (1 + row.taxProduct / 100));
	if (index > -1) {
		this.$set(this.data, index, {
			...this.data[index],
			[flag]: Number(value),
			cost,
			total: (this.data[index].quantity || 1) * cost,
		});
		helper.setLocalData(this.routeNameValidated, this.data);
	}
	if (indexSelect > -1) {
		this.dataSelected[indexSelect][flag] = Number(value);
		this.dataSelected[index].total =
			(this.dataSelected[index].quantity || 1) * this.dataSelected[index].cost;
		this.$set(this.data, index, {
			...this.data[index],
			cost,
		});
	}
}

function changeLocation(row, value, flag) {
	const index = this.data.findIndex((d) => d.id === row.id);
	const indexSelect = this.dataSelected.findIndex((p) => p.id === row.id);
	if (index > -1) {
		if (value.model === 'dueDate') {
			this.data[index][flag] = format(value.value, 'YYYY-MM-DD');
		} else {
			this.data[index][flag] = value;
		}
	}
	if (indexSelect > -1) {
		if (value.model === 'dueDate') {
			this.dataSelected[indexSelect][flag] = format(value.value, 'YYYY-MM-DD');
		} else {
			this.dataSelected[indexSelect][flag] = Number(value);
		}
	}
}

function clearFilter(add) {
	this.costCenter = null;
	this.dueDate = null;
	this.warehouse = null;
	this.brand = null;
	this.lot = null;
	this.quantityProduct = 1;
	this.newProduct = {
		product: null,
	};
	this.selectedProduct = '';
	this.searchVal = null;
	this.createdAt = add ? this.createdAt : helper.exactDate(this.$today(), 'YYYY-MM-DD');
}

function openConfirmDelete({ id, name }) {
	this.dialogMessage = `¿Desea eliminar '${name}'?`;
	this.dialog = true;
	this.productId = id;
}

function closeDialog() {
	this.dialog = false;
	this.productId = null;
}

function deleteProduct() {
	const index = this.data.findIndex((d) => d.id === this.productId);
	const indexSelect = this.dataSelected.findIndex((p) => p.id === this.productId);
	if (index > -1) {
		this.data.splice(index, 1);
		helper.setLocalData(this.routeNameValidated, this.data);
	}
	if (indexSelect > -1) {
		this.dataSelected.splice(indexSelect, 1);
	}
	this.closeDialog();
}

function validations() {
	const minQuantityData = (value) => value.length >= 1;
	return {
		headerPage: {
			typeOperation: { required },
			documentTypeId: { required },
		},
		dataSelected: { minQuantityData },
	};
}

function cancelCreateNewInOut() {
	if (
		this.$route.query.origin &&
		(this.$route.query.origin === 'edit-master-product' ||
			this.$route.query.origin === 'products')
	) {
		const params = {
			id: this.productIdEdit,
		};
		const query = {};
		if (this.commerceCode && this.commerceId && this.subsidiaryId) {
			params.commerceCode = this.commerceCode;
			params.commerceId = this.commerceId;
			params.subsidiaryId = this.subsidiaryId;
			query.origin = '/ecommerce/commerce';
			query.name = this.$route.query.name;
		}
		if (this.$route.query.origin === 'products') {
			query.origin = 'products';
		}
		this.goTo('edit-master-product', { params, query });
	} else {
		this.clearFilter();
		this.data = [];
		this.dataSelected = [];
		// this.headerPage = {
		// 	groupName: null,
		// 	typeDocument: null,
		// 	serie: null,
		// 	number: null,
		// 	documentTypeId: null,
		// 	typeOperation: null,
		// };
		this.commentary = '';
		this.checkAll = false;
	}
}

async function createNewInOut() {
	this.isLoading = true;
	const kardex = this.data.map((d) => {
		const newData = {
			additionalInformation: {
				location: d.location,
				commentary: d.commentary,
				warehouseName: d.warehouseSelectName,
				series: d.series,
				productLots: d.productLots
					? {
							quantity: d.productLots.quantity || d.quantity,
							location: d.productLots.location,
							code: d.productLots.lot || d.productLots.code,
							codeEan: d.productLots.codeEan,
							date: d.productLots.date,
							dateDue: d.productLots.expirationDate || d.productLots.dateDue,
					  }
					: undefined,
			},
			dueDate: d.dueDate,
			costCenterId: d.costCenterSelectId,
			warehouseId: d.warehouseSelectId,
			brandId: d.brandIdSelectId,
			productId: d.productId || this.productIdEdit,
			quantity: d.totalW !== undefined ? parseFloat(d.totalW.toFixed(2)) : d.quantity,
			priceCost: d.cost || 0,
		};
		return newData;
	});
	const { typeOperation, documentTypeId } = this.headerPage;
	const currentDate = new Date();
	const hours = String(currentDate.getHours()).padStart(2, '0');
	const minutes = String(currentDate.getMinutes()).padStart(2, '0');
	const body = {
		additionalInformation: {
			commentary: this.commentary || null,
			moduleName: 'INVENTARIO',
		},
		dateOnline: this.dateOnline,
		typeOperation,
		documentTypeId,
		kardex,
		createdAt: format(`${this.createdAt} ${hours}:${minutes}`, 'YYYY-MM-DD HH:mm'),
	};
	const message = this.headerPage.typeOperation === 1 ? 'Ingreso' : 'Egreso';
	try {
		await this.$httpProducts.post('kardex/movements', body);
		this.showNotification(`El ${message} se cerró correctamente`);
		this.showCost = false;
		this.cancelCreateNewInOut();
		helper.removeLocalData(this.routeNameValidated);
		this.closeModalAverage();
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'STOCK_NOT_ENOUGH') {
				this.showNotification('Uno o mas productos no tienen suficiente stock', 'error');
			} else if (err.data.message === 'ERROR_UNIQUE_HASH') {
				this.showNotification('Ya existe el hash.', 'error');
			} else if (err.data.message === 'WITHOUT_ACCESS_TO_INCOME_MODULE') {
				this.showNotification(err.data.messageError, 'error');
			} else {
				this.showGenericError();
			}
		} else if (err.status === 500) {
			this.showGenericError();
		}
		this.isLoading = false;
	} finally {
		this.isLoading = false;
	}
}

function newRoute() {
	this.loadData();
	this.cancelCreateNewInOut();
}

function routeNameValidated() {
	if (this.$route.name === 'edit-master-product') {
		const validatedRow = helper.getLocalData('products-selected-entry');
		return validatedRow ? 'products-selected-entry' : 'products-selected-out';
	}
	return this.$route.name === 'new-entry'
		? 'products-selected-entry'
		: 'products-selected-out';
}

function setDate(value, item) {
	const indexSelect = this.dataSelected.findIndex((p) => p.id === item.row.id);
	if (indexSelect > -1) {
		this.dataSelected[indexSelect].createdAt = helper.exactDate(value, 'YYYY-MM-DD');
	}
	helper.setLocalData(this.routeNameValidated, this.data);
}

function totalQuantity() {
	return this.data.reduce((a, d) => a + d.quantity, 0);
}

function validToCreate() {
	const quantityInvalid = this.dataSelected.some((d) => !d.quantity);
	const priceInvalid = this.dataSelected.some((d) => !d.cost);
	if (quantityInvalid || priceInvalid) {
		const message = priceInvalid
			? 'El costo unitario de todos los productos seleccionados debe ser mayor a cero'
			: 'La cantidad de todos los productos seleccionados debe ser mayor a cero';
		this.showNotification(message, 'warning');
		this.isLoading = false;
	} else {
		this.createNewInOut();
	}
}

function openDialoErrorAverage(items) {
	this.showErrorAverage = true;
	this.itemsProductsCost = [...items];
}

function sendSeries({ warehouseProductId, series, productId, totalW }) {
	this.seriesObject = {
		warehouseProductId,
		series,
	};
	this.cancelModal(true);
	const index = this.data.findIndex(
		(d) => d.productId === productId && d.warehouseSelectId === warehouseProductId
	);
	const indexSelect = this.dataSelected.findIndex(
		(p) => p.productId === productId && p.warehouseSelectId === warehouseProductId
	);
	this.seriesSelect = series;
	if (index > -1) {
		this.data[index].series = series;
		this.data[index].quantity = totalW;
	}
	if (indexSelect > -1) {
		this.dataSelected[indexSelect].series = series;
		this.dataSelected[indexSelect].quantity = totalW;
	}
}

function closeModalAverage() {
	this.showErrorAverage = false;
	this.sendProducts = [];
	this.isLoading = false;
	const newDate = new Date();
	this.dateOnline = newDate.getTime().toString();
}

function checkAverageCost() {
	if (this.validateSeries()) {
		if (this.validateNewEntry) {
			this.showGenericError('Agregue al menos una serie por producto');
			return;
		}
		this.showGenericError('Seleccione al menos una serie por producto');
		return;
	}
	this.totalSelectProduct =
		this.data.filter((prod) => prod.isSelected).length === this.data.length;
	this.productsAddCost = this.dataSelected.filter((prod) => prod.cost > prod.price);
	if (!this.totalSelectProduct) {
		this.showConfirmOut = true;
	} else if (this.productsAddCost.length > 0 && this.$route.name === 'new-entry') {
		this.showCost = true;
	} else if (this.$route.name === 'new-discharge') {
		this.createNewInOut();
	} else if (this.isFlagKardexValued) {
		this.loadAverageCost();
	} else {
		this.validToCreate();
	}
}

function acceptProductDialog() {
	if (this.isFlagKardexValued) {
		this.loadAverageCost();
	} else {
		this.validToCreate();
	}
	this.showConfirmOut = false;
}

async function loadAverageCost() {
	this.isLoading = true;
	const body = {
		costValidation: this.data.map((p) => {
			const newV = {
				productId: p.productId || this.productIdEdit || p.id,
				price: p.cost || 0,
				quantity: p.quantity,
				warehouseId: p.warehouseSelectId,
			};
			return newV;
		}),
	};
	try {
		const { data: response } = await this.$httpProducts.patch(
			`products/average-cost-validation/${this.codePurchases}`,
			body
		);
		this.noSuccess = response.some((r) => r.exceeded);
		if (this.noSuccess) {
			this.sendProducts = response.reduce((acum, r) => {
				if (r.exceeded) {
					const newAcum = { ...r };
					newAcum.productName =
						this.data.find((p) => p.productId === r.productId).name ||
						this.data.find((p) => p.productId === r.productId).product.name ||
						'';
					acum.push(newAcum);
				}
				return acum;
			}, []);
			this.showErrorAverage = true;
		} else {
			this.validToCreate();
		}
	} catch (error) {
		this.showGenericError();
	}
}

function validatedBrand() {
	return this.$userInfo.company.settings.flagImport;
}

function showConfigBrand() {
	return this.$userInfo.company.settings.flagUseSimpleBrand;
}

function closeDialogConfirm() {
	this.showConfirmOut = false;
}

function getDate({ model, value }) {
	this[model] = format(value, 'YYYY-MM-DD');
}

function closeModalCost() {
	this.showCost = false;
	this.productsAddCost = [];
}

function data() {
	return {
		typeProduct,
		movementId: null,
		idGroup: null,
		disabledEdit: false,
		dialogmodalLotes: false,
		dialogmodalNewLotes: false,
		objPricesale: {
			subtotal: 0,
			costUnit: 0,
			tax: null,
			quantity: null,
			total: null,
			warehouseId: null,
		},
		action: {
			active: false,
			code: '',
			open: false,
			title: '',
			width: 380,
		},
		brands: [],
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
				name: 'Almacén',
				value: 'warehouse',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Nombre',
				value: 'name',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Unidad',
				value: 'unitName',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Cant',
				value: 'quantity',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Costo Unit',
				value: 'costUnit',
				checked: !this.$userInfo.flagNotShowCostPrice,
				visible: !this.$userInfo.flagNotShowCostPrice,
				flagVisible: this.$userInfo.flagNotShowCostPrice,
			},
			{
				id: 7,
				name: 'IGV',
				value: 'tax',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Precio Costo',
				value: 'priceCost',
				checked: !this.$userInfo.flagNotShowCostPrice,
				visible: !this.$userInfo.flagNotShowCostPrice,
				flagVisible: this.$userInfo.flagNotShowCostPrice,
			},
			{
				id: 9,
				name: 'P. Venta',
				value: 'priceSale',
				visible: true,
				checked: true,
			},
			{
				id: 10,
				name: 'Total Costo Unit',
				value: 'total',
				checked: !this.$userInfo.flagNotShowCostPrice,
				visible: !this.$userInfo.flagNotShowCostPrice,
				flagVisible: this.$userInfo.flagNotShowCostPrice,
			},
			{
				id: 11,
				name: 'Caracteristicas',
				value: 'brand',
				visible: false,
				checked: false,
			},
			{
				id: 12,
				name: 'Categoria',
				value: 'categoryName',
				visible: false,
				checked: false,
			},
			{
				id: 13,
				name: 'Ubicación',
				value: 'categoryName',
				visible: false,
				checked: false,
				flagVisible: true,
			},
			{
				id: 14,
				name: 'Centro de costos',
				value: 'cost',
				visible: false,
				checked: false,
			},
			{
				id: 15,
				name: 'Stock Actual',
				value: 'stock',
				visible: true,
				checked: true,
			},
			{
				id: 16,
				name: 'Nro. Lote',
				tooltip: 'Numero de Lote',
				value: 'stock',
				visible: false,
				checked: false,
			},
			{
				id: 17,
				name: 'F. de Venc.',
				tooltip: 'Fecha de Vencimiento',
				value: 'stock',
				visible: true,
				checked: true,
			},
			{
				id: 18,
				name: 'Acciones',
				value: 'action',
				visible: true,
				checked: true,
			},
		],
		showAddModal: true,
		commentary: null,
		data: [],
		dateOnline: '',
		dueDate: null,
		checkAll: false,
		groups: [],
		searchVal: null,
		selectedProduct: '',
		isLoading: false,
		lastPage: 0,
		lot: null,
		warehouses: [],
		costsCenter: [],
		currentPage: 1,
		headerPage: {
			groupName: null,
			typeDocument: null,
			serie: null,
			number: null,
			documentTypeId: null,
			typeOperation: null,
		},
		newProduct: {
			product: null,
		},
		costCenter: null,
		warehouse: {},
		brand: null,
		seriesObject: null,
		series: null,
		quantityProduct: 1,
		dialogMessage: '',
		dialog: false,
		productId: null,
		productsAddCost: [],
		dataSelected: [],
		createdAt: null,
		groupId: null,
		showBrandConfig: false,
		codePurchases: null,
		showConfirmOut: false,
		showErrorAverage: false,
		itemsProductsCost: [],
		noSuccess: false,
		sendProducts: [],
		showCost: false,
		showLot: false,
		createdLots: [],
		detailSeries: false,
		productSerie: {},
		productDischarge: {},
		validateNewEntry: false,
		sumSeries: null,
		resumen: [
			{ label: 'Total Cant.:', value: 0 },
			{ label: 'Total P. Venta:', value: 0 },
			{
				label: 'Total Costo Unit:',
				value: 0,
				flagVisible: this.$userInfo.flagNotShowCostPrice,
			},
			{
				label: 'Total P. Costo:',
				value: 0,
				flagVisible: this.$userInfo.flagNotShowCostPrice,
			},
		],
		resumenVisible: false,
	};
}

export default {
	name: 'new-in-out',
	components: {
		appCommentaries,
		appCommentariesLotes,
		modalLotes,
		modalLotesSales,
		appActions,
		appDateSelect,
		appTable,
		actionSidebar,
		headerPage,
		generalFilter,
		group,
		productsSearchInput,
		productsSearchForm,
		btnAverageCost,
		modalItems,
		controlSeries,
		documentState,
		viewSeries,
	},
	created,
	computed: {
		disabledAdd,
		routeNameValidated,
		totalQuantity,
		validatedBrand,
		showConfigBrand,
		validateQuantityZero() {
			return this.data.some((item) => item.quantity === 0);
		},
		flagLot() {
			return this.newProduct.product && this.newProduct.product.flagLotsEnabled;
		},
	},
	data,
	methods: {
		addNewLot,
		closeSidebar,
		setComentary,
		setCommentaryLotes,
		makeCommentary,
		acceptProductDialog,
		addProduct,
		addProductWithLot,
		handleOpenModalNewLot,
		handleCloseModalNewLot,
		cancelModal,
		closeDialogConfirm,
		detailGroup,
		detailHeader,
		getDate,
		loadData,
		openDialogLotes,
		handlecloseModalLotes,
		openSearch,
		stopClick,
		rowIsSelected,
		selectedAll,
		runAction,
		setProduct,
		changeLocation,
		changeValue,
		clearFilter,
		editPriceCost,
		openConfirmDelete,
		closeDialog,
		deleteProduct,
		createNewInOut,
		cancelCreateNewInOut,
		setDate,
		getData,
		validToCreate,
		openDialoErrorAverage,
		closeModalAverage,
		closeModalCost,
		checkAverageCost,
		loadAverageCost,
		openSeries,
		openSeriesDischarge,
		sendSeries,
		printData(a) {
			console.log(a);
		},
		sendSeriesExit(rows, id, sumSeries) {
			this.sumSeries = Boolean(sumSeries);
			const series = rows.map((obj) => ({ id: obj.id, serie: obj.serie }));
			const index = this.data.findIndex((d) => d.productId === id);
			const indexSelect = this.dataSelected.findIndex((p) => p.productId === id);
			if (index > -1) {
				this.data[index].series = series;
				this.data[index].quantity = sumSeries;
			}
			if (indexSelect > -1) {
				this.dataSelected[indexSelect].series = series;
				this.dataSelected[indexSelect].quantity = sumSeries;
			}
			this.cancelModal(true);
		},
		totalSerieValue(row) {
			const index = this.data.findIndex((d) => d.id === row.id);
			if (row.quantity) {
				if (index > -1) {
					this.data[index].total = this.data[index].quantity * this.data[index].cost;
					helper.setLocalData(this.routeNameValidated, this.data);
				}
				return Number.isInteger(row.quantity) ? row.quantity : row.quantity.toFixed(2);
			}
			return 0;
		},
		validateSeries() {
			const productSeries = this.data.filter((d) => d.product);
			const existsProducts = productSeries.length
				? productSeries.filter((d) => d.product.flagControlSerie)
				: false;
			const vaSer = existsProducts.length
				? !existsProducts.every((e) => e.series)
				: false;
			return vaSer;
		},
		setQuantity({ value }) {
			this.quantityProduct = Number(value);
		},
	},
	props: {
		commerceCode: [Number, String],
		commerceId: [Number, String],
		productIdEdit: [Number, String],
		subsidiaryId: [Number, String],
		warehouseId: [Number, String],
		productIdSerie: {
			type: Object,
		},
	},
	validations,
	watch: {
		$route: newRoute,
		data(newData) {
			this.resumen[0].value = newData.reduce((a, d) => a + d.quantity, 0);
			this.resumen[1].value = newData.reduce((a, d) => a + d.price * d.quantity, 0);
			this.resumen[2].value = newData.reduce((a, d) => a + d.cost * d.quantity, 0);
			this.resumen[3].value = newData.reduce((a, d) => a + d.priceCost * d.quantity, 0);
		},
	},
};
</script>
<style lang="scss" scoped>
.btn-price-sale {
	background-color: color(primary);
	border-radius: 5px;
	color: white;
	font-family: map-get($fonts, open-regular);
	font-size: 10px;
	padding: 4px 1px;
	margin-top: 24px;
	width: 190px;
}
.w-8 {
	width: 8%;
}

.w-10 {
	width: 10%;
}

.text-info {
	color: map-get($colors, tableText);
	font-size: 10px;
}

.width-date {
	width: 120px;
}
</style>
