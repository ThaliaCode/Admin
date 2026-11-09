<template>
	<v-dialog v-model="open" persistent max-width="625">
		<v-card class="modal">
			<v-card-title class="title-card justify-center text-center">
				<span class="title-text"
					>Productos que no cuentan con stock suficiente</span
				>
			</v-card-title>
			<v-divider></v-divider>
			<v-card-text>
				<div class="mesage-error pa-2">{{ message }}</div>
				<app-table
					class="pa-0 mb-4 mt-2"
					name="products-witchout-stock"
					:inputSearch="false"
					:filterColumns="false"
					:rows="details"
					:selectable="false"
					:show-pagination="true"
					:columns="columnsStock"
				>
					<template slot="rows" slot-scope="props">
						<td class="is-not-selectable">
							{{ props.row.code }}
						</td>
						<td>{{ props.row.name || '-' }}</td>
						<td>{{ props.row.stock }}</td>
						<td>
							{{ props.row.warehouseName || '-' }}
						</td>
					</template>
				</app-table>
			</v-card-text>
			<v-card-actions class="justify-center pb-3">
				<v-btn
					class="btn-action"
					color="pink"
					type="button"
					@click="$emit('close-modal')"
					small
				>
					Atras
					<v-icon color="white" size="16" class="ml-1"> highlight_off </v-icon>
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import appTable from '@/components/shared/table/app-table';

export default {
	name: 'modal-stock-error',
	data() {
		return {
			columnsStock: [
				{
					id: 1,
					name: 'Código',
					value: 'code',
					checked: true,
					visible: true,
				},
				{
					id: 2,
					name: 'Nombre',
					value: 'name',
					checked: true,
					visible: true,
				},
				{
					id: 3,
					name: 'Stock',
					value: 'stock',
					checked: true,
					visible: true,
				},
				{
					id: 4,
					name: 'Tienda',
					value: 'warehouseName',
					checked: true,
					visible: true,
				},
			],
		};
	},
	props: {
		open: {
			default: false,
			type: Boolean,
		},
		details: {
			type: Array,
			default: () => [],
		},
		message: {
			type: String,
		},
	},
	components: {
		appTable,
	},
};
</script>

<style scoped>
.mesage-error {
	color: red;
	font-size: 0.8rem;
}

.title-card {
	background-color: #f8f8f8;
	border-bottom: 1px solid #e0e0e0;
	padding: 16px;
	font-weight: bold;
}
.title-text {
	font-size: 1rem;
	color: #333;
}
</style>
