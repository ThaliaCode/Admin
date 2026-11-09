<template>
	<div class="pb-5">
		<app-table
			name="ratings-list"
			:clean-search="cleanSearch"
			:columns="columns"
			:current-page="currentPage"
			:last-page="lastPage"
			:rows="rows"
			@on-page="$emit('on-page', $event)"
			@on-search-event="$emit('on-search', $event)"
			class="is-not-selectable"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">
					<span v-if="props.row.product">
						{{ props.row.product.name }}
					</span>
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.description }}</td>
				<td v-show="showRow(columns, 3)">
					<v-layout wrap align-center>
						<v-flex>
							<span v-for="i in 5" :key="i">
								<v-icon color="black">
									<template v-if="i <= props.row.rating">
										star
									</template>
									<template v-else>
										star_border
									</template>
								</v-icon>
							</span>
						</v-flex>
						<v-flex>
							<span class="black--text bold">{{ props.row.rating }}</span>
						</v-flex>
					</v-layout>
				</td>
				<td v-show="showRow(columns, 4)" class="action-td" @click.stop="stopClick">
					<v-tooltip top>
						<v-switch
							slot="activator"
							class="switch-inline"
							color="success"
							hide-details
							@change="$emit('change-state', { value: $event, id: props.row.id })"
							v-model="props.row.flagActive"
						></v-switch>
						<span>{{ stateName(props.row) }}</span>
					</v-tooltip>
					<app-tooltip-button
						color="success"
						icon="edit"
						text="Editar"
						@click-icon="$emit('edit', props.row)"
					/>
				</td>
			</template>
		</app-table>
	</div>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';

	function stateName({ flagActive }) {
		return flagActive ? 'Activado' : 'Desactivado';
	}

	export default {
		name: 'ratings-list',
		components: {
			appTable,
		},
		methods: {
			stateName,
		},
		props: {
			cleanSearch: {
				default: false,
				type: Boolean,
			},
			columns: {
				default: () => [],
				type: Array,
			},
			currentPage: [Number, String],
			lastPage: [Number, String],
			rows: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>
<style lang="scss" scoped>
	.bold {
		font-family: font(lato-bold);
	}
</style>
