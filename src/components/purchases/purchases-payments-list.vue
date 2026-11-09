<template>
	<div>
		<v-layout wrap mt-4 class="form-height">
			<div :class="['item-table', hideDetails ? 'active' : null]">
				<app-table
					name="purchases-payments-list"
					selectable
					:input-search="false"
					show-details-info
					:check-all="checkAll"
					:columns="columns"
					:hide-details="hideDetails"
					:rows="rows"
					:show-arrow="showArrow"
					@show-details="showDetails"
					@on-selected-all="allIsSelected"
					@row-is-selected="rowIsSelected"
					:padding="padding">
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)">
							{{ props.index + 1 }}
						</td>
						<td v-show="showRow(columns, 2)">
							{{ props.row.module.name }}
						</td>
						<td v-show="showRow(columns, 3)">
							{{ props.row.typeMovementName }}
						</td>
						<td v-show="showRow(columns, 4)">
							{{ props.row.documentNumber }}
						</td>
						<td v-show="showRow(columns, 5)">
							{{ props.row.amount }}
						</td>
						<td v-show="showRow(columns, 6)">
							{{ props.row.concept }}
						</td>
					</template>
				</app-table>
			</div>
			<transition name="fade-left" mode="out-in">
				<div
					ref="purchases-payments-details"
					:class="['item-details pr-4', hideDetails ? 'active' : null]"
					v-show="showDetailsActive">
					<documents-details
						:id="selectedId"
						:mounted="showDetailsActive"
						hide-buttons
					/>
				</div>
			</transition>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				hidden
				success-text="Cerrar"
				success-color="primary"
				@accept-button-clicked="closePayments"
			/>
		</section>
	</div>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';
	import documentsDetails from '@/components/cash-desk-closing/sub-components/documents-details';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function mounted() {
		const el = this.$refs['purchases-payments-details'];
		document.addEventListener('scroll', () => {
			const yValue = scrollY;
			if (yValue >= 160) {
				const v = yValue - 160;
				el.style.transform = `translateY(${v}px)`;
			} else {
				el.style.transform = 'translateY(0px)';
			}
		});
	}

	function allIsSelected(isSelected) {
		this.$emit('all-is-selected', isSelected);
	}

	function closePayments() {
		this.hideDetails = false;
		this.$emit('close-payments');
	}

	function padding() {
		return this.showDetailsActive ? 'pl-4' : 'px-4';
	}

	function rowIsSelected(row) {
		this.$emit('row-is-selected', row);
	}

	function showArrow() {
		return this.rows.length > 0;
	}

	function showDetails(value) {
		this.hideDetails = !value;
	}

	function showDetailsActive() {
		return this.hideDetails && this.showArrow && this.selectedId;
	}

	function data() {
		return {
			hideDetails: false,
		};
	}

	export default {
		name: 'purchases-payments-list',
		components: {
			appTable,
			documentsDetails,
			modalSidebarButton,
		},
		computed: {
			padding,
			showArrow,
			showDetailsActive,
		},
		data,
		methods: {
			allIsSelected,
			closePayments,
			rowIsSelected,
			showDetails,
		},
		mounted,
		props: {
			checkAll: {
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
			selectedId: [Number, String],
		},
	};
</script>

<style lang="scss" scoped>
	.item-table {
		flex: 1 1 100%;
	}

	.item-table.active,
	.item-details.active {
		flex: 1 1 50%;
	}
</style>
