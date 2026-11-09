<template>
	<div>
		<app-loading
			:show-loading="loadingGeneral"
			label="La carga terminará en un momento y podrás ver
			toda la información del detalle del inventario"
		/>
		<header-page
			name="detail-master-inventory"
			:title="titlePage"
			:show-clean="false"
			show-excel-menu
			:showExcel="false"
			btns-column="xs9"
			open-on-click
			to-show
			:options="options"
			@emit-excel="emitExcel"
		>
			<header-inventory :date-start="dateStart" :date-end="dateEnd" />
			<v-flex xs5>
				<v-layout align-center>
					<v-btn
						type="button"
						color="success"
						class="btn-action mr-3"
						@click="runAction({ code: 'import-excel' })"
					>
						Importar excel
					</v-btn>
					<a
						href="/static/excel/template-invetario-excel.xlsx"
						download="plantilla-conciliacion-bancaria"
						class="btn-download-excel-template mr-3"
					>
						Descargar Excel
					</a>
				</v-layout>
			</v-flex>
		</header-page>
		<app-actions
			:resource-uri="$route.name"
			:value-disabled="actionsDisabled"
			@run-action="runAction"
		/>
		<div class="px-4 mt-2" v-if="inventoryState !== 1">
			<v-flex xs4 mr-2>
				<v-layout wrap align-center>
					<span class="header-label mr-1">Total de costo (sin igv):</span>
					<span class="header-label total">
						{{ $userInfo.company.currencyDefault.symbol }}

						{{
							fatherInventory.additionalInformation &&
							fatherInventory.additionalInformation.totalCostInventory | round
						}}
					</span>
				</v-layout>
			</v-flex>
		</div>
		<div class="wrapper-legends px-4 mt-4">
			<div v-for="(legend, index) in legends" :key="index" class="d-flex mr-4">
				<div :style="`background-color: ${legend.color}`" class="wrapper-square"></div>
				<span>{{ legend.name }}</span>
			</div>
		</div>
		<div class="overflow-auto mt-0">
			<table-inventory
				:sum-cont="sumCont"
				:sum-stock="sumStock"
				:num-colum="numInventories"
				:list-product="products"
				:list-detail="inventoriesDetail"
				:inventory-status="inventoryState"
				:show-kardex-value="showKardexValue"
				:show-pagination="showPagination"
				:currentPage="currentPage"
				:last-page="lastPage"
				@on-page="onPage"
				@detail="openDetail"
				@change-select="changeSelect"
				@change-all="changeAll"
				@update-price-cost="updatePriceCost"
				:check-all="checkAll"
			></table-inventory>
		</div>
		<section class="modal-filter-footer">
			<v-layout wrap justify-center pt-3 pb-3>
				<v-flex xs12 sm1 pr-1>
					<v-btn
						class="btn-action btn-full caption white--text"
						color="pink"
						@click="back"
					>
						Atrás
					</v-btn>
				</v-flex>
				<v-flex xs12 sm2 pl-2 v-if="showKardexValue && showUpdate">
					<v-btn
						class="btn-action caption white--text btn-full"
						color="success"
						@click="updateInventory"
					>
						Actualizar Costo del Inventario
					</v-btn>
				</v-flex>
				<v-flex xs12 sm2 pl-2 v-if="showClose">
					<v-btn
						class="btn-action btn-full caption white--text"
						color="success"
						@click="closeInventory"
						:disabled="flagDisabled"
					>
						Cerrar Inventario
					</v-btn>
				</v-flex>
			</v-layout>
		</section>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:header-color="action.color"
			:title="action.title"
			:width="action.width"
			@close-modal="closeDetail"
			v-model="action.open"
		>
			<orders-import-excel
				v-if="action.code === 'import-excel'"
				:father-inventory="fatherInventory"
				@load-data="detailInventory"
				@close-modal="closeDetail"
			/>
			<detail-ubication
				:rows="detail"
				:inventors="inlineResponsibles"
				@close-modal="closeDetail"
				v-if="action.code === 'detail'"
			/>
			<status-inventory
				v-if="action.code === 'status-inventory'"
				:employees="employees"
				@send-status="sendStatus"
				@close-modal="closeDetail"
			/>
		</action-sidebar>
		<app-show-dialog
			:price-min="true"
			:valid-warehouse="false"
			:show-products="true"
			:products="productsValid"
			color-dialog="error"
			color-hex="#D5331A"
			title-header="Cerrar Inventario"
			:show-modal-init="showProductsInventory"
			:text-content="textValid"
			@close-dialog="closeNotification"
		/>
	</div>
