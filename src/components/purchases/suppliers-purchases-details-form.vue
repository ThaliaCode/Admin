<template>
	<div>
		<div class="overflow-auto mt-4">
			<app-table
				name="suppliers-purchases-details"
				:columns="columns"
				:main-list="false"
				:rows="rows"
				:input-search="false"
				class="is-not-selectable"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable"
						v-show="showRow(columns, 1)">
						{{ props.row.documentNumber }}
					</td>
					<td v-show="showRow(columns, 2)">
						{{ props.row.createdAt | formatDate('YYYY-MM-DD') }}
					</td>
					<td v-show="showRow(columns, 3)">
						{{ props.row.dateDocument | formatDate('YYYY-MM-DD') }}
					</td>
					<td v-show="showRow(columns, 4)">
						{{ props.row.statusName }}
					</td>
					<td v-show="showRow(columns, 5)">
						<app-tooltip-button
							v-if="props.row.entityState"
							:text="props.row.entityState.name"
							icon="fiber_manual_record"
							:color="props.row.entityStateId === 1 ? 'success' : 'error'"
						/>
					</td>
					<td v-show="showRow(columns, 6)">
						{{ props.row.amount | round }}
					</td>
					<td v-show="showRow(columns, 7)">
						{{ props.row.debtAmount | round }}
					</td>
				</template>
			</app-table>
		</div>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				hidden
				success-text="Cerrar"
				success-color="primary"
				@accept-button-clicked="close"
			/>
		</section>
	</div>
</template>

<script>

import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.loadData();
}

function close() {
	this.$emit('close');
}

async function loadData() {
	const params = { supplierId: this.id };
	try {
		({ data: this.rows } = await this.$httpSales.post('purchase-documents', {},
			{ params }));
		this.rows = this.rows.map((row) => {
			const newRow = { ...row };
			newRow.statusName = row.state ? row.state.name : '';
			return newRow;
		});
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function data() {
	return {
		columns: [
			{
				id: 1,
				name: 'Doc #',
				value: 'documentNumber',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'F. de Creación',
				value: 'createdAt',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'F. de Compra',
				value: 'dateDocument',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Estado',
				value: 'statusName',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'CTB',
				value: 'entityStateId',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Costo Total',
				value: 'amount',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Deuda',
				value: 'dueAmount',
				visible: true,
				checked: true,
			},
		],
		rows: [],
	};
}

export default {
	name: 'suppliers-purchases-details-form',
	components: {
		appTable,
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		close,
		loadData,
	},
	props: {
		id: {
			type: [Number, String],
		},
	},
};
</script>
