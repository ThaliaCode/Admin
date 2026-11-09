<template>
	<div>
		<header-page
			:title="`${$route.meta.title}: ${$route.query.transferNumber}`"
		/>
		<general-filter>
			<v-layout row wrap align-center justify-start>
				<v-flex xs2>Tipo de documento:</v-flex>
				<v-flex xs8>
					<v-radio-group
						row
						v-model="typeDocument"
						class="sale-radio pt-0">
						<v-radio
							v-for="document in typeDocuments"
							:key="document.code"
							:label="document.name"
							:value="document.code"
							color="success">
						</v-radio>
					</v-radio-group>
				</v-flex>
			</v-layout>
		</general-filter>
		<general-filter>
			<v-layout row wrap justify-start>
				<v-flex xs12 sm6 md3 pr-1 class="align-col client">
					<v-select
						bottom
						single-line
						hide-details
						label="Forma de pago"
						:items="paymentMethods"
						item-text="name"
						item-value="id"
						readonly
						v-model="paymentMethod"
						class="filter-select"
						content-class="filter-select-content"
					></v-select>
				</v-flex>
				<v-flex xs12 sm6 md3 px-1 class="align-col client">
					<v-select
						bottom
						single-line
						hide-details
						label="Tipo de pago"
						:items="typePayments"
						item-text="name"
						item-value="id"
						v-model="typePayment"
						class="filter-select"
						content-class="filter-select-content"
					></v-select>
				</v-flex>
			</v-layout>
		</general-filter>
		<general-filter>
			<v-layout row wrap justify-start>
				<v-flex xs12 sm6 md4 pr-1 class="align-col client">
					<v-select
						autocomplete
						bottom
						single-line
						hide-details
						label="Cliente"
						:loading="loading"
						:items="customers"
						item-text="fullName"
						:search-input.sync="search"
						v-model="customer"
						class="filter-select"
						content-class="filter-select-content"
					></v-select>
				</v-flex>
				<v-flex xs12 sm6 md2 px-1 class="align-col">
					<v-text-field
						hide-details
						readonly
						single-line
						label="Documento de cliente"
						v-model="documentCustomer"
						class="filter-select"
					></v-text-field>
				</v-flex>
				<v-flex xs12 sm6 md2 px-1 class="align-col position">
					<v-menu
						lazy
						v-model="menu"
						transition="scale-transition"
						offset-y
						full-width>
						<v-text-field
							slot="activator"
							label="Fecha de inicio"
							v-model="entryDate"
							single-line
							append-icon="event"
							class="filter-select shadow-inset-calendar shadow-inset-calendar-end"
							readonly
						></v-text-field>
						<v-date-picker
							v-model="entryDate"
							no-title
							scrollable
						></v-date-picker>
					</v-menu>
				</v-flex>
				<v-flex v-if="isPeru" xs12 sm6 md2 px-1 mx-2 class="align-col position">
					<v-chip
						label
						color="pink"
						text-color="white"
						class="chip-exchange">
						Cambio Maki: <span>S/.</span>
					</v-chip>
					<v-text-field
						single-line
						hide-details
						label="00.00"
						type="number"
						v-model.number="exchangeRate"
						class="filter-select shadow-inset-chip quotation"
					></v-text-field>
				</v-flex>
			</v-layout>
		</general-filter>
		<general-filter>
			<v-layout row wrap justify-start>
				<v-flex xs12 sm6 md4 pr-1 class="align-col client">
					<v-select
						bottom
						single-line
						hide-details
						label="Lista de precios"
						:items="priceLists"
						item-text="name"
						item-value="id"
						v-model="priceList"
						class="filter-select"
						content-class="filter-select-content"
						@input="onChangeList"
					></v-select>
				</v-flex>
			</v-layout>
		</general-filter>
		<app-table
			name="sale-create"
			selectable
			local-storage
			:input-search="false"
			:columns="columns"
			:rows="productsFiltered"
			:check-all="checkAll"
			:main-list="false"
			key-value="productId"
			@on-toggle-columns="toggleColumns"
			@row-is-selected="rowIsSelected"
			@on-selected-all="selectedAll"
			class="no-main-list mb-0">
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)">{{ props.row.autoBarcode }}</td>
				<td v-show="showRow(columns, 2)">{{ props.row.code }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.name }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.description }}</td>
				<td
					class="py-1"
					v-show="showRow(columns, 5)">
					<v-text-field
						hide-details
						single-line
						type="number"
						v-model.number="props.row.quantity"
						class="filter-select"
						@click.stop="() => false"
					></v-text-field>
				</td>
				<td
					class="py-1"
					v-show="showRow(columns, 6)">
					<v-text-field
						hide-details
						single-line
						type="number"
						v-model.number="props.row.price"
						class="filter-select"
						@click.stop="() => false"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 7)">{{ props.row.stock }}</td>
				<td v-show="showRow(columns, 8)">
					<button
						class="table-icon"
						@click.stop="removeItemConfirm(props.row)">
						<v-icon
							color="pink"
							size="19">
							highlight_off
						</v-icon>
					</button>
				</td>
			</template>
		</app-table>
		<v-layout wrap px-4>
			<v-flex xs6>
				<v-card class="white--text" height="61">
					<v-layout row wrap justify-space-around
						mb-2 class="row-text row-text-title">
						<v-flex xs5 text-xs-center>
							Subtotal
						</v-flex>
						<v-flex xs2 text-xs-center>
							+
						</v-flex>
						<v-flex xs5 text-xs-center>
							IGV
						</v-flex>
					</v-layout>
					<v-layout row wrap justify-space-around
						class="row-text row-text-price">
						<v-flex xs5 text-xs-center>
							{{ priceAmounts.subtotal | round }}
						</v-flex>
						<v-flex xs2></v-flex>
						<v-flex xs5 text-xs-center>
							{{ priceAmounts.tax | round }}
						</v-flex>
					</v-layout>
				</v-card>
			</v-flex>
			<v-flex xs3>
				<v-card class="text-xs-center card-grey" height="61">
					<v-layout column wrap class="row-text">
						<v-flex xs12 text-xs-center mb-2 class="row-text-title">
							-dsct
						</v-flex>
						<v-flex xs12 text-xs-center class="row-text-price">
							{{ priceAmounts.discount | round }}
						</v-flex>
					</v-layout>
				</v-card>
			</v-flex>
			<v-flex xs3>
				<v-card class="text-xs-center card-blue" height="61">
					<v-layout column wrap class="row-text">
						<v-flex xs12 text-xs-center mb-2 class="row-text-title white--text">
							Total
						</v-flex>
						<v-flex xs12 text-xs-center class="row-text-price white--text">
							{{ priceAmounts.total | round }}
						</v-flex>
					</v-layout>
				</v-card>
			</v-flex>
		</v-layout>
		<v-layout d-flex justify-center py-2>
			<v-flex xs10>
				<v-text-field
					no-resize
					multi-line
					single-line
					class="textarea-content filter-select"
					name="new-product-description"
					label="Comentario"
					v-model="commentary"
				></v-text-field>
			</v-flex>
		</v-layout>
		<v-layout row wrap justify-center>
			<v-btn
				class="btn-action mr-2"
				color="error"
				@click="cancelSale">
				Cancelar
				<v-icon
								color="white"
								size="16">
								highlight_off
							</v-icon>
			</v-btn>
			<v-btn
				:disabled="saveDisabled"
				class="btn-action ml-2"
				color="primary"
				@click="createSale">Cobrar</v-btn>
		</v-layout>
		<v-dialog v-model="dialog" persistent
			max-width="470">
			<v-card>
				<v-card-title class="headline">Eliminar producto</v-card-title>
				<v-divider></v-divider>
				<v-card-text>¿Desea eliminar el producto "{{ productName }}" del listado?</v-card-text>
				<v-card-actions>
					<v-layout row wrap justify-center>
						<v-btn
							class="btn-action mr-2"
							color="primary"
							@click.native="closeConfirm">
							Cancelar
							<v-icon
								color="white"
								size="16">
								highlight_off
							</v-icon>
						</v-btn>
						<v-btn
							class="btn-action ml-2"
							color="error"
							@click="removeItem">Eliminar</v-btn>
					</v-layout>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
	import helper from '@/shared/helper';
	import appTable from './../shared/table/app-table';
	import actionSidebar from './../shared/action-sidebar';
	import generalFilter from './../shared/general-filter';
	import headerPage from './../shared/header-page';

	function created() {
		const newDate = new Date();
		this.dateOnline = newDate.getTime().toString();
		if (this.$userInfo) {
			this.flagIgv = this.$userInfo.company.flagIgv || 1;
		}
		this.loadResources();
		this.loadData();
	}

	function cancelSale() {
		this.goTo('list-of-transfers');
	}

	function changePage(page) {
		this.currentPage = page;
	}

	function closeConfirm() {
		this.dialog = false;
		this.productIndex = 0;
		this.productName = '';
	}

	async function createSale() {
		this.isLoading = true;
		const details = this.dataSelected.map((detail) => {
			const newDetail = { ...detail };
			newDetail.detail = {
				brandId: detail.brandId,
				discount: detail.discount,
				price: detail.price,
				productType: detail.type,
				quantity: detail.quantity,
				stockQuantity: detail.stock,
				warProductsId: detail.productId,
				warWarehousesId: this.$route.query.warehouseSourceId,
			};
			return newDetail.detail;
		});
		const typePaymentSelected = this.typePayments.find(tp => tp.id === this.typePayment);
		const creditCardName = this.typePayment > 1 ? typePaymentSelected.name : '';
		const model = {
			amount: this.priceAmounts.total,
			amountCash: this.priceAmounts.total,
			amountCredit: 0,
			change: 0,
			creditCardName,
			commentary: this.commentary,
			currency: 'PEN',
			customerId: this.customer.id,
			discount: this.priceAmounts.discount,
			exchangeRate: this.exchangeRate,
			paymentMethodId: this.paymentMethod,
			subtotal: this.priceAmounts.subtotal,
			taxes: this.priceAmounts.tax,
			detailsPayments: [],
			transactions: [{
				amount: this.priceAmounts.total,
				currency: 'PEN',
				paymentAmount: this.priceAmounts.total,
				paymentDate: new Date(this.entryDate),
				typePaymentId: this.typePayment,
			}],
			flagTransfer: false,
			details,
		};
		model.dateOnline = this.dateOnline;
		try {
			const { data: sale } = await this.$httpSales.post(`sale-documents/${this.typeDocument}/type-document`, model);
			this.showNotification('La venta se realizó correctamente.');
			this.goTo('sale-detail', { params: { saleId: sale.id } });
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			} else if (err.status === 400) {
				if (err.data.message === 'SALE_DUPLICATE_ERROR') {
					this.showGenericError('La venta ya ha sido registrada');
				}
			}
		} finally {
			this.isLoading = false;
		}
	}

	function documentCustomer() {
		if (this.customer.typePerson.documentNumber &&
			this.customer.typePerson.documentNumber.length === 11) {
			this.typeDocumentsSelected = 'FAC';
		} else {
			this.typeDocumentsSelected = 'BOL';
		}
		return this.customer.typePerson.documentNumber;
	}
	
	async function loadData() {
		try {
			({ data: this.products } = await this.$httpProducts.get(`transfers/${this.id}/products`));
			this.products = this.products.map((product) => {
				const newProduct = { ...product };
				newProduct.isSelected = this.checkAll;
				newProduct.discount = product.discount || 0;
				newProduct.price = product.priceList && product.priceList[this.priceList] ?
					product.priceList[this.priceList].price : 0;
				return newProduct;
			});
			this.productsFiltered = [...this.products];
			this.setDataSelected(this.productsFiltered);
		} catch (err) {
			this.showGenericError();
		}
	}

	async function loadResources() {
		const request = [
			this.exchangeByDate(),
			this.getTypeDocuments('sales'),
			this.getTypePayments('sales'),
			this.getPaymentsMethods(),
			this.listPricingPromise(),
		];
		const [exchangeRate, typeDocuments, typePayments, paymentMethods, priceLists] =
			await Promise.all(request);
		this.exchangeRate = exchangeRate.data.amount;
		this.typeDocuments = typeDocuments.data.map(td => td.documentType);
		this.typePayments = typePayments.data.map(tp => tp.paymentType);
		this.paymentMethods = paymentMethods.data;
		this.priceLists = priceLists.data;
		this.priceList = priceLists.data[0].id;
	}

	function onChangeList(id) {
		this.products = this.products.map((product) => {
			const newProduct = { ...product };
			newProduct.price = product.priceList[id].price;
			return newProduct;
		});
		this.productsFiltered = [...this.products];
		this.setDataSelected(this.productsFiltered);
	}

	function priceAmounts() {
		const taxValue = 18 / 100;
		let total = 0;
		let tax = 0;
		let subtotal = 0;
		let discount = 0;
		if (this.productsFiltered.length > 0) {
			subtotal = this.productsFiltered.reduce((acum, currentProduct) =>
				acum + (currentProduct.price * currentProduct.quantity), 0);
			discount = this.productsFiltered.reduce((acum, currentProduct) =>
				acum + (currentProduct.discount * currentProduct.quantity), 0) || 0;
			if (discount > 0) {
				subtotal -= discount;
			}
			if (this.flagIgv === 0) {
				tax = this.roundInNumber((subtotal) * taxValue);
				total = this.roundInNumber(subtotal + tax);
			} else {
				total = this.roundInNumber(subtotal);
				subtotal = this.roundInNumber(total / (1 + taxValue));
				tax = this.roundInNumber(total - subtotal);
			}
		}
		const amounts = {
			subtotal,
			tax,
			discount,
			total,
		};
		return amounts;
	}

	function readyToSale() {
		const selectedProducts = this.productsFiltered.filter(p => p.isSelected);
		return selectedProducts.length > 0 && selectedProducts.every(sp => (sp.quantity > 0)
			&& (sp.price > 0));
	}

	function removeItem() {
		this.products.splice(this.productIndex, 1);
		this.productsFiltered = [...this.products];
		this.setDataSelected(this.productsFiltered);
		this.dialog = false;
	}

	function removeItemConfirm({ productId, name }) {
		this.productIndex = this.products.findIndex(p => p.productId === productId);
		this.productName = name;
		this.dialog = true;
	}

	function rowIsSelected({ productId, isSelected }) {
		this.checkAll = this.productsFiltered.every(check => check.isSelected);
		if (isSelected) {
			this.dataSelected.push(this.productsFiltered.find(row => row.productId === productId));
		} else {
			const index = this.dataSelected.findIndex(row => row.productId === productId);
			this.dataSelected.splice(index, 1);
		}
	}

	function saveDisabled() {
		return !this.readyToSale || this.isLoading;
	}

	function search(val) {
		return this.searchCustomer(val);
	}

	async function searchCustomer(value) {
		const searchTrim = value ? value.trim() : '';
		const customerExist = this.customer && this.customer.fullName ?
			searchTrim.toLowerCase() === this.customer.fullName.toLowerCase() : null;
		if (searchTrim && !customerExist) {
			this.loading = true;
			try {
				const { data: customers } = await this.customerSelections(searchTrim);
				this.customers = customers.map((customer) => {
					const newCustomer = { ...customer };
					newCustomer.fullName
						= `${customer.typePerson.fullName}-${customer.typePerson.documentNumber}`;
					return newCustomer;
				});
			} catch (err) {
				this.showGenericError();
			} finally {
				this.loading = false;
			}
		} else {
			this.loading = false;
		}
	}

	function selectedAll(isSelected) {
		this.checkAll = isSelected;
		this.productsFiltered = this.productsFiltered.map((row) => {
			const newRow = { ...row };
			newRow.isSelected = isSelected;
			return newRow;
		});
		this.dataSelected = isSelected ? [...this.productsFiltered] : [];
	}

	function setDataSelected(values) {
		this.dataSelected = values.filter(val => val.isSelected);
	}

	function toggleColumns() {
		return true;
	}

	function data() {
		return {
			checkAll: true,
			columns: [
				{ id: 1, name: 'Número', value: 'autoBarcode', visible: true, checked: true },
				{ id: 2, name: 'Código', value: 'code', visible: true, checked: true },
				{ id: 3, name: 'Nombre', value: 'name', visible: true, checked: true },
				{ id: 4, name: 'Descripción', value: 'description', visible: true, checked: true },
				{ id: 5, name: 'Cantidad', value: 'quantity', visible: true, checked: true },
				{ id: 6, name: 'Precio', value: 'price', visible: true, checked: true },
				{ id: 7, name: 'Stock', value: 'stock', visible: true, checked: true },
				{ id: 8, name: 'Acciones', visible: true, checked: true, flagVisible: true },
			],
			commentary: '',
			customers: [],
			customer: { typePerson: {} },
			dataSelected: [],
			dateOnline: '',
			dialog: false,
			entryDate: helper.formatDate(new Date(), 'YYYY-MM-DD'),
			exchangeRate: 0,
			flagIgv: 0,
			isLoading: false,
			loading: false,
			menu: false,
			paymentMethods: [],
			paymentMethod: 1,
			priceList: 0,
			priceLists: [],
			productIndex: 0,
			productName: '',
			products: [],
			productsFiltered: [],
			search: '',
			typeDocument: 'BOL',
			typeDocuments: [],
			typePayments: [],
			typePayment: 1,
		};
	}

	export default {
		name: 'sale-create',
		components: {
			actionSidebar,
			appTable,
			generalFilter,
			headerPage,
		},
		computed: {
			documentCustomer,
			priceAmounts,
			readyToSale,
			saveDisabled,
		},
		created,
		data,
		methods: {
			cancelSale,
			changePage,
			closeConfirm,
			createSale,
			loadData,
			loadResources,
			onChangeList,
			removeItem,
			removeItemConfirm,
			rowIsSelected,
			searchCustomer: helper.debounce(searchCustomer),
			selectedAll,
			setDataSelected,
			toggleColumns,
		},
		props: ['id'],
		watch: {
			search,
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
		}
	}

	.quotation {
		left: 4px !important;
		top: 0px !important;
	}

	.position {
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
</style>