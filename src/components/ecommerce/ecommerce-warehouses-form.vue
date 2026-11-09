<template>
	<div>
		<v-layout wrap py-5 px-4>
			<v-flex xs12 v-for="warehouse in warehouses" :key="warehouse.id">
				<v-checkbox
					:label="warehouse.name"
					color="success"
					small
					class="body-1"
					v-model="warehouse.isSelected"
					hide-details
				/>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="invalid"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="$emit('save', warehouses)"
			/>
		</section>
	</div>
</template>

<script>
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function invalid() {
		return this.warehouses.every(wi => !wi.isSelected);
	}

	export default {
		name: 'ecommerce-warehouses-form',
		components: {
			modalSidebarButton,
		},
		computed: {
			invalid,
		},
		props: {
			warehouses: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>
