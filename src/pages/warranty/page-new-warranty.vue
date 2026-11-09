<template>
	<div>
		<header-page
			:caption-navigation="headerWarranty"
			:title="titleWarranty"
			:show-clean="false"
			:show-excel="false"
			btns-column="xs8"
			to-show
		>
			<v-layout row v-if="$route.params.id">
				<v-flex xs4>
					<v-layout row wrap align-center>
						<v-flex d-flex align-center pl-3 class="column-label">
							Fecha:
						</v-flex>
						<v-flex d-flex align-center class="column-value">
							{{ informationWarranty.startDate | exactDate }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs4 ml-2>
					<v-layout row wrap align-center>
						<v-flex d-flex align-center pl-3 class="column-label">
							Saldo a Favor:
						</v-flex>
						<v-flex d-flex align-center class="column-value">
							{{ informationWarranty.amount | round }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex ml-3 text-xs-center v-if="options.length">
					<slot></slot>
					<v-tooltip top>
						<v-btn
							slot="activator"
							:style="showExcelMenu ? 'display: none' : 'display: flex'"
							class="header-page-download-document primary btn-auto py-1 px-1 mr-3"
							:disabled="excelLoading"
							@click="openMenu"
						>
							<img src="/static/img/excel.svg" alt="download" height="17" />
						</v-btn>
						<span>Reporte por tipo de Garantia</span>
					</v-tooltip>
					<v-menu
						content-class="excel-menu-content"
						offset-y
						:nudge-bottom="8"
						:nudge-left="25"
						v-if="showExcelMenu"
						:open-on-click="true"
					>
						<v-btn
							slot="activator"
							class="btn-download-excel btn-auto py-1 px-1 mr-3"
							:disabled="excelLoading"
							@click="openMenu"
						>
							<img src="/static/img/excel.svg" alt="download" height="17" />
						</v-btn>
						<v-list v-if="showExcelMenu">
							<v-list-tile
								v-for="option in options"
								:key="option.id"
								@click="downloadDocument(option)"
							>
								<v-list-tile-title>
									{{ option.typeBenefitsName.name }} {{ option.number }}
								</v-list-tile-title>
							</v-list-tile>
						</v-list>
					</v-menu>
				</v-flex>
				<v-flex ml-1 v-if="options.length">
					<v-tooltip top>
						<v-btn
							slot="activator"
							type="button"
							class="header-page-download-document primary btn-auto py-1 px-1 mr-3"
							:disabled="excelLoading"
							@click="downloadWarranty"
						>
							<img src="/static/img/excel.svg" alt="download" height="17" />
						</v-btn>
						<span>Reporte General de Garantia</span>
					</v-tooltip>
				</v-flex>
				<v-flex v-if="typeBenefitsGruop.length">
					<slot></slot>
					<v-tooltip top>
						<v-btn
							slot="activator"
							:style="showExcelMenuGroup ? 'display: none' : 'display: flex'"
							class="header-page-download-document primary btn-auto py-1 px-1 mr-3"
							:disabled="excelLoading"
							@click="openMenuGroup"
						>
							<img src="/static/img/excel.svg" alt="download" height="17" />
						</v-btn>
						<span>Reportes Agrupados</span>
					</v-tooltip>
					<v-menu
						content-class="excel-menu-content"
						offset-y
						:nudge-bottom="8"
						:nudge-left="25"
						v-if="showExcelMenuGroup"
						:open-on-click="true"
					>
						<v-btn
							slot="activator"
							class="btn-download-excel btn-auto py-1 px-1 mr-3"
							:disabled="excelLoading"
							@click="openMenuGroup"
						>
							<img src="/static/img/excel.svg" alt="download" height="17" />
						</v-btn>
						<v-list v-if="showExcelMenuGroup">
							<v-list-tile
								v-for="option in typeBenefitsGruop"
								:key="option.id"
								@click="downloadDocumentGroup(option)"
							>
								<v-list-tile-title>
									{{ option.name }}
								</v-list-tile-title>
							</v-list-tile>
						</v-list>
					</v-menu>
				</v-flex>
				<v-flex
					ml-2
					class="process-text"
					:style="`color: ${this.color}; border: 1px solid ${this.color} `"
				>
					{{
						informationWarranty.statusOperation
							? informationWarranty.statusOperation.process
							: null
					}}
					{{
						informationWarranty.statusOperation
							? informationWarranty.statusOperation.statusName
							: null
					}}
				</v-flex>
			</v-layout>
		</header-page>
		<div v-if="$route.params.id">
			<app-actions
				:resource-uri="$route.name"
				:value-disabled="actionsDisabled"
				@run-action="runAction"
			/>
		</div>
		<v-layout row align-end px-4 pt-4 class="page-new-warranty-header">
			<v-flex xs3>
				<app-select
					append-icon="search"
					:disabled="!!idWarranty"
					autocomplete
					label="Buscar Cliente"
					item-value="id"
					item-text="autocomplete"
					:items="customers"
					:item="params.customerId"
					model="customerId"
					return-object
					@input="setParams"
				/>
			</v-flex>
			<v-flex xs3 ml-2>
				<app-select
					:disabled="!!idWarranty"
					label="Almacén"
					item-value="id"
					item-text="name"
					model="warehouseId"
					:return-object="false"
					:item="params.warehouseId"
					:items="warehouses"
					@input="setParams"
				/>
			</v-flex>
			<v-flex xs3 ml-4>
				<v-layout column>
					<v-flex class="primary--text ft-11"
						>Empleado que ingreso el producto</v-flex
					>
					<v-flex class="ft-13">{{ nameEmployee }}</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout
			row
			align-end
			px-4
			mt-3
			v-if="informationWarranty.status !== 4 || isVendor"
		>
			<v-flex xs3>
				<products-search-input
					:disabled="informationWarranty.status === 3"
					:search-value="selectedProduct"
					@search="openSearch"
				/>
			</v-flex>
			<v-flex xs3 px-2>
				<app-select
					:item="params.subsidiaryId"
					item-text="sucursalName"
					item-value="id"
					:items="subsidiaries"
					label="Seleccione Sucursal"
					model="subsidiaryId"
					:return-object="false"
					@input="setParams"
				/>
			</v-flex>
			<v-flex xs2 ml-2>
				<v-btn
					type="button"
					color="primary"
					class="btn-action btn-action-block mr-2"
					:disabled="!selectedProduct"
					@click="openConfigProduct"
				>
					Configurar producto y agregar
				</v-btn>
			</v-flex>
		</v-layout>
		<v-layout px-4 mb-4>
			<v-flex xs12 class="title-product mt-4">Productos</v-flex>
		</v-layout>
		<app-table
			:selectable="!!idWarranty"
			:columns="columns"
			:rows="rows"
			:input-search="false"
			:filter-columns="false"
			@on-selected-all="selectedAll"
			@row-is-selected="rowIsSelected"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">
					{{ props.row.product ? props.row.product.code : null }}
				</td>
				<td v-show="showRow(columns, 2)">
					{{ props.row.product ? props.row.product.name : null }}
				</td>
				<td v-show="showRow(columns, 3)">{{ props.row.fullNameSupplier }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.typeDocument }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.documentNumber }}</td>
				<td v-show="showRow(columns, 6)">
					{{ props.row.descriptions }}
				</td>
				<td v-show="showRow(columns, 7)">
					{{ props.row.product ? props.row.product.stock : null }}
				</td>
				<td v-show="showRow(columns, 8)">{{ props.row.stockReplaced }}</td>
				<td v-show="showRow(columns, 9)">{{ props.row.quantity }}</td>
				<td v-show="showRow(columns, 10)">{{ props.row.priceSale | round }}</td>
				<td v-show="showRow(columns, 11)">{{ props.row.amountTotalRow }}</td>
				<td
					v-show="showRow(columns, 12)"
					:style="
						props.row.status === 1 ? 'color: #237bf5' : 'color: color(primary)'
					"
				>
					{{
						props.row.statusOperation
							? props.row.statusOperation.statusName
							: null
					}}
				</td>
				<td v-show="showRow(columns, 13)">
					<app-tooltip-button
						v-if="idWarranty"
						:disabled="props.row.status === 3 || isVendor"
						color="primary"
						icon="edit"
						text="Editar"
						@click-icon="editWarranty(props.row)"
					></app-tooltip-button>
					<app-tooltip-button
						v-if="idWarranty"
						color="primary"
						text="Ver Detalle"
						icon="remove_red_eye"
						@click-icon="viewDetailRow(props.row)"
					/>
					<app-tooltip-button
						:disabled="props.row.status === 3 || isVendor"
						color="error"
						text="Anular Garantía"
						icon="close"
						@click-icon="cancelWarranty(props.row)"
					/>
				</td>
			</template>
		</app-table>
		<action-sidebar
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<products-search-form
				v-if="action.code === 'product-searcher'"
				@add-product="setProduct"
				:search-value="searchVal"
				text="Seleccionar"
				not-valid-negative-stock
				master
				:show-filter="false"
			/>
			<config-product
				v-if="action.code === 'config-product'"
				:problem-description="model.problemDescription"
				:array-images="model.arrayImages"
				:allowed-files="allowedFiles"
				:columns="columnsHistory"
				:model="model"
				:states="states"
				:show-view="showView"
				:view-modal="viewModal"
				:rows="rowsHistory"
				:sales-product="salesProduct"
				:text-save="textSave"
				:disabled-quantity="disabledQuantity"
				:show-new-supplier="showNewSupplier"
				@set-input="setInput"
				@cancel-action="closeModal"
				@save="saveModalConfig"
				@valid-note="validSale"
			/>
		</action-sidebar>
		<v-dialog
			v-model="dialogChange"
			persistent
			max-width="353px"
			@close-modal="closeDialog"
		>
			<modal-items
				title="RECAMBIO"
				name-action="Guardar"
				show-slot
				:disabled="!params.warehouseIdDialog"
				@close-modal="closeDialog"
				@action-modal="changeAction"
			>
				<div class="pb-4">
					<div class="pt-3 pb-3 px-4 content-header">
						<app-select
							label="Almacen"
							item-value="id"
							item-text="name"
							:item="params.warehouseIdDialog"
							:items="warehouses"
							model="warehouseIdDialog"
							:return-object="false"
							@input="setParams"
						/>
					</div>
					<v-layout row justify-space-between px-3 pt-3>
						<v-flex class="title-model">Stock Almacen:</v-flex>
						<v-flex class="title-model">Producto:</v-flex>
						<v-flex class="title-model" text-xs-right>Cantidad:</v-flex>
					</v-layout>
					<v-flex v-for="(item, index) in dataSelected" :key="index">
						<v-layout row px-3 pt-3 align-center>
							<v-flex v-flex xs2>
								{{ item.stockWarehouse }}
							</v-flex>
							<v-flex
								xs9
								:class="{
									'red-alert':
										item.quantityChange > item.stockWarehouse ||
										item.stockWarehouse === 0 ||
										item.quantityChange > item.quantity - item.stockReplaced,
								}"
								class="name-product ml-2"
							>
								{{ item.product.name }}
							</v-flex>
							<v-flex class="ml-2" xs3>
								<app-input-text
									:class="{
										'red-alert border-radius-red':
											item.quantityChange > item.stockWarehouse ||
											item.stockWarehouse === 0 ||
											item.quantityChange > item.quantity - item.stockReplaced,
									}"
									:disabled="item.stockWarehouse === 0"
									:text="item.quantityChange"
									model="quantityChange"
									@input="setQuantity(item, $event)"
								/>
							</v-flex>
						</v-layout>
						<v-flex
							px-3
							xs12
							mt-1
							class="form-group__message"
							v-if="item.quantityChange > item.stockWarehouse"
						>
							La cantidad excede al stock del almacén
						</v-flex>
						<v-flex
							px-3
							xs12
							mt-1
							class="form-group__message"
							v-if="item.quantityChange > item.quantity - item.stockReplaced"
						>
							La cantidad ingresada supera a los productos pendientes por
							procesar
						</v-flex>
					</v-flex>
				</div>
			</modal-items>
		</v-dialog>
		<v-dialog
			v-model="dialgoGenerate"
			persistent
			max-width="460px"
			@close-modal="closeDialog"
		>
			<modal-items
				title="GENERAR CUPÓN"
				name-action="Guardar"
				show-slot
				:disabled="!params.amountCupon"
				@close-modal="closeDialog"
				@action-modal="actionGenerateCupon"
			>
				<div class="pt-3 pb-3 px-4 content-header">
					<v-layout row>
						<v-flex class="title-model" xs6 text-xs-center>Producto:</v-flex>
						<v-flex class="title-model" xs2 text-xs-center>P.V:</v-flex>
						<v-flex class="title-model" xs2 text-xs-center>Cantidad:</v-flex>
						<v-flex class="title-model" xs2 text-xs-center>Total:</v-flex>
					</v-layout>
					<v-layout row mb-2 v-for="(item, index) in dataSelected" :key="index">
						<v-flex class="name-product" text-xs-center xs6>
							{{ item.product.name }}
						</v-flex>
						<v-flex xs2 text-xs-center pt-2>
							{{ item.priceSale }}
						</v-flex>
						<v-flex xs2>
							<app-input-text
								class="input-warranty"
								:disabled="item.stockWarehouse === 0"
								:text="item.quantityChangeCupon"
								model="quantityChangeCupon"
								@input="setQuantityCupon(index, item, $event)"
							/>
						</v-flex>
						<v-flex xs2 pt-2 text-xs-center>
							{{ item.amountRow }}
						</v-flex>
					</v-layout>
				</div>
				<div class="pt-3 pb-3 px-4">
					<v-layout row align-center justify-space-between>
						<v-flex class="title-model" xs6> Monto de Cupón </v-flex>
						<v-flex class="ml-3">
							<app-input-text
								class="input-warranty"
								model="amountCupon"
								:text="params.amountCupon"
								@input="setParams"
							/>
						</v-flex>
					</v-layout>
				</div>
			</modal-items>
		</v-dialog>
		<v-dialog v-model="dialogReturn" persistent max-width="353px">
			<modal-items
				title="Devolución"
				name-action="Aceptar"
				show-slot
				@close-modal="closeDialog"
				@action-modal="returnAction"
			>
				<div class="pt-3 pb-3 px-4 content-header">
					<app-select
						label="Almacen"
						item-value="id"
						item-text="name"
						:item="params.warehouseId"
						:items="warehouses"
						model="warehouseId"
						:disabled="true"
						:return-object="false"
					/>
				</div>
				<div class="pt-1 pb-3 px-4 content-header">
					<v-layout row justify-space-between px-3 pt-3>
						<v-flex class="title-model">Producto:</v-flex>
						<v-flex class="title-model" text-xs-right>Cantidad:</v-flex>
					</v-layout>
					<v-flex v-for="(item, index) in dataSelected" :key="index">
						<v-layout row px-2 pt-3 align-center>
							<v-flex
								xs9
								:class="{
									'red-alert':
										item.stockReturn > item.stockWarehouse ||
										item.stockWarehouse === 0 ||
										item.stockReturn > item.quantity - item.stockReplaced,
								}"
								class="name-product"
							>
								{{ item.product.name }}
							</v-flex>
							<v-flex class="ml-2" xs3>
								<app-input-text
									:class="{
										'red-alert':
											item.stockReturn > item.stockWarehouse ||
											item.stockWarehouse === 0 ||
											item.stockReturn > item.quantity - item.stockReplaced,
									}"
									:text="item.stockReturn"
									model="stockReturn"
									@input="setStockReturn(index, $event)"
								/>
							</v-flex>
						</v-layout>
						<v-flex
							px-3
							xs12
							mt-1
							class="form-group__message"
							v-if="
								item.stockReturn > item.stockWarehouse ||
								item.stockWarehouse === 0 ||
								item.stockReturn > item.quantity - item.stockReplaced
							"
						>
							La cantidad excede a los productos pendientes ingresados.
						</v-flex>
						<v-flex
							px-3
							xs12
							mt-1
							class="form-group__message"
							v-if="item.stockReturn > item.quantity - item.stockReplaced"
						>
							La cantidad ingresada supera a los productos pendientes por
							procesar
						</v-flex>
					</v-flex>
				</div>
			</modal-items>
		</v-dialog>
		<app-show-dialog
			color-dialog="error"
			color-hex="#D5331A"
			title-header="Crear Garantia"
			:text-content="textContent"
			:show-modal-init="showModal"
			@close-dialog="closeDialogModal"
		/>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:img="false"
				:hiddenSaveBtn="
					informationWarranty.status === 3 || informationWarranty.status === 4
				"
				padding-cancel="px-5 py-2"
				padding-success="px-4 py-2"
				:success-text="labelModalSidebar"
				success-color="primary"
				cancel-text="Atras"
				cancel-color="secondary"
				:is-loading="!rows.length"
				@accept-button-clicked="btnModalWarranty"
				@cancel-button-clicked="goBack"
			/>
		</section>
	</div>
