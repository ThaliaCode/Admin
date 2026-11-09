<template>
	<div class="configuration-loading-products">
		<header-page name="Loading of Products" :title="`Carga de Productos`" />
		<app-loading
			:show-loading="loadingServices"
			label="La carga terminará en un momento y podrás ver
			toda la información configurada para el comercio."
		/>
		<v-layout wrap px-3 mt-2 mb-5 pb-5 pt-3 class="column-group min-h-191">
			<v-flex xs12 md8 class="pr-5-rs">
				<v-layout wrap>
					<v-flex xs12>
						<div class="title-form">
							<div>
								<p class="mb-0">Seleccione Opción</p>
							</div>
							<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem">
								<a
									href="/static/excel/template_carga_productos.xlsx"
									download="descargar-productos"
								>
									<v-btn
										class="btn-action btn-auto btn-full py-2 px-1"
										color="success"
										outline
									>
										<img src="/static/img/excel.svg" height="19" class="ml-0 mr-2" />
										<span class="primary--text">Descargar Plantilla</span>
									</v-btn>
								</a>

								<label ml-4 ref="label" for="upload-file-prices">
									<input
										type="file"
										hidden
										id="upload-file-prices"
										ref="file"
										:disabled="isValidImport"
										v-on:change="importProducts()"
									/>
									<v-btn
										class="btn-action btn-auto btn-full py-2 px-1"
										color="success"
										outline
										@click="onClick('import')"
										:disabled="isValidImport"
									>
										<img src="/static/img/excel.svg" height="19" class="ml-0 mr-2" />
										<span class="primary--text">Importar Productos</span>
									</v-btn>
								</label>
								<v-btn
									class="btn-action btn-auto py-2 px-1"
									color="primary"
									:disabled="isFileUpload"
									type="button"
									@click="saveFile"
								>
									Guardar
								</v-btn>
							</div>
						</div>
					</v-flex>
					<v-flex xs12 md6>
						<app-select
							:item="commerce.salPriceListId"
							:items="listPrices"
							item-text="name"
							item-value="id"
							label="Lista de precio"
							model="salPriceListId"
							:return-object="false"
							@input="setDataCommerce"
						></app-select>
					</v-flex>
					<v-flex xs12 md6 pl-2>
						<app-select
							:item="commerce.subsidiary"
							:items="subsidiaries"
							item-text="rucName"
							item-value="id"
							label="Lista de Subsidarias"
							model="subsidiary"
							:return-object="false"
							@input="setDataCommerce"
						></app-select>
					</v-flex>
					<v-flex xs12 md6 pl-2>
						<app-select
							:disabled="!commerce.subsidiary"
							:item="commerce.warehouseId"
							:items="warehouses"
							item-text="name"
							item-value="id"
							label="Lista de Tiendas"
							model="warehouseId"
							:return-object="false"
							@input="setDataCommerce"
						></app-select>
					</v-flex>
					<v-flex xs12 md6 mt-4 v-if="importData">
						<ul class="list-import">
							<li>
								<v-icon color="success" size="18">check_circle</v-icon>
								Productos añadidos: {{ importData.data.n_products || 0 }}
							</li>
							<li>
								<v-icon size="18" color="error">error</v-icon>
								Productos con errores: {{ importData.data.reg_error || 0 }}
							</li>
							<li v-if="importData.data.reg_error > 0">
								<v-icon size="18" color="warning">assignment_late</v-icon>
								Descargar errores:
								<a :href="getURlExcelError(importData.data.name_excel)" target="_blank">
									excelError.xlsx
								</a>
							</li>
						</ul>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
import 'vue2-timepicker/dist/VueTimepicker.css';
import actionSidebar from '@/components/shared/action-sidebar';
import headerPage from '@/components/shared/header-page';
import helper from '@/shared/helper';
import VueSixFour from 'vue-six-four';
import btnAddItem from '@/components/shared/btn-add-item';
import modalItems from '@/components/shared/modal-items';
import axios from 'axios';

const { generateBlob, showDownloadDialog, getLocalData } = helper;

async function created() {
	this.companyId = this.$userInfo.companyId;
	this.countryId = this.$userInfo.company.country.id;
	await this.loadCommerce();
}

async function loadCommerce() {
	this.filterData();
}

async function filterData() {
	const request = [this.listPricingPromise(), this.$httpSalesRead.get('subsidiaries')];
	try {
		[{ data: this.listPrices }, { data: this.subsidiaries }] = await Promise.all(request);
		this.listPrices = this.listPrices.map((price) => {
			const newPrice = Object.assign({}, price);
			newPrice.type = 'salPriceId';
			return newPrice;
		});
		this.subsidiaries = this.subsidiaries;
	} catch (error) {
		this.showGenericError();
	}
}

