<template>
  <div>
	  	<v-flex py-3 px-4>
			<v-text-field
				class="filter-select"
				hide-details
				label="Buscar Comercio"
				single-line
				v-model="search"
				@keyup="onSearchCommerce(search)"
			></v-text-field>
		</v-flex>
		<v-layout wrap py-3 px-4>
			<v-flex xs7 mb-4>
				Comercios
			</v-flex>
			<v-flex xs5>
				Planes
			</v-flex>
			<v-flex xs12 mb-3 v-for="(item, index) in commerce" :key="index">
				<v-layout row>
					<v-flex xs7>
						<v-checkbox
							:label="item.name"
							color="success"
							small
							v-model="item.isSelected"
							hide-details

						></v-checkbox>
					</v-flex>
					<v-flex xs5>
						<v-select
						class="filter-select"
						hide-details
						label="Seleccione Plan"
						item-text="name"
						item-value="id"
						:items="plans"
						v-model="item.planId"
					></v-select>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="$emit('cancel-modal')"
				@accept-button-clicked="$emit('save')"
			/>
		</section>
	</div>  
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function disabledButton() {
	return this.commerce.every(p => !p.isSelected);
}

function onSearchCommerce(search) {
	this.$emit('on-search-commerce', search);
}

function data() {
	return {
		search: '',
	};
}

export default {
	name: 'assign-commerce',
	data,
	computed: {
		disabledButton,
	},
	methods: {
		onSearchCommerce,
	},
	components: {
		modalSidebarButton,
	},
	props: {
		commerce: {
			default: () => [],
			type: Array,
		},
		plans: {
			default: () => [],
			type: Array,
		},
	},
};
</script>