</template>
<script>
import appActions from '@/components/shared/app-actions';
import appShowDialog from '@/components/shared/app-show-dialog';
import XLSX from 'xlsx';
import lib from '@/shared/lib';
import headerPage from '@/components/shared/header-page';
import tableInventory from '@/components/shared/table/table-inventory';
import headerInventory from '@/components/shared/header-inventory';
import actionSidebar from '@/components/shared/action-sidebar';
import detailUbication from '@/components/shared/inventories/detail-ubication';
import ordersImportExcel from '@/components/inventories/orders-import-excel';
import statusInventory from '@/components/inventories/status-inventory';
import helper from '@/shared/helper';

const { round } = lib;

const round3 = round(3);

function created() {
	this.showKardexValue = this.$userInfo.company.settings.flagKardexValued || false;
	this.loadingGeneral = true;
	this.detailInventory();
	this.loadEmployees();
	if (this.$route.params.row) {
		this.fatherInventory = JSON.parse(this.$route.params.row);
	}
	this.titlePage = this.isPeru
		? `INVENTARIO ${this.$route.params.id}`
		: `TOMA FÍSICA ${this.$route.params.id}`;
}

async function detailInventory() {
	const id = this.$route.params.id;
	const status = Number(this.$route.params.status);
	const params = {
		page: status === 2 ? this.currentPage : undefined,
		limit: status === 2 ? 1000 : undefined,
	};
	try {
		const response = await this.$httpProducts.get(`/inventories/father-summary/${id}`, {
			params,
		});
		this.fatherInventory = response.data;
		this.dateStart = helper.exactDate(response.data.createdAt);
		this.dateEnd = helper.exactDate(response.data.endDate);
		this.products = response.data.details.map((product) => {
			const newProduct = { ...product };
			newProduct.priceCost = product.priceCost ? round3(product.priceCost) : 0;
			newProduct.tightCount =
				(product.totalCount || product.computed) - product.adjustment;
			newProduct.difference = (newProduct.tightCount || 0) - product.stock;
			newProduct.select = false;
			newProduct.location = product.location || '-';
			return newProduct;
		});
		this.sumStock = response.data.totalQuantitySold
			? response.data.totalQuantitySold.totalStock
			: 0;
		this.sumCont = response.data.totalQuantitySold
			? response.data.totalQuantitySold.totalComputed
			: 0;
		this.inventories = response.data.inventories;
		this.numInventories = this.inventories.length;
		this.inventoryState = response.data.status;
		this.showClose = this.inventoryState === 1;
		this.lastPage = response.data.xLastPage;
		if (this.showKardexValue) {
			this.showUpdate =
				this.products.every((p) => p.priceCost === 0) && this.inventoryState === 1;
		}
		this.sameProduct();
	} catch (error) {
		this.loadingGeneral = false;
		if (error.status === 400) {
			if (error.data.message === 'INVENTORY_CHILD_NOT_FOUND') {
				this.showGenericError('No se han realizado conteos en este inventario');
				this.showKardexValue = false;
				this.showClose = false;
			}
		} else {
			this.showGenericError();
		}
	} finally {
		this.loadingGeneral = false;
	}
}

function sameProduct() {
	this.inventoriesDetail = this.inventories.map((inventory) => {
		const groupDetail = [];
		const detailGeneral = {
			responsable: [],
			products: [],
		};
		this.products.forEach((product) => {
			let flag = product.productId
				? inventory.details.filter(
						(i) => i.brandId === product.brandId && i.productId === product.productId
				  )
				: [];
			if (flag.length > 0) {
				let sum = 0;
				flag.forEach((detail) => {
					sum += detail.computed;
				});
				flag = flag.map((detail) => {
					const newEl = { ...detail };
					newEl.location = product.location;
					newEl.sumComputed = sum;
					newEl.color = '';
					if (newEl.statusReview === 2) {
						newEl.color = 'rgba(77, 198, 140, 0.28)';
					} else if (newEl.statusReview === 3) {
						newEl.color = 'rgba(255, 207, 98, 0.28)';
					} else if (newEl.statusReview === 5) {
						newEl.color = 'rgba(254, 107, 125, 0.29)';
					}
					return newEl;
				});
			}
			groupDetail.push(flag);
			detailGeneral.responsable = inventory.responsible;
			detailGeneral.inlineResponsibles = inventory.responsible.join(', ');
			detailGeneral.createdAt = inventory.createdAt;
			detailGeneral.products = groupDetail;
		});
		return detailGeneral;
	});
}

