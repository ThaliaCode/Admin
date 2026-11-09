<template>
	<div>
		<header-page
			name="rotation-report"
			:columns="columns"
			:rows="products"
			:title="$route.meta.title"
			to-show
			:show-excel="false"
			:options="options"
			show-excel-menu
			@clean-product-filter="onCleanFilter"
			:open-on-click="true"
			@emit-excel="emitExcel"
		/>
		<reports-filters
			show-warehouse
			show-categories
			show-brands
			:clean-filters="cleanFilters"
			@return-data="setData"
			@search-data="loadData"
			@valid-disabled="validDisabled"
		/>
		<div style="display: flex; justify-content: end">
			<div class="formula-container">
				<div class="formula-header">Fórmula de Rotación</div>
				<div class="formula-content">
					<v-icon style="color: #17a2b8" size="16">info</v-icon>
					<div class="formula-text">
						<span class="formula-label">Rotación =</span>
						<span class="cant-salida">Cant. Salida</span>
						<span class="division">/</span>
						<span class="cant-entrada">Cant. Entrada</span>
					</div>
					<div class="decimal-info">(2dec.)</div>
				</div>
			</div>
		</div>
		<reports-rotation-list
			:total-items="totalItems"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:products="products"
			@on-page="changePage"
		/>
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import reportsFilters from '@/components/reports/reports-filters';
import reportsRotationList from '@/components/reports/reports-rotation-list';
import { format } from 'date-fns';

function changePage(page) {
	this.currentPage = page;
	this.loadData(page);
}

function emitExcel(code) {
	if (code === 'report-rotation') {
		this.downloadReportExcel('report-rotation');
	} else if (code === 'kardex-inventory') {
		this.downloadReportExcel('kardex-inventory');
	} else {
		this.downloadReportExcel('kardex-list');
	}
}

async function downloadReportExcel(code) {
	const params = { ...this.params };
	if (code === 'kardex-list' || code === 'kardex-inventory') {
		params.flagKardexValued = this.$userInfo.company.settings.flagKardexValued;
	}
	const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
	const { name, lastname } = this.$userInfo;
	let labelReport = '';
	let urlReport = '';
	labelReport =
		code === 'kardex-inventory' ? 'REPORTE DETALLE DE INVENTARIO VALORIZADO' : null;
	urlReport =
		code === 'kardex-inventory' ? 'documents/rotation-calendar-inventory-kardex' : null;
	if (code !== 'kardex-inventory') {
		labelReport =
			code === 'kardex-list' ? 'REPORTE DE KARDEX VALORIZADO' : 'REPORTE DE ROTACIÓN';
		urlReport =
			code === 'kardex-list'
				? 'documents/rotation-calendar-valued-kardex'
				: 'documents/rotation-product';
	}
	let validFileName = code === 'kardex-inventory' ? `KARDEX-INVENTORY_${now}` : null;
	if (code !== 'kardex-inventory') {
		validFileName =
			code === 'kardex-list'
				? `KARDEX-VALUE_${now}`
				: `RR_${this.values.warehouseId || ''}_${this.params.startDate}_${
						this.params.endDate
				  }_${now}`;
	}
	if (code === 'report-rotation') {
		params.warehouseName = this.values.warehouseId;
	}
	const documentData = {
		filename: validFileName,
		extension: 'xlsx',
		comment: `${labelReport} generado por ${name} ${lastname} ${
			this.params.startDate
		} | ${this.params.endDate} / Producto: ${this.values.productId || ''} / Tienda: ${
			this.values.warehouseId || ''
		} / Categorias: ${this.values.categoryIds || ''}`,
		params,
	};
	try {
		await this.$httpReports.post(urlReport, documentData);
		this.showExcelGenerateMessage();
	} catch (error) {
		this.showGenericError();
	}
}

async function loadData(page = 1) {
	this.query.page = page;
	this.cleanFilters = false;
	if (this.disabled) {
		this.showGenericError(
			'La fecha inicial no debe ser mayor a la final y el rango no debe superar los 30 días'
		);
	} else {
		try {
			const params = this.params;
			params.categoryIds =
				this.params.categoryIds && this.params.categoryIds.length === 0
					? null
					: this.params.categoryIds;
			const { data: response } = await this.$httpProductsSales.post(
				'products/rotation',
				params,
				{
					params: this.query,
				}
			);
			this.totalItems = response.total;
			this.products = [...response.values];
			this.lastPage = response.lastPage;
		} catch (error) {
			this.showGenericError();
		}
	}
}

