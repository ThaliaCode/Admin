<template>
	<div>
		<header-page
			:limit-title="35"
			:title="$route.meta.title"
			:number-bill="` - ${transferNumber}`"
			to-show
			:show-excel="false"
			:show-clean="false"
		>
			<v-flex class="body-2">
				Cantidad de Productos Transferidos: {{ total }}
			</v-flex>
			<v-btn
				color="success"
				class="btn-action btn-auto py-1 px-3 white--text ma-0"
				type="button"
				@click="exportExcel"
			>
				<v-icon left color="white" size="20">file_download</v-icon>
				<span style="font-size: 14px;">Descargar Excel</span>
			</v-btn>
		</header-page>
		<general-filter class="layout wrap pt-2 pb-3">
			<label class="body-1 pr-4 pt-3">
				<span class="primary--text lighten-1 body-2">Número:</span>
				{{ transferNumber }}
			</label>
			<label class="body-1 pr-4 pt-3">
				<span class="primary--text lighten-1 body-2">T. Origen:</span>
				{{ transfer.warehouseOrigin.name }}
			</label>
			<label class="body-1 pr-4 pt-3">
				<span class="primary--text lighten-1 body-2">T. Destino:</span>
				{{ transfer.warehouseDestination.name }}
			</label>
			<label class="body-1 pr-4 pt-3">
				<span class="primary--text lighten-1 body-2">Estado:</span>
				{{ transfer.statusName }}
			</label>
			<label class="body-1 pr-4 pt-3">
				<span class="primary--text lighten-1 body-2">Tipo de Doc:</span>
				{{ transfer.typeDocument.code }}
			</label>
			<label class="body-1 pr-4 pt-3">
				<span class="primary--text lighten-1 body-2">F. de Creación:</span>
				{{ transfer.createdAt | formatDate('YYYY-MM-DD') }}
			</label>
			<label class="body-1 pr-4 pt-3">
				<span class="primary--text lighten-1 body-2">Última Act.:</span>
				{{ transfer.updatedAt | formatDate('YYYY-MM-DD') }}
			</label>
			<label class="body-1 pt-3">
				<span class="primary--text lighten-1 body-2">F. de Anulación:</span>
				{{ transfer.cancelDate | formatDate('YYYY-MM-DD') }}
			</label>
		</general-filter>
		<transfers-detail-list
			:columns="columns"
			:rows="rows"
			@search-details="searchDetails"
			@open-series="openSeries"
		/>
		<action-sidebar
			:title="action.title"
			:value="action.open"
			:width="action.width"
			:code-action="action.code"
			@close-modal="closeModal"
		>
			<view-series
				v-if="action.code === 'view-series'"
				:product="transferProduct"
				:serie="transferSerie"
				@close="closeModal"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import XLSX from 'xlsx';
import generalFilter from '@/components/shared/general-filter';
import headerPage from '@/components/shared/header-page';
import transfersDetailList from '@/components/transfers/transfers-detail-list';
import actionSidebar from '@/components/shared/action-sidebar';
import controlSeries from '@/components/products/control-series';
import viewSeries from '@/components/transfers/view-series';

function created() {
	this.loadData();
}

