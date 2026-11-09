<template>
	<div>
		<v-layout wrap row>
			<v-flex xs12 pa-4>
				<p>
					<span class="label-text">Destino: </span
					>{{ data.warehouseSourceName }}
				</p>
			</v-flex>
			<v-flex xs12>
				<app-table
					name="transfer-series"
					:columns="columns"
					:rows="data.details"
					:main-list="false"
					:input-search="false"
					class="is-not-selectable"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)" class="is-not-selectable">
							{{ props.row.product.name }}
						</td>
						<td v-show="showRow(columns, 2)">
							{{ props.row.clearanceAmountSent }}
						</td>
						<td v-show="showRow(columns, 3)" class="text-number">
							<v-text-field
								hide-details
								single-line
								:disabled="validateSeries"
								v-model="props.row.devolution"
								type="number"
								class="filter-select"
							></v-text-field>
						</td>
						<td v-show="showRow(columns, 4)">
							<v-text-field
								hide-details
								single-line
								v-model="props.row.reason"
								class="filter-select"
							></v-text-field>
						</td>
						<td v-show="showRow(columns, 5)">
							<app-tooltip-button
								v-if="props.row.additionalInformation.series"
								img="/static/img/icons/barcode.svg"
								:height="25"
								text="Control de series"
								@click-icon="openSeries(props.row)"
							/>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="disabled"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="finalizeTransfer"
			>
			</modal-sidebar-button>
		</section>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			:help-actions="actionsToHelp"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<view-series
				v-if="action.code === 'view-series'"
				:product="saleSeriesProduct"
				:serie="saleSeries"
				:flag="flagSeries"
				:text-alert="alertText"
				@send-series="sendSeries"
				@close="closeModal"
			/>
		</action-sidebar>
	</div>
</template>
<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import actionSidebar from '@/components/shared/action-sidebar';
import viewSeries from '@/components/transfers/view-series';

function created() {
	const newDate = new Date();
	this.dateOnline = newDate.getTime().toString();
}

async function finalizeTransfer() {
	const invalidRow = this.data.details.find((d) => {
		const value = Number(d.devolution);
		return value < 0 || value > d.clearanceAmountSent;
	});
	if (invalidRow) {
		this.showNotification(
			'El monto de devolucion ingresado no es válido.',
			'warning',
		);
		return;
	}
	this.disabled = true;
	const array = this.data.details.map((d) => {
		const newRow = {
			additionalInformation: {
				seriesDevolution: d.product.series || null,
				codeLot: d.additionalInformation ? d.additionalInformation.codeLot : null,
			},
			dateOnline: this.dateOnline,
			code: d.product.code,
			productId: d.productId,
			devolution: Number(d.devolution),
			reason: d.reason,
			status: d.status,
			brandId: d.brandId,
		};
		return newRow;
	});
	const body = { details: array };
	try {
		await this.$httpProducts.patch(`transfers/${this.id}/finished`, body);
		this.showNotification('Se realizó la acción correctamente');
		this.disabled = false;
		this.$emit('close-modal');
	} catch (error) {
		this.showGenericError();
		this.disabled = false;
	}
}
function data() {
	return {
		alertText: null,
		columns: [
			{ id: 1, name: 'Nombre', visible: true, checked: true },
			{ id: 2, name: 'Cantidad', visible: true, checked: true },
			{ id: 3, name: 'Rechazo', visible: true, checked: true },
			{ id: 4, name: 'Motivo de Rechazo', visible: true, checked: true },
			{ id: 5, name: 'Acciones', visible: true, checked: true },
		],
		rows: [],
		disabled: false,
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 0,
		},
		actionDefault: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 0,
		},
		flagSeries: false,
		validateSeries: false,
	};
}
export default {
	name: 'transfers-end',
	components: {
		appTable,
		modalSidebarButton,
		viewSeries,
		actionSidebar,
	},
	created,
	data,
	methods: {
		finalizeTransfer,
		openSeries(row) {
			this.action.code = 'view-series';
			this.action.open = true;
			this.action.title = 'SERIES A RECHAZAR';
			this.alertText = `Seleccione las series a rechazar de ${row.product.name}`;
			this.action.width = 770;
			this.flagSeries = true;
			this.saleSeries = row;
			this.saleSeriesProduct = row.product;
		},
		closeModal() {
			this.idRow = null;
			this.action = { ...this.actionDefault };
		},
		sendSeries(rowSeries, id, sumSeries) {
			this.validateSeries = Boolean(rowSeries.length);
			const index = this.data.details.findIndex((p) => p.productId === id);
			if (index > -1) {
				this.data.details[index].product.series = rowSeries;
				this.data.details[index].devolution = sumSeries;
			}
			this.closeModal();
		},
	},
	props: {
		id: [Number, String],
		data: {
			type: Object,
			default: () => {},
		},
	},
};
</script>
<style lang="scss" scoped>
.text-number {
	width: 30px;
}

.label-text {
	color: map-get($colors, background-sidebar);
}
</style>