function onCleanFilter() {
	this.cleanFilters = true;
}

function setData({ model, value, name }) {
	if (model === 'categoryIds' || model === 'modulesIds' || model === 'brandIds') {
		this.params[model] = value.length ? value.map((cat) => cat.id) : undefined;
		this.values[model] = value.length ? value.map((cat) => cat.name) : [];
	} else {
		this.params[model] = value.id || value;
		this.values[model] = name || value.name || value;
	}
}

function validDisabled(val) {
	this.disabled = val;
}

function data() {
	return {
		cleanFilters: false,
		categories: [],
		warehouses: [],
		columns: [
			{
				id: 1,
				name: 'Cod.',
				value: 'code',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Cod. Alternos',
				value: 'inlineAlternateCode',
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
				name: '# Ingresos',
				value: 'countIn',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: '# Salidas',
				value: 'countOut',
				checked: true,
				visible: true,
			},
			{
				id: 6,
				name: 'Cant. Ingresos',
				value: 'totalIn',
				checked: true,
				visible: true,
			},
			{
				id: 7,
				name: 'Cant. Salidas',
				value: 'totalOut',
				checked: true,
				visible: true,
			},
			{
				id: 8,
				name: 'Unidad',
				value: 'codeUnit',
				checked: true,
				visible: true,
			},
			{
				id: 9,
				name: 'Rotación',
				value: 'rotation',
				checked: true,
				visible: true,
			},
		],
		values: {
			categoryIds: [],
			product: '',
			warehouseId: null,
		},
		currentPage: 1,
		disabled: false,
		headers: {},
		lastPage: 0,
		params: {
			categoryIds: undefined,
			endDate: null,
			startDate: null,
			warehouseId: null,
			productId: undefined,
			modulesIds: undefined,
		},
		products: [],
		options: [
			{ id: 1, code: 'report-rotation', name: 'Reporte Rotación' },
			{ id: 2, code: 'report-kardex', name: 'Reporte Kardex Valorizado' },
			{
				id: 3,
				code: 'kardex-inventory',
				name: 'Reporte Detalle Inventario Valorizado',
			},
		],
		totalItems: 0,
		query: {
			limit: 20,
			page: 1,
		},
	};
}

export default {
	name: 'report-rotation',
	components: {
		headerPage,
		reportsFilters,
		reportsRotationList,
	},
	data,
	methods: {
		changePage,
		downloadReportExcel,
		emitExcel,
		loadData,
		onCleanFilter,
		setData,
		validDisabled,
	},
};
</script>

<style scoped lang="scss">
.formula-container {
	position: relative;
	margin: 0 1rem 0.5rem;

	.formula-header {
		position: absolute;
		background: #ff5722;
		color: white;
		padding: 0.4rem 0.7rem;
		font-weight: 600;
		font-size: 12px;
		border-radius: 8px;
		top: -15px;
		left: -40px;
	}

	.formula-content {
		background: #f8f9fa;

		display: flex;
		align-items: center;
		padding: 1.2rem 0.75rem 0.75rem 0.75rem;
		background: white;
		gap: 0.6rem;
		font-size: 14px;
		border-radius: 12px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

		.formula-text {
			border: 1.2px solid #ddd;
			border-radius: 8px;
			background: #fff;
			display: flex;
			align-items: center;
			gap: 0.5rem;
			font-weight: 800;
			flex-grow: 1;
			padding: 0.15rem 0.5rem;

			.formula-label {
				color: #333;
				margin-right: 0.25rem;
			}

			.cant-salida {
				color: #17a2b8;
				font-weight: 600;
			}

			.division {
				color: #333;
				margin: 0 0.25rem;
			}

			.cant-entrada {
				color: #ff5722;
				font-weight: 600;
			}
		}

		.decimal-info {
			color: #999;
			font-size: 0.8rem;
		}
	}
}
</style>