async function loadData() {
	try {
		({ data: this.transfer } = await this.$httpProducts.get(
			`transfers/${this.id}`
		));
		this.transfer.typeDocument = this.transfer.typeDocument || {
			id: this.transfer.typeDocumentId,
		};
		this.transferNumber = `${this.transfer.serie}-${this.transfer.number}`;
		this.transfer.warehouseOrigin = this.transfer.warehouseOrigin || '';
		this.rows = [
			...this.transfer.details.map((detail) => {
				const newDetail = { ...detail };
				newDetail.brand = newDetail.brand || {};
				let quantity = 0;
				let stock = 0;
				if (Number(this.$route.query.status) === 2) {
					quantity = detail.clearanceAmountSent;
					stock = detail.createdStockSource;
				} else if (Number(this.$route.query.status) === 3) {
					quantity = detail.clearanceAmountSent - detail.devolution;
					stock = detail.deliveryStockSource;
				} else if (Number(this.$route.query.status) === 1) {
					stock = detail.createdStockOrigin;
					quantity = detail.quantity;
				} else {
					quantity = detail.quantity;
					stock = detail.createdStockSource;
				}
				newDetail.stockAvaible = detail.product
					? detail.product.stockWarehouse
					: 0;
				newDetail.viewQuantity = quantity;
				newDetail.viewStock = stock;
				this.total = this.total + quantity;
				return newDetail;
			}),
		];
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function searchDetails(searchValue) {
	this.localSearch = searchValue;
	if (searchValue) {
		const rowsFilter = this.rowsComplete.filter(
			(item) =>
				item.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1 ||
				item.code.toLowerCase().indexOf(searchValue.toLowerCase()) > -1 ||
				item.description.toLowerCase().indexOf(searchValue.toLowerCase()) > -1
		);
		this.rows = [...rowsFilter];
	} else {
		this.rows = [...this.rowsComplete];
	}
}

function openSeries(row) {
	this.action.code = 'view-series';
	this.action.open = true;
	this.action.title = `${row.product.code}-${row.product.name} - SERIES`;
	this.action.width = 700;
	this.transferSerie = row;
	this.transferProduct = row.product;
}

function closeModal() {
	this.action.code = null;
	this.action.open = false;
	this.action.title = '';
}

function exportExcel() {
	const mapRow = (row) => ({
		'Cod.': row.product ? row.product.code : '',
		'Cod. interno': row.product ? row.product.autoBarcode || row.product.internalCode || '' : '',
		Nombre: row.product ? row.product.name : '',
		Características: row.product ? row.product.inlineFeatures || row.product.features || '' : '',
		Descripción: row.product ? row.product.description : '',
		Marca: row.brand ? row.brand.name : '',
		Categoria: row.product && row.product.category ? row.product.category.name : '',
		'Cant.': row.viewQuantity || 0,
		Rechazados: row.devolution || 0,
		Motivo: row.reason || row.observation || '',
		Stock: row.stockAvaible !== undefined ? row.stockAvaible : row.viewStock || 0,
	});

	const rowsData = this.rows.map(mapRow);
	const ws = XLSX.utils.json_to_sheet(rowsData);
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, 'Productos Transferidos');
	XLSX.writeFile(wb, `transferencia-${this.transferNumber || this.id}.xlsx`);
}

function data() {
	return {
		columns: [
			{ id: 1, name: 'Cod.', visible: true, checked: true },
			{ id: 2, name: 'Cod. interno', visible: true, checked: true },
			{ id: 3, name: 'Nombre', visible: true, checked: true },
			{ id: 4, name: 'Características', visible: true, checked: true },
			{ id: 5, name: 'Descripción', visible: true, checked: true },
			{ id: 6, name: 'Marca', visible: true, checked: true },
			{ id: 7, name: 'Categoria', visible: false, checked: false },
			{ id: 8, name: 'Cant.', visible: true, checked: true },
			{ id: 9, name: 'Rechazados', visible: true, checked: true },
			{ id: 10, name: 'Motivo', visible: true, checked: true },
			{ id: 11, name: 'Stock', visible: true, checked: true },
			{ id: 12, name: 'Acciones', visible: true, checked: true },
		],
		localSearch: '',
		rows: [],
		rowsComplete: [],
		transfer: {
			typeDocument: {},
			warehouseDestination: {},
			warehouseOrigin: {},
		},
		transferNumber: '',
		action: {
			code: null,
			title: '',
			open: false,
			width: 700,
		},
		productSerie: null,
		total: 0,
		transferSerie: {},
		transferProduct: {},
	};
}

export default {
	name: 'pages-transfers-detail',
	components: {
		generalFilter,
		headerPage,
		transfersDetailList,
		actionSidebar,
		controlSeries,
		viewSeries,
	},
	created,
	data,
	methods: {
		loadData,
		searchDetails,
		openSeries,
		closeModal,
		exportExcel,
	},
	props: {
		id: [Number, String],
	},
};
</script>
