<template>
	<div>
		<app-table
			class="is-not-selectable mt-5"
			name="products-sections-list"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="rows"
			@on-page="$emit('on-page', $event)"
			@on-search-event="$emit('on-search', $event)"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)"
					class="is-not-selectable">{{ props.row.order }}</td>
				<td v-show="showRow(columns, 2)">{{ props.row.name }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.description }}</td>
				<td
					class="td-action"
					v-show="showRow(columns, 4)"
					@click.stop="stopClick"
				>
					<v-tooltip top>
						<v-switch
							slot="activator"
							class="switch-inline"
							hide-details
							color="success"
							:disabled="loading"
							v-model="props.row.flagActive"
							@change="$emit('on-switch', props.row)"
						></v-switch>
						<span>{{ stateName(props.row) }}</span>
					</v-tooltip>
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
						@click-icon="$emit('click-icon', { code: 'delete', row: props.row })"
					/>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';

	function stateName({ flagActive }) {
		return flagActive ? 'Activa' : 'Inactiva';
	}

	export default {
		name: 'products-sections-list',
		components: {
			appTable,
		},
		methods: {
			stateName,
		},
		props: {
			columns: {
				default: () => [],
				type: Array,
			},
			currentPage: {
				default: 1,
				type: Number,
			},
			lastPage: {
				default: 0,
				type: Number,
			},
			loading: {
				default: false,
				type: Boolean,
			},
			rows: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>
