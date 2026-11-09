<template>
	<div>
		<header-page
			to-show
			:show-clean="false"
			:show-excel="false"
			:title="$route.meta.title"
		>
			<header-summary
				class="justify-end"
				:document-name="customer.typePerson.documentName"
				:document-number="customer.typePerson.documentNumber"
				:name="customer.autocomplete"
			/>
		</header-page>
		<v-layout my-3 px-4 wrap justify-start align-center>
			<v-flex xs12 sm6 md4 pr-2>
				<autocomplete-component
					customer
					return-object
					custom-search
					append-icon="search"
					class="custom-autocomplete custom-autocomplete-search"
					http-code="$httpSales"
					id="search-supplier"
					:item="customer"
					item-text="autocomplete"
					item-value="id"
					:items="customers"
					placeholder-value="Cliente"
					resource-url="customers"
					@return-data="setCustomer"
				/>
			</v-flex>
			<v-flex xs12 sm6 md2 pl-2>
				<v-text-field
					hide-details
					readonly
					single-line
					label="Documento de cliente"
					v-model="document"
					class="filter-select shadow-inset"
				></v-text-field>
			</v-flex>
			<v-flex xs12 sm3 md1 pt-1>
				<button
					@click="openSliderModal('NC', 'Nuevo Cliente')"
					class="pl-add-container size"
				>
					<v-icon id="add-icon" color="white">add</v-icon>
				</button>
			</v-flex>
		</v-layout>
		<v-layout wrap align-end px-4>
			<v-flex xs12 sm6 md2 px-2>
				<label class="caption">Tipo de moneda</label>
				<v-select
					bottom
					single-line
					hide-details
					:items="currencies"
					label="Tipo de moneda"
					item-text="code"
					item-value="code"
					class="filter-select"
					content-class="filter-select-content"
					v-model="salesCurrency"
				></v-select>
			</v-flex>
			<v-flex xs2 px-2>
				<app-select
					:disabled="true"
					label="¿Comó quieres recibir tu producto?"
					:item="pickUpSelected"
					item-text="name"
					item-value="id"
					:items="pickUps"
					model="pickUpSelected"
				/>
			</v-flex>
			<v-flex xs3 px-2>
				<app-select
					label="Seleccione una Tienda"
					:item="warehousePickId"
					item-text="name"
					item-value="id"
					:items="warehouses"
					model="warehousePickId"
					@input="setWarehousePick"
				/>
			</v-flex>
			<v-flex xs3 px-2>
				<app-select
					label="Vendedor"
					:item="employeeId"
					item-text="name"
					item-value="id"
					:items="employees"
					model="employeeId"
					@input="setEmployeeId"
				/>
			</v-flex>
		</v-layout>
		<v-layout my-4 wrap justify-start align-center px-4>
			<v-flex xs3>
				<app-select
					:disabled="data && data.length > 0"
					:item="warehouseId"
					item-text="name"
					item-value="id"
					:items="warehouses"
					label="Almacen (Buscar Producto)"
					model="warehouseId"
					return-object
					@input="setWarehouse"
				/>
			</v-flex>
			<v-flex xs12 sm6 md4 ml-2 class="align-col">
				<!-- INPUT PRODUCTO GENERAL -->
				<products-search-input
					ref="productSearcher"
					ref-value="productSearcher"
					id="productSearcher"
					:search-value="selectedProduct"
					@search="openSearch"
				/>
			</v-flex>
			<v-flex xs12 sm6 md2 px-1 class="align-col">
				<label class="caption">Lista de Precios</label>
				<v-select
					autocomplete
					bottom
					single-line
					hide-details
					:disabled="
						!selectedProduct ||
						$userInfo.company.settings.flagPriceListChangeApproval
					"
					item-text="name"
					item-value="id"
					:items="newProduct.product.pricesListArray"
					v-model="newProduct.selectedPriceListId"
					label="Lista de Precios"
					class="filter-select"
					content-class="filter-select-content"
				>
					<template slot="item" slot-scope="data">
						{{ data.item.name }}
						<span v-if="data.item.price"
							>- Precio: {{ salesCurrency }}{{ data.item.price | round }}</span
						>
					</template>
					<template slot="selection" slot-scope="data">
						<p class="mb-0 text-selection">
							{{ data.item.name }}
							<span v-if="data.item.price" class="price-selection">
								{{ salesCurrency }}{{ data.item.price | round }}
							</span>
						</p>
					</template>
				</v-select>
			</v-flex>
			<v-flex xs12 sm5 md2 px-2 class="align-col">
				<v-layout row justify-space-between align-end>
					<v-layout column>
						<v-flex>
							<label class="caption" mr-2>Cantidad:</label>
						</v-flex>
						<v-flex>
							<v-text-field
								single-line
								hide-details
								type="number"
								ref="productQuantity"
								v-model.number="newProduct.quantity"
								label="0"
								class="filter-select shadow-inset"
								content-class="filter-select-content"
								@keypress.enter="addProduct"
							></v-text-field>
						</v-flex>
					</v-layout>
					<button
						:disabled="
							!newProduct.product ||
							!newProduct.quantity ||
							!newProduct.selectedPriceListId
						"
						class="pl-add-container size ml-2"
						:class="{
							opacyble:
								!newProduct.product ||
								!newProduct.quantity ||
								!newProduct.selectedPriceListId,
						}"
						@click="addProduct"
					>
						<v-icon id="add-icon" color="white">add</v-icon>
					</button>
				</v-layout>
			</v-flex>
			<v-flex xs4 pt-2 mb-2>
				<!-- INPUT PRODUCTO PISTOLA DE BARRA -->
				<products-search-input
					ref="productSearcherByGun"
					ref-value="productSearcherByGun"
					id="productSearcherByGun"
					labelSearching="Busqueda por codigo (lector de barras)"
					:clean-input="cleanInput"
					:flagInputEvent="true"
					:search-value="selectedProduct"
					:used-gun="flagUseGun"
					@input="gettingCode"
				/>
			</v-flex>
			<v-flex mt-4 mr-5 text-end>
				<span><b>Total:</b></span>
				<span>{{ defaultCurrency }} {{ priceAmounts.total | round }}</span>
			</v-flex>
		</v-layout>
		<app-table
			class="mb-0"
			name="quotations"
			:columns="columns"
			:current-page="currentPage"
			:rows="data"
			:input-search="false"
			local-storage
			:last-page="lastPage"
			@on-toggle-columns="toogleColumns"
			@on-search-event="callServiceAndSearch"
			@on-page="changePage"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)">{{ props.row.autoBarcode }}</td>
				<td v-show="showRow(columns, 2)">{{ getWarehouseName(props.row) }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.code }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.name }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.description }}</td>
				<td v-show="showRow(columns, 7)">
					<v-text-field
						hide-details
						single-line
						type="number"
						:ref="`quantity${props.index}`"
						v-model.number="props.row.quantity"
						class="filter-select shadow-inset input-max-width"
						@click.stop="stopClick"
						v-on:input="quantityValidation(props.row, $event, props.index)"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 10)">
					<template v-if="flagUpdatePrice">
						<v-text-field
							hide-details
							single-line
							type="number"
							v-model.number="props.row.priceUnitary"
							class="filter-select shadow-inset"
							@click.stop="stopClick"
						></v-text-field>
					</template>
					<template v-else>
						{{ props.row.priceUnitary }}
					</template>
				</td>
				<td v-show="showRow(columns, 11)">
					<template v-if="flagUpdatePrice">
						<v-text-field
							hide-details
							single-line
							type="number"
							v-model.number="props.row.pricePerSale"
							class="filter-select shadow-inset"
							@click.stop="stopClick"
							v-on:change="editPricePerSale(props.row, props.index, $event)"
						></v-text-field>
					</template>
					<template v-else>
						{{ props.row.pricePerSale }}
					</template>
				</td>
				<td v-show="showRow(columns, 12)" @click.stop="stopClick">
					<app-select
						:item="props.row.unitId"
						item-text="code"
						item-value="id"
						:items="props.row.units"
						model="unitId"
						@input="setData('unitId', $event, props.row, true, props.index)"
					/>
				</td>
				<td v-show="showRow(columns, 13)">{{ props.row.stock }}</td>
				<td v-show="showRow(columns, 14)">
					<v-text-field
						hide-details
						single-line
						type="number"
						v-model.number="props.row.discountPercentage"
						class="filter-select shadow-inset input-max-width"
						@click.stop="stopClick"
						@input="editDiscount(props.row, props.index, $event)"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 15)">{{ props.row.taxes }}</td>
				<td v-show="showRow(columns, 16)">
					{{ props.row.total | round | abs }}
				</td>
				<td v-show="showRow(columns, 17)">
					<button class="table-icon" @click.stop="warningModal(props.row)">
						<v-icon color="pink" size="19"> highlight_off </v-icon>
					</button>
				</td>
			</template>
		</app-table>
		<v-layout row wrap px-4 py-1>
			<v-flex xs12 class="totales-section d-flex text-xs-center">
				<v-flex>
					<span>Desc.: </span>
					<span
						>{{ defaultCurrency }}
						{{ priceAmounts.totalDiscount | round }}</span
					>
				</v-flex>
				<v-flex>
					<span>{{ getTaxByCountry($userInfo) }}: </span>
					<span>{{ defaultCurrency }} {{ priceAmounts.tax | round }}</span>
				</v-flex>
				<v-flex class="subtotal-container">
					<div class="subtotal">
						<span>SubT.: </span>
						<span
							>{{ defaultCurrency }} {{ priceAmounts.subtotal | round }}</span
						>
						<button type="button" class="btn-totales" @click="active = !active">
							<v-icon v-if="active" color="info">remove</v-icon>
							<v-icon v-else color="info">add</v-icon>
						</button>
					</div>
					<transition name="fade" mode="out-in">
						<div class="subtotal-menu" v-if="active">
							<div class="subtotal-menu-content">
								<p v-for="(tax, indexTax) in generalTaxes" :key="indexTax">
									<span class="taxes-title">{{ tax.description }}</span>
									<span
										>{{ defaultCurrency }}
										{{ resumeTaxes[tax.code] | round }}</span
									>
								</p>
							</div>
						</div>
					</transition>
				</v-flex>
				<v-flex>
					<span>Total: </span>
					<span>{{ defaultCurrency }} {{ priceAmounts.total | round }}</span>
				</v-flex>
			</v-flex>
		</v-layout>
		<v-layout px-4 mt-5>
			<v-flex xs4 mb-4>
				<v-text-field
					class="textarea-content filter-select shadow-inset"
					type="number"
					label="Código de compañía"
					v-model="extCompanyCode"
				></v-text-field>
			</v-flex>
		</v-layout>
		<v-layout wrap px-4 mt-1>
			<v-flex xs4>
				<v-text-field
					no-resize
					multi-line
					single-line
					class="textarea-content filter-select shadow-inset"
					name="new-product-description"
					label="Comentario"
					v-model="commentary"
				></v-text-field>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer pa-4">
			<v-flex xs12 text-xs-center>
				<v-btn
					type="button"
					class="btn-action mr-2"
					:color="quotationId ? 'error' : 'primary'"
					@click="cancelQuotation"
				>
					{{ cancelBtn }}
					<img
						v-if="quotationId"
						:src="`${$imageUrl}/icon-cancel.svg`"
						alt=""
					/>
				</v-btn>
				<v-btn
					:disabled="
						$v.$invalid ||
						negative ||
						blockedCustomer ||
						invalidValue ||
						zeroQuantity
					"
					type="button"
					class="btn-action"
					color="success"
					:loading="isPending"
					@click="updateOrder"
					>Guardar</v-btn
				>
			</v-flex>
		</section>
		<action-sidebar
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			:help-actions="actionsToHelp"
			:active="action.active"
			@close-modal="closeModal"
		>
			<customers-form
				fast-form
				v-if="customerRegisterSelected"
				:is-loading="loadingCustomer"
				:model-data="customer"
				@cancel="closeModal"
				@save="saveCustomer"
			/>
			<app-comments
				v-if="action.code === 'AD'"
				:data="commentary"
				:new-comments="newComments"
				@comments-event="addComments"
			/>
			<products-search-form
				:selectable="false"
				v-if="isProductSearcher"
				not-valid-negative-stock
				:search-value="searchVal"
				:warehouseId="warehouseId"
				@add-product="setProduct"
				text="Agregar"
			/>
			<section class="modal-filter-footer" v-if="action.code === 'AD'">
				<modal-sidebar-button
					:is-loading="disableButton"
					@cancel-button-clicked="closeModal"
					@accept-button-clicked="saveData"
				/>
			</section>
		</action-sidebar>
		<v-dialog v-model="removeProduct" max-width="500px">
			<v-card>
				<v-card-title>
					<v-layout d-flex justify-center>
						<p class="text-xs-center">
							¿Esta seguro que desea <b>ELIMINAR</b> este producto?:
						</p>
					</v-layout>
				</v-card-title>
				<v-card-text>
					<v-layout d-flex justify-center>
						<h4 class="text-xs-center">Producto:</h4>
						<h3 class="text-xs-center">
							{{ productToRemove.name }} ({{ productToRemove.code }})
						</h3>
					</v-layout>
				</v-card-text>
				<v-card-text>
					<v-layout d-flex justify-center>
						<h2 class="text-xs-center">
							Esta acción eliminará este producto de la cotización y no se podrá
							deshacer
						</h2>
					</v-layout>
				</v-card-text>
				<v-card-actions>
					<v-layout d-flex justify-space-between>
						<v-btn
							type="button"
							@click="removeProduct = false"
							color="pink"
							class="btn-action mr-1"
						>
							Cancelar
							<v-icon color="white" size="16"> highlight_off </v-icon>
						</v-btn>
						<v-btn
							type="button"
							color="success"
							@click="removeItem"
							class="btn-action ml-1"
						>
							Aceptar
							<v-icon color="white" size="16"> check_circle_outline </v-icon>
						</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import customersForm from '@/components/customers/customers-form';
