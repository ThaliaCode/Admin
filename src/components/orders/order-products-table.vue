<template>
	<div>
		<table class="order-table" border="0" cellpadding="0" cellspacing="0">
			<thead>
				<tr>
					<th>
						<input
							name="all"
							type="checkbox"
							:value="checkAll"
							:checked="checkAll"
							class="input-checkbox"
							:disabled="checkAllDisabled"
							@change="$emit('selected-all', $event.target.checked)"
						/>
					</th>
					<template v-for="column in columns">
						<th :key="column.id">
							{{ column.name }}
						</th>
					</template>
				</tr>
			</thead>
			<tbody>
				<tr v-for="row in rows" :key="row.id">
					<td class="text-xs-center">
						<input
							name="row"
							type="checkbox"
							class="input-checkbox"
							:disabled="row.checkedDisabled"
							v-model="row.isSelected"
						/>
					</td>
					<template v-for="column in columns">
						<td :key="column.id" class="text-xs-center border-right">
							<template v-if="column.value === 'productName'">
								<v-tooltip top>
									<span slot="activator">
										{{ row[column.value] | limitTo(10) }}
									</span>
									<span>{{ row[column.value] }}</span>
								</v-tooltip>
							</template>
							<template v-else>
								{{ row[column.value] }}
							</template>
						</td>
					</template>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
	export default {
		name: 'order-products-table',
		props: {
			checkAll: {
				default: false,
				type: Boolean,
			},
			checkAllDisabled: {
				default: false,
				type: Boolean,
			},
			columns: {
				default: () => [],
				type: Array,
			},
			rows: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.order-table {
		width: 100%;

		tr {
			th {
				background-color: rgba(228, 228, 228, 0.49);
				color: color(paginationText);
				font-family: font(open-bold);
				font-size: size(small10);
				height: 25px;
				text-transform: uppercase;
			}

			td {
				border-bottom: 1px solid color(silver-detail-table);
				color: color(paginationText);
				font-family: font(open-regular);
				font-size: size(small11);
				height: 25px;
				text-transform: uppercase;

				&.border-right {
					border-right: 1px solid color(silver-detail-table);

					&:last-child {
						border-right: 0px;
					}
				}
			}
		}
	}
</style>