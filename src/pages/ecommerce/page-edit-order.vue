<template>
	<div>
		<header-page
			to-show
			:caption-navigation="captionNavigation"
			:show-clean="false"
			:show-excel="false"
			:title="pageTitle"
		>
			<header-summary
				class="justify-end"
				:document-name="customer.typePerson.documentName"
				:document-number="customer.typePerson.documentNumber"
				:name="customer.autocomplete"
			/>
		</header-page>
		<v-layout my-3 px-4 wrap justify-start align-center>
			<v-flex xs12 sm6 md5 pr-2>
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
		<v-layout wrap align-center px-4>
			<v-flex xs12 sm6 md2 pr-2>
				<v-menu
					lazy
					v-model="menu"
					transition="scale-transition"
					offset-y
					full-width
				>
					<v-text-field
						slot="activator"
						label="Fecha de inicio"
						v-model="entryDate"
						single-line
						append-icon="event"
						class="filter-select shadow-inset shadow-inset-calendar shadow-inset-calendar-end"
						readonly
					></v-text-field>
					<v-date-picker
						v-model="entryDate"
						no-title
						scrollable
					></v-date-picker>
				</v-menu>
			</v-flex>
			<v-flex xs12 sm6 md2 px-2>
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
			<v-flex v-if="isPeru" xs12 sm6 md2 px-2 class="col-exchange">
				<v-chip label color="pink" text-color="white" class="chip-exchange">
					Cambio Maki: <span>S/.</span>
				</v-chip>
				<v-text-field
					single-line
					hide-details
					label="00.00"
					type="number"
					v-model.number="exchangeRate"
					@change="validateExchangeRate"
					class="filter-select shadow-inset-chip"
				></v-text-field>
			</v-flex>
			<v-flex xs12 sm6 md2 px-2 v-if="showImportFields">
				<v-text-field
					class="filter-select shadow-inset"
					hide-details
					label="Plazo de entrega"
					single-line
					type="number"
					v-model.number="dayImportTerm"
					@input="validateOnInput"
				></v-text-field>
			</v-flex>
		</v-layout>
		<v-layout my-4 wrap justify-start align-center px-4>
			<v-flex xs12 sm6 md5 pr-2 class="align-col">
				<products-search-input
					:search-value="selectedProduct"
					@search="openSearch"
				/>
			</v-flex>
			<v-flex xs12 sm6 md2 px-1 class="align-col">
				<autocomplete-component
					label-value="Lista de Precios"
					item-text="name"
					item-value="id"
					:items="newProduct.product.pricesListArray"
					:on-clean="onClean"
					:resource-url="'/sal-price-lists'"
					:http-code="'$httpSales'"
					:item="this.newProduct.selectedPriceListId"
					return-object
					@return-data="setPriceList"
				></autocomplete-component>
			</v-flex>
			<v-flex xs12 sm6 md3 px-2 ml-3 pt-4 class="align-col">
				<v-layout row justify-space-between align-center>
					<v-flex>
						<span mr-2>Cantidad:</span>
					</v-flex>
					<v-flex mx-2>
						<v-text-field
							single-line
							hide-details
							type="number"
							v-model.number="newProduct.quantity"
							label="0"
							class="filter-select shadow-inset"
							content-class="filter-select-content"
							@keypress.enter="addProduct"
						></v-text-field>
					</v-flex>
					<button
						:disabled="
							!newProduct.product ||
							!newProduct.quantity ||
							!newProduct.selectedPriceListId
						"
						class="pl-add-container size"
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
			<v-flex mt-4 ml-3>
				<span><b>Total: </b></span>
				<span>{{ defaultCurrency }} {{ priceAmounts.total | round }}</span>
			</v-flex>
		</v-layout>
		<app-table
			class="mb-0"
			name="quotations"
			:columns="columns"
			:current-page="currentPage"
			:rows="data"
			local-storage
			include-filter
			selectable
			:check-all="checkAll"
			:last-page="lastPage"
			@on-toggle-columns="toogleColumns"
			@on-search-event="callServiceAndSearch"
			@on-page="changePage"
			@row-is-selected="rowIsSelected"
			@on-selected-all="selectedAll"
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
						:value="props.row.quantity"
						class="filter-select shadow-inset input-max-width"
						@click.stop="stopClick"
						@input="quantityValidation(props.row, $event)"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 10)">
					<v-text-field
						readonly
						hide-details
						single-line
						type="number"
						v-model.number="props.row.priceUnitary"
						class="filter-select shadow-inset"
						@click.stop="stopClick"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 11)">
					<v-text-field
						readonly
						hide-details
						single-line
						type="number"
						v-model.number="props.row.pricePerSale"
						class="filter-select shadow-inset"
						@click.stop="stopClick"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 12)" @click.stop="stopClick">
					<app-select
						readonly
						:item="props.row.unitId"
						item-text="code"
						item-value="id"
						:items="props.row.units"
						model="unitId"
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
						@input="editDiscount(props.row, $event)"
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
		<v-layout row py-2 pl-4>
			<v-flex xs5 d-flex align-center>
				<v-btn flat @click="openSliderModal('AD', 'Observaciones')">
					<span>Observaciones</span>
				</v-btn>
			</v-flex>
		</v-layout>
		<v-layout>
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
					:disabled="$v.$invalid || negative || blockedCustomer || invalidValue"
					type="button"
					class="btn-action"
					color="success"
					@click="updateOrder"
					>Guardar</v-btn
				>
			</v-flex>
		</v-layout>
		<action-sidebar
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			:help-actions="actionsToHelp"
			:active="action.active"
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
				v-if="isProductSearcher"
				:search-value="searchVal"
				@add-product="setProduct"
			/>
			<section class="modal-filter-footer" v-if="!customerRegisterSelected">
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
import lib from '@/shared/lib';
import Sales from '@/shared/sale';
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
	createPropertyByOtherOne,
	getDeeper,
	round,
	setNewProperty,
	setNewPropertyByFunction,
	updateItemInCollection,
} = lib;
const round2 = round(2);