import helper from '@/shared/helper';
import Sales from '@/shared/sale';
import lib from '@/shared/lib';
import productsSearchForm from '@/components/shared/searcher/products-search-form';
import productsSearchInput from '@/components/shared/searcher/products-search-input';
import headerPage from '@/components/shared/header-page';
import headerSummary from '@/components/shared/header-summary';
import generalFilter from '@/components/shared/general-filter';
import appTable from '@/components/shared/table/app-table';
import actionSidebar from '@/components/shared/action-sidebar';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import appComments from '@/components/shared/sales/app-coments';

const Quotation = new Sales();
const {
	compose,
	getDeeper,
	isEmpty,
	round,
	find,
	setNewProperty,
	setNewPropertyByFunction,
	equality,
	updateItemInCollection,
	updateItemInCollectionByIndex,
} = lib;
const round2 = round(2);
const round4 = round(4);
const Sale = new Sales();

function disableButton() {
	let state = false;
	if (this.action.code === 'NC') {
		state = this.customerError;
	}
	return state;
}

function created() {
	this.selectedWarehouse = getDeeper('warWarehousesId')(this.$userInfo);
	this.flagUseGun =
		getDeeper('company', 'flagBarcodeReader')(this.$userInfo) === 1;
	this.columns = this.updateColumns(this.$userInfo, this.columns);
	Quotation.user = this.$userInfo;
	const userCompanyData = this.$userInfo.company;
	const userCompanyKeys = Object.keys(userCompanyData);
	const existFlagUpdatePrice = userCompanyKeys.find(
		(k) => k === 'flagUpdatePrice'
	);
	const flagUpdatePriceUser =
		this.$userInfo.additionalInformation &&
		this.$userInfo.additionalInformation.flagUpdatePrice
			? this.$userInfo.additionalInformation.flagUpdatePrice
			: false;
	const flagUpdatePriceCompany = existFlagUpdatePrice
		? userCompanyData.flagUpdatePrice
		: true;
	this.flagUpdatePrice = flagUpdatePriceUser;
	if (flagUpdatePriceUser) {
		this.flagUpdatePrice = flagUpdatePriceCompany;
	}
	this.show10Percentage =
		this.$userInfo.company.settings.flagTaxesIgvTemporary || false;
	this.generalTaxes = helper.getLocalData('general-taxes') || [];
	this.generalTaxes = this.generalTaxes.map((p) => {
		const newRow = { ...p };
		newRow.idCodeReference = `${p.code}${p.percentage}`;
		newRow.show = true;
		return newRow;
	});
	if (this.show10Percentage) {
		const newIgvTeen = {
			name: 'IGV IMPUESTO GENERAL A LAS VENTAS',
			description: 'IGV IMPUESTO GENERAL A LAS VENTAS - Porcentaje: 10',
			code: '01',
			id: 33,
			flagTypeTaxes: 1,
			isSelected: false,
			value: '01',
			catalogSunatId: 6,
			percentage: 10,
			show: false,
		};
		newIgvTeen.idCodeReference = `${newIgvTeen.code}${newIgvTeen.percentage}`;
		this.generalTaxes.push(newIgvTeen);
	}
	this.warehouseId = this.$userInfo.warWarehousesId;
	this.codeApp = process.env.APP_CODE;
	this.warehousePickId = this.$userInfo.warWarehousesId;
	this.salesCurrency = getDeeper('company', 'currency')(this.$userInfo);
	this.basePrice = getDeeper(
		'company',
		'settings',
		'flagBasePriceDefault'
	)(this.$userInfo);
	Quotation.generalTaxes = this.generalTaxes;
	this.loadData();
}
function updateColumns(user, columns) {
	const taxLabel =
		user.company && user.company.country ? user.company.country.taxName : null;
	return columns.map((c) => {
		const newCol = { ...c };
		if (c.value === 'taxes') {
			newCol.name = `% ${taxLabel}`;
		}
		return newCol;
	});
}
async function loadData() {
	const requests = [
		this.listPricingPromise(),
		this.getCurrencies(),
		this.listOfUnits(),
		this.$httpProducts.get('warehouses'),
		this.$httpSales.get('customers', { params: { flagGeneric: 1 } }),
		this.$httpSales.get('employees'),
	];
	try {
		const responses = await Promise.all(requests);
		[
			{ data: this.pricesList },
			{ data: this.currencies },
			{ data: this.units },
			{ data: this.warehouses },
			{ data: this.customers },
			{ data: this.employees },
		] = responses;
		this.warehouse = this.warehouses.find((p) => p.id === this.warehouseId);
		this.customer = this.customers.find((c) => c.flagGeneric);
		this.employeeId = this.employees.find((e) => e.id === this.$userInfo.id);
	} catch (error) {
		if (error.status === 500) {
			this.showGenericError();
		}
	}
	this.newProduct.selectedPriceListId = Quotation.defaultPriceList.id;
}
function searching(val) {
	return this.searchValue(val, 1);
}
function searchingProducts(val) {
	return this.searchValue(val, 0);
}
async function searchValue(value, flag) {
	const searchTrim = value ? value.trim() : '';
	const autocomplete = flag
		? this.customer.autocomplete.trim()
		: this.newProduct.product.autocomplete.trim();
	const alreadySelected =
		searchTrim.toLowerCase() === autocomplete.toLowerCase();
	if (searchTrim && !alreadySelected) {
		this.loading = true;
		try {
			const service = flag
				? this.customerSelections(searchTrim)
				: this.productsSelections(searchTrim);
			const response = await service;
			const defaultCustomer = {
				autocomplete: '',
				typePerson: {},
			};
			if (flag) {
				this.customers = [...response.data];
				if (this.customers.length === 1) {
					this.customer = this.customers[0];
					this.search = null;
				} else if (this.customers.length > 1) {
					this.customer = this.customers.find(
						(c) =>
							c.autocomplete.trim().toLowerCase() === searchTrim.toLowerCase()
					) || { ...defaultCustomer };
					this.search = null;
				} else {
					this.customer = { ...defaultCustomer };
				}
			} else {
				this.products = response.data.map((prod) => {
					const newProd = { ...prod };
					newProd.autoBarcode = prod.product.autoBarcode;
					newProd.categoryName = prod.product.category.name;
					newProd.code = prod.product.code;
					newProd.description = prod.product.description;
					newProd.name = prod.product.name;
					newProd.priceCost = prod.priceCost || 0;
					newProd.units = prod.product.conversions
						? this.unitsByProduct(prod.product)
						: [{ ...prod.product.unit }];
					newProd.unitConversion = 1;
					newProd.unitId = prod.product.unitId;
					newProd.unitName = prod.product.unit.name;
					newProd.unitQuantity = prod.quantity;
					newProd.warehouseName = prod.warehouse.name;
					newProd.warWarehouseProductBrandId =
						prod.warWarehouseProductBrandId || prod.id;
					return newProd;
				});
			}
		} catch (err) {
			this.showGenericError();
		} finally {
			this.loading = false;
		}
	}
}
function callServiceAndSearch(value) {
	this.searchData = value;
	if (value) {
		this.params.search = value;
	} else {
		this.params.search = null;
	}
	this.currentPage = 1;
}

