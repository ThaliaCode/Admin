<template>
	<div>
		<header-page
			:show-excel="false"
			:title="$route.meta.title"
			to-show
			@clean-product-filter="cleanFilter"
		/>
		<general-filter class="layout wrap align-center">
			<v-flex xs12 md4 px-2>
				<label class="caption">Reporte</label>
				<v-select
					:items="reports"
					v-model="selectedReport"
					class="filter-select shadow-inset"
					item-text="name"
					@input="changeSelect($event)"
				>
				</v-select>
			</v-flex>
			<v-flex xs12 md2 px-2 v-if="subsidiaries.length > 0 && !isSaleOrCoverage">
				<label class="caption"> {{ labelSucursal() }}</label>
				<app-select
					:items="subsidiaries"
					:item="subsidiaryId"
					class="filter-select shadow-inset"
					item-value="id"
					model="subsidiaryId"
					item-text="rzSocial"
					:return-object="false"
					@input="setSucursal"
				>
				</app-select>
			</v-flex>
			<v-flex xs12 md2 px-2 v-if="warehousesFiltered.length && showWarehouses">
				<app-select
					chips
					:item="warehouseIds"
					item-text="name"
					item-value="id"
					:items="warehousesFiltered"
					multiple
					:label="labelWarehouse()"
					:return-object="false"
					@input="getWarehouseIds"
				/>
			</v-flex>
			<v-flex
				xs12
				md2
				px-2
				v-if="showCategories && !isSaleOrCoverage && isNotSaleEmployee"
			>
				<app-select
					:item="categoryId"
					item-text="name"
					item-value="id"
					:items="categories"
					label="Categoría"
					:return-object="false"
					@input="getCategory"
				></app-select>
			</v-flex>
			<v-flex xs12 md2 px-2 v-if="showBrands">
				<app-select
					:item="brandId"
					item-text="name"
					item-value="id"
					:items="brands"
					label="Marca"
					model="brand"
					:return-object="false"
					@input="brandId = $event.value"
				/>
			</v-flex>
			<v-flex xs12 md2 px-2 v-if="needTypeDocuments || isSaleOrCoverage">
				<autocomplete-component
					chips
					item-text="code"
					item-value="code"
					:items="typeDocuments"
					label-value="T. Documento"
					multiple
					:object-data="'documentType'"
					resource-url="/type-documents?flagType=1"
					:return-object="false"
					:http-code="'$httpSales'"
					:item="typeDocumentCodes"
					@return-data="getParamTypeDocuments($event, 'typeDocumentCodes')"
				></autocomplete-component>
			</v-flex>
			<v-flex
				xs12
				md2
				px-2
				v-if="
					([1, 2, 11, 12, 16].includes(selectedReport.id) || isSaleOrCoverage) &&
					isNotSaleEmployee
				"
			>
				<app-select
					multiple
					chips
					:item="employeeIds"
					model="employeeIds"
					item-text="name"
					item-value="id"
					:items="employees"
					label="Empleados"
					:return-object="false"
					@input="getEmployees"
				></app-select>
			</v-flex>
			<v-flex xs12 md2 px-2>
				<app-date-select
					:date-formatted="params.startDate"
					label="Fecha de inicio"
					model="startDate"
					@input="setDate"
				/>
			</v-flex>
			<v-flex xs12 md2 px-2>
				<app-date-select
					:date-formatted="params.endDate"
					label="Fecha de fin"
					:min-date="params.startDate"
					model="endDate"
					@input="setDate"
				/>
			</v-flex>
			<v-flex xs2 px-2>
				<app-select
					:item="params.currency"
					item-text="name"
					item-value="code"
					:items="currencies"
					label="Moneda"
					model="currency"
					:return-object="false"
					@input="params.currency = $event.value"
				/>
			</v-flex>

			<v-flex
				xs12
				sm1
				md1
				px-2
				pt-3
				ml-1
				hidden-sm-and-down
				v-if="!isSaleOrCoverage && !onlyReportExcel && isNotSaleEmployee"
			>
				<v-btn
					:disabled="isLoading"
					:loading="isLoading"
					color="primary"
					block
					@click="downloadReport('preview')"
				>
					<v-icon> image_search </v-icon>
				</v-btn>
			</v-flex>
			<v-flex xs12 sm1 md1 px-2 pt-3 ml-1 v-if="!onlyReportExcel">
				<v-btn
					@click="downloadReport('download')"
					:disabled="isLoading"
					:loading="isLoading"
					color="success"
					block
				>
					<v-icon> cloud_download </v-icon>
				</v-btn>
			</v-flex>
			<v-flex xs12 sm1 md1 px-2 pt-3 ml-1 v-if="showExcel">
				<v-btn
					:disabled="isLoading"
					:loading="isLoading"
					color="primary"
					block
					@click="downloadReportExcel"
				>
					<img src="/static/img/excel.svg" alt="download" height="20" />
				</v-btn>
			</v-flex>
			<v-flex xs12 sm1 md1 px-2 pt-3 ml-1 v-if="reportId === 9">
				<v-btn
					type="button"
					color="success"
					class="btn-action"
					style="font-size: 2.5rem; height: 50px"
					@click="showDetailReport"
				>
					Ver detalle
				</v-btn>
			</v-flex>
		</general-filter>
		<div ref="viewer" id="result" class="hidden-sm-and-down"></div>
	</div>
