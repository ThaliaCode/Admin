<template>
	<div>
		<v-layout wrap px-2>
			<v-flex xs12 px-4 mt-3>
				<p>Cliente: {{ customerName }}</p>
			</v-flex>
			<v-flex xs12>
				<app-table
					name="products-sale-detail"
					:columns="columns"
					:rows="details"
					local-storage
					:input-search="false"
					:filter-columns="false"
					:main-list="false"
					class="is-not-selectable no-main-list">
					<template slot="rows" slot-scope="props">
						<td
							class="is-not-selectable"
							v-show="showRow(columns, 1)">{{ props.row.name }}
							({{props.row.code}})</td>
						<td v-show="showRow(columns, 2)">{{ props.row.quantity }}</td>
						<td v-show="showRow(columns, 3)">
							<v-text-field
								hide-details
								single-line
								type="number"
								min="0"
								v-model.number="props.row.devolution"
								@keyup="validateData(props.row)"
								class="filter-select shadow-inset width-min"
							></v-text-field>
						</td>
						<td
							class="py-1"
							v-show="showRow(columns, 4)">
							<v-text-field
								label="Motivo de devolución"
								v-model="props.row.reason"
								hide-details
								textarea
								no-resize
								single-line
								:disabled="props.row.readonly"
								class="filter-select shadow-inset textarea-content"
							></v-text-field>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabled"
				@accept-button-clicked="$emit('refund')"
				@cancel-button-clicked="$emit('cancel-button')"
			/>
		</section>
	</div>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function validateData({ id }) {
		const detailIndex = this.details.findIndex(detail => (detail.devolution > detail.quantity)
			|| (Number(detail.devolution) <= 0) || !detail.devolution);
		const toValidate = {
			id,
			details: this.details,
			disabled: detailIndex > -1,
		};
		this.$emit('validate-data', toValidate);
	}

	function disabled() {
		const nonProducts = this.details.length === 0;
		const moreToReturn = this.details.some(d => d.devolution > d.quantity);
		return nonProducts || moreToReturn;
	}

	function data() {
		return {
			columns: [
				{ id: 1, name: 'Nombre', value: 'name', visible: true },
				{ id: 2, name: 'Cantidad', value: 'quantity', visible: true },
				{ id: 3, name: 'Devolución', value: 'devolution', visible: true },
				{ id: 4, name: 'Motivo Devolución', value: 'reason', visible: true },
			],
		};
	}

	export default {
		name: 'refund-sale',
		components: {
			appTable,
			modalSidebarButton,
		},
		computed: {
			disabled,
		},
		data,
		methods: {
			validateData,
		},
		props: {
			customerName: String,
			details: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>