</template>

<script>
import actionSidebar from '@/components/shared/action-sidebar';
import appActions from '@/components/shared/app-actions';
import appShowDialog from '@/components/shared/app-show-dialog';
import configProduct from '@/components/warranty/config-product';
import appTable from '@/components/shared/table/app-table';
import headerPage from '@/components/shared/header-page';
import modalItems from '@/components/shared/modal-items';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import productsSearchForm from '@/components/shared/searcher/products-search-form';
import productsSearchInput from '@/components/shared/searcher/products-search-input';
import helper from '@/shared/helper';

function created() {
	this.idWarranty = this.$route.params.id;
	this.isVendor = this.isRoleVendor;
	this.params.subsidiaryId = this.$userInfo.subsidiary.id;
	if (this.idWarranty) {
		this.loadInformationWarranty();
	}
	this.loadResources();
	if (!this.idWarranty) {
		this.nameEmployee = this.$userInfo.fullname;
	}
}

async function loadInformationWarranty() {
	try {
		const response = await this.$httpProducts.get(
			`warranties/${this.idWarranty}`
		);
		this.informationWarranty = response.data;
		this.nameEmployee = this.informationWarranty.fullNameEmployee;
		this.params.warehouseId = response.data.warehouseId;
		this.color = response.data.statusOperation
			? response.data.statusOperation.color
			: '#000000';
		this.params.customerId = response.data.customerId;
		this.options = response.data.typeBenefits;
		this.typeBenefitsGruop = response.data.typeBenefitsGruop;
		this.rows = response.data.details.map((p) => {
			const newRow = { ...p };
			newRow.stockWarehouse = null;
			newRow.isSelected = false;
			newRow.stockReplaced = p.stockReplaced || 0;
			newRow.stockReturn = Number(p.quantity - newRow.stockReplaced);
			newRow.quantityChangeCupon = p.quantity - newRow.stockReplaced;
			newRow.quantityChange = p.quantity - newRow.stockReplaced;
			const newQuantity = p.quantity - newRow.stockReplaced;
			newRow.amountRow = Number(newQuantity * p.priceSale);
			newRow.amountTotalRow = Number(p.quantity * p.priceSale);
			newRow.descriptions = p.problemDescription.reduce(
				(a, s) => a.concat(` ${s.description}, `),
				''
			);
			return newRow;
		});
		this.params.product = response.data.product;
	} catch (error) {
		this.showGenericError();
	}
}