async function gettingCode(code) {
	if (code.replace(/ /g, '') !== '*') {
		this.cleanInput = false;
		// crear parametro para el servicio
		const params = {
			code,
			warehouseId: this.selectedWarehouse,
			relationAdd: 'productFind,brand,warehouse',
		};

		// lista de precios por defecto
		const defaultList = this.pricesList.find((el) => el.flagDefault === 1);
		this.newProduct.selectedPriceListId = defaultList.id;

		let productCode = code.replace(/ /g, '');
		let weight = 1;

		if (productCode[0] === '*' && productCode.length === 14) {
			productCode = code.replace(/ /g, '').substring(3, 8);
			const weightCode = code.replace(/ /g, '').substring(8, 13);
			weight = `${weightCode.substring(0, 2)}.${weightCode.substring(2, 5)}`;
		}

		// actualizo params
		params.code = productCode;
		params.flagActive = 1;
		params.flagSales = 1;
		const productToInsert = await this.getProduct(params);
		if (productToInsert) {
			const rowExist = this.data.find((p) => p.id === productToInsert.id);
			const indexRow = this.data.findIndex(
				(p) =>
					p.id === productToInsert.id && p.unitId === productToInsert.unitId
			);
			const index = this.data.findIndex(
				(prod) => prod.unitId === productToInsert.unitId
			);
			if (rowExist && index >= 0) {
				if (
					!this.allowOrderStockNegative &&
					this.data[indexRow].unitQuantity === productToInsert.stock
				) {
					this.showNotification(
						`El producto: ${rowExist.name} ya se encuentra agregado con la unidad: ${rowExist.unitName}, ya alcanzó el limite de stock.`,
						'info'
					);
				} else {
					this.showNotification(
						`El producto: ${rowExist.name} ya se encuentra agregado con la unidad: ${rowExist.unitName}, se le aumento la cantidad.`,
						'info'
					);
					this.data[indexRow].quantity = this.data[indexRow].quantity + 1;
					this.data[indexRow].unitQuantity =
						this.data[indexRow].unitQuantity + 1;
					this.data[indexRow].total =
						this.data[indexRow].pricePerSale * this.data[indexRow].quantity;
				}
			} else {
				this.setProduct(productToInsert, 'productSearcherByGun');
				this.newProduct.quantity = weight;
				this.newProduct.showBrand =
					this.$userInfo.company.settings.flagUseSimpleBrand || false;
				const dataTransformed = await Sales.addProductsSale(
					this.newProduct,
					this.generalTaxes,
					this.$userInfo
				);
				dataTransformed.pricePerSaleUnit = dataTransformed.pricePerSale;
				this.data.push(dataTransformed);
				this.newProduct.quantity = 0;
			}
			this.selectedProduct = null;
			this.cleanInput = true;
		} else {
			this.showNotification('Producto no encontrado.', 'info');
		}
	}
}

