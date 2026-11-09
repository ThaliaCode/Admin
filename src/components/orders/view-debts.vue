<template>
	<section>
		<v-layout wrap>
			<v-flex class="xs12 mt-3">
				<app-table
					name="view-debts"
					:columns="columns"
					:rows="data"
					:current-page="currentPage"
					:items-quantity="data.length"
					:last-page="lastPage"
					:items-total-quantity="itemsTotalQuantity"
					@on-search-event="onSearch"
					@on-page="loadData"
				>
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)">{{ props.row.documentNumber }}</td>
						<td v-show="showRow(columns, 2)">
							{{ props.row.createdAt | formatDate }}
						</td>
						<td v-show="showRow(columns, 3)">
							{{ props.row.typeDocument.name }}
						</td>
						<td v-show="showRow(columns, 4)">
							{{ props.row.employee ? props.row.employee.fullname : null }}
						</td>
						<td v-show="showRow(columns, 5)">
							<document-state
								:color="props.row.state.color"
								:tooltip="props.row.state.name"
							/>
						</td>
						<td v-show="showRow(columns, 6)">
							<document-state
								:color="props.row.paymentStateColor"
								:tooltip="props.row.paymentStateName"
							/>
						</td>
						<td v-show="showRow(columns, 7)">{{ props.row.payment.name }}</td>
						<td v-show="showRow(columns, 8)">{{ props.row.dueAmount }}</td>
						<td v-show="showRow(columns, 9)">
							{{ props.row.debtAmount | round }}
						</td>
						<td v-show="showRow(columns, 10)">
							{{ props.row.amount | round }}
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:hidden-save-btn="true"
				@cancel-button-clicked="$emit('close-modal')"
			/>
		</section>
	</section>
</template>
<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import documentState from '@/components/shared/document-state';

function data() {
	return {
		columns: [
			{
				id: 1,
				name: '# Doc',
				value: 'documentNumber',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Fecha creación',
				value: 'createdAt',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Tipo de documento',
				value: 'typeDocument.name',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Empleado',
				value: 'employee.name',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Est. Despacho',
				value: 'state.name',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Est. Pago',
				value: 'state.name',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Tipo de Pago',
				value: 'payment.name',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Saldo Abonado',
				value: 'dueAmount',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Deuda',
				value: 'debt',
				visible: true,
				checked: true,
			},
			{
				id: 10,
				name: 'Total',
				value: 'amount',
				visible: true,
				checked: true,
			},
		],
		data: [],
		params: {
			search: null,
			page: 1,
			limit: 20,
		},
		currentPage: 1,
		lastPage: 0,
		itemsTotalQuantity: 0,
	};
}
function created() {
	this.loadData();
}

export default {
	name: 'view-debts',
	data,
	created,
	components: {
		appTable,
		documentState,
		modalSidebarButton,
	},
	methods: {
		onSearch(searchValue) {
			const searchTrim = searchValue ? searchValue.trim() : null;
			this.params.search = searchTrim;
			this.loadData();
		},
		async loadData(page = 1) {
			this.currentPage = page;
			this.params.page = this.currentPage;
			try {
				const params = {
					...this.params,
					customerId: this.customerId,
				};
				const { data: sales, headers } = await this.$httpSalesRead.get(
					'sale-documents/amortization-all',
					{ params }
				);
				this.itemsTotalQuantity = Number(headers['x-quantity']);
				this.lastPage = Number(headers['x-last-page']);
				this.data = sales;
			} catch (err) {
				this.showGenericError();
			}
		},
	},
	props: {
		customerId: [Number, String],
	},
};
</script>