async function loadResources() {
	const requests = [
		this.$httpProducts.get('warehouses'),
		this.$httpSales.get('customers'),
		this.subsidiariesList(),
	];
	[
		{ data: this.warehouses },
		{ data: this.customers },
		{ data: this.subsidiaries },
	] = await Promise.all(requests);
	if (this.warehouses.length === 1) {
		this.params.warehouseId = this.warehouses[0].id;
	}
	if (this.customers.length === 1) {
		this.params.customerId = this.customers[0].id;
	}
}

function openSearch(value) {
	this.searchVal = value ? value.trim() : '';
	this.action.code = 'product-searcher';
	this.action.title = 'Productos';
	this.action.width = 739;
	this.action.open = true;
}

function setProduct(prod) {
	this.closeModal();
	this.selectedProduct = prod.name;
	this.params.product = prod;
}

function closeModal() {
	this.action = {
		open: false,
		code: null,
		title: '',
	};
	this.viewModal = false;
	this.showView = false;
	this.editRow = null;
	this.showNewSupplier = false;
	this.clearModal();
}

function openConfigProduct() {
	if (this.params.customerId) {
		this.action = {
			open: true,
			code: 'config-product',
			title: this.selectedProduct,
			width: 560,
		};
		this.textSave = 'Agregar Producto';
		this.informationSales();
	} else {
		this.showNotification(
			'Debe seleccionar un cliente y/o almacén para configurar el producto.',
			'warning'
		);
	}
}