</template>

<script>
import appDateSelect from '@/components/shared/app-date-select';
import { format, subDays } from 'date-fns';
import headerPage from '@/components/shared/header-page';
import generalFilter from '@/components/shared/general-filter';
import helper from '@/shared/helper';

async function created() {
	const requests = [
		this.brandsList(),
		this.subsidiariesList(),
		this.warehousesList(),
		this.categoriesList(),
		this.globalEmployees(),
		this.getCurrencies(),
	];
	[
		{ data: this.brands },
		{ data: this.subsidiaries },
		{ data: this.warehouses },
		{ data: this.categories },
		{ data: this.employees },
		{ data: this.currencies },
	] = await Promise.all(requests);
	this.selectedReport = this.reports[0];
	if (this.subsidiaries.length === 1) {
		this.subsidiaryId = this.subsidiaries[0].id;
	}
	if (this.categories.length === 1) {
		this.categoryId = this.categories[0].id;
	}

	this.subsidiaryId = this.subsidiaries[0].id;
	this.warehousesFiltered = this.warehouses.filter(
		(w) => w.subsidiaryId === this.subsidiaryId
	);

	if (this.warehouses.length === 1) {
		this.warehouseIds = this.warehousesFiltered.map((p) => p.id);
	}
	this.warehousesFiltered.unshift({ id: 0, name: 'Seleccionar todos' });
	if (this.currencies && this.currencies.length) {
		this.params.currency = this.currencies[0].code;
	}
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
	const documents = helper.getLocalData('documents');
	this.typeDocuments =
		documents.length && documents.map(({ documentType }) => documentType);
	const filterIds = [52, 3, 5, 1, 2];
	this.typeDocuments = this.typeDocuments.filter((typeDocument) =>
		filterIds.includes(typeDocument.id)
	);
}

function getEmployees({ model, value }) {
	this[model] = value;
}
function getParamTypeDocuments(value, model) {
	this[model] = value;
}

function getCategory({ value }) {
	this.categoryId = value;
}

function setSucursal({ model, value }) {
	this[model] = value;
	this.warehousesFiltered = this.warehouses.filter((p) => p.subsidiaryId === value);
	if (this.warehousesFiltered.length === 1) {
		this.warehouseIds = this.warehousesFiltered.map((p) => p.id);
	}
}

