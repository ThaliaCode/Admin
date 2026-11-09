<template>
	<div>
		<header-page
			class="is-not-selectable"
			to-show
			:show-clean="false"
			show-excel
			:columns="columnsExcel"
			:rows="data"
			export-to-pdf
			:title="`${$route.meta.title} #${documentNumber}`"
			:limit-title="65"
			@download-dispatch="downloadPdf"
		>
		</header-page>
		<v-layout row wrap align-center px-4 mt-3>
			<v-flex xs3>
				<v-layout row wrap align-center px-2>
					<v-flex d-flex align-center pl-2 class="column-label">
						Fecha de Entrega:
					</v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ createdDetail | formatDate }}
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs3>
				<v-layout row wrap align-center px-2>
					<v-flex d-flex align-center pl-2 class="column-label">
						Tipo de Doc.:
					</v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ typeDocument }}
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs3>
				<v-layout row wrap align-center px-2>
					<v-flex d-flex align-center pl-2 class="column-label">
						Empleado:
					</v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ employeeName }}
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs3>
				<v-layout row wrap align-center px-2>
					<v-flex d-flex align-center pl-2 class="column-label">
						Número de Doc.:
					</v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ documentNumberHeader }}
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout row wrap align-center px-4 mt-3>
			<v-flex xs3>
				<v-layout row wrap align-center px-2>
					<v-flex d-flex align-center pl-2 class="column-label">
						Almacén:
					</v-flex>
					<v-flex d-flex align-center class="column-value">
						{{ warehouseNameHeader }}
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<app-table
			class="mt-4"
			:columns="columns"
			:current-page="currentPage"
			:rows="data"
			:last-page="lastPage"
			:items-quantity="data.length"
			:items-total-quantity="itemsTotalQuantity"
			:input-search="false"
			@on-page="changePage"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)" class="is-not-selectable">
					{{ props.row.documentNumber }}
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.documentType }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.productCode }}</td>
				<td v-show="showRow(columns, 4)">{{ props.row.productName }}</td>
				<td v-show="showRow(columns, 5)">
					<span v-if="props.row.quantityIn">{{ props.row.quantityIn }}</span>
					<span v-else>-</span>
				</td>
				<td v-show="showRow(columns, 6)">
					<span v-if="props.row.quantityOut">{{ props.row.quantityOut }}</span>
					<span v-else>-</span>
				</td>
				<td v-show="showRow(columns, 7)">
					<span v-if="props.row.quantityIn">{{
						props.row.createdAt | formatDate
					}}</span>
					<span v-else>-</span>
				</td>
				<td v-show="showRow(columns, 8)">
					<span v-if="props.row.quantityOut">{{
						props.row.createdAt | formatDate
					}}</span>
					<span v-else>-</span>
				</td>
				<td v-show="showRow(columns, 9)">{{ props.row.warehouseName }}</td>
				<td v-show="showRow(columns, 10)">
					<app-tooltip-button
						color="info"
						text="Ver Detalle"
						icon="remove_red_eye"
						@click-icon="viewDetail(props.row)"
					/>
				</td>
			</template>
		</app-table>
		<v-layout wrap mt-3>
			<v-flex xs12 pl-5 py-2 class="content-semi-green">
				<p class="my-0">Comentario</p>
			</v-flex>
			<v-flex xs12 pl-5 mt-3 class="commentary-text">
				{{ commentary }}
			</v-flex>
		</v-layout>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:header-color="action.color"
			:title="action.title"
			:width="action.width"
			v-model="action.open"
			@close-modal="cancelModal"
		>
			<app-commentaries-lotes
				v-if="action.code === 'COMMELOTS'"
				:show-additional="Boolean(currentProduct.productLots)"
				:disabledEdit="true"
				:disabled-edit-commentary="true"
				:product="currentProduct"
				@close-modal="cancelModal"
			/>
		</action-sidebar>
	</div>
</template>

<script>
import actionSidebar from '@/components/shared/action-sidebar';
import headerPage from '@/components/shared/header-page';
import appTable from '@/components/shared/table/app-table';
import appCommentariesLotes from '@/components/sales/subcomponents/commentaries-lotes';
import helper from '@/shared/helper';

const { showDownloadDialog, generateBlob } = helper;

function created() {
	this.idDetail = this.$route.params.id;
	this.loadDetailMovementKardex();
	this.columnsExcel = [
		...this.columns.slice(0, -1),
		{
			id: 10,
			name: 'Codigo de Lote',
			value: 'lot',
			visible: true,
			checked: true,
		},
		{
			id: 11,
			name: 'Ubicación',
			value: 'location',
			visible: true,
			checked: true,
		},
		{
			id: 12,
			name: 'Fecha de expiración',
			value: 'dueDate',
			visible: true,
			checked: true,
		},
	];
}