async function getProduct(par) {
	// Mapeo de productos al venir del servico de busqueda
	const { data: response } = await this.$httpProducts.get('products', {
		params: par,
	});
	return response.map((product) => {
		const newProduct = { ...product };
		const productItem = product.product || product;
		const warehouseName = product.warehouse ? product.warehouse.name : '';
		const { id: subCategoryId, name: subCategoryName } =
			productItem.subCategory || {};
		newProduct.autoBarcode = productItem.autoBarcode;
		newProduct.brandName = productItem.brand ? productItem.brand.name : '';
		newProduct.categoryName = productItem.category
			? productItem.category.name
			: '';
		newProduct.subCategoryName = subCategoryName;
		newProduct.subCategoryId = subCategoryId;
		newProduct.code = productItem.code;
		newProduct.description = productItem.description;
		newProduct.inlineAlternateCode = productItem.inlineAlternateCode;
		newProduct.inlineFeatures = productItem.inlineFeatures;
		newProduct.name = productItem.name;
		newProduct.price = productItem.price;
		newProduct.priceCost = productItem.cost
			? productItem.cost || 0
			: product.priceCost || 0;
		newProduct.unitCode = productItem.unit ? productItem.unit.code : '';
		newProduct.unitConversion = 1;
		newProduct.unitId = productItem.unitId;
		newProduct.unitName = productItem.unit ? productItem.unit.name : '';
		newProduct.unitQuantity = productItem.quantity;
		newProduct.warehouseName = productItem.warehouse
			? productItem.warehouse.name
			: warehouseName;
		newProduct.warWarehouseProductBrandId =
			productItem.warWarehouseProductBrandId || productItem.id;
		newProduct.groupType = productItem.groupType;
		newProduct.type = productItem.type || 1;
		newProduct.location = productItem.location || product.location || null;
		return newProduct;
	})[0];
}

function document() {
	if (this.quotationId && this.customer.typePerson) {
		return this.customer.typePerson.documentNumber;
	}
	let customerDocument = null;
	if (this.customer) {
		customerDocument = this.customer.dni || this.customer.ruc;
	}
	return customerDocument;
}

function setWarehouse({ model, value }) {
	this[model] = value.id;
}

async function addProduct() {
	if (!this.newProduct.quantity) {
		this.showGenericError(
			'Ingresar una cantidad mayor a cero (0) para agregar el producto.'
		);
		return;
	}
	const rowExist = this.data.find((p) => p.id === this.newProduct.product.id);
	const indexRow = this.data.findIndex(
		(p) =>
			p.id === this.newProduct.product.id &&
			p.unitId === this.newProduct.product.unitId
	);
	const index = this.data.findIndex(
		(prod) => prod.unitId === this.newProduct.product.unitId
	);
	if (rowExist && index >= 0) {
		if (
			!this.allowOrderStockNegative &&
			this.data[indexRow].unitQuantity + this.newProduct.quantity >=
				this.newProduct.product.stock
		) {
			this.showNotification(
				`El producto: ${rowExist.name} no cuenta con suficiente stock.`,
				'info'
			);
		} else {
			const plus = this.newProduct.quantity || 1;
			this.showNotification(
				`El producto: ${rowExist.name} ya se encuentra agregado con la unidad: ${rowExist.unitName}, se le aumento la cantidad.`,
				'info'
			);
			this.data[indexRow].quantity = this.data[indexRow].quantity + plus;
			this.data[indexRow].unitQuantity = this.data[indexRow].unitQuantity + 1;
			this.data[indexRow].total =
				this.data[indexRow].pricePerSale * this.data[indexRow].quantity;
		}
	} else {
		const dataTransformed = await Sales.addProducts(
			this.newProduct,
			this.generalTaxes,
			this.$userInfo,
			this.showImportFields,
			true
		);
		dataTransformed.pricePerSaleUnit = dataTransformed.pricePerSale;
		dataTransformed.traceability = { origin: this.$route.name };
		this.data.push(dataTransformed);
	}
	helper.setLocalData('products-selected', this.data);
	this.newProduct.product = {
		autocomplete: '',
		pricesListArray: [...this.pricesList],
	};
	this.newProduct.quantity = 0;
	this.getPriceListId(this.customer);
	this.products = [];
	this.cleanInput = null;
	this.selectedProduct = null;
	setTimeout(() => {
		this.$refs.productSearcher.$el.children[0].children[0].children[0].children[0].children[0].focus();
	}, 300);
}