async function downloadReport(type) {
	try {
		this.isLoading = true;
		const { fileName, post = {}, extension, code, name } = this.selectedReport;
		const { fullname } = this.$userInfo;
		const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
		if (this.isSaleOrCoverage || !this.isNotSaleEmployee) {
			if (!this.isNotSaleEmployee && this.reportId !== 15 && !this.brandId) {
				this.showNotification(
					'Debe seleccionar una marca para generar el reporte',
					'warning'
				);
				return;
			}
			const body = {
				extension: 'pdf',
				filename: `${fileName} ${now} pdf`,
				params: {
					employeeName: fullname,
					startDate: this.params.startDate,
					currency: this.params.currency || undefined,
					endDate: this.params.endDate,
					employeeIds: this.employeeIds.length ? this.employeeIds : undefined,
					includeNtc: [2].includes(this.selectedReport.id) ? false : undefined,
					typeDocumentIds:
						this.typeDocumentCodes.length && this.isNotSaleEmployee
							? this.typeDocuments
									.filter((doc) => this.typeDocumentCodes.includes(doc.code))
									.map((doc) => doc.id)
							: undefined,
					warehouseIds:
						this.warehouseIds.length && this.showWarehouses
							? this.warehouseIds.filter((id) => id !== 0)
							: undefined,
					warehouseNames:
						this.warehouseIds.length && this.showWarehouses
							? this.warehouseIds
									.filter((id) => id !== 0)
									.map((id) => this.warehouses.find((w) => w.id === id)?.name)
									.filter(Boolean)
							: undefined,
				},
			};

			if (!this.isNotSaleEmployee) {
				body.params.typeDocumentCodes = this.typeDocumentCodes.length
					? this.typeDocumentCodes
					: undefined;

				if (this.reportId !== 15) {
					const brand = this.brands.find((v) => v.id === this.brandId);
					body.params.brandId = this.brandId;
					body.params.brandName = brand.name;
					body.filename = `${fileName}_${brand.name}_${now}_pdf`;
				}
			}

			if (type === 'download') {
				await this.$httpReports.post(`documents/${code}-pdf`, body);
				this.notificationReport(name);
			} else {
				const bodyPreview = {
					employeeName: fullname,
					code: `${code}-pdf`,
				};
				delete body.params.employeeName;
				const { data: blobData } = await this.$httpSales.post(
					'sale-document/pdf',
					bodyPreview,
					{
						params: body.params,
					}
				);
				const blob = helper.generateBlob(blobData);
				const urlObject = URL.createObjectURL(blob);
				const iFrame = document.createElement('iframe');
				iFrame.setAttribute('src', urlObject);
				iFrame.setAttribute('style', 'height:100vh;width:100%');
				const childNodes = this.$refs.viewer.childNodes;
				if (childNodes.length > 0) {
					this.$refs.viewer.removeChild(this.$refs.viewer.childNodes[0]);
				}
				this.$refs.viewer.append(iFrame);
			}
		} else {
			const paramsReport = {
				responseType: 'blob',
				params: {
					startDate: this.params.startDate,
					currency: this.params.currency,
					endDate: this.params.endDate,
					comSubsidiaryId: this.subsidiaryId || undefined,
					employeeIds: this.employeeIds.join(',') || undefined,
					categoryId: this.categoryId || undefined,
					flagIncludeIGV: [1, 2, 3].includes(this.selectedReport.id) ? false : undefined,
					documentTypesCodes: this.typeDocumentCodes.length
						? this.typeDocumentCodes.join(',')
						: null,
				},
			};
			post.warehouseIds = this.warehouseIds.length
				? this.warehouseIds.filter((id) => id !== 0)
				: undefined;
			post.warehouseNames =
				this.warehouseIds.length
					? this.warehouseIds
							.filter((id) => id !== 0)
							.map((id) => this.warehouses.find((w) => w.id === id)?.name)
							.filter(Boolean)
					: undefined;

			const { data: blobData } = await this.$httpReportSales.post(
				'sale-document/pdf',
				post,
				paramsReport
			);
			const nameReport = `${fileName}-${this.startDate}-${this.endDate}`;
			const blob = helper.generateBlob(blobData);
			if (type === 'preview') {
				const urlObject = URL.createObjectURL(blob);
				const iFrame = document.createElement('iframe');
				iFrame.setAttribute('src', urlObject);
				iFrame.setAttribute('style', 'height:100vh;width:100%');
				const childNodes = this.$refs.viewer.childNodes;
				if (childNodes.length > 0) {
					this.$refs.viewer.removeChild(this.$refs.viewer.childNodes[0]);
				}
				this.$refs.viewer.append(iFrame);
			} else {
				helper.showDownloadDialog(blob, nameReport, extension || 'pdf');
			}
		}
	} catch (error) {
		console.error(error);
		if (error.status === 400) {
			this.showNotification('Su compañía no cuenta con este reporte', 'warning');
		} else {
			this.showGenericError();
		}
	} finally {
		this.isLoading = false;
	}
}
function getWarehouseIds({ value }) {
	const selectedIds = value;

	const selectAllSelected = selectedIds.includes(0);

	if (selectAllSelected) {
		this.warehouseIds =
			this.warehouseIds.length === this.warehousesFiltered.length - 1
				? []
				: this.warehousesFiltered.map((w) => w.id).filter((id) => id !== 0);
	} else {
		this.warehouseIds = selectedIds;
	}
}

