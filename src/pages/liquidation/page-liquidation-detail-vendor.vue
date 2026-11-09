<template>
	<div>
		<header-page
			:caption-navigation="$route.meta.title"
			title="Ventas Junio - Vendedor 1"
			to-show
			:show-clean="false"
			:show-excel="false"
		>
			<v-btn
				class="btn-download-excel btn-auto py-1 px-1 mr-3"
				:disabled="false"
				@click="downloadPdf"
			>
				<img src="/static/img/icon-pdf.svg" height="17" class="align-img" />
			</v-btn>
		</header-page>
		<div class="mt-5">
			<app-table
				class="mb-0 is-not-selectable"
				name="inventories-list-master"
				:columns="columns"
				:rows="data"
				:items-quantity="data.length"
				:current-page="currentPage"
				:last-page="lastPage"
				:items-total-quantity="totalItems"
				@on-search-event="searchEvent"
				@on-page="changePage"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">
						<a
							:href="`/sales/convert/${props.row.documentId}`"
							target="_blank"
							>{{ props.row.documentNumber }}</a
						>
					</td>
					<td v-show="showRow(columns, 2)">
						{{ props.row.orderNumber || '-' }}
					</td>
					<td v-show="showRow(columns, 3)">
						{{ props.row.productCode || '-' }}
					</td>
					<td v-show="showRow(columns, 4)">
						{{ props.row.description || '-' }}
					</td>
					<td v-show="showRow(columns, 5)">
						{{ props.row.unitName || '-' }}
					</td>
					<td v-show="showRow(columns, 6)">{{ props.row.total || '-' }}</td>
					<td v-show="showRow(columns, 7)">
						{{ props.row.quantity || '-' }}
					</td>
					<td v-show="showRow(columns, 8)">{{ props.row.earnedComission }}</td>
				</template>
			</app-table>
			<v-layout row wrap px-4 py-1>
				<v-flex xs12 class="totals-section d-flex text-xs-center">
					<v-flex class="subtotal">
						<span>Total de las ventas totales: </span>
						<span class="ml-2"
							>{{ currencySymbol }}
							{{
								detailVendor && detailVendor.totalSales
									? detailVendor.totalSales
									: 0
							}}</span
						>
					</v-flex>
					<v-flex class="subtotal">
						<span>Total de las comisiones ganadas: </span>
						<span class="ml-2"
							>{{ currencySymbol }}
							{{
								detailVendor && detailVendor.totalEarnedComission
									? detailVendor.totalEarnedComission
									: 0
							}}</span
						>
					</v-flex>
				</v-flex>
			</v-layout>
		</div>
		<div class="grid-container">
			<!-- Primera fila -->
			<div class="grid-item grid--color grid--size">
				<b
					>Llegaste a {{ currencySymbol }}
					{{
						detailVendor && detailVendor.totalSales
							? detailVendor.totalSales
							: 0
					}}
					en ventas, tu sueldo base es:</b
				>
			</div>
			<div class="grid-item grid--color">
				{{ currencySymbol }}
				{{
					detailVendor && detailVendor.baseSalary ? detailVendor.baseSalary : 0
				}}
			</div>
			<!-- Segunda fila -->
			<div class="grid-item"><b>Total de comisiones ganadas:</b></div>
			<div class="grid-item">
				{{ currencySymbol }}
				{{
					detailVendor && detailVendor.totalEarnedComission
						? detailVendor.totalEarnedComission
						: 0
				}}
			</div>
			<!-- Tercera fila -->
			<div class="grid-item grid--color"><b>Total a pagar:</b></div>
			<div class="grid-item grid--color">
				{{ currencySymbol }}
				{{ detailVendor && detailVendor.totalPay ? detailVendor.totalPay : 0 }}
			</div>
		</div>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				hidden
				:img="false"
				padding-success="px-5 py-2"
				success-color="primary"
				success-text="Volver"
				@accept-button-clicked="goBack"
			/>
		</section>
	</div>