function changePage(page) {
	this.currentPage = page;
}

function negative() {
	const isNegative = this.data.some(
		(d) => d.quantityNegative || d.priceNegative
	);
	if (isNegative) {
		this.showNotification('No debe haber valores negativos', 'error');
	}
	return isNegative;
}

function quantityValidation(product, quantity, index) {
	this.data = this.data.map(
		compose(
			setNewPropertyByFunction('tax', this.setTaxesAmount, false),
			setNewPropertyByFunction('total', Sales.getTotal, false),
			setNewPropertyByFunction('pricePerSale', Sales.getPricePerSale, false),
			setNewPropertyByFunction('subtotal', this.setSubtotal, false),
			setNewPropertyByFunction('totalDiscount', this.setTotalDiscount, false),
			setNewPropertyByFunction('discount', this.setDiscountAmount, false),
			updateItemInCollection(product, 'productId', 'quantity', quantity)
		)
	);
	const newProduct = { ...product };
	// newProduct.idProductUnit = `${index}${product.id}`;
	// this.data[index].idProductUnit = `${index}${product.id}`;
	this.data = Quotation.quantityValidationQuatation(
		newProduct,
		quantity,
		this.data,
		index
	);
}

function orderPriceAmount() {
	const amounts = Sale.getAmounts(this.data, this.isPeru, 0);
	amounts.subtotal = amounts.total - amounts.tax;
	return amounts;
}

function priceAmounts() {
	return this.orderPriceAmount();
}

function cancelQuotation() {
	this.data = {};
	let urlName = '';
	if (this.isTwoDrivers) {
		urlName = this.$route.query.from;
	} else {
		urlName =
			this.$route.name === 'pending-order-edit' ? 'orders-module' : 'orders';
	}
	this.goTo(urlName);
	helper.removeLocalData('products-selected');
}

function buildBody() {
	const {
		orderStateId,
		warehouseName,
		deliveryAddress,
		deliveryDate,
		deliveryPrice,
		additionalInfo,
		customerAddressId,
		// responsiblePickUp,
	} = this.quotation;
	const objResponsible = {
		dni: this.customer.typePerson
			? this.customer.typePerson.documentNumber
			: null,
		email: this.customer.email,
		fullname: this.customer.typePerson
			? this.customer.typePerson.fullName
			: null,
		lastname: this.customer.lastname || undefined,
		name: this.customer.name || this.customer.rzSocial || undefined,
		phone: this.customer.phone,
	};
	const extCompanyCode = this.extCompanyCode || undefined;
	const employeeId =
		typeof this.employeeId === 'number' ? this.employeeId : this.employeeId.id;
	const additionalInformation = additionalInfo
		? {
				...additionalInfo,
				extCompanyCode,
		  }
		: {
				extCompanyCode,
		  };
	return compose(
		setNewProperty('codeApp', this.codeApp),
		setNewProperty('employeeId', employeeId),
		setNewProperty('currency', this.salesCurrency),
		setNewProperty(
			'customerId',
			this.customerId || (this.customer && this.customer.id)
		),
		setNewProperty('comments', this.commentary),
		setNewProperty('warehouseId', this.warehouseId),
		setNewProperty('warehouseName', this.warehouse.name),
		setNewProperty('warehouseAddress', this.warehouse.address),
		setNewProperty('orderStateId', orderStateId),
		setNewProperty('paymentStateId', 3),
		setNewProperty('typeOrder', 1),
		setNewProperty('originPlatform', 2),
		setNewProperty('wayPaymentDetailCode', 'EFECTIVO'),
		setNewProperty('wayPaymentId', 2),
		setNewProperty('flagPickUp', this.pickUpSelected),
		setNewProperty('deliveryAddress', deliveryAddress),
		setNewProperty('deliveryDate', deliveryDate),
		setNewProperty('deliveryPrice', deliveryPrice),
		setNewProperty('additionalInfo', additionalInformation),
		setNewProperty('responsiblePickUp', objResponsible),
		setNewProperty('customerAddressId', customerAddressId),
		setNewProperty(
			'details',
			this.updateFlagSalesInDetails(this.data, warehouseName)
		)
	)({});
}

function setData(model, value, row, flagUnitChanged, index) {
	const findRow = this.data.some(
		(p) => p.unitId === value.id && p.warProductsId === row.warProductsId
	);
	if (findRow) {
		this.productDuplicateUnit =
			this.data.filter(
				(p) => p.unitId === value.id && p.product.id === row.product.id
			) || [];
	}
	const newRow = Quotation.updateByUnitChangeQuotation(
		model,
		value.value,
		row,
		flagUnitChanged
	);
	if (flagUnitChanged) {
		this.data = updateItemInCollectionByIndex(index, newRow, this.data);
		this.data[index].pricePerSaleUnit = newRow.pricePerSale;
		this.data[index].pricePerSaleOrigin = newRow.pricePerSale;
		return false;
	}
	return newRow;
}

