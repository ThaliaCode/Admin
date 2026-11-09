<template>
	<div>
		<v-flex pt-3>
			<app-table
				:input-search="false"
				class="is-not-selectable mb-0"
				name="history-products"
				:columns="columns"
				:rows="rows"
				:last-page="lastPage"
				:current-page="currentPage"
				:caption-quantity="false"
				@on-page="$emit('change-page')"
			>
				<template slot="rows" slot-scope="props">
					<td class="is-not-selectable" v-show="showRow(columns, 1)">
						{{ props.row.createdAtRecord }}
					</td>
					<td class="is-not-selectable" v-show="showRow(columns, 2)">
						<router-link
							v-if="props.row.documentId"
							target="_blank"
							:to="{ name: 'purchase-detail', params: { id: props.row.documentId } }"
							class="text-decoration-none"
						>
							{{ props.row.serie }} - {{ props.row.number }}
						</router-link>
						<span v-else> {{ props.row.serie }} - {{ props.row.number }} </span>
					</td>
					<td class="is-not-selectable" v-show="showRow(columns, 3)">
						{{ props.row.name }}
					</td>
					<td class="is-not-selectable" v-show="showRow(columns, 4)">
						{{ props.row.quantity }}
					</td>
					<td class="is-not-selectable" v-show="showRow(columns, 5)">
						{{ props.row.tax }}
					</td>
					<td class="is-not-selectable" v-show="showRow(columns, 6)">
						{{ props.row.currency }}
					</td>
					<td class="is-not-selectable" v-show="showRow(columns, 7)">
						{{ props.row.price | round }}
					</td>
					<td class="is-not-selectable" v-show="showRow(columns, 8)">
						{{ props.row.taxAmount | round }}
					</td>
					<td class="is-not-selectable" v-show="showRow(columns, 9)">
						{{ props.row.unitPrice | round }}
					</td>
					<td class="is-not-selectable" v-show="showRow(columns, 10)">
						{{ props.row.total | round }}
					</td>
				</template>
			</app-table>
			<section class="modal-filter-footer pt-2 pb-2">
				<modal-sidebar-button
					:hiddenSaveBtn="true"
					@cancel-button-clicked="$emit('close-modal')"
				/>
			</section>
		</v-flex>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function data() {
	return {
		columns: [
			{
				id: 1,
				name: 'Fecha/Hora',
				value: 'createdAt',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Serie - #',
				value: 'createdAt',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Proovedor',
				value: 'createdAt',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Cant',
				value: 'createdAt',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'IMP %',
				value: 'createdAt',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'Moneda',
				value: 'currency',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Cost. sin IGV',
				value: 'createdAt',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'IMP',
				value: 'createdAt',
				tooltip: 'Impuesto',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Cost. con IGV',
				tooltip: 'Precio Unitario',
				value: 'createdAt',
				visible: true,
				checked: true,
			},
			{
				id: 10,
				name: 'Total',
				value: 'createdAt',
				visible: true,
				checked: true,
			},
		],
		currentPage: 1,
		lastPage: 0,
	};
}

export default {
	name: 'history-products',
	components: {
		appTable,
		modalSidebarButton,
	},
	props: {
		rows: {
			type: Array,
			default: () => [],
		},
	},
	data,
};
</script>