function changeSelect(select) {
	this.cleanFilter();
	this.reportId = select.id;
	if (
		this.reportId === 5 ||
		this.reportId === 3 ||
		this.reportId === 4 ||
		this.reportId === 6 ||
		this.reportId === 7 ||
		this.reportId === 13 ||
		this.reportId === 15 ||
		this.reportId === 14 ||
		this.reportId === 16
	) {
		this.showExcel = false;
	} else {
		this.showExcel = true;
	}
	this.showCategories = ![11, 12].includes(select.id) && this.categories.length > 0;
	this.isNotSaleEmployee = ![15, 14, 13, 21].includes(this.reportId);
	this.isSaleOrCoverage =
		select.code === 'coverage-report' || select.code === 'sales-analysis-report';
	this.showWarehouses = [1, 2, 3, 4, 8, 9, 10, 11, 12, 13, 14, 15, 16, 21].includes(
		select.id
	);
	this.showBrands = [12, 13, 14, 21].includes(select.id);
	if (this.needTypeDocuments || this.isSaleOrCoverage) {
		this.typeDocumentCodes = this.typeDocuments
			.filter((td) => td.flagIncludeNotes)
			.map((d) => d.code);
	}
	if (this.currencies && this.currencies.length) {
		this.params.currency = this.currencies[0].code;
	}
}

function cleanFilter() {
	this.warehouseIds =
		this.warehousesFiltered.length === 1 ? this.warehousesFiltered.map((p) => p.id) : [];
	this.subsidiaryId = this.subsidiaries[0].id;
	this.brandId = null;
	this.categoryId = this.categories.length === 1 ? this.categories[0].id : [];
	this.params.startDate = format(subDays(this.$today(), 7), 'YYYY-MM-DD');
	this.params.endDate = this.$today();
	this.typeDocumentCodes.splice(0);
	if (this.currencies && this.currencies.length) {
		this.params.currency = this.currencies[0].code;
	}
	this.employeeIds = [];
}