function updateFlagSalesInDetails(products) {
	// MAPEO DE PRODUCTOS PARA DETALLE DE PAYLOAD DE PEDIDOS
	return products.reduce((list, item) => {
		const { taxes } = item.product;
		const percentage = taxes.length ? taxes[0].percentage : 0;
		const subtotalWithoutTax = round4(
			(item.pricePerSale * item.quantity * 100) / (100 + percentage)
		);
		const taxAmount = round4(subtotalWithoutTax * (percentage / 100));

		const newItem = {};
		newItem.additionalInformation = this.getAdditionalInformation(item);
		newItem.alternateCode = item.alternateCode;
		newItem.brandId = item.brandId;
		newItem.brandName =
			item.brandName || item.product.brandName || item.brand.name;
		newItem.categoryId = item.categoryId || item.product.category.id;
		newItem.categoryName = item.categoryName || item.product.category.name;
		newItem.subCategoryId = item.subCategoryId;
		newItem.subCategoryName = item.subCategoryName;
		newItem.codeTaxes = taxes.length ? taxes[0].code : '';
		newItem.description = item.description;
		newItem.discount =
			item.quantity *
				(item.pricePerSaleOrigin * (item.discountPercentage / 100)) || 0;
		newItem.discountPercentage = Number(item.discountPercentage) || 0;
		newItem.productCode = item.code;
		newItem.productId = item.productId;
		newItem.productImage =
			item.productImage || item.urlImage || item.product.urlImage;
		newItem.productName = item.name;
		newItem.quantity = item.quantity;
		newItem.salePrice = item.pricePerSale;
		newItem.stockQuantity = item.stock;
		newItem.unitCode = item.unit
			? item.unit.code
			: item.unitCode || item.product.unitCode;
		newItem.unitConversion = item.unitConversion;
		newItem.unitId = item.unitId;
		newItem.unitName = item.unit
			? item.unit.name
			: item.unitName || item.product.unitName;
		newItem.unitQuantity = item.unitConversion * item.quantity || 1;
		newItem.warehouseId = item.warehouseId;
		newItem.warehouseName = item.warehouseName;
		newItem.productId = item.productId;
		newItem.taxAmount = taxAmount;
		newItem.tax = percentage;
		newItem.subtotalWithoutTax = subtotalWithoutTax;
		newItem.taxes = item.product.taxes.map(this.setFlagSalesBoolean);
		return list.concat(newItem);
	}, []);
}
function setFlagSalesBoolean(tax) {
	const {
		flagSales,
		flagPurchases,
		code,
		codeTable,
		codePercentage,
		percentage,
	} = tax;
	const newFlagSales = flagSales === 1;
	const newFlagPurchases = !!flagPurchases;
	return compose(
		setNewProperty('flagSales', newFlagSales),
		setNewProperty('flagPurchases', newFlagPurchases),
		setNewProperty('code', code),
		setNewProperty('codeTable', codeTable),
		setNewProperty('codePercentage', codePercentage),
		setNewProperty('percentage', percentage)
	)({});
}
async function updateOrder() {
	this.isPending = true;
	const url = 'orders/employee';
	const body = this.buildBody();

	try {
		const response = await this.$httpSales.post(url, body);
		const { id } = response.data;
		this.showNotification('Pedido creadó con éxito');
		this.goTo('page-detail-order', { params: { orderId: id } });
	} catch (error) {
		if (error.data.message) {
			if (error.data.message === 'NO_UPDATE_BECAUSE_ORDER_FINALIZED') {
				this.showGenericError('La orden se encuentra finalizada', 4000);
			}
		} else {
			this.showGenericError();
		}
	} finally {
		this.isPending = false;
	}
}

function warningModal(item) {
	this.productToRemove = item;
	this.removeProduct = true;
}

async function removeItem() {
	const product = this.productToRemove;
	const index = this.data.findIndex((e) => e.id === product.id);
	this.data.splice(index, 1);
	helper.setLocalData('products-selected', this.data);
	if (product.warehouseProductId) {
		try {
			await this.$httpSales.delete(
				`/sale-documents-detail/${product.detailProductId}`
			);
			this.showNotification('Producto eliminado de la cotización');
			this.loadData();
		} catch (error) {
			this.showGenericError();
		}
	}
	this.removeProduct = false;
}
function validations() {
	return {
		customer: {
			required,
		},
		data: {
			required,
		},
	};
}

function cancelBtn() {
	return this.quotationId ? 'Anular' : 'Regresar';
}

function beforeDestroy() {
	helper.setLocalData('products-selected', this.data);
}

function setWarehousePick({ model, value }) {
	this[model] = value.id;
	this.warehouse = value;
}

function saveData() {
	if (this.action.code === 'NC') {
		this.newCustomerRegister = false;
	} else if (this.action.code === 'AD') {
		this.newComments = false;
	}
	this.closeModal();
}

function closeModal() {
	if (this.action.code === 'AD') {
		this.newComments = false;
	} else if (this.action.code === 'product-search') {
		this.searchVal = null;
	}
	this.action = { ...this.actionDefault };
	this.searchVal = null;
}

function openSliderModal(code, title = '', width = 500) {
	this.action = {
		active: true,
		code,
		open: true,
		title,
		width,
	};
	this.newComments = true;
}

function stopClick() {
	return false;
}

function toogleColumns() {
	return true;
}

function addComments(value) {
	this.commentary = value;
}

function salesCurrencySymbol() {
	if (this.currencies.length > 0) {
		return this.currencies.find((c) => c.code === this.salesCurrency).symbol;
	}
	return false;
}

function editDiscount(product, index, value) {
	const isOrder = this.$route.name === 'create-order';
	this.data = Sales.editDiscount(product, value, this.data, index, isOrder);
}

function getTaxByCountry(user) {
	return user.company && user.company.country
		? user.company.country.taxName
		: null;
}

function resumeTaxes() {
	const amounts = this.priceAmounts;
	return Quotation.getTotalTaxesAmounts(amounts, this.data);
}

function getPriceListId(customerId) {
	const listByCustomer = customerId
		? this.newProduct.product.pricesListArray.find(
				(pl) => pl.comCustomersId === customerId
		  ) || {}
		: {};
	const listByEmployee =
		this.newProduct.product.pricesListArray.find(
			(pl) => pl.comEmployeeId === this.$userInfo.id
		) || {};
	const listByWarhouse =
		this.newProduct.product.pricesListArray.find(
			(pl) => pl.warWarehousesId === this.$userInfo.warWarehousesId
		) || {};
	const listDefault = Quotation.defaultPriceList.id;
	const priceListId =
		listByCustomer.id || listByEmployee.id || listByWarhouse.id || listDefault;
	this.setPriceList({ id: priceListId });
}

function setPriceList(list) {
	if (list && list.id) {
		this.newProduct.selectedPriceListId = list.id;
		if (this.data.length > 0) {
			this.changePriceByList(list.id);
		}
	}
}
function changePriceByList(listId) {
	this.data = this.data.map((d) => {
		const newD = { ...d };
		newD.selectedPriceListId = listId;
		return newD;
	});
}

function unitsByProduct(item) {
	if (item.conversions) {
		const keys = Object.keys(item.conversions);
		const newUnits = this.units.reduce((acum, unt) => {
			const index = keys.findIndex((k) => Number(k) === unt.id);
			if (index > -1) {
				acum.push(unt);
			}
			return acum;
		}, []);
		if (item.unit) {
			newUnits.push(item.unit);
		} else {
			const unit = {
				id: item.unitId,
				code: item.unitCode,
				name: item.unitName,
			};
			newUnits.push(unit);
		}
		return newUnits;
	}
	return [];
}

function openSearch(value) {
	this.cleanInput = false;
	this.searchVal = value ? value.trim() : '';
	this.action.code = 'product-searcher';
	this.action.title = 'Productos';
	this.action.width = 789;
	this.action.open = true;
}

function isProductSearcher() {
	return this.action.code === 'product-searcher';
}