async function informationSales(filter = false) {
	try {
		const body = {
			comSubsidiaryId: this.params.subsidiaryId,
			typeSearch: filter ? 1 : 0,
			customerId: this.params.customerId,
			productId: this.params.product.id,
			serie: filter ? this.model.serie : undefined,
			number: filter ? this.model.number : undefined,
			salTypeDocumentId: filter ? this.model.typeDocumentId : undefined,
		};
		const response = await this.$httpSales.post(
			'sale-documents/type-search',
			body
		);
		if (!filter) {
			this.salesProduct = response.data.map((p) => {
				const newRow = { ...p };
				newRow.typeDocumentComplete = `${p.documentNumber} - Precio de Venta: ${
					p.salePrice
				} - Cant.: ${p.quantity || 0}`;
				return newRow;
			});
			if (this.salesProduct.length === 1) {
				this.model.infoSale = this.salesProduct[0];
				this.model.priceSale = this.salesProduct[0].salePrice;
				this.model.brandId = this.salesProduct[0].brandId;
				this.model.warehouseId = this.salesProduct[0].warWarehousesId;
				this.model.saleId = this.salesProduct[0].documentNumber;
				this.model.documentCode = this.salesProduct[0].documentCode;
				this.model.typeDocumentName = this.salesProduct[0].documentCode;
				this.model.typeDocument = this.salesProduct[0].documentCode;
				this.model.documentNumber = this.salesProduct[0].documentNumber;
				this.model.typeDocumentId = this.salesProduct[0].typeDocumentId;
				this.model.documentId = this.salesProduct[0].id;
				this.model.quantitySale = this.salesProduct[0].quantity;
				this.model.brandId = this.salesProduct[0].brandId;
				this.model.brandName = this.salesProduct[0].brandName;
				this.model.categoryId = this.salesProduct[0].categoryId;
				this.model.categoryName = this.salesProduct[0].categoryName;
				this.model.number = this.salesProduct[0].number;
			}
		}
		if (filter) {
			this.model.priceSale = response.data.salePrice;
			this.model.brandId = response.data.brandId;
			this.model.warehouseId = response.data.warWarehousesId;
			this.model.brandName = response.data.brandName;
			this.model.categoryId = response.data.categoryId;
			this.model.categoryName = response.data.categoryName;
			this.model.typeDocument = response.data.documentCode;
			this.model.typeDocumentName = response.data.documentCode;
			this.model.documentCode = response.data.documentCode;
			this.model.documentNumber = response.data.documentNumber;
			this.model.saleId = response.data.documentNumber;
			this.model.quantitySale = response.data.quantity;
			this.showNotification('Se registro correctamente la venta.');
		}
	} catch (error) {
		if (error.status === 400) {
			this.showGenericError(error.data.messageError);
		} else if (error.status === 500) {
			this.showGenericError();
		}
	}
}

function titleWarranty() {
	if (this.$route.params.id) {
		return 'Editar Garantía';
	}
	return 'Nueva Garantía';
}

function headerWarranty() {
	if (this.$route.params.id) {
		return 'Garantía < Editar Garantía';
	}
	return 'Garantía < Nueva Garantía';
}

function goBack() {
	this.$router.back();
}

function runAction({ code }) {
	if (code === 'replacement') {
		this.dialogChange = true;
		this.loadInformationWarehouse();
		this.params.warehouseIdDialog = this.warehouses[0].id;
	} else if (code === 'generate-cupon') {
		this.dialgoGenerate = true;
		this.params.amountCupon = this.dataSelected.reduce(
			(a, c) => a + c.amountRow,
			0
		);
	} else {
		this.dialogReturn = true;
		this.loadInformationWarehouse();
	}
}

