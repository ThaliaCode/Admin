<template>
	<div class="pb-5 mb-5">
		<template v-if="warehouses.length > 0">
			<table
				border="0"
				cellpadding="0"
				cellspacing="0"
				class="table-slide"
				width="100%"
			>
				<tbody>
					<tr
						class="table-slide-tr"
						v-for="warehouse in warehouses"
						:key="warehouse.id"
					>
						<td class="table-slide-td">
							<v-checkbox
								color="success"
								hide-details
								name="selected"
								v-model="warehouse.isSelected"
							></v-checkbox>
						</td>
						<td class="table-slide-td table-slide-name">{{ warehouse.name }}</td>
						<td class="table-slide-td">
							<span
								v-if="warehouse.settings"
								class="color-preview"
								:style="`background-color: ${warehouse.settings.color}`"
							></span>
						</td>
					</tr>
				</tbody>
			</table>
		</template>
		<template v-else>
			<div class="slide-message">
				No se encontraron tiendas para la empresa seleccionada.
			</div>
		</template>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabled"
				:img="false"
				success-color="primary"
				success-text="Seleccionar Tiendas"
				@cancel-button-clicked="$emit('cancel')"
				@accept-button-clicked="$emit('save-selection')"
			/>
		</section>
	</div>
</template>

<script>
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	export default {
		name: 'warehouse-slide',
		components: {
			modalSidebarButton,
		},
		props: {
			disabled: {
				default: false,
				type: Boolean,
			},
			warehouses: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.slide-message {
		align-items: center;
		background-color: color(white);
		border: 2px solid color(paginationText);
		border-radius: 12px;
		color: color(paginationText);
		display: flex;
		flex-wrap: wrap;
		font-family: font(open-semibold);
		font-size: size(small13);
		justify-content: center;
		margin: 10px auto;
		max-width: 90%;
		padding: 20px 0px;
	}

	.table-slide {
		&-tr {
			height: 43px;

			&:nth-child(even) {
				background-color: color(white);
			}
		}

		&-td {
			&:first-child {
				padding-left: 26px;
				width: 66px;
			}
		}

		&-name {
			color: color(paginationText);
			font-family: font(open-semibold);
			font-size: size(medium);
		}

		&-color {
			outline: none !important;
		}
	}

	.color-preview {
		border: 1px solid color(paginationText);
		border-radius: 100%;
		display: block;
		height: 25px;
		width: 25px;
	}
</style>