function setProduct(prod, ref) {
	// Setear el valor por defecto de cantidad a 1 (despues de buscar un producto)
	this.selectedProduct = prod.name;
	this.newProduct.quantity = 1;
	const newProd = { ...prod };
	newProd.priceBaseToCalculate = this.basePrice;
	newProd.product.taxes = prod.product.taxes.map((tax) => {
		const newRowTax = { ...tax };
		newRowTax.idCodeReference = `${tax.code}${tax.percentage}`;
		return newRowTax;
	});
	newProd.pricesListArray = this.setPricesListByProduct(
		this.pricesList,
		prod.priceList
	);
	newProd.units = prod.product.conversions
		? this.unitsByProduct(prod.product)
		: [{ ...prod.product.unit }];
	newProd.isOrder = true;
	this.newProduct.product = { ...newProd };
	this.cleanProducts = true;
	this.cleanInput = true;
	const defaultListPrice = this.pricesList.find((p) => p.flagDefault === 1);
	const priceListFind = newProd.pricesListArray.find(
		(p) => p.id === this.newProduct.selectedPriceListId
	);
	const validPriceList = priceListFind ? priceListFind.id : null;
	const listDefault =
		Sale.defaultPriceList && Sale.defaultPriceList.id
			? Sale.defaultPriceList.id
			: this.$userInfo.salPriceList.id;
	const priceListId = validPriceList || defaultListPrice.id || listDefault;
	this.setPriceList({ id: priceListId });
	this.closeModal();
	setTimeout(() => {
		const prop = ref || 'productQuantity';
		// ESTA FUNCIÓN HARÁ UN EFOQUE AL INPUT DEL ELEMENTO CON
		// CON SU ATRIBUTO REF CORRESPONDIENTE
		const inputElement = this.$refs[prop].$el.querySelector('input');
		if (inputElement) {
			inputElement.focus();
		}
	}, 300);
	this.cleanInput = true;
	this.searchVal = null;
}

function setPricesListByProduct(pricesList, productPricesList) {
	const pricesListArray = [];
	const ids = Object.keys(productPricesList);
	ids.forEach((plId) => {
		const currentPriceList = find(equality('id', Number(plId)), pricesList);
		if (!isEmpty(currentPriceList)) {
			const priceListObject = {
				id: currentPriceList.id,
				name: currentPriceList.name,
				...productPricesList[plId],
			};
			pricesListArray.push(priceListObject);
		}
	});

	return pricesListArray;
}

function getWarehouseName(row) {
	return getDeeper('warehouseName')(row);
}

function getPrice(product) {
	const { unitPrice, tax } = product;
	const igv = this.$userInfo.company.flagIgv;
	if (igv) {
		return unitPrice * (1 + tax / 100);
	}
	return unitPrice;
}

function customerRegisterSelected() {
	return this.action.code === 'NC';
}

function editPricePerSale(product, index, newPrice) {
	this.data = Sales.editPricePerSale(product, newPrice, this.data, index);
	if (Number(newPrice) < product.priceSaleMin) {
		this.showPriceSale = true;
		this.idRow = product.id;
		this.showMaxProduct = false;
		this.textModal = `Para poder realizar la cotización el precio de venta debe tener como minimo de ${product.priceSaleMin}`;
	}
}

async function saveCustomer(customer) {
	this.loadingCustomer = true;
	const url = 'customers';
	const method = 'post';
	const {
		address,
		civilStatus,
		contact,
		email,
		flagTypePerson,
		gender,
		phone,
		phoneNumbers,
		name,
		lastname,
		dni,
		ruc,
		rzSocial,
	} = customer;
	const body = {
		accountAdvanceAccount: null,
		accountingCode: null,
		address,
		cityId: null,
		civilStatus,
		contact,
		countryId: null,
		creditLimitDays: null,
		customerType: null,
		dateBirth: null,
		email,
		flagAccounting: null,
		flagDetraction: null,
		flagExemptTaxes: null,
		flagItemsWithoutRetainer: null,
		flagPostDatedCredit: null,
		flagRelatedCustomer: null,
		flagRetentionAgent: null,
		flagSpecialContributor: null,
		flagTypePerson,
		gender,
		geoPosition: null,
		latitude: null,
		limitAmountCredit: null,
		longitude: null,
		originIncomeId: null,
		parishId: null,
		paymentMethodId: null,
		phone,
		phoneNumbers,
		postalCode: null,
		provinceId: null,
		typeDestinationId: null,
		zone: null,
	};
	if (customer.ruc) {
		body.rzSocial = rzSocial;
		body.ruc = ruc;
	} else {
		body.name = name;
		body.lastname = lastname;
		body.dni = dni;
	}
	try {
		const { data: response } = await this.$httpSales[method](url, body);
		this.showNotification('El cliente ha sido creado correctamente');
		this.selectThisCustomer(response);
	} catch (err) {
		if (err.data.message === 'CUSTOMER_EXIST_ERROR') {
			this.showNotification('El cliente ya está registrado', 'warning');
		} else {
			this.showGenericError();
		}
	} finally {
		this.loadingCustomer = false;
	}
}

function selectThisCustomer(customer) {
	this.closeModal();
	this.customers = [{ ...customer }];
	this.customer = { ...customer };
	this.search = customer.autocomplete;
}

function blockedCustomer() {
	return this.customer.flagActive === 0;
}

function setCustomer(customer) {
	if (customer) {
		this.customer = { ...customer };
		this.customerId = customer.id;
		this.getPriceListId(customer.id);
		if (customer.flagActive === 0) {
			this.showNotification(
				'El cliente se encuentra bloqueado, no se pude continuar con la venta.',
				'warning'
			);
		}
	}
}

function validateOnInput(val) {
	const valid = /^[0-9]+$/;
	if (!valid.test(val)) {
		this.invalidValue = true;
		this.showGenericError('Debe ingresar un número igual o mayor a cero (0)');
	}
	this.invalidValue = !valid.test(val);
}

function showImportFields() {
	return this.$userInfo.company.settings.flagImport;
}

function setTaxes(item) {
	const { taxes } = item;
	if (!taxes || taxes.length === 0) {
		return [];
	}
	taxes[0].flagSales = taxes[0].flagSales ? 1 : 0;
	const newItem = setNewProperty('product', { taxes })(item);
	return Sales.getTaxesByProduct(this.generalTaxes, newItem);
}

function setTaxesAmount(item) {
	const { total, subtotal } = item;
	return round2(total - subtotal);
}

function setSubtotal(item) {
	const { quantity, discountPercentage, priceUnitary, unitPrice } = item;
	const priceWithDiscount =
		(priceUnitary || unitPrice) * (1 - discountPercentage / 100);
	return round2(priceWithDiscount * quantity);
}

function updateTaxes(item) {
	const { taxes } = item.product;
	if (!taxes) {
		return item;
	}
	const flagSales = taxes[0].flagSales;
	taxes[0].flagSales = flagSales ? 1 : 0;
	return setNewProperty('taxes', taxes)(item.product);
}

function setDiscountAmount(item) {
	return Sales.getDiscountAmount(item, true);
}

function setPricePerSale(item) {
	const { priceUnitary, tax } = item;
	const unitaryDiscount = Sales.getDiscountAmount(item);
	return round2(priceUnitary - unitaryDiscount) * tax;
}

function setTotalDiscount(item) {
	const { discount, quantity } = item;
	return round2(discount * quantity);
}