async function exportProducts() {
	try {
		const responseType = 'blob';
		const urlExport = '/static/excel/template_carga_productos.xlsx';
		const { data: response } = await axios.get(urlExport, { responseType });
		const blob = generateBlob(
			response,
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		showDownloadDialog(blob, 'product-list', 'xlsx');
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	} finally {
		this.loading = false;
	}
}

function importProducts() {
	this.fileImport = this.$refs.file.files[0];
	const name = this.fileImport.name;
	const words = name.split('.');
	const lastItem = words.length;
	const extension = words[lastItem - 1];
	this.importData = null;
	if (this.allowedFilesPrices.indexOf(extension) > -1) {
		this.isFileUpload = false;
	} else {
		this.showNotification(
			`Archivo no válido, solo se permite ${this.allowedFilesPrices.join(',')}`,
			'warning'
		);
	}
}

async function saveFile() {
	this.isFileUpload = true;
	this.importData = null;
	try {
		const taxes = getLocalData('general-taxes');
		const taxDefault = taxes.find((t) => t.flagTaxes);
		const formData = new FormData();
		formData.append('file_excel', this.fileImport);
		formData.append('idCountry', this.countryId);
		formData.append('flagUseSimpleBrand', this.flagUseSimpleBrand);
		formData.append('taxCodeCountry', taxDefault.code || '01');
		if (this.commerce.warehouseId) {
			formData.append('warehouseId', this.commerce.warehouseId);
		}
		// const baseUrl = point.endPoint;
		// const endPoint = axios.create({ baseURL: baseUrl });
		const { data: response } = await this.$httpJapiExcel.post(
			`api/excel/readexcel/${this.companyId}/pricelist/${this.commerce.salPriceListId}/subsidiary/${this.commerce.subsidiary}`,
			formData,
			{ headers: { 'Content-Type': 'multipart/form-data' } }
		);
		this.importData = response;
		this.commerce.salPriceListId = null;
		this.commerce.subsidiary = null;
		this.fileImport = null;
		this.$refs.file.value = null;
		this.isFileUpload = true;
		this.isValidImport = true;
	} catch (error) {
		if (error.status === 500) {
			this.showGenericError();
		} else if (error.status === 400) {
			if (error.data.message === 'READ_FILE_XLSX_ERROR') {
				this.showNotification(
					'No se pudo leer el archivo excel. Recargue la página e inténtelo de nuevo.',
					'error'
				);
			} else if (error.data.message === 'WRITE_FILE_XLSX_ERROR') {
				this.showNotification(
					'Se produjo un error de escritura en el archivo. Recargue la página e inténtelo de nuevo.',
					'error'
				);
			}
			this.isFileUpload = true;
		}
	}
}

function onClick(code) {
	if (code === 'export') {
		this.exportProducts();
	} else if (code === 'import') {
		this.showDialogPrices();
	}
}

function showDialogPrices() {
	this.$refs.label.click();
}

function setSalPriceId(list) {
	if (list && list.id) {
		this.commerce.salPriceListId = list.id;
	}
}

async function setDataCommerce({ model, value }) {
	this.commerce[model] = value;
	if (this.commerce.subsidiary !== null && this.commerce.salPriceListId !== null) {
		this.isValidImport = false;
	}
	if (model !== 'subsidiary') return;
	const params = { subsidiaryId: value };
	try {
		const { data: response } = await this.$httpProducts.get('warehouses', {
			params,
		});
		this.commerce.warehouseId = null;
		this.warehouses = response;
	} catch (err) {
		this.showGenericError();
	}
}

function setCommerceData() {
	this.commerce.salPriceListId = this.listCommerces[0].settings.salPriceListId;
}

function data() {
	return {
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 500,
		},
		allowedFiles: [
			'jpg',
			'jpeg',
			'png',
			'doc',
			'docx',
			'xls',
			'xlsx',
			'pdf',
			'txt',
			'svg',
		],
		allowedFilesPrices: ['xls', 'xlsx'],
		companyId: null,
		loadingServices: false,
		commerce: {
			salPriceListId: null,
			subsidiary: null,
			warehouseId: null,
		},
		listPrices: [],
		subsidiaries: [],
		listCommerces: {
			settings: {
				salPriceListId: null,
			},
		},
		isValidImport: true,
		isFileUpload: true,
		file: '',
		importData: null,
		fileImport: null,
		flagUseSimpleBrand: this.$userInfo.company.settings.flagUseSimpleBrand,
		domainJapiExcel: helper.getEndPointDynamic('JAPI_EXCEL_URL') || '',
		warehouses: [],
	};
}