</template>
<script>
import headerPage from '@/components/shared/header-page';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import appTable from '@/components/shared/table/app-table';
import { format } from 'date-fns';

function data() {
	return {
		columns: [
			{ id: 1, name: 'Documento de venta', visible: true, checked: true },
			{ id: 2, name: 'Numero de pedido', visible: true, checked: true },
			{
				id: 3,
				name: 'Codigo Prod.',
				tooltip: 'Codigo del Producto',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Nombre Prod.',
				tooltip: 'Nombre del Producto',
				visible: true,
				checked: true,
			},
			{ id: 5, name: 'Unidad', visible: true, checked: true },
			{ id: 6, name: 'Venta total', visible: true, checked: true },
			{ id: 7, name: 'Total de Productos', visible: true, checked: true },
			{ id: 8, name: 'Comisión ganada', visible: true, checked: true },
		],
		data: [],
		detailVendor: null,
		lastPage: 0,
		totalItems: 0,
		currentPage: 1,
		dataGeneral: [],
		currencySymbol: this.$userInfo.company.currencyDefault.symbol,
		params: {
			page: 1,
			search: null,
		},
	};
}

async function loadData() {
	try {
		const { data: dataGeneral } = await this.$httpSettlement.get(
			`/settlements/${this.id}/employee-details`
		);

		if (dataGeneral) {
			dataGeneral.totalPay =
				dataGeneral.totalEarnedComission + dataGeneral.baseSalary || 0;
			this.detailVendor = dataGeneral;
		}
	} catch (err) {
		this.showGenericError();
	}
}

export default {
	name: 'liquidation-detail-vendor',
	data,
	created() {
		this.loadData();
		this.loadRows();
	},
	components: {
		headerPage,
		appTable,
		modalSidebarButton,
	},
	methods: {
		loadData,
		searchEvent(value) {
			const search = value ? value.trim() : null;
			this.params.search = search;
			this.loadRows();
		},
		async loadRows() {
			try {
				const { data: row } = await this.$httpSettlement.get(
					`/settlements/${this.id}/employee-detail-list`,
					{ params: this.params }
				);
				this.lastPage = Math.ceil(row.total / row.itemsPerPage);
				this.totalItems = row.total;
				if (row) {
					this.data = row.data;
				}
			} catch (error) {
				this.showGenericError();
			}
		},
		goBack() {
			this.$router.go(-1);
		},
		changePage(page) {
			this.currentPage = page;
			this.params.page = page;
			this.loadRows();
		},
		async downloadPdf() {
			try {
				const now = format(new Date(), 'YYYY_MM_DD_HH_mm_ss');
				const { name, lastname, companyId } = this.$userInfo;
				const documentData = {
					filename: `Reporte_Liquidacion_De_Empleado ${now}`,
					extension: 'pdf',
					comment: `Reporte_Liquidacion_De_Empleado generado por ${name || ''} ${lastname || ''}_${companyId || ''}`,
					params: {
						settlementId: this.detailVendor ? this.detailVendor.settlementId : null,
						employeeId: this.detailVendor ? this.detailVendor.employeeId : null,
					},
				};
				await this.$httpReports.post('documents/liquidation-detail-vendor', documentData);
				this.notificationReport('Reporte_Liquidacion_De_Empleado');
			} catch (error) {
				this.showGenericError();
			}
		},
	},
	props: {
		id: [Number, String],
	},
};
</script>
<style lang="scss" scoped>
.grid-container {
	display: grid;
	grid-template-columns: 2fr 0.5fr;
	margin: 40px 25%;
}

.grid-item {
	padding: 20px;
	border: 1.5px solid color(primary);
	color: color(primary);
}
.grid-item:nth-child(even) {
	text-align: end;
}

.grid-item:nth-child(odd) {
	text-align: end;
}
.grid--color {
	background-color: #d8e9e9;
}
</style>