async function loadInformationWarehouse() {
	const body = {
		productIds: this.dataSelected.map((p) => p.productId),
		warehouseIds: this.warehouses.map((i) => i.id),
	};
	try {
		const response = await this.$httpProducts.post(
			'products/warehouse-stock',
			body
		);
		this.infoStockProduct = response.data;
		if (this.dialogReturn) {
			this.validatedWarehouseReturn();
		} else {
			this.validatedWarehouse();
		}
	} catch (error) {
		this.showGenericError();
	}
}

function validatedWarehouseReturn() {
	this.dataSelected = this.dataSelected.map((p) => {
		const newRow = { ...p };
		newRow.stockWarehouse = 0;
		const rowProduct = this.infoStockProduct.find((o) => o.id === p.productId);
		if (rowProduct) {
			const warehouseExist = rowProduct.warehouseProductDetails.find(
				(w) => w.id === this.params.warehouseId
			);
			if (warehouseExist && warehouseExist.stockWarehouse > 0) {
				newRow.stockWarehouse = warehouseExist.stockWarehouse;
			}
		}
		return newRow;
	});
	return this.dataSelected;
}

function validatedWarehouse() {
	this.dataSelected = this.dataSelected.map((p) => {
		const newRow = { ...p };
		newRow.stockWarehouse = 0;
		const rowProduct = this.infoStockProduct.find((o) => o.id === p.productId);
		if (rowProduct) {
			const warehouseExist = rowProduct.warehouseProductDetails.find(
				(w) => w.id === this.params.warehouseIdDialog
			);
			if (warehouseExist && warehouseExist.stockWarehouse > 0) {
				newRow.stockWarehouse = warehouseExist.stockWarehouse;
			}
		}
		return newRow;
	});
	return this.dataSelected;
}

function closeDialog() {
	this.dialogChange = false;
	this.dialgoGenerate = false;
	this.dialogReturn = false;
	this.params.warehouseIdDialog = null;
	this.params.quantityChange = null;
	this.params.amountCupon = null;
	this.textSave = '';
	this.idRow = null;
}

function setParams({ model, value }) {
	if (value) {
		if (model === 'customerId') {
			this.params[model] = value.id;
			this.params.fullNameCustomer = value.name || value.autocomplete;
		} else if (model === 'warehouseIdDialog') {
			this.params[model] = value;
			this.validatedWarehouse();
		} else {
			this.params[model] = value;
		}
	}
}

function saveModalConfig() {
	if (this.idWarranty) {
		if (this.editRow) {
			this.editRowWarranty();
		} else {
			this.addProductWarranty();
		}
	} else {
		const rowWarranty = {
			id: this.rows.length + 1,
			warehouseId: this.model.warehouseId,
			product: this.params.product,
			fullNameSupplier: this.model.fullNameSupplier,
			supplierId: this.model.supplierId,
			quantity: this.model.quantity,
			priceSale: this.model.priceSale,
			statusOperation: this.model.stateId,
			problemDescription: this.model.problemDescription,
			descriptions: this.model.problemDescription.reduce(
				(a, s) => a.concat(` ${s.description}, `),
				''
			),
			typeDocument: this.model.typeDocument,
			typeDocumentName: this.model.typeDocumentName,
			documentNumber: this.model.documentNumber,
			images: this.model.arrayImages,
			documentId: this.model.documentId,
			amountRow: Number(this.model.quantity * this.model.priceSale),
			amountTotalRow: Number(this.model.quantity * this.model.priceSale),
			brandId: this.model.brandId,
			brandName: this.model.brandName,
			categoryId: this.model.categoryId,
			categoryName: this.model.categoryName,
		};
		this.rows.push(rowWarranty);
		this.closeModal();
		this.clearModal();
		this.selectedProduct = null;
		this.params.product = null;
	}
}

async function editRowWarranty() {
	const body = {
		supplierId: this.model.supplierId,
		fullNameSupplier: this.model.supplierName,
		problemDescription: this.model.problemDescription.map((o) => {
			const newRow = {};
			newRow.description = o.description;
			return newRow;
		}),
		status: this.model.stateId.id,
		images: this.model.arrayImages.map((i) => {
			const newRow = {};
			newRow.urlImage = i.urlImage;
			return newRow;
		}),
	};
	try {
		await this.$httpProducts.patch(
			`warranties/${this.idWarranty}/details/${this.idRow}`,
			body
		);
		this.closeModal();
		this.dataSelected = [];
		this.showNotification('Se actualizo la garantia correctamente');
		this.loadInformationWarranty();
	} catch (error) {
		this.showGenericError();
	}
}

async function addProductWarranty() {
	const productId = this.rows.find(
		(p) => p.productId === this.params.product.id
	);
	const existSale = this.rows.find(
		(o) => o.documentId === this.model.documentId
	);
	if (productId && existSale) {
		this.showNewSupplier = true;
	} else {
		const arrayDescription = this.model.problemDescription.map((o) => {
			const row = {};
			row.description = o.description;
			return row;
		});
		this.arrayNew.push({
			productId: this.params.product.id,
			warehouseId: this.params.warehouseId,
			brandId: this.salesProduct.brandId || this.model.brandId,
			quantity: Number(this.model.quantity),
			priceSale: Number(this.model.priceSale),
			documentId: Number(this.model.documentId),
			typeDocument: this.model.typeDocumentName || this.model.documentCode,
			documentNumber: this.model.number || this.model.documentNumber,
			supplierId: this.model.supplierId,
			fullNameSupplier: this.model.supplierName,
			problemDescription: arrayDescription || [],
			status: this.model.stateId.id,
			images: this.model.arrayImages.map((p) => {
				const rowImage = {};
				rowImage.urlImage = p.urlImage;
				return rowImage;
			}),
			brandName: this.model.brandName,
			categoryName: this.model.categoryName,
			categoryId: this.model.categoryId,
		});
		const body = {
			details: this.arrayNew,
		};
		try {
			await this.$httpProducts.post(
				`warranties/${this.idWarranty}/details`,
				body
			);
			this.closeModal();
			this.clearModal();
			this.showNotification('Se agrego el producto correctamente.');
			this.loadInformationWarranty();
		} catch (error) {
			if (error.status === 400) {
				this.arrayNew = [];
			} else {
				this.showGenericError();
			}
		}
	}
}

