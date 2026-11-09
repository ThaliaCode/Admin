<template>
	<v-card class="modal-lotes-sales">
		<v-card-title class="modal-items-title">
			Seleccione el documento de nota de credito
		</v-card-title>
		<v-divider></v-divider>
		<v-card-text>
			<app-table
				class="my-2"
				name="modal-select-ntc"
				:inputSearch="true"
				:filterColumns="true"
				:rows="rows"
				:selectable="selectable"
				:columns="columns"
				:last-page="lastPage"
				:items-quantity="rows.length"
				:items-total-quantity="itemsTotalQuantity"
				@on-page="changePage"
				:current-page="currentPage"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">
						{{ props.row.warehouseName || '-' }}
					</td>
					<td v-show="showRow(columns, 2)">{{ props.row.documentNumber }}</td>
					<td v-show="showRow(columns, 3)">
						{{
							props.row.dateDocument ||
							props.row.dateEmission | exactDate('DD-MM-YYYY HH:mm:ss', true)
						}}
					</td>
					<td v-show="showRow(columns, 4)">{{ props.row.amount | round }}</td>
					<td v-show="showRow(columns, 5)">
						<v-flex xs4 ml-3>
							<v-btn
								class="btn-action btn-auto btn-width-auto px-2 py-1"
								color="success"
								small
								@click="$emit('add-document-ntc', props.row)"
							>
								Seleccionar
							</v-btn>
						</v-flex>
					</td>
				</template>
			</app-table>
		</v-card-text>
		<v-card-actions class="modal-items-action py-3">
			<v-layout row wrap justify-center>
				<v-flex xs3 text-xs-center>
					<v-btn
						color="error"
						class="btn-action white--text"
						@click="$emit('close-modal')"
					>
						Cancelar
					</v-btn>
				</v-flex>
			</v-layout>
		</v-card-actions>
	</v-card>
</template>

<script>
import appDateSelect from '@/components/shared/app-date-select';
import appTable from '@/components/shared/table/app-table';

export default {
	name: 'modal-select-ntc',
	components: {
		appDateSelect,
		appTable,
	},
	props: {
		quantity: {
			type: Number,
			default: 0,
		},
		newLots: {
			type: Array,
			default: () => [],
		},
		idSupplier: {
			type: Number,
		},
		idCustomer: {
			type: Number,
		},
		typeDocument: {
			type: Array,
		},
		selectable: {
			default: false,
			type: Boolean,
		},
		isPurchase: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		return {
			columns: [
				{
					id: 1,
					name: 'Tienda',
					checked: true,
					visible: true,
				},
				{
					id: 2,
					name: '# Doc.',
					checked: true,
					visible: true,
				},
				{
					id: 3,
					name: 'Fecha de Compra',
					checked: true,
					visible: true,
				},
				{
					id: 4,
					name: 'Total Compra',
					checked: true,
					visible: true,
				},
				{
					id: 5,
					name: '',
					checked: true,
					visible: true,
				},
			],
			rows: [],
			currentPage: 1,
			lastPage: null,
			itemsTotalQuantity: 0,
			isNtc: null,
		};
	},
	created() {
		this.isNtc = this.typeDocument.find((d) => d.documentType.code === 'NTC');
		if (!this.isNtc) {
			this.showNotification('No tiene configurada Nota de Credito');
			return;
		}
		if (this.isPurchase) {
			this.loadPurchases();
		} else {
			this.columns[2].name = 'Fecha de Emisión';
			this.columns[3].name = 'Total de Venta';
			this.loadSales();
		}
	},
	methods: {
		async loadSales() {
			try {
				const params = {
					customerId: this.idCustomer,
					documentTypesNot: 'COT',
					currencies: this.$userInfo.company.currency,
					page: this.currentPage,
					limit: 10,
					sortField: 'created_at',
					typeDocumentIds: this.isNtc.comTypeDocumentId,
				};
				const { data: rows, headers } = await this.$httpSalesRead.get('sale-documents', {
					params,
				});
				// Se coloca 0 en flagTransfer para que no deshabilite la fila(solo es por estilos css)
				this.rows = rows.map((r) => ({
					...r,
					flagTransfer: 0,
				}));
				this.lastPage = Number(headers['x-last-page']);
				this.itemsTotalQuantity = Number(headers['x-quantity']);
			} catch (error) {
				if (error.status === 500) {
					this.showGenericError();
				}
			}
		},
		async loadPurchases() {
			try {
				const params = {
					paymentMethod: 2,
					flagUse: false,
					currencies: this.$userInfo.company.currency,
					supplierId: this.idSupplier,
					page: this.currentPage,
					limit: 10,
					sortDirection: 'desc',
					sortField: 'created_at',
					stateNotIds: '3,5',
				};
				const body = {
					typeDocumentIds: [this.isNtc.comTypeDocumentId],
				};
				const { data: rows, headers } = await this.$httpSales.post(
					'purchase-documents',
					body,
					{ params }
				);
				this.rows = rows;
				this.lastPage = Number(headers['x-last-page']);
				this.itemsTotalQuantity = Number(headers['x-quantity']);
			} catch (error) {
				if (error.status === 500) {
					this.showGenericError();
				}
			}
		},
		changePage(page) {
			this.currentPage = page;
			if (this.isPurchase) {
				this.loadPurchases();
			} else {
				this.loadSales();
			}
		},
	},
};
</script>

<style>
.modal-items-title {
	background-color: rgba(195, 231, 232, 0.21);
	color: color(primary);
	font-weight: 600;
	padding: 13px 29px;
	text-transform: uppercase;
}

.button {
	display: flex;
	width: 40%;
	justify-content: center;
	align-items: center;
	padding: 5px 0px;
	border-radius: 5px;
	color: color(primary);
	border: 2px solid color(primary);
	font-size: 14px;
	margin-left: 24px;
}
</style>
