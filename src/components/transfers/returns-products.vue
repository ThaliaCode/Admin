<template>
	<div>
		<app-table
			name="transfer-series"
			:columns="columns"
			:rows="dataSelect.details"
			:main-list="false"
			:input-search="false"
			class="is-not-selectable mt-5"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)" class="is-not-selectable">
					{{ props.row.product.code }}
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.product.name }}</td>
				<td v-show="showRow(columns, 2)">
					<v-select
						:items="typeDocuments"
						single-line
						item-text="name"
						item-value="code"
						bottom
						hide-details
						class="filter-select"
						v-model="props.row.typeDocumentCode"
						:disabled="true"
					></v-select>
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.product.unitName }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.devolution }}</td>
				<td v-show="showRow(columns, 6)">
					<app-tooltip-button
						v-if="
							props.row.additionalInformation &&
							props.row.additionalInformation.series &&
							props.row.additionalInformation.series.length
						"
						img="/static/img/icons/barcode.svg"
						:height="25"
						text="Control de series"
						@click-icon="openSeries(props.row)"
					/>
				</td>
			</template>
		</app-table>
		<div class="mx-4 content-total">
			Total {{ dataSelect.totalDetails.totalDevolution }}
		</div>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="disabled"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="sendAdjust"
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
				:flagReturn="flagReturn"
				@close="closeModal"
			/>
		</action-sidebar>
	</div>
</template>
<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import appSelect from '@/components/shared/app-select';
import actionSidebar from '@/components/shared/action-sidebar';
import viewSeries from '@/components/transfers/view-series';

async function sendAdjust() {
	this.disabled = true;
	const series = [];
	const array = this.dataSelect.details.map((d) => {
		if (d.additionalInformation && d.additionalInformation.seriesDevolution) {
			series.push(...d.additionalInformation.seriesDevolution);
		}
		const newData = {
			typeDocumentCode: d.typeDocumentCode,
			productId: d.productId,
			brandId: d.brandId,
			quantity: d.devolution,
			additionalInformation: {
				codeLot: d.additionalInformation ? d.additionalInformation.codeLot : null,
			},
		};
		return newData;
	});
	const body = { details: array, series: series.map((s) => s.id) };
	try {
		await this.$httpProducts.patch(`/transfers/${this.dataSelect.id}/adjust`, body);
		this.showNotification('La acción se realizó correctamente.');
		this.$emit('update');
	} catch (error) {
		this.showGenericError();
		this.disabled = false;
	}
}

function data() {
	return {
		data: [],
		columns: [
			{ id: 1, name: 'Cod', visible: true, checked: true },
			{ id: 2, name: 'Productos', visible: true, checked: true },
			{ id: 3, name: 'Tipo de Mov.', visible: true, checked: true },
			{ id: 4, name: 'UND', visible: true, checked: true },
			{ id: 5, name: 'Cantidad', visible: true, checked: true },
			{ id: 6, name: 'Acciones', visible: true, checked: true },
		],
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
		flagReturn: false,
	};
}

export default {
	name: 'returns-products',
	data,
	components: {
		appTable,
		modalSidebarButton,
		appSelect,
		viewSeries,
		actionSidebar,
	},
	methods: {
		sendAdjust,
		openSeries(row) {
			this.action.code = 'view-series';
			this.action.open = true;
			this.action.title = `${row.product.code}-${row.product.name} - SERIES`;
			this.action.width = 770;
			this.flagReturn = true;
			this.saleSeries = row;
			this.saleSeriesProduct = row.product;
		},
		closeModal() {
			this.idRow = null;
			this.action = { ...this.actionDefault };
		},
	},
	props: {
		typeDocuments: {
			type: Array,
			default: () => [],
		},
		dataSelect: {
			type: Object,
			default: () => {},
		},
	},
};
</script>
<style lang="scss" scoped>
.content-total {
	background: map-get($colors, content-color);
	font-family: map-get($fonts, open-bold);
	padding: 8px 10px 8px 8px;
	text-align: right;
}
</style>