function setInput({ model, value }) {
	if (value) {
		if (model === 'supplierId') {
			this.model[model] = value.id;
			this.model.fullNameSupplier = value.name;
		} else if (model === 'typeDocument') {
			this.model[model] = value;
			this.model.typeDocumentName = value.documentType.name;
			this.model.typeDocumentId = value.documentType.id;
		} else if (model === 'saleId') {
			this.model[model] = value.documentNumber;
			this.model.priceSale = value.salePrice;
			this.model.infoSale = value;
			this.model.brandId = value.brandId;
			this.model.brandName = value.brandName;
			this.model.categoryName = value.categoryName;
			this.model.categoryId = value.categoryId;
			this.model.warehouseId = value.warWarehousesId;
			this.model.documentCode = value.documentCode;
			this.model.typeDocumentName = value.documentCode;
			this.model.typeDocument = value.documentCode;
			this.model.documentNumber = value.documentNumber;
			this.model.quantitySale = value.quantity;
			this.model.documentId = value.id;
		} else if (model === 'quantity') {
			this.model[model] = value;
			if (value > this.model.quantitySale) {
				this.showModal = true;
				this.textContent = `La cantidad ingresada no puede superar al monto de la cantidad de la venta. Cantidad Venta: ${this.model.quantitySale}`;
			}
		} else {
			this.model[model] = value;
		}
	}
}

function labelModalSidebar() {
	if (this.idWarranty) {
		return 'Cerrar Garantía';
	}
	return 'Guardar Garantia';
}

async function btnModalWarranty() {
	if (this.idWarranty) {
		const body = {
			status: 4,
		};
		await this.$httpProducts.patch(`warranties/${this.idWarranty}`, body);
		this.showNotification('Se cerro la garantía correctamente.');
	} else {
		let body = {};
		if (this.params.warehouseId) {
			body = {
				amount: this.rows.reduce((a, c) => a + c.amountRow, 0),
				startDate: this.$today(),
				totalProducts: this.rows.length,
				warehouseId: this.params.warehouseId,
				customerId: this.params.customerId,
				fullNameCustomer: this.params.fullNameCustomer,
				details: this.rows.map((p) => {
					const newRow = {};
					newRow.total = p.amountTotalRow;
					newRow.productId = p.product.id;
					newRow.fullNameSupplier = p.supplierName;
					newRow.quantity = Number(p.quantity);
					newRow.priceSale = p.priceSale;
					newRow.status = p.statusOperation ? p.statusOperation.id : null;
					newRow.documentId = Number(p.documentId);
					newRow.typeDocument = p.typeDocument;
					newRow.documentNumber = p.number || p.documentNumber;
					newRow.supplierId = p.supplierId;
					newRow.problemDescription = p.problemDescription.map((l) => {
						const row = {};
						row.description = l.description;
						return row;
					});
					newRow.images = p.images.map((l) => {
						const rowImage = {};
						rowImage.urlImage = l.urlImage;
						return rowImage;
					});
					newRow.brandId = p.brandId;
					newRow.brandName = p.brandName;
					newRow.categoryId = p.categoryId;
					newRow.categoryName = p.categoryName;
					return newRow;
				}),
			};
			try {
				await this.$httpProducts.post('warranties', body);
				this.showNotification('Se guardó la garantía correctamente.');
				this.goTo('warranty');
			} catch (error) {
				this.showGenericError();
			}
		} else {
			this.showNotification('Debe seleccionar un almacén', 'warning');
		}
	}
}

function viewDetailRow(row) {
	this.action = {
		open: true,
		code: 'config-product',
		title: row.product.name,
		width: 560,
	};
	this.viewModal = true;
	this.showView = true;
	this.rowsHistory = row.warrantyHistory;
	this.model = {
		quantity: row.quantity,
		priceSale: row.priceSale,
		problemDescription: row.problemDescription,
		supplierId: row.supplierId,
		stateId: row.status,
		arrayImages: row.images,
		stateWarranty: row.status,
		number: row.number,
		saleId: row.documentNumber || row.documentId || row.typeDocument,
		serie: row.serie,
		typeDocument: row.documentId,
	};
}

async function cancelWarranty(row) {
	if (!this.idWarranty) {
		const index = this.rows.findIndex((o) => o.id === row.id);
		if (index > -1) {
			this.rows.splice(index, 1);
		}
	} else {
		this.deleteRowWaranty(row);
	}
}

async function deleteRowWaranty(row) {
	try {
		const body = {
			itemsId: [row.id],
		};
		await this.$httpProducts.patch(
			`warranties/${this.idWarranty}/cancel-item`,
			body
		);
		this.showNotification('Se anulo el producto correctamente.');
		this.loadInformationWarranty();
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'WARRANTY_ALREADY_CLOSED') {
				this.showGenericError(
					'No se puede anular la garantía, ya que la garantía ya fue cerrada.'
				);
			} else {
				this.showGenericError();
			}
		}
	}
}

function editWarranty(row) {
	this.action = {
		open: true,
		code: 'config-product',
		title: row.product.name,
		width: 560,
	};
	this.disabledQuantity = !!this.idWarranty;
	this.rowsHistory = row.warrantyHistory;
	this.viewModal = false;
	this.textSave = 'Actualizar Garantía';
	this.idRow = row.id;
	this.editRow = true;
	this.showView = true;
	this.productId = row.productId;
	this.model = {
		quantity: row.quantity,
		priceSale: row.priceSale,
		problemDescription: row.problemDescription,
		supplierId: row.supplierId,
		stateId: row.status,
		arrayImages: row.images,
		stateWarranty: row.status,
		saleId: row.documentNumber,
		serie: row.serie,
		number: row.number,
		typeDocument: row.typeDocument,
	};
}

function clearModal() {
	this.model = {
		infoSale: {},
		addDocument: null,
		stateWarranty: null,
		stateId: null,
		arrayImages: [],
		quantity: null,
		priceSale: 0,
		number: null,
		saleId: null,
		typeDocumentName: null,
		descriptionId: null,
		description: null,
		problemDescription: [],
		supplierId: null,
		serie: null,
	};
	this.idRow = null;
	this.textSave = '';
}

