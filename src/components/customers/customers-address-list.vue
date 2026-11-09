<template>
	<div>
		<app-table
			name="address"
			:margin="'mb-0'"
			:clean-search="cleanSearch"
			:columns="columns"
			:current-page="currentPage"
			:input-search="false"
			:items-quantity="itemsQuantity"
			:items-total-quantity="itemsTotalQuantity"
			:last-page="lastPage"
			:rows="rows"
			@on-page="$emit('on-page', $event)"
			class="is-not-selectable"
		>
			<template slot="rows" slot-scope="props">
				<td class="is-not-selectable" v-show="showRow(columns, 1)">
					<v-tooltip top>
						<span slot="activator">
							{{ props.row.name | limitTo(6) || '-' }}
						</span>
						<span>
							{{ props.row.name }}
						</span>
					</v-tooltip>
				</td>
				<td v-show="showRow(columns, 2)">
					<v-tooltip top>
						<span slot="activator">
							{{ props.row.provinceName | limitTo(9) || '-' }}
						</span>
						<span>
							{{ props.row.provinceName }}
						</span>
					</v-tooltip>
				</td>
				<td v-show="showRow(columns, 3)">
					<v-tooltip top>
						<span slot="activator">
							{{ props.row.cityName | limitTo(9) || '-' }}
						</span>
						<span>
							{{ props.row.cityName }}
						</span>
					</v-tooltip>
				</td>
				<td v-show="showRow(columns, 4)">
					<v-tooltip top>
						<span slot="activator">
							{{ props.row.parishName | limitTo(9) || '-' }}
						</span>
						<span>
							{{ props.row.parishName }}
						</span>
					</v-tooltip>
				</td>
				<td v-show="showRow(columns, 5)">
					<v-tooltip top>
						<span slot="activator">
							{{ props.row.addressLine1 | limitTo(9) || '-' }}
						</span>
						<span>
							{{ props.row.addressLine1 }}
						</span>
					</v-tooltip>
				</td>
				<template v-if="columns.some((c) => c.name === 'Acciones')">
					<td v-show="showRow(columns, 6)">
						<app-tooltip-button
							class="mr-1"
							text="Editar"
							color="success"
							icon="edit"
							@click-icon="$emit('edit-address', props.row)"
						/>
						<app-tooltip-button
							class="mr-1"
							text="Eliminar"
							color="pink"
							icon="close"
							@click-icon="$emit('delete-address', props.row)"
						/>
						<v-tooltip top>
							<v-switch
								slot="activator"
								class="switch-inline"
								hide-details
								color="success"
								v-model="props.row.flagActive"
								@change="$emit('change-state', props.row)"
							></v-switch>
							<span>{{ props.row.flagActive ? 'Activo' : 'Inactivo' }}</span>
						</v-tooltip>
						<!-- <app-tooltip-button
							color="warning"
							:icon="props.row.isFavorite ? 'star' : 'star_border'"
							text="Dirección Principal"
							size="20"
							@click-icon="$emit('click-icon', props.row)"
						></app-tooltip-button> -->
					</td>
				</template>
			</template>
		</app-table>
	</div>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import documentState from '@/components/shared/document-state';

export default {
	name: 'customers-address-list',
	components: {
		appTable,
		documentState,
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
		currentPage: Number,
		itemsQuantity: Number,
		itemsTotalQuantity: Number,
		lastPage: Number,
		rows: {
			default: () => [],
			type: Array,
		},
	},
};
</script>

<style lang="scss" scoped></style>