function back() {
	this.$router.go(-1);
}

async function closeInventory() {
	this.flagDisabled = true;
	const id = this.$route.params.id;
	try {
		await this.$httpProducts.patch(`inventories/${id}/close-father`);
		this.showNotification('El inventario se cerró correctamente');
		this.flagDisabled = false;
		this.back();
	} catch (error) {
		if (error.data.message === 'INVENTORY_CHILD_NOT_FOUND') {
			this.showGenericError('No se han realizado conteos en este inventario');
		} else if (error.data.message === 'INVENTORY_ALREADY_CLOSED') {
			this.showGenericError('El inventario se encuentra cerrado');
		} else if (error.data.message === 'INVENTORY_NEEDS_APPROVAL') {
			this.showGenericError(
				'Hay artículos de inventario que deben aprobarse, verifíquelos e inténtelo de nuevo.'
			);
		} else if (error.data.message === 'USER_NO_ACCESS') {
			this.showGenericError(
				'El usuario no tiene acceso para realizar esta acción, verifíquelo e inténtelo de nuevo.'
			);
		} else if (error.data.message === 'INVENTORY_PRODUCTS_REJECTED') {
			this.showProductsInventory = true;
			this.textValid = error.data.messageError;
			this.productsValid = error.data.details;
		} else {
			this.showGenericError();
		}
		this.flagDisabled = false;
	}
}

function openDetail(detail, inlineResponsibles) {
	this.detail = detail;
	this.inlineResponsibles = inlineResponsibles;
	this.action.open = true;
	this.action.width = 500;
	this.action.title = `${detail[0].codeProduct} - UBICACIÓN`;
	this.action.code = 'detail';
}

function closeDetail() {
	this.action.open = false;
	this.action.title = '';
	this.action.code = null;
}

function closeStatusSlide() {
	this.selects = [];
	this.closeDetail();
}

function changeSelect(product) {
	if (product.select) {
		this.selects.push(product);
	} else {
		const index = this.selects.findIndex((s) => s.productId === product.productId);
		if (index > -1) {
			this.selects.splice(index, 1);
		}
	}
	this.checkAll = this.products.every((p) => p.select);
}

function changeAll({ target }) {
	this.checkAll = target.checked;
	if (this.checkAll) {
		this.selects = [...this.products];
	} else {
		this.selects = [];
	}
	this.products = this.products.map((p) => {
		const newProduct = { ...p };
		newProduct.select = this.checkAll;
		return newProduct;
	});
}

function actionsDisabled() {
	const disabledActions = [
		{ code: 'status-inventory', disabled: !this.selects.length > 0 },
	];
	return disabledActions;
}

function runAction({ code }) {
	this.action.code = code;
	this.action.title = code === 'import-excel' ? this.fatherInventory.name : 'Estado';
	this.action.open = true;
}

async function loadEmployees() {
	const response = await this.$httpSales.get('employees');
	this.employees = response.data;
}

async function sendStatus(model) {
	const arrayProducts = this.selects.map((s) => {
		const newProduct = {};
		newProduct.productId = s.productId;
		newProduct.brandId = s.brandId;
		return newProduct;
	});
	const id = this.$route.params.id;
	const body = {
		commentary: model.commentary,
		products: arrayProducts,
	};
	const url = model.status === 5 ? 'rejections' : 'approvals';
	if (model.status === 5) {
		body.employeeId = model.employeeId;
	} else {
		body.status = model.status;
	}
	try {
		await this.$httpProducts.patch(`inventories/${id}/${url}`, body);
		this.showNotification('La acción se realizó correctamente');
		this.closeStatusSlide();
		this.detailInventory();
	} catch (error) {
		if (error.status === 400) {
			if (error.data.message === 'INVENTORY_ALREADY_CLOSED') {
				this.showGenericError('El inventario esta cerrado');
			}
		} else {
			this.showGenericError();
		}
	}
}

async function updateInventory() {
	const id = this.$route.params.id;
	const body = {
		details: this.products.map((e) => {
			const newRow = {
				brandId: e.brandId,
				productId: e.productId,
				priceCost: e.priceCost,
			};
			return newRow;
		}),
	};
	try {
		await this.$httpProducts.patch(`inventories/${id}/price`, body);
		this.showNotification('Los costos fueron actualizados correctamente.');
		this.showUpdate = false;
		this.showClose = true;
		this.detailInventory();
	} catch (error) {
		this.showGenericError();
	}
}