async function changeAction() {
	let filterArray = [];
	filterArray = this.dataSelected.filter((p) => p.stockWarehouse > 0);
	const body = {
		warehouseId: this.params.warehouseIdDialog,
		details: filterArray.map((o) => {
			const newRow = {};
			newRow.id = o.id;
			newRow.stockReplaced = Number(o.quantityChange);
			return newRow;
		}),
	};
	try {
		await this.$httpProducts.patch(
			`warranties/${this.idWarranty}/stock-replaced`,
			body
		);
		this.showNotification('Se realizo el cambio correctamente.');
		this.dataSelected = [];
		this.closeDialog();
		this.loadInformationWarranty();
	} catch (error) {
		if (error.status === 400) {
			this.showGenericError('Verificar que se envien los datos correctamente.');
		} else {
			this.showGenericError();
		}
	}
}

async function actionGenerateCupon() {
	const body = {
		details: this.dataSelected.map((o) => {
			const newRow = {};
			newRow.id = o.id;
			newRow.stockDispatch = Number(o.quantityChangeCupon);
			return newRow;
		}),
		amount: Number(this.params.amountCupon),
	};
	try {
		await this.$httpProducts.patch(
			`warranties/${this.idWarranty}/stock-discount-coupon`,
			body
		);
		this.showNotification('Se genero el cupòn correctamente.');
		this.dataSelected = [];
		this.closeDialog();
		this.loadInformationWarranty();
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'STOCK_NOT_ENOUGH') {
				this.showNotification(
					'La cantidad agregada supera al stock del producto.',
					'error'
				);
			}
		} else {
			this.showGenericError();
		}
	}
}

function validSale() {
	this.informationSales(true);
}

