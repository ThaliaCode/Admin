<template>
	<div>
		<app-table
			class="is-not-selectable mb-0"
			padding="px-0"
			:columns="columns"
			:input-search="false"
			:rows="rows"
			:caption-quantity="false"
			local-search
			@on-local-search="$emit('on-local-search', $event)"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">
					{{ props.row.order }}
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.title }}</td>
				<td v-show="showRow(columns, 3)">
					<img
						v-if="props.row.urlImage"
						:src="props.row.urlImage"
						:alt="props.row.title"
						class="table-image"
					/>
					<span v-else>-</span>
				</td>
				<td v-show="showRow(columns, 4)">{{ props.row.name }}</td>
				<td v-show="showRow(columns, 5)">
					<app-tooltip-button
						color="success"
						icon="edit"
						text="Editar"
						@click-icon="$emit('click-icon', { code: 'edit', row: props.row })"
					/>
					<app-tooltip-button
						color="error"
						icon="delete"
						text="Eliminar"
						@click-icon="
							$emit('click-icon', { code: 'delete', row: props.row })
						"
					/>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';

function data() {
	return {
		columns: [
			{
				id: 1,
				name: 'Orden',
				value: 'order',
				checked: true,
				visible: true,
			},
			{
				id: 2,
				name: 'Título',
				value: 'title',
				checked: true,
				visible: true,
			},
			{
				id: 3,
				name: 'Imagen',
				value: 'urlImage',
				checked: true,
				visible: true,
			},
			{
				id: 4,
				name: 'Sección',
				value: 'name',
				checked: true,
				visible: true,
			},
			{
				id: 5,
				name: 'Acciones',
				checked: true,
				visible: true,
				flagVisible: true,
			},
		],
	};
}

export default {
	name: 'assign-sections-list',
	components: {
		appTable,
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

<style lang="scss" scoped>
.table-image {
	border: 1px solid map-get($colors, primary);
	border-radius: 8px;
	max-width: 95px;
}
</style>