function updatePriceCost(row, value) {
	const index = this.products.findIndex((p) => p.productId === row.productId);
	if (index > -1) {
		this.showUpdate = true;
		this.showKardexValue = true;
		this.showClose = false;
		this.products[index].priceCost = Number(value);
	}
}

function closeNotification() {
	this.showProductsInventory = false;
	this.productsValid = [];
	this.textValid = '';
}

function onPage(page) {
	this.currentPage = page;
	this.detailInventory();
}

function data() {
	return {
		fatherInventory: {},
		currentPage: 1,
		showUpdate: false,
		inventoryState: 0,
		lastPage: 0,
		products: [],
		inventories: [],
		numInventories: 0,
		sameProducts: [],
		inventoriesDetail: [],
		dateStart: null,
		dateEnd: null,
		sumStock: 0,
		sumCont: 0,
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 500,
		},
		detail: [],
		inlineResponsibles: '',
		flagDisabled: false,
		loadingGeneral: false,
		titlePage: '',
		legends: [
			{ name: 'Rechazado', color: '#fe6b7d' },
			{ name: 'Observado', color: '#fdcc5e' },
			{ name: 'Aprobado', color: '#4dc68c' },
		],
		productsValid: [],
		checkAll: false,
		selects: [],
		employees: [],
		excelData: [],
		showProductsInventory: false,
		showClose: false,
		showPagination: true,
		showKardexValue: false,
		textValid: '',
		options: [
			{ id: 1, code: 'inventory', name: 'Reporte Detallado de Inventario' },
			// {
			// 	id: 2,
			// 	code: 'inventories-father-summary-xlsx',
			// 	name: 'Reporte Resumen de Inventario',
			// },
		],
	};
}
export default {
	name: 'detail-master-inventory',
	components: {
		appActions,
		appShowDialog,
		headerPage,
		tableInventory,
		headerInventory,
		actionSidebar,
		detailUbication,
		statusInventory,
		ordersImportExcel,
	},
	computed: {
		actionsDisabled,
	},
	created,
	data,
	methods: {
		back,
		changeAll,
		changeSelect,
		closeDetail,
		closeInventory,
		closeNotification,
		closeStatusSlide,
		detailInventory,
		loadEmployees,
		sameProduct,
		sendStatus,
		openDetail,
		onPage,
		runAction,
		generateInventoryExcel() {
			const name = this.inventoryState === 2 ? 'Stock Anterior' : 'Stock Actual';
			this.excelData = this.products.map((prod) => {
				const lastValue = prod.diff || prod.computed - prod.stock;
				const newProd = {
					'Código de Producto': prod.codeProduct,
					Nombre: prod.nameProduct,
					Conteo: prod.computed,
					'Ubicacion (Referencia)': prod.location,
					[name]: prod.stock,
					Ajuste: prod.adjustment,
					'Conteo Ajustado': prod.computed,
					Diferencia: lastValue,
					'Cost.Ant': prod.priceCost,
				};
				return newProd;
			});
			const dataExport = XLSX.utils.json_to_sheet(this.excelData);
			const woorkbook = XLSX.utils.book_new();
			const filename = `INV_${this.dateStart}_${this.dateEnd}`;
			XLSX.utils.book_append_sheet(woorkbook, dataExport, filename);
			XLSX.writeFile(woorkbook, `${filename}.xlsx`);
		},
		updateInventory,
		updatePriceCost,
		emitExcel(report) {
			const { code, name } = this.options.find((o) => o.code === report);
			const params = {
				inventoryId: this.fatherInventory.id,
				employeeId: this.fatherInventory.employeeId,
			};
			if (code === 'inventory') {
				this.generateInventoryExcel();
			} else {
				this.onEmitExcel(code, name, params);
			}
		},
	},
};
</script>
<style lang="scss" scoped>
.btn-download-excel-template {
	background-color: color(primary);
	border-radius: 5px;
	color: color(white);
	font-family: font(open-semibold);
	font-size: size(small10);
	padding: 7px 10px;
	text-decoration: none;
}
.wrapper-legends {
	display: flex;
	font-size: 11px;
}

.wrapper-square {
	height: 14px;
	margin-right: 5px;
	width: 14px;
}

.header-label {
	color: map-get($colors, background-sidebar);
	font-size: 14px !important;
	&.total {
		font-size: 18px !important;
		font-weight: bold;
	}
}
</style>