export default {
	name: 'page-loading-products',
	components: {
		actionSidebar,
		headerPage,
		VueSixFour,
		btnAddItem,
		modalItems,
	},
	created,
	data,
	methods: {
		exportProducts,
		onClick,
		setSalPriceId,
		importProducts,
		setDataCommerce,
		loadCommerce,
		setCommerceData,
		filterData,
		showDialogPrices,
		saveFile,
		getURlExcelError(nameExcel) {
			// Elimina cualquier "/" final de domainJapiExcel y cualquier "/" inicial de name_excel
			const cleanDomain = this.domainJapiExcel.replace(/\/+$/, '');
			const cleanName = nameExcel.replace(/^\/+/, '');
			const url = `${cleanDomain}/${cleanName}`;
			return url;
		},
	},
	props: {
		id: [Number, String],
	},
};
</script>

<style lang="scss" scoped>
.page-configuration {
	display: flex;
	flex-direction: row;
	width: 100%;
}

.container-image {
	width: 50%;
}

.text-support-image {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, open-regular);
	font-size: map-get($sizes, small11);
	margin: 4px 0 0 0;
}

.title-form {
	border-bottom: 1px solid color(subheader);
	color: color(background-sidebar);
	font-family: font(open-bold);
	font-size: size(medium16);
	margin-bottom: 21px;
	padding-bottom: 9px;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}

.wrapper-upload {
	align-items: flex-end;
	display: flex;
}

.w-100 {
	width: 100%;
}

.border-bottom {
	border-bottom: 1px solid map-get($colors, blue-grey);
}

.background-table {
	background-color: map-get($colors, white);
	border: 1px solid map-get($colors, border-tab);
	border-radius: 8px;
	overflow: hidden;
}

.title-center-help {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, lato-bold);
	font-size: map-get($sizes, medium16);
}

.modal-confirm-delete {
	border-radius: 9px;
	text-align: center;
}

.buttons-configuration {
	background-color: white;
	bottom: 0%;
	left: 0px;
	padding: 12px 0;
	position: fixed;
	right: 0px;
	width: 100%;
	z-index: 2;
}

.create-help-center {
	border-left: 1px solid #d3dde6;
}

.help-actions {
	width: 100px;
}

.payment-title {
	color: color(primary);
}

.config-button {
	background-color: color(info);
	border-radius: 13px;
	color: white;
	font-size: size(small11);
	height: 26px;
	width: 110px;
}

.title-container {
	display: flex;
}

.title-stepper {
	color: map-get($colors, background-sidebar);
	font-family: map-get($fonts, lato-bold);
	font-size: 16px;
	padding-bottom: 10px;
}

.link-green {
	color: color(primary);
	font-size: 13px;
	text-decoration: underline;
}

.headline {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(medium) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 340px;
	padding-top: 37px !important;
	text-align: center;
}

.subtext {
	color: color(grey-border);
	font-family: font(open-regular);
	font-size: size(small) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 340px;
	padding: 0px !important;
	text-align: center;
}

.btn-block {
	padding-bottom: 24px !important;
	padding-top: 28px !important;
}

.address-caption,
.address-text {
	color: color(paginationText);
	font-family: font(open-regular);
}

.address-caption {
	color: color(brown-grey);
}

.payment-subtitle {
	border-bottom: 1px solid color(subheader);
	color: color(paginationText);
	font-family: font(open-bold);
	font-size: size(small13);
	padding-bottom: 6px;
	text-transform: uppercase;
}

.configuration-ecommerce {
	position: relative;
}

.btn-upload {
	align-items: center;
	background: color(primary);
	border-radius: 0 5px 5px 0;
	display: flex;
	justify-content: center;
	height: 27px;
	margin-top: 21px;
	width: 100%;
}

.btn-save-file {
	height: 38px !important;
}

.text-hour {
	color: color(brown-grey);
	font-size: 13px;
}

.column-group {
	flex-direction: column;
}

.min-h-191 {
	min-height: calc(100vh - 191px);
}

.text-map-cation {
	color: color(paginationText);
	font-size: 13px;
	font-weight: 100;
}

.text-small {
	font-size: size(small10);
}

.pt-20 {
	padding-top: 18px;
}

.text-gray {
	color: color(paginationText);
	font-size: 12px;
}

.pr-5-rs {
	padding-right: 48px;

	@media (max-width: 760px) {
		padding: 0;
	}
}

.pl-5-rs {
	padding-left: 48px;

	@media (max-width: 760px) {
		padding: 0;
	}
}

.label-contact {
	color: color(brown-grey);
	font-family: font(open-regular);
	font-size: size(small13);
	margin-bottom: 1px;
}

.configuration-ecommerce .filter-select.input-group.shadow-inset.ma-0 {
	margin: 0px !important;
}

.title-billers {
	border-bottom: 1px solid color(subheader);
	color: color(primary);
	font-size: 13px;
	padding-bottom: 4px;
}
.numeric-order-style {
	color: color(primary);
	font-size: 13px;
}
.list-import {
	color: color(black);
	list-style: none;
	font-family: font(open-regular);
	font-size: size(small13);
}
</style>
