<template>
	<div class="pt-2 apply-discount">
		<v-flex>
			<app-table
				selectable
				class="mt-2"
				:columns="columns"
				:rows="data"
				:filterColumns="false"
				:includeFilter="false"
				:check-all="checkAll"
				:current-page="currentPage"
				:last-page="lastPage"
				dispatchDetail
				disabledValue="disabled"
				@on-search-event="onSearch"
				@row-is-selected="rowIsSelected"
				@on-selected-all="selectedAll"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)" class="is-not-selectable">
						{{ props.row.numbDocuments }}
					</td>
					<td v-show="showRow(columns, 2)" class="text-blue">
						{{ props.row.amount }}
					</td>
					<td v-show="showRow(columns, 3)">{{ props.row.dueAmount }}</td>
					<td v-show="showRow(columns, 4)">{{ props.row.amountAvaible }}</td>
					<td v-show="showRow(columns, 5)" class="width-quantity">
						<v-text-field
							no-resize
							single-line
							type="number"
							@click.stop="stopClick"
							:disabled="props.row.amountAvaible === 0"
							v-model.number="props.row.quantityCoupon"
							class="filter-select shadow-inset-table text-center"
							@input="setQuantityRow($event, props.row)"
						></v-text-field>
					</td>
				</template>
			</app-table>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				success-color="primary"
				:is-loading="disabled && validatedData"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="saveApplyCoupon"
			/>
		</section>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import appShowDialog from '@/components/shared/app-show-dialog';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function setCoupon({ model, value }) {
	this[model] = value;
}

function validatedData() {
	return this.data.some((p) => p.quantityCoupon);
}

function setQuantityRow(value, row) {
	this.$emit('set-quantity', value, row);
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : null;
	this.$emit('on-search', searchTrim);
}

function rowIsSelected(row) {
	this.$emit('row-is-select', row);
}

function selectedAll(value) {
	this.$emit('selected-all', value);
}

function stopClick() {
	return false;
}

function saveApplyCoupon() {
	this.$emit('save-apply-coupon');
}

function data() {
	return {
		cuopon: null,
		couponsSelecteds: [],
		dataSelected: [],
		columns: [
			{ id: 1, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 2, name: 'Monto', value: 'amount', visible: true, checked: true },
			{ id: 3, name: 'Monto Usado', visible: true, checked: true },
			{ id: 4, name: 'Monto Disponible', visible: true, checked: true },
			{ id: 5, name: 'Monto a Aplicar', visible: true, checked: true },
		],
		params: {
			search: null,
		},
		showDialog: false,
	};
}

export default {
	name: 'apply-discount-coupon',
	data,
	components: {
		appTable,
		appShowDialog,
		modalSidebarButton,
	},
	props: {
		data: {
			type: Array,
			default: () => [],
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		checkAll: {
			type: Boolean,
			default: false,
		},
		lastPage: {
			type: [String, Number],
			default: 0,
		},
		currentPage: {
			type: [String, Number],
			default: 1,
		},
	},
	methods: {
		rowIsSelected,
		saveApplyCoupon,
		selectedAll,
		setCoupon,
		setQuantityRow,
		stopClick,
		onSearch,
		validatedData,
	},
};
</script>

<style lang="scss" scoped>
.ft-10 {
	font-size: 10px;
}

.client_button {
	align-items: center;
	background: map-get($colors, primary);
	border-top-right-radius: 5px;
	border-bottom-right-radius: 5px;
	color: white;
	display: flex;
	font-size: 11px;
	height: 32px;
	padding: 6px 7px;
	position: relative;
	right: 5px;
	width: 95px;

	&--info {
		border-radius: 5px;
	}
}

.content-apply {
	background-color: #f4f4f4;
	font-family: map-get($fonts, open-regular);
}

.title-coupon {
	color: color(primary);
	font-size: 12px;
}

.content-coupon {
	border-radius: 4px;
	border: solid 0.5px color(primary);
	color: #8f8f8f;
	font-size: 14px;
	padding: 5px 8px;
	max-width: 190px;
}

.text-blue {
	color: #237bf5;
	font-family: map-get($fonts, open-semibold);
}

.text-center {
	text-align: center !important;
}

.width-quantity {
	width: 150px !important;
}
</style>