function setDate({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
}

async function downloadReportExcel() {
	try {
		this.isLoading = true;
		const { fileName, code } = this.selectedReport;
		if (code === 'list-sales') {
			if (this.warehouseIds.length === 0) {
				this.showNotification(
					'Debe seleccionar al menos una tienda para generar un reporte',
					'warning'
				);
				return;
			}
		}

		const needSelectBrand = this.reportId === 21;
		if (needSelectBrand && !this.brandId) {
			this.showNotification(
				'Debe seleccionar una marca para generar el reporte',
				'warning'
			);
			return;
		}

		const nameReport = `${fileName}-${this.params.startDate}-${this.params.endDate}`;
		const urlReports = `documents/${code}`;
		const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
		const body = {
			extension: 'xlsx',
			filename: `${fileName}_${now}_xlsx`,
			params: {
				startDate: this.params.startDate,
				endDate: this.params.endDate,
				currency: this.params.currency,
				comSubsidiaryId: this.isSaleOrCoverage
					? undefined
					: this.subsidiaryId || undefined,
				employeeIds: this.employeeIds.length > 0 ? this.employeeIds : undefined,
				brandId: this.brandId || undefined,
				categoryId:
					this.categoryId && this.categoryId.length > 0 && !this.isSaleOrCoverage
						? this.categoryId
						: undefined,
				warehouseIds:
					this.warehouseIds.length > 0 && !this.isSaleOrCoverage
						? this.warehouseIds.filter((id) => id !== 0)
						: undefined,
				flagIncludeIGV:
					this.selectedReport.id === 1 ||
					(this.selectedReport.id === 3 && !this.isSaleOrCoverage)
						? false
						: undefined,
			},
		};

		const isListOrDetail = [11, 12].includes(this.selectedReport.id);
		if (this.typeDocumentCodes.length && !this.isSaleOrCoverage) {
			body.params.documentTypesCodes = this.typeDocumentCodes;
			body.params.includeNtc = false;
		}
		if (this.isSaleOrCoverage || isListOrDetail) {
			body.params.typeDocumentIds =
				this.typeDocumentCodes.length === 0
					? undefined
					: this.typeDocuments
							.filter((doc) => this.typeDocumentCodes.includes(doc.code))
							.map((doc) => doc.id);

			if (isListOrDetail) {
				delete body.params.documentTypesCodes;
			}
		}
		const url = this.isSaleOrCoverage ? `documents/${code}-xlsx` : urlReports;
		await this.$httpReports.post(url, body);
		this.notificationReport(nameReport);
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		} else if (err.status === 400) {
			if (err.data.message === 'NOT_FOUND_REPORT') {
				this.showGenericError('El reporte no se encuentra activado para su compañía.');
			}
		}
	} finally {
		this.isLoading = false;
	}
}

