<template>
    <div>
		<v-layout wrap>
			<v-flex xs12
				v-for="(item, index) in filter"
				:key="index"
				class="filter-by-row">
				<v-checkbox
					class="filter-checkbox"
					:id="`${item.id}-${index}`"
					:label="item.name"
					color="primary"
					size="small"
					:true-value="1"
					:false-value="0"
					v-model="item.value"
					@change="onItemSelected(item, $event)"
					hide-details
				></v-checkbox>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="$emit('close')"
			/>
		</section>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function onItemSelected(item, value) {
	if (item.name === 'Todos') {
		this.$set(this.filter[1], 'value', value);
		this.$set(this.filter[2], 'value', value);
	} else {
		const newValue = this.filter[1].value && this.filter[2].value ? 1 : 0;
		this.$set(this.filter[0], 'value', newValue);
	}
}

function data() {
	return {
		filter: [
			{
				id: 1,
				name: 'Todos',
				value: 0,
			},
			{
				id: 2,
				name: 'Activos',
				code: 'active',
				value: 0,
			},
			{
				id: 3,
				name: 'Inactivos',
				code: 'desactive',
				value: 0,
			},
		],
	};
}

export default {
	data,
	name: 'filter-product',
	components: {
		modalSidebarButton,
	},
	methods: {
		onItemSelected,
	},
};
</script>

<style lang="scss" scoped>
.filter-by-row {
	&:nth-child(even) {
		background: map-get($colors, background-even-modal);
	}

	.input-group {
		label {
			color: map-get($colors, subheaderText);
			font-family: map-get($fonts, open-semibold);
			font-size: 13px;
		}
	}
}
</style>
