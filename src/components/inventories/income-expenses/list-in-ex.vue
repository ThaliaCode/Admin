<template>
	<app-table
		name="list-in-ex"
		:class="{ 'is-not-selectable': !selectable, 'no-main-list': !mainList }"
		:check-all="checkAll"
		:columns="columns"
		:current-page="currentPage"
		:last-page="lastPage"
		local-storage
		:main-list="mainList"
		padding="pt-4 px-0"
		:rows="registers"
		:selectable="selectable"
		@on-page="$emit('on-page', $event)"
		@on-search-event="$emit('on-search', $event)"
		@on-selected-all="$emit('on-selected-all', $event)"
		@row-is-selected="$emit('row-is-selected', $event)"
	>
		<template slot="rows" slot-scope="props">
			<td v-show="showRow(columns, 1)" :class="{ 'is-not-selectable': !selectable }">
				<v-tooltip right>
					<span slot="activator">{{ props.row.movementCode }}</span>
					<span>{{ props.row.movementName }}</span>
				</v-tooltip>
			</td>
			<td v-show="showRow(columns, 2)">{{ props.row.productCode }}</td>
			<td v-show="showRow(columns, 3)">{{ props.row.productName }}</td>
			<td v-show="showRow(columns, 4)">{{ props.row.warehouseName }}</td>
			<td v-show="showRow(columns, 5)">{{ props.row.quantity }}</td>
			<td v-show="showRow(columns, 6)">
				<v-tooltip top>
					<v-btn
						class="link-document btn-auto btn-underline btn-total"
						color="primary"
						depressed
						flat
						slot="activator"
						@click="$emit('go-to-detail', props.row)"
					>
						{{ props.row.documentNumber }}
					</v-btn>
					<span>Ver detalle de {{ props.row.moduleName }}</span>
				</v-tooltip>
			</td>
			<td v-show="showRow(columns, 7)">{{ (props.row.createdAt || props.row.updatedAt) | exactDate }}</td>
		</template>
	</app-table>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';

	export default {
		name: 'list-in-ex',
		components: {
			appTable,
		},
		props: {
			checkAll: {
				default: false,
				type: Boolean,
			},
			columns: {
				default: () => [],
				type: Array,
			},
			currentPage: [Number, String],
			lastPage: [Number, String],
			mainList: {
				default: false,
				type: Boolean,
			},
			registers: {
				default: () => [],
				type: Array,
			},
			selectable: {
				default: false,
				type: Boolean,
			},
		},
	};
</script>

<style lang="scss" scoped>

</style>