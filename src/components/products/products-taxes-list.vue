<template>
	<div>
		<v-layout wrap pa-4>
			<v-flex xs12 mb-3>
				<label class="title">Impuestos:</label>
			</v-flex>
			<v-flex xs12>
				<app-table
					class="is-not-selectable no-main-list"
					:columns="columns"
					:filter-columns="false"
					:input-search="false"
					:main-list="false"
					name="products-taxes-list"
					padding="px-0"
					:rows="rows"
				>
					<template slot="rows" slot-scope="props">
						<td class="is-not-selectable">{{ props.row.name }}</td>
						<td>{{ props.row.percentage }}%</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				hidden
				success-color="blue"
				success-text="Cerrar"
				@accept-button-clicked="$emit('close')"
			/>
		</section>
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
					name: 'Nombre',
					value: 'name',
					visible: true,
				},
				{
					id: 2,
					name: 'Porcentaje',
					value: 'percentage',
					visible: true,
				},
			],
		};
	}

	export default {
		name: 'products-taxes-list',
		components: {
			appTable,
			modalSidebarButton,
		},
		data,
		props: {
			rows: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>