function selectedAll(value) {
	({
		products: this.rows,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selecteAll(value, this.rows, this.dataSelected));
}

function rowIsSelected({ id, isSelected }) {
	this.checkAll = this.rows.every((row) => row.isSelected);
	if (isSelected) {
		this.dataSelected.push(this.rows.find((row) => row.id === id));
	} else {
		const index = this.dataSelected.findIndex((row) => row.id === id);
		this.dataSelected.splice(index, 1);
	}
}

function actionsDisabled() {
	const disabled =
		this.dataSelected.every((p) => p.status === 3) || this.isVendor;
	const disabledActions = [
		{ code: 'replacement', disabled },
		{ code: 'generate-cupon', disabled },
		{ code: 'return', disabled },
	];
	return disabledActions;
}

function setQuantity(item, value) {
	const indexRow = this.dataSelected.findIndex((p) => p.id === item.id);
	if (indexRow > -1) {
		this.dataSelected[indexRow].quantityChange = Number(value.value);
	}
}

function openMenu() {
	this.showExcelMenu = true;
}

function openMenuGroup() {
	this.showExcelMenuGroup = true;
}

async function downloadDocument({ typeBenefits, typeBenefitsName, number }) {
	const downloadDialog = this.$userInfo.company.settings.downloadSale;
	const body = {
		code: typeBenefitsName.code,
	};
	const responseType = 'blob';
	const contentType = downloadDialog ? 'application/pdf' : 'text/html';
	try {
		const { data: blobData } = await this.$httpProducts.post(
			`warranties/${this.idWarranty}/pdf?typeBenefits=${typeBenefits}&codeBenefits=${number}`,
			body,
			{ responseType }
		);
		const blob = helper.generateBlob(blobData, contentType);
		helper.showDownloadDialog(
			blob,
			typeBenefitsName.name,
			'pdf',
			downloadDialog
		);
	} catch (error) {
		this.showGenericError();
	}
}

async function downloadDocumentGroup({ code, type, name }) {
	const downloadDialog = this.$userInfo.company.settings.downloadSale;
	const body = {
		code,
	};
	const responseType = 'blob';
	const contentType = downloadDialog ? 'application/pdf' : 'text/html';
	try {
		const { data: blobData } = await this.$httpProducts.post(
			`warranties/${this.idWarranty}/pdf?typeBenefits=${type}`,
			body,
			{ responseType }
		);
		const blob = helper.generateBlob(blobData, contentType);
		helper.showDownloadDialog(blob, name, 'pdf', downloadDialog);
	} catch (error) {
		this.showGenericError();
	}
}

async function downloadWarranty() {
	const downloadDialog = this.$userInfo.company.settings.downloadSale;
	const body = {
		code: 'warranty-pdf',
	};
	const responseType = 'blob';
	const contentType = downloadDialog ? 'application/pdf' : 'text/html';
	try {
		const { data: blobData } = await this.$httpProducts.post(
			`warranties/${this.idWarranty}/pdf`,
			body,
			{ responseType }
		);
		const blob = helper.generateBlob(blobData, contentType);
		helper.showDownloadDialog(
			blob,
			'Reporte General de Garantia',
			'pdf',
			downloadDialog
		);
	} catch (error) {
		this.showGenericError();
	}
}

async function returnAction() {
	const body = {
		details: this.dataSelected.map((o) => {
			const newRow = {};
			newRow.id = o.id;
			newRow.stockReturn = Number(o.stockReturn);
			return newRow;
		}),
		warehouseId: this.params.warehouseId,
	};
	try {
		await this.$httpProducts.patch(
			`warranties/${this.idWarranty}/stock-return`,
			body
		);
		this.showNotification('Se generó correctamente la devolución');
		this.dataSelected = [];
		this.closeDialog();
		this.loadInformationWarranty();
	} catch (error) {
		this.showGenericError();
	}
}

function setStockReturn(index, value) {
	if (value) {
		this.dataSelected[index].stockReturn = value.value;
	}
}

function setQuantityCupon(index, item, { value }) {
	this.dataSelected[index].quantityChangeCupon = value;
	this.dataSelected[index].amountRow = Number(value) * item.priceSale;
	this.params.amountCupon = this.dataSelected.reduce(
		(a, c) => a + c.amountRow,
		0
	);
}

function closeDialogModal() {
	this.showModal = false;
}

function data() {
	return {
		arrayNew: [],
		arrayImages: [],
		action: {
			code: '',
			title: '',
			width: 0,
			open: false,
		},
		allowedFiles: ['jpg', 'jpeg', 'png', 'pdf', 'svg'],
		checkAll: false,
		color: null,
		options: [],
		typeBenefitsGruop: [],
		columns: [
			{ id: 1, name: 'Cod', value: 'name', visible: true, checked: true },
			{ id: 2, name: 'Nombre', value: 'unit', visible: true, checked: true },
			{
				id: 3,
				name: 'Proovedor',
				value: 'totalStock',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Tipo Doc',
				value: 'totalCount',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: '# Doc',
				value: 'totalDiff',
				visible: true,
				checked: true,
			},
			{ id: 6, name: 'Descripción', value: '', visible: true, checked: true },
			{ id: 7, name: 'Stock Actual', value: '', visible: true, checked: true },
			{
				id: 8,
				name: 'Procesada',
				tooltip: 'Cantidad Procesada',
				value: '',
				visible: true,
				checked: true,
			},
			{ id: 9, name: 'Cant', value: '', visible: true, checked: true },
			{ id: 10, name: 'PV', value: '', visible: true, checked: true },
			{ id: 11, name: 'Total', value: '', visible: true, checked: true },
			{ id: 12, name: 'Estado', value: '', visible: true, checked: true },
			{ id: 13, name: 'Acciones', value: '', visible: true, checked: true },
		],
		columnsHistory: [
			{ id: 1, name: 'Empleado', value: 'name', visible: true, checked: true },
			{ id: 2, name: 'Fecha', value: 'name', visible: true, checked: true },
			{ id: 3, name: 'Cambio', value: 'name', visible: true, checked: true },
		],
		customers: [],
		dataSelected: [],
		dialgoGenerate: false,
		disabledQuantity: false,
		editRow: false,
		excelLoading: false,
		dialogReturn: false,
		idRow: null,
		idWarranty: null,
		isVendor: false,
		model: {
			brandName: null,
			categoryId: null,
			categoryName: null,
			documentId: null,
			quantitySale: null,
			brandId: null,
			typeDocumentId: null,
			serie: null,
			infoSale: {},
			addDocument: null,
			stateWarranty: null,
			arrayImages: [],
			quantity: null,
			priceSale: null,
			number: null,
			saleId: null,
			typeDocumentName: null,
			descriptionId: null,
			description: null,
			supplierName: null,
			problemDescription: [],
			supplierId: null,
		},
		informationWarranty: {},
		dialogChange: false,
		nameEmployee: null,
		rows: [],
		rowsHistory: [],
		salesProduct: [],
		showExcelMenu: false,
		showExcelMenuGroup: false,
		showNewSupplier: false,
		showView: false,
		textContent: '',
		states: [
			{
				id: 5,
				statusName: 'Recepción',
			},
			{
				id: 6,
				statusName: 'Diagnostico',
			},
			{
				id: 3,
				statusName: 'Terminado',
			},
		],
		subsidiaries: [],
		params: {
			fullNameCustomer: null,
			amountCupon: 0,
			customerId: null,
			subsidiaryId: null,
			warehouseId: null,
			quantityChange: null,
			warehouseIdDialog: null,
		},
		showModal: false,
		textSave: 'Agregar Producto',
		selectedProduct: null,
		searchVal: null,
		viewModal: false,
		warehouses: [],
	};
}

export default {
	name: 'page-new-warranty',
	created,
	data,
	components: {
		actionSidebar,
		appActions,
		appShowDialog,
		appTable,
		configProduct,
		headerPage,
		modalItems,
		modalSidebarButton,
		productsSearchForm,
		productsSearchInput,
	},
	computed: {
		actionsDisabled,
		headerWarranty,
		labelModalSidebar,
		titleWarranty,
	},
	methods: {
		returnAction,
		actionGenerateCupon,
		addProductWarranty,
		btnModalWarranty,
		cancelWarranty,
		changeAction,
		clearModal,
		closeDialog,
		closeModal,
		deleteRowWaranty,
		goBack,
		editRowWarranty,
		editWarranty,
		downloadWarranty,
		downloadDocument,
		downloadDocumentGroup,
		informationSales,
		loadInformationWarehouse,
		loadInformationWarranty,
		loadResources,
		openSearch,
		rowIsSelected,
		runAction,
		saveModalConfig,
		selectedAll,
		setInput,
		setQuantityCupon,
		setStockReturn,
		setParams,
		setProduct,
		closeDialogModal,
		setQuantity,
		openConfigProduct,
		openMenu,
		openMenuGroup,
		validSale,
		validatedWarehouse,
		validatedWarehouseReturn,
		viewDetailRow,
	},
};
</script>

<style lang="scss" scoped>
.page-new-warranty {
	&-header {
		background-color: #ebf5f5;
		padding: 15px 10px 28px 25px;
	}
}

.ft-11 {
	font-size: 11px;
}

.ft-13 {
	font-size: 13px;
}

.title-product {
	border-bottom: 1px solid #d9e8e9;
	color: color(sidebar);
	font-family: map-get($fonts, open-bold);
	font-size: 13px;
}

.process-text {
	border-radius: 12px;
	font-family: font(open-semibold);
	font-size: 13px;
	height: 25px;
	padding-top: 2px;
	text-align: center;
	width: 145px;
}

.content-header {
	border-bottom: 1px solid #c3e7e8;
}

.title-model {
	color: #8f8f8f;
	font-size: 13px;
}

.text-customer {
	font-size: 14px;
	color: color(paginationText);
}

.name-product {
	border-radius: 4px;
	border: solid 0.5px color(primary);
	color: #8f8f8f;
	font-size: 12px;
	padding: 5px 8px;
}

.red-alert {
	border: 1px solid red;
}

.border-radius-red {
	border-radius: 6px;
}

.label {
	margin-bottom: 0 !important;
}

.btn-download-excel {
	@include flex-center;
	background-color: map-get($colors, primary) !important;
	height: 25px;
	min-width: 25px !important;
	margin: 0px;
	position: relative;
	width: 25px !important;

	&:before {
		border-left: 5px solid transparent;
		border-right: 5px solid transparent;
		border-top: 6.5px solid map-get($colors, primary);
		content: '';
		position: absolute;
		bottom: -6.5px;
		z-index: 9;
	}
}

.header-page-download-document {
	@include flex-center;
	height: 25px;
	min-width: 25px;
	margin: 0px;
	position: relative;
}
</style>