function disableButton() {
	let state = false;
	if (this.action.code === 'NC') {
		state = this.customerError;
	}
	return state;
}

function created() {
	this.entryDate = helper.formatDate(new Date(), 'YYYY-MM-DD');
	this.columns = this.updateColumns(this.$userInfo, this.columns);
	this.generalTaxes = helper.getLocalData('general-taxes') || [];
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
		this.exchangeByDate(),
		this.getCurrencies(),
		this.listOfUnits(),
	];
	if (this.id) {
		requests.push(this.$httpSales.get(`orders/${this.id}`));
	}
	try {
		const responses = await Promise.all(requests);
		[
			{ data: this.pricesList },
			{ data: this.exchangeRate },
			{ data: this.currencies },
			{ data: this.units },
			{ data: this.quotation },
		] = responses;
		this.exchangeRate = this.exchangeRate.amount;
		this.setOrderData(this.quotation);
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

async function addProduct() {
	const index = this.data.findIndex(
		(prod) => prod.id === this.newProduct.product.id
	);
	if (index < 0) {
		const dataTransformed = await Sales.addProducts(
			this.newProduct,
			this.generalTaxes,
			this.$userInfo,
			this.showImportFields,
			true
		);
		dataTransformed.traceability = { origin: this.$route.name };
		this.data.push(dataTransformed);
	} else {
		this.showNotification('El producto ya ha sido agregado.', 'info');
	}
	helper.setLocalData('products-selected', this.data);
	this.newProduct.product = {
		autocomplete: '',
		pricesListArray: [...this.pricesList],
	};
	this.newProduct.quantity = 0;
	this.getPriceListId(this.customer);
	this.products = [];
	this.selectedProduct = '';
}

function changePage(page) {
	this.currentPage = page;
}

function rowIsSelected(row) {
	({
		products: this.data,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selectedRows(row, this.data, this.dataSelected));
}

function selectedAll(value) {
	({
		products: this.data,
		productsSelected: this.dataSelected,
		checkAll: this.checkAll,
	} = this.selecteAll(value, this.data, this.dataSelected));
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

function quantityValidation(product, quantity) {
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
}

function priceAmounts() {
	return this.data.reduce((obj, item) => {
		const { totalDiscount, subtotal, total, tax } = item;
		const newObj = { ...obj };
		newObj.totalDiscount = (obj.totalDiscount || 0) + totalDiscount;
		newObj.subtotal = (obj.subtotal || 0) + subtotal;
		newObj.total = (obj.total || 0) + total;
		newObj.tax = (obj.tax || 0) + tax;
		return newObj;
	}, {});
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
		warehouseId,
		warehouseName,
		warehouseAddress,
		deliveryAddress,
		deliveryDate,
		deliveryPrice,
		paymentStateId,
		additionalInfo,
		customerAddressId,
		responsiblePickUp,
	} = this.quotation;
	return compose(
		setNewProperty('comments', this.commentary),
		setNewProperty('orderStateId', orderStateId),
		setNewProperty('flagPickUp', this.pickUpSelected),
		setNewProperty('warehouseId', warehouseId),
		setNewProperty('warehouseName', warehouseName),
		setNewProperty('warehouseAddress', warehouseAddress),
		setNewProperty('deliveryAddress', deliveryAddress),
		setNewProperty('deliveryDate', deliveryDate),
		setNewProperty('deliveryPrice', deliveryPrice),
		setNewProperty('paymentStateId', paymentStateId),
		setNewProperty('comments', this.commentary),
		setNewProperty('additionalInfo', additionalInfo),
		setNewProperty('responsiblePickUp', responsiblePickUp),
		setNewProperty('customerAddressId', customerAddressId),
		setNewProperty(
			'details',
			this.updateFlagSalesInDetails(this.data, warehouseName)
		)
	)({});
}

function updateFlagSalesInDetails(products, warehouseName) {
	return products.reduce((list, item) => {
		const { taxes } = item.product;
		const newItem = {};
		newItem.alternateCode = item.alternateCode;
		newItem.brandId = item.brandId;
		newItem.brandName =
			item.brandName || item.product.brandName || item.brand.name;
		newItem.categoryId = item.categoryId || item.product.category.id;
		newItem.categoryName = item.categoryName || item.product.category.name;
		newItem.codeTaxes = taxes.length ? taxes[0].code : '';
		newItem.description = item.description;
		newItem.discount = item.discount || 0;
		newItem.discountPercentage = item.discountPercentage || 0;
		newItem.product = item.product;
		newItem.productCode = item.code;
		newItem.productId = item.productId;
		newItem.productImage =
			item.productImage || item.urlImage || item.product.urlImage;
		newItem.productName = item.name;
		newItem.quantity = item.quantity;
		newItem.salePrice = item.pricePerSale;
		newItem.stockQuantity = item.stock;
		newItem.unit =
			item.unit ||
			item.units.find(
				(u) => u.code === (item.unitCode || item.product.unitCode)
			);
		newItem.unitCode = item.unit
			? item.unit.code
			: item.unitCode || item.product.unitCode;
		newItem.unitConversion = item.unitConversion;
		newItem.unitId = item.unitId;
		newItem.unitName = item.unit
			? item.unit.name
			: item.unitName || item.product.unitName;
		newItem.unitQuantity = item.quantity;
		newItem.warehouseId = item.warehouseId;
		newItem.warehouseName = warehouseName;
		newItem.productId = item.productId;
		newItem.taxes = item.product.taxes.map(this.setFlagSalesBoolean);
		return list.concat(newItem);
	}, []);
}
function setFlagSalesBoolean(tax) {
	const { flagSales, flagPurchases, code, codeTable, codePercentage } = tax;
	const newFlagSales = flagSales === 1;
	const newFlagPurchases = !!flagPurchases;
	return compose(
		setNewProperty('flagSales', newFlagSales),
		setNewProperty('flagPurchases', newFlagPurchases),
		setNewProperty('code', code),
		setNewProperty('codeTable', codeTable),
		setNewProperty('codePercentage', codePercentage)
	)({});
}
async function updateOrder() {
	const validateZero = this.data.some(
		(d) => d.quantity === 0 || d.quantity === '0'
	);
	if (validateZero) {
		this.showGenericError(
			'No se puede realizar un pedido, si la cantidad de los productos estan en 0'
		);
		return;
	}
	const url = `orders/${this.id}`;
	const body = this.buildBody();
	try {
		await this.$httpSales.patch(url, body);
		this.showNotification(`Pedido número ${this.id} actualizado con éxito`);
		const urlName =
			this.$route.name === 'pending-order-edit' ? 'orders-module' : 'orders';
		this.goTo(urlName);
	} catch (error) {
		if (error.data.message) {
			if (error.data.message === 'NO_UPDATE_BECAUSE_ORDER_FINALIZED') {
				this.showGenericError('La orden se encuentra finalizada', 4000);
			}
		} else {
			this.showGenericError();
		}
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
		entryDate: {
			type: required,
		},
		exchangeRate: {
			type: required,
		},
	};
}

function cancelBtn() {
	return this.quotationId ? 'Anular' : 'Regresar';
}

function beforeDestroy() {
	helper.setLocalData('products-selected', this.data);
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

function salesCurrency(newValue, oldValue) {
	const conversion =
		oldValue === 'PEN' ? 1 / this.exchangeRate : this.exchangeRate;
	this.data = this.data.map((d) => {
		const newD = { ...d };
		newD.price *= conversion;
		return newD;
	});
}

function validateExchangeRate(value) {
	let newValue = Number(value);
	if (newValue < 1) {
		newValue = 1;
	}
	this.exchangeRate = newValue;
}

function editDiscount(product, value) {
	this.data = this.data.map(
		compose(
			setNewPropertyByFunction('tax', this.setTaxesAmount, false),
			setNewPropertyByFunction('total', Sales.getTotal, false),
			setNewPropertyByFunction('subtotal', this.setSubtotal, false),
			setNewPropertyByFunction('totalDiscount', this.setTotalDiscount, false),
			setNewPropertyByFunction('pricePerSale', Sales.getPricePerSale, false),
			setNewPropertyByFunction('discount', this.setDiscountAmount, false),
			updateItemInCollection(product, 'productId', 'discountPercentage', value)
		)
	);
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
	this.searchVal = value ? value.trim() : '';
	this.action.code = 'product-searcher';
	this.action.title = 'Productos';
	this.action.width = 739;
	this.action.open = true;
}

function isProductSearcher() {
	return this.action.code === 'product-searcher';
}

function setProduct(prod) {
	const newProd = { ...prod };
	newProd.units = prod.product.conversions
		? this.unitsByProduct(prod.product)
		: [{ ...prod.product.unit }];
	this.newProduct.product = { ...newProd };
	this.selectedProduct = newProd.autocomplete;
	this.closeModal();
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

function setOrderData(order) {
	const { comments, currency, customer, details, flagPickUp } = order;
	this.pickUpSelected = flagPickUp;
	this.salesCurrency = currency;
	this.commentary = comments;
	this.selectThisCustomer(customer);
	this.data = details.map(
		compose(
			setNewPropertyByFunction('totalDiscount', this.setTotalDiscount, false),
			setNewPropertyByFunction('product', this.updateTaxes, false),
			setNewProperty('units', [...this.units]),
			createPropertyByOtherOne('name', 'productName'),
			setNewPropertyByFunction('tax', this.setTaxesAmount, false),
			setNewPropertyByFunction('subtotal', this.setSubtotal, false),
			createPropertyByOtherOne('priceUnitary', 'unitPrice'),
			setNewPropertyByFunction('taxes', this.setTaxes, false),
			createPropertyByOtherOne('pricePerSale', 'salePrice'),
			createPropertyByOtherOne('code', 'productCode')
		)
	);
}

function setDiscountAmount(item) {
	return Sales.getDiscountAmount(item);
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

function pageTitle() {
	const { meta, params } = this.$route;
	const { number } = params;
	const { title } = meta;
	return `${title} - ${number}`;
}

function captionNavigation() {
	return this.$route.name === 'pending-order-edit'
		? 'Editando pedidos pendientes de entrega'
		: 'Editando pedidos de ecommerce';
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
		actionDefault: {
			active: false,
			code: '',
			open: false,
			width: 0,
			title: '',
		},
		active: false,
		checkAll: false,
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
				visible: true,
				checked: true,
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
		commentary: '',
		considerations: [],
		currencies: [],
		currency: 'PEN',
		currentPage: 1,
		customer: {
			autocomplete: '',
			typePerson: {},
		},
		customers: [],
		customerError: true,
		data: [],
		dataSelected: [],
		dayImportTerm: null,
		defaultCurrency: '',
		defaultPriceList: {},
		documentNumber: '',
		editingOrder: 0,
		entryDate: '',
		errColor: 'error',
		exchangeRate: 0,
		flagIgv: 0,
		generalTaxes: [],
		invalidValue: false,
		lastPage: 1,
		loading: false,
		loadingCustomer: false,
		menu: false,
		model: {},
		newComments: false,
		newConsideration: false,
		newCustomer: {},
		newCustomerRegister: false,
		newIssue: false,
		newProduct: {
			product: {
				autocomplete: '',
			},
			quantity: 0,
			selectedPriceListId: 0,
		},
		onClean: false,
		params: {},
		pickUpSelected: 2,
		pricesList: [],
		products: [],
		productToRemove: {},
		quotation: {},
		quotationId: 0,
		removeProduct: false,
		salTypeDocumentId: 0,
		salesCurrency: '',
		search: null,
		searchData: '',
		searchProduct: null,
		searchVal: null,
		selectedProduct: '',
		state: null,
		status: [],
		units: [],
		workToDo: [],
	};
}
export default {
	name: 'page-edit-order',
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
		captionNavigation,
		customerRegisterSelected,
		disableButton,
		document,
		isProductSearcher,
		negative,
		pageTitle,
		priceAmounts,
		resumeTaxes,
		salesCurrencySymbol,
		showImportFields,
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
		getTaxByCountry,
		getWarehouseName,
		loadData,
		openSearch,
		openSliderModal,
		quantityValidation,
		removeItem,
		rowIsSelected,
		saveCustomer,
		saveData,
		searchValue: helper.debounce(searchValue),
		searching,
		searchingProducts: helper.debounce(searchingProducts),
		selectedAll,
		selectThisCustomer,
		setCustomer,
		setDiscountAmount,
		setFlagSalesBoolean,
		setOrderData,
		setPriceList,
		setPricePerSale,
		setProduct,
		setTaxes,
		setTaxesAmount,
		setTotalDiscount,
		setSubtotal,
		stopClick,
		toogleColumns,
		unitsByProduct,
		updateColumns,
		updateFlagSalesInDetails,
		updateOrder,
		updateTaxes,
		validateExchangeRate,
		validateOnInput,
		warningModal,
	},
	props: {
		id: [Number, String],
	},
	validations,
	watch: {
		search: searching,
		searchProduct: searchingProducts,
		salesCurrency,
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
</style>