async function loadDetailMovementKardex() {
	this.params.page = this.currentPage;
	try {
		const response = await this.$httpProducts.get(
			`kardex/list-header/${this.idDetail}`,
			{ params: this.params }
		);
		const {
			details,
			aditionalInformation,
			documentNumber,
			entityName,
			createdAt,
			documentTypeName,
		} = response.data;
		this.data = details.map((p) => {
			const newRow = { ...p };
			const productLots = p.additionalInformation.productLots;
			const lotDeuDate = productLots
				? helper.formatDate(productLots.dateDue, 'YYYY-MM-DD HH:mm:ss')
				: null;
			newRow.dueDate = p.dueDate || lotDeuDate || null;
			newRow.location = productLots ? productLots.location : null;
			newRow.lot = productLots ? productLots.code : p.lot || null;
			newRow.dateFormatted = p.quantityIn
				? helper.formatDate(p.createdAt, 'YYYY-MM-DD HH:mm:ss')
				: null;
			newRow.outFormatted = p.quantityOut
				? helper.formatDate(p.createdAt, 'YYYY-MM-DD HH:mm:ss')
				: null;
			newRow.quantityOutValue = p.quantityOut ? p.quantityOut : '-';
			newRow.productCode = p.product ? p.product.code : '';
			newRow.productName = p.product ? p.product.name : '';
			newRow.warehouseName = p.additionalInformation
				? p.additionalInformation.warehouseName
				: '';
			return newRow;
		});
		this.typeDocument = documentTypeName || '';
		this.employeeName = entityName || '';
		this.createdDetail = createdAt || '';
		this.documentNumberHeader = documentNumber || '';
		this.warehouseNameHeader = aditionalInformation
			? aditionalInformation.warehouseName
			: '';
		this.documentNumber = documentNumber || '';
		this.commentary = aditionalInformation.commentary || '';
		this.lastPage = Number(response.headers['x-last-page']);
		this.itemsTotalQuantity = response.data.totalDetails;
	} catch (error) {
		console.log(error);
		this.showGenericError();
	}
}

function changePage(page) {
	this.currentPage = page;
	this.loadData();
}

function data() {
	return {
		action: {
			active: false,
			code: '',
			open: false,
			title: '',
			width: 380,
		},
		createdDetail: '',
		commentary: null,
		currentPage: 1,
		data: [],
		documentNumberHeader: null,
		columns: [
			{
				id: 1,
				name: '# DOC',
				value: 'documentNumber',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Documento',
				value: 'documentType',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Cod. Producto',
				value: 'productCode',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Producto',
				value: 'productName',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Entrada',
				value: 'quantityIn',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Salida',
				value: 'quantityOutValue',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Fecha de Entrega',
				value: 'dateFormatted',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Fecha de Salida',
				value: 'outFormatted',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Almacén',
				value: 'warehouseName',
				visible: true,
				checked: true,
			},
			{ id: 10, name: 'Acciones', visible: true, checked: true },
		],
		columnsExcel: [],
		documentNumber: null,
		employeeName: '',
		idDetail: null,
		itemsTotalQuantity: 0,
		lastPage: 0,
		params: {
			page: null,
		},
		typeDocument: '',
		warehouseNameHeader: '',
		currentProduct: null,
	};
}

export default {
	name: 'page-detail-movement-kardex',
	created,
	data,
	components: {
		appTable,
		headerPage,
		actionSidebar,
		appCommentariesLotes,
	},
	methods: {
		changePage,
		loadDetailMovementKardex,
		async downloadPdf() {
			try {
				const body = {
					id: this.idDetail,
					employeeName: this.employeeName,
					code: 'movement-kardex-details-pdf',
				};
				const { data: response } = await this.$httpProductsSales.post(
					'kardex/movement-kardex-pdf',
					body
				);
				const blob = generateBlob(response, 'text/html');
				this.showNotification('El reporte se generó correctamente');
				showDownloadDialog(blob, 'Reporte de Detalle de Movimiento Kardex');
			} catch (error) {
				this.showGenericError();
			}
		},
		cancelModal() {
			this.action.open = false;
			this.action.code = '';
		},
		viewDetail(product) {
			this.currentProduct = {
				...product,
				productLots: product.additionalInformation.productLots,
				commentary: product.additionalInformation.commentary,
				location: product.additionalInformation.location,
			};
			this.action = {
				active: true,
				code: 'COMMELOTS',
				open: true,
				title: 'Detalle del Producto',
				width: 450,
			};
		},
	},
};
</script>