function data() {
	return {
		action: {
			active: false,
			code: '',
			open: false,
			width: 0,
			title: '',
		},
		isPending: false,
		actionDefault: {
			active: false,
			code: '',
			open: false,
			width: 0,
			title: '',
		},
		active: false,
		codeApp: null,
		columns: [
			{
				id: 1,
				name: '#',
				value: 'autoBarcode',
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
				name: 'Código',
				value: 'code',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Nombre',
				value: 'name',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Descripción',
				value: 'description',
				visible: false,
				checked: false,
			},
			{
				id: 7,
				name: 'Cantidad',
				value: 'quantity',
				visible: true,
				checked: true,
			},
			{
				id: 10,
				name: 'P. Unitario',
				value: 'priceUnitary',
				tooltip: 'Precio Unitarios',
				visible: false,
				checked: false,
				flagVisible: true,
			},
			{
				id: 11,
				name: 'PVP',
				value: 'pricePerSale',
				visible: true,
				checked: true,
			},
			{
				id: 12,
				name: 'Unidad',
				value: 'unitName',
				visible: true,
				checked: true,
			},
			{
				id: 13,
				name: 'Stock',
				value: 'stock',
				visible: true,
				checked: true,
			},
			{
				id: 14,
				name: 'Desc. (%)',
				value: 'discountPercentage',
				visible: true,
				checked: true,
				tooltip: 'Descuento',
				showInput: false,
				isEditable: true,
			},
			{
				id: 15,
				name: '',
				value: 'taxes',
				visible: true,
				checked: true,
			},
			{
				id: 16,
				name: 'Total',
				value: 'total',
				visible: true,
				checked: true,
			},
			{
				id: 17,
				name: 'Acciones',
				visible: true,
				checked: true,
				flagVisible: true,
			},
		],
		cleanInput: false,
		dialogStockRow: false,
		quantityRow: 0,
		titleHeaderDialogRow: '',
		pickUps: [
			{
				id: 2,
				name: 'Recojo en Tienda',
			},
		],
		commentary: '',
		considerations: [],
		currencies: [],
		currency: 'PEN',
		currentPage: 1,
		customer: {
			autocomplete: '',
			typePerson: {},
		},
		customerId: null,
		customers: [],
		customerError: true,
		data: [],
		dataSelected: [],
		dayImportTerm: null,
		defaultCurrency: '',
		defaultPriceList: {},
		documentNumber: '',
		editingOrder: 0,
		extCompanyCode: null,
		flagIgv: 0,
		flagUseGun: false,
		generalTaxes: [],
		invalidValue: false,
		lastPage: 1,
		loading: false,
		loadingCustomer: false,
		model: {},
		employees: [],
		employeeId: null,
		newComments: false,
		newCustomerRegister: false,
		newProduct: {
			product: {
				autocomplete: '',
			},
			quantity: 0,
			selectedPriceListId: 0,
		},
		params: {},
		pickUpSelected: 2,
		pricesList: [],
		products: [],
		productToRemove: {},
		quotation: {},
		quotationId: 0,
		removeProduct: false,
		salesCurrency: '',
		search: null,
		selectedWarehouse: null,
		searchData: '',
		searchProduct: null,
		searchVal: null,
		selectedProduct: '',
		state: null,
		units: [],
		warehouse: {},
		warehouses: [],
		warehouseId: null,
		allowOrderStockNegative:
			this.$userInfo.company.settings.allowOrderStockNegative,
	};
}
export default {
	name: 'create-order',
	beforeDestroy,
	components: {
		actionSidebar,
		appComments,
		appTable,
		autocompleteComponent,
		customersForm,
		generalFilter,
		headerPage,
		headerSummary,
		modalSidebarButton,
		productsSearchForm,
		productsSearchInput,
	},
	computed: {
		blockedCustomer,
		cancelBtn,
		customerRegisterSelected,
		disableButton,
		document,
		isProductSearcher,
		negative,
		priceAmounts,
		resumeTaxes,
		salesCurrencySymbol,
		showImportFields,
		zeroQuantity() {
			const zeroQuantity = this.data.some((d) => d.quantity === 0);
			if (zeroQuantity) {
				this.showGenericError(
					'La cantidad no puede ser cero. Por favor, ingresa una cantidad válida mayor que cero.'
				);
			}
			return zeroQuantity;
		},
	},
	created,
	data,
	methods: {
		addComments,
		addProduct,
		buildBody,
		cancelQuotation,
		callServiceAndSearch,
		changePage,
		changePriceByList,
		closeModal,
		editDiscount,
		getPrice,
		getPriceListId,
		getProduct,
		getTaxByCountry,
		getWarehouseName,
		gettingCode,
		editPricePerSale,
		loadData,
		openSearch,
		openSliderModal,
		quantityValidation,
		removeItem,
		saveCustomer,
		saveData,
		searchValue: helper.debounce(searchValue),
		searching,
		searchingProducts: helper.debounce(searchingProducts),
		selectThisCustomer,
		setCustomer,
		setData,
		setDiscountAmount,
		setFlagSalesBoolean,
		setPriceList,
		setPricesListByProduct,
		setPricePerSale,
		setProduct,
		setTaxes,
		setTaxesAmount,
		setTotalDiscount,
		setSubtotal,
		setWarehousePick,
		setWarehouse,
		stopClick,
		toogleColumns,
		orderPriceAmount,
		unitsByProduct,
		updateColumns,
		updateFlagSalesInDetails,
		updateOrder,
		updateTaxes,
		validateOnInput,
		warningModal,
		setEmployeeId({ model, value }) {
			this[model] = value.id;
		},
		getAdditionalInformation(item) {
			const flagSettlement = this.$userInfo.company.settings.flagSettlement;
			let comissions =
				item.priceList[item.selectedPriceListId] &&
				item.priceList[item.selectedPriceListId].comissions;
			const pList = item.priceList[item.selectedPriceListId];
			if (item.unitId && pList && pList.units && pList.units[item.unitId]) {
				const unitComissions = pList.units[item.unitId].comissions;
				if (!isEmpty(unitComissions) && Object.keys(unitComissions).length > 0) {
					comissions = unitComissions;
				}
			}
			const additionalInformation = {
				salPriceListId: item.selectedPriceListId,
				comissions: flagSettlement ? comissions : undefined,
			};
			if (item.location) {
				additionalInformation.location = item.location;
			}
			return additionalInformation;
		},
	},
	props: {
		id: [Number, String],
	},
	validations,
	watch: {
		search: searching,
		searchProduct: searchingProducts,
	},
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
		white-space: normal;
	}
}

.col-exchange {
	padding-top: 1.5px;
	position: relative;
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
.opacyble {
	opacity: 0.3;
}
.discount {
	border: 2px solid color(grey-border);
	border-radius: 5px !important;
	box-shadow: none !important;
}

.text-selection {
	color: color(paginationText);
	font-size: 12px;
	height: 0 !important;
	padding-left: 9px;
}

.price-selection {
	color: color(background-sidebar);
	font-weight: bold;
}

.section-options {
	background-color: color(summary);
}
.text-end {
	text-align: end;
}
</style>

