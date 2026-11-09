<template>
	<div>
		<header-page
			:columns="columns"
			export-to-pdf
			name="dispatch-detail"
			:rows="dataSelected"
			:show-clean="false"
			:title="$route.meta.title"
			to-show
			v-on:download-dispatch="downloadSale" />
		<v-layout row wrap align-center mt-2 px-5>
			<v-flex xs3>
				<h3>#{{ sale.typeDocument.name }} {{ sale.serie }}-{{ sale.number }}</h3>
			</v-flex>
			<v-flex xs6>
				<h5>Vendedor: {{ sale.employee.name }} {{ sale.employee.lastname }}</h5>
			</v-flex>
		</v-layout>
		<v-layout row wrap mt-2>
			<v-flex xs12>
				<v-divider></v-divider>
			</v-flex>
		</v-layout>
		<v-layout row wrap align-center mt-2 px-5>
			<v-flex xs6>
				<v-layout row wrap>
					<v-flex xs6>
						<h5>Cliente:</h5>
						<h5>{{ sale.customerData.name }}</h5>
					</v-flex>
					<v-flex xs6>
						<h5>Modo de pago:</h5>
						<h5>{{ sale.payment.name }}</h5>
					</v-flex>
				</v-layout>
				<v-layout row wrap>
					<v-flex xs6>
						<h5>DNI/RUC:</h5>
						<h5>{{ sale.customerData.document }}</h5>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-tabs
			v-model="active"
			color="transparent"
			slider-color="blue"
			class="px-5 pt-4">
			<v-tab
				v-for="tab in tabs"
				:key="tab.id"
				ripple>
				{{ tab.title }}
			</v-tab>
			<v-tab-item
				v-for="tab in tabs"
				:key="tab.id">
				<div v-if="Number(active) === 0">
					<div class="overflow-auto pb-0">
						<app-table
							name="dispatch-detail"
							:columns="columns"
							dispatch-detail
							:rows="sale.details"
							:key-value="keyValue"
							:input-search="false"
							local-storage
							:selectable="saleForDelivering"
							:check-all="checkAll"
							:main-list="false"
							@on-toggle-columns="toggleColumns"
							v-on:row-is-selected="rowIsSelected"
							v-on:on-selected-all="selectedAll"
							:class="{ 'is-not-selectable' : isNotSelectable }">
							<template slot="rows" slot-scope="props">
								<td
									:class="{ 'is-not-selectable' : isNotSelectable }"
									v-show="showRow(columns, 1)">{{ props.row.model }}</td>
								<td v-show="showRow(columns, 2)">{{ props.row.code }}</td>
								<td v-show="showRow(columns, 3)">{{ props.row.autoBarcode }}</td>
								<td v-show="showRow(columns, 4)">{{ props.row.name }}</td>
								<td v-show="showRow(columns, 5)">{{ props.row.inlineFeatures }}</td>
								<td v-show="showRow(columns, 6)">{{ props.row.description }}</td>
								<td v-show="showRow(columns, 7)">{{ props.row.location }}</td>
								<td v-show="showRow(columns, 8)">{{ props.row.brandName }}</td>
								<td v-show="showRow(columns, 9)">{{ props.row.quantity }}</td>
								<td v-show="showRow(columns, 10)">{{ props.row.price | round }}</td>
								<td v-show="showRow(columns, 11)">{{ props.row.discount | round }}</td>
								<td v-show="showRow(columns, 12)">{{ props.row.stockQuantity }}</td>
								<td v-show="showRow(columns, 13)">{{ props.row.weigth }}</td>
								<td v-show="showRow(columns, 14)">{{ props.row.subTotal }}</td>
							</template>
						</app-table>
					</div>
					<v-layout row wrap mb-5>
						<v-flex xs6>
							<v-card class="white--text card-grey" height="61">
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
							<v-card class="text-xs-center card-pink" height="61">
								<v-layout column wrap class="row-text">
									<v-flex xs12 text-xs-center mb-2 class="row-text-title white--text">
										-dsct
									</v-flex>
									<v-flex xs12 text-xs-center class="row-text-price white--text">
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
				</div>
				<div v-else>
					<v-layout row wrap mb-5 v-if="dataSelected.length > 0">
						<v-flex xs6 pr-2>
							<v-layout row wrap>
								<v-flex xs12>
									<label class="dispatch-form-label">
										Datos del conductor
									</label>
								</v-flex>
								<v-flex xs12 mt-2>
									<v-text-field
										label="Nombre del conductor"
										v-model="form.driverName"
										hide-details
										class="filter-select"
									></v-text-field>
									<span class="form-group__message" v-if="!form.driverName">
										La descripción del producto es requerida
									</span>
								</v-flex>
								<v-flex xs12 mt-3>
									<v-text-field
										label="Licencia"
										v-model="form.driverLicense"
										hide-details
										class="filter-select"
									></v-text-field>
								</v-flex>
								<v-flex xs12 mt-3>
									<v-text-field
										label="Celular"
										v-model="form.driverCelphone"
										hide-details
										class="filter-select"
									></v-text-field>
								</v-flex>
								<v-flex xs12 mt-3>
									<v-text-field
										label="# Placa"
										v-model="form.driverLicensePlate"
										hide-details
										class="filter-select"
									></v-text-field>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs6 pl-2>
							<v-layout row wrap>
								<v-flex xs12>
									<label class="dispatch-form-label">
										Datos de la ruta
									</label>
								</v-flex>
								<v-flex xs12 mt-2>
									<v-text-field
										label="Dirección de destino"
										v-model="form.destination"
										hide-details
										class="filter-select"
									></v-text-field>
								</v-flex>
								<v-flex xs12 mt-3>
									<v-text-field
										label="Observaciones"
										v-model="form.observation"
										hide-details
										textarea
										no-resize
										class="filter-select textarea-content"
									></v-text-field>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
					<v-layout row wrap
						v-else-if="dataSelected.length === 0
							&& saleForDelivering"
						my-5 px-3>
						Debe seleccionar los productos que desea despachar para poder generar la guía.
					</v-layout>
					<v-layout row wrap v-else my-5 px-3>
						Todos los productos de esta venta ya fueron despachados.
					</v-layout>
				</div>
			</v-tab-item>
		</v-tabs>
		<v-layout row wrap>
			<v-flex xs12 text-xs-center>
				<v-btn
					type="button"
					color="info"
					class="btn-action"
					v-on:click="backToDispatch">
					Volver
				</v-btn>
				<v-btn
					v-if="saleForDelivering && Number(active) === 0"
					type="button"
					color="success"
					class="btn-action"
					v-on:click="goToGuide"
					:disabled="dataSelected.length === 0">
					Despachar
				</v-btn>
				<v-btn
					v-if="saleForDelivering
						&& Number(active) === 1
						&& dataSelected.length > 0"
					type="button"
					color="success"
					class="btn-action"
					:disabled="!form.driverName"
					v-on:click="generateGuide">
					Generar Guía
				</v-btn>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
	import helper from '@/shared/helper';
	import appTable from './../shared/table/app-table';
	import headerPage from './../shared/header-page';

	function created() {
		this.loadData();
	}

	function allIsSelected(row) {
		this.checkAll = this.sale.details.every(check => check.isSelected);
		if (row.isSelected) {
			this.dataSelected.push(row);
		} else {
			const index = this.dataSelected.findIndex(el => el.id === row.id);
			this.dataSelected.splice(index, 1);
		}
	}

	function backToDispatch() {
		this.goTo('products-dispatch');
	}

	async function downloadSale() {
		try {
			const downloadDialog = this.$userInfo.company.settings.downloadSale;
			const model = { code: 'pdf' };
			const responseType = 'blob';
			const contentType = downloadDialog ? 'application/pdf' : 'text/html';
			const response = await this.$httpReportSales.post(`sale-documents/${this.id}/pdf`, model, { responseType });
			const blob = helper.generateBlob(response.data, contentType);
			helper.showDownloadDialog(blob, `${this.sale.serie}-${this.sale.number}`, downloadDialog);
		} catch (error) {
			this.showGenericError();
		}
	}

	async function generateGuide() {
		this.form.salSaleDocumentsId = this.sale.id;
		this.form.number = this.sale.number;
		this.form.transportData = null;
		this.form.details = this.dataSelected.map((detail) => {
			const newDetail = { ...detail };
			newDetail.toDispatch = {
				id: detail.id,
				warProductsId: detail.warProductsId,
				quantity: detail.quantity,
				warehousesId: detail.warWarehousesId,
				brandId: detail.brandId,
			};
			return newDetail.toDispatch;
		});
		try {
			await this.$httpSales.post('remission-guides', this.form);
			this.showNotification('La guía se generó correctamente.');
			this.backToDispatch();
		} catch (err) {
			const reg = /driverName/g;
			if (reg.test(err.data.message)) {
				const message = 'El nombre del conductor es requerido';
				this.showNotification(message, 'error');
			}
			this.showGenericError();
		}
	}

	function goToGuide() {
		this.active = '1';
	}

	function isNotSelectable() {
		return this.sale.state.code !== 'PXEN';
	}

	async function loadData() {
		try {
			const response = await this.$httpSales.get(`sale-documents/${this.id}`, { params: this.params });
			const details = response.data.details.map((product) => {
				const newProduct = { ...product };
				newProduct.model = product.product.model;
				newProduct.code = product.product.code;
				newProduct.autoBarcode = product.product.autoBarcode;
				newProduct.name = product.product.name;
				newProduct.inlineFeatures = product.product.inlineFeatures;
				newProduct.description = product.product.description;
				newProduct.location = product.product.location;
				newProduct.brandName = product.product.brandName;
				newProduct.weight = product.product.weight;
				newProduct.isSelected = false;
				return newProduct;
			});
			response.data.details = details;
			if (response.data.customer) {
				response.data.customerData = {
					name: response.data.customer.flagTypePerson > 1 ? response.data.customer.rzSocial
						: `${response.data.customer.name} ${response.data.customer.lastname}`,
					document: response.data.customer.flagTypePerson > 1 ? response.data.customer.ruc
						: response.data.customer.dni,
				};
			} else {
				response.data.customerData = {};
			}
			this.sale = response.data;
		} catch (err) {
			this.showGenericError();
		}
	}

	function priceAmounts() {
		if (this.sale.details.length > 0) {
			return this.amountsCalculate(this.sale.details);
		}
		return { subtotal: 0, tax: 0.18, discount: 0, total: 0.18 };
	}

	function rowIsSelected(row) {
		const i = this.sale.details.findIndex(rowData => rowData.warProductsId
				=== row.warProductsId);
		this.sale.details[i].isSelected = row.isSelected;
		if (row.isSelected) {
			if (this.dataSelected.length > 0) {
				const dataToAdd = this.dataSelected.find(rowSelected =>
					rowSelected.autoBarcode === row.autoBarcode
					&& rowSelected.warProductsId === row.warProductsId);
				if (!dataToAdd) {
					this.dataSelected.push(row);
				}
			} else {
				this.dataSelected.push(row);
			}
		} else {
			const index = this.dataSelected.findIndex(rowData => rowData[this.keyValue]
				=== row[this.keyValue]);
			this.dataSelected.splice(index, 1);
		}
		this.checkAll = this.sale.details.every(check => check.isSelected);
	}

	function saleForDelivering() {
		return this.sale.state.code === 'PXEN';
	}

	function selectedAll(value) {
		this.checkAll = value;
		this.sale.details = this.sale.details.map((dataSingle) => {
			const newData = Object.assign({}, dataSingle);
			newData.isSelected = dataSingle.flagDispatch ? false : value;
			if (newData.isSelected) {
				if (this.dataSelected.length > 0) {
					const dataToAdd = this.dataSelected.find(rowSelected =>
						rowSelected.autoBarcode === newData.autoBarcode
						&& rowSelected.warProductId === newData.warProductId);
					if (!dataToAdd) {
						this.dataSelected.push(newData);
					}
				} else {
					this.dataSelected.push(newData);
				}
			} else {
				const index = this.dataSelected.findIndex(rowData => rowData[this.keyValue]
					=== newData[this.keyValue]);
				this.dataSelected.splice(index, 1);
			}
			return newData;
		});
	}

	function toggleColumns() {
		return true;
	}

	function data() {
		return {
			active: null,
			checkAll: false,
			columns: [
				{ id: 1, name: 'Modelo', value: 'model', visible: true, checked: true },
				{ id: 2, name: 'Código', value: 'code', visible: true, checked: true },
				{ id: 3, name: 'Cod. interno', value: 'autoBarcode', visible: true, checked: true },
				{ id: 4, name: 'Nombre', value: 'name', visible: true, checked: true },
				{ id: 5, name: 'Características', value: 'inlineFeatures', visible: true, checked: true },
				{ id: 6, name: 'Descripción', value: 'description', visible: true, checked: true },
				{ id: 7, name: 'Ubicación', value: 'location', visible: true, checked: true },
				{ id: 8, name: 'Marca', value: 'brandName', visible: true, checked: true },
				{ id: 9, name: 'Cantidad', value: 'quantity', visible: true, checked: true },
				{ id: 10, name: 'Precio', value: 'price', visible: true, checked: true },
				{ id: 11, name: 'Descuento', value: 'discount', visible: true, checked: true },
				{ id: 12, name: 'Stock', value: 'stockQuantity', visible: true, checked: true },
				{ id: 13, name: 'Peso', value: 'weigth', visible: true, checked: true },
				{ id: 14, name: 'Total', value: 'subTotal', visible: true, checked: true },
			],
			dataSelected: [],
			form: {
				driverName: '',
				driverLicense: '',
				driverCelphone: '',
				driverLicensePlate: '',
				destination: '',
				observation: '',
			},
			keyValue: 'warProductId',
			localSearch: '',
			params: {
				search: null,
			},
			sale: {
				customerData: {},
				details: [],
				employee: {},
				payment: {},
				state: {},
				typeDocument: {},
			},
			searchData: '',
			tabs: [
				{ id: 1, title: 'Detalle de productos' },
				{ id: 2, title: 'Generar guía' },
			],
		};
	}

	export default {
		name: 'dispatch-detail',
		components: {
			appTable,
			headerPage,
		},
		computed: {
			isNotSelectable,
			priceAmounts,
			saleForDelivering,
		},
		created,
		data,
		methods: {
			allIsSelected,
			backToDispatch,
			downloadSale,
			generateGuide,
			goToGuide,
			loadData,
			rowIsSelected,
			selectedAll,
			toggleColumns,
		},
		props: ['id'],
	};
</script>

<style lang="scss" scoped>
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

	h3, h5 {
		display: inline-block;
		font-family: map-get($fonts, open-semibold);
	}

	h5 {
		color: map-get($colors, paginationText);
	}

	.dispatch-form-label {
		color: map-get($colors, blue-card);
		font-family: map-get($fonts, bold);
		font-size: 14px;
	}
</style>