function data() {
	return {
		categories: [],
		categoryId: null,
		showCategories: false,
		currencies: [],
		employees: [],
		employeeIds: [],
		typeDocumentCodes: [],
		isLoading: false,
		reportId: null,
		selectedReport: {},
		subsidiaryId: null,
		isSaleOrCoverage: false,
		showBrands: false,
		reports: [
			{
				id: 11,
				fileName: 'listado_de_ventas_',
				name: 'Reporte de lista de venta',
				code: 'list-sales',
				post: {
					code: 'list-sales',
				},
			},
			{
				id: 12,
				fileName: 'detalle_de_ventas_',
				name: 'Reporte de detalle de venta',
				code: 'list-sales-details',
				post: {
					code: 'list-sales-details',
				},
			},
			{
				id: 1,
				fileName: 'resumen-ventas-de-articulos',
				name: 'Resumen de Ventas de Artículos (Sin IGV)',
				code: 'subsidiary-sale-details-xlsx',
				post: {
					code: 'subsidiary-sale-details',
				},
			},
			{
				id: 2,
				fileName: 'resumen-ventas-costo',
				name: 'Resumen de Ventas de Artículos P. Costo (Con IGV)',
				code: 'total-cost-sale-details-xlsx',
				post: {
					code: 'total-cost-sale-details',
				},
			},
			{
				id: 16,
				fileName: 'resumen-ventas-costo-totales',
				name: 'Totales de Ventas de Artículos P. Costo (Con IGV)',
				code: 'total-cost-sale',
				post: {
					code: 'total-cost-sale',
				},
			},
			{
				id: 3,
				fileName: 'resumen-productos-categoria',
				name: 'Resumen Productos por Categoría (Sin IGV)',
				code: 'category-sale-details-xlsx',
				post: {
					code: 'category-sale-details',
				},
			},
			{
				id: 4,
				fileName: 'resumen-productos-categoria',
				name: 'Resumen Productos por Categoría (Con IGV)',
				code: 'category-sale-details-xlsx',
				post: {
					code: 'category-sale-details',
				},
			},
			{
				id: 5,
				fileName: 'facturacion-cliente',
				name: 'Resumen de Ventas por Cliente',
				code: 'customer-invoice-xlsx',
				post: {
					code: 'customer-invoice',
				},
			},
			{
				id: 6,
				fileName: 'facturacion-total',
				name: 'Resumen de Facturación Totales',
				code: 'customer-invoice-total-xlsx',
				post: {
					code: 'customer-invoice-total',
				},
			},
			{
				id: 7,
				fileName: 'resumen-facturacion-detallado',
				name: 'Resumen de Facturación (Detallado)',
				post: {
					code: 'customer-sale-details',
				},
			},
			{
				id: 8,
				fileName: 'resumen-agrupada-producto',
				name: 'Resumen de Venta por Artículos Agrupados',
				code: 'documents-group-products-xlsx',
				post: {
					code: 'documents-group-products',
				},
			},
			{
				id: 9,
				fileName: 'detalle-cobertura-empleados',
				name: 'Detalle de cobertura por empleados',
				code: 'coverage-report',
			},
			{
				id: 10,
				fileName: 'reporte-analisis-venta',
				name: 'Reporte de análisis de venta',
				code: 'sales-analysis-report',
			},
			{
				id: 11,
				fileName: 'listado_de_ventas_anulados_cero',
				name: 'Lista de venta con anulados en 0',
				code: 'list-sales-canceled-zero',
				post: {
					code: 'list-sales-canceled-zero',
				},
			},
			{
				id: 13,
				fileName: 'reporte-vendedores-marca',
				name: 'Reporte de Vendedores por Marca',
				code: 'employee-sale-totals',
			},
			{
				id: 14,
				fileName: 'reporte-detallado-producto-marca',
				name: 'Reporte Detallado de Producto por Marca',
				code: 'employee-sale-grouped',
			},
			{
				id: 15,
				fileName: 'reporte-vendedor-totales',
				name: 'Reporte Total de Vendedores',
				code: 'employee-sale-totals',
			},
			{
				id: 21,
				code: 'employee-sale-totals-xlsx',
				fileName: 'reporte-vendedores-marca-excel',
				name: 'Reporte de Vendedores por Marca (Excel)',
			},
		],
		params: {
			startDate: null,
			endDate: null,
			currency: null,
		},
		showExcel: true,
		subsidiaries: [],
		warehouses: [],
		warehousesFiltered: [],
		warehouseIds: [],
		brands: [],
		brandId: null,
		isNotSaleEmployee: true,
		showWarehouses: true,
	};
}

export default {
	name: 'page-sales-report',
	data,
	created,
	components: {
		appDateSelect,
		headerPage,
		generalFilter,
	},
	methods: {
		cleanFilter,
		changeSelect,
		downloadReportExcel,
		downloadReport,
		getCategory,
		getEmployees,
		getParamTypeDocuments,
		getWarehouseIds,
		setDate,
		setSucursal,
		showDetailReport() {
			this.$router.push({ 
				name: 'detail-sales',
				query: {
					startDate: this.params.startDate,
					endDate: this.params.endDate,
				}
			});
		},
	},
	computed: {
		needTypeDocuments() {
			return [1, 2, 3, 4, 8, 11, 12, 13, 14, 15, 16, 21].includes(this.selectedReport.id);
		},
		onlyReportExcel() {
			return [11, 12, 21].includes(this.selectedReport.id);
		},
	},
};
</script>