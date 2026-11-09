<template>
	<div>
		<v-layout wrap pa-4>
			<v-flex xs12 v-if="row.additionalInformation && row.additionalInformation.customer">
				<span class="black--text rating-label">Nombre:</span>
				<span>{{ row.additionalInformation.customer.name }}</span>
			</v-flex>
			<v-flex xs12>
				<span class="black--text rating-label">Producto:</span>
				<span>{{ row.product.name }}</span>
			</v-flex>
			<v-flex xs12 my-4>
				<v-divider></v-divider>
			</v-flex>
			<v-flex xs12>
				<!-- <star-rating
					border-color="black"
					:border-width="1"
					:increment="1"
					:max-rating="5"
					:rating="rating"
					inactive-color="#f1f3f7"
					active-color="black"
					:star-size="17"
					@rating-selected="onSetRating"
				></star-rating> -->
			</v-flex>
			<v-flex xs12 mt-4>
				<v-text-field
					label="Opinión"
					v-model="row.description"
					no-resize
					class="filter-select shadow-inset textarea-content"
				></v-text-field>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="isLoading"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="
					$emit('save', { rating, description: row.description, orderId: row.orderId })
				"
			>
			</modal-sidebar-button>
		</section>
	</div>
</template>

<script>
// import StarRating from 'vue-star-rating';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function created() {
	this.rating = this.row.rating;
}

function onSetRating(value) {
	this.rating = value;
}

function data() {
	return {
		rating: 0,
	};
}

export default {
	name: 'rating-form',
	components: {
		// StarRating,
		modalSidebarButton,
	},
	created,
	data,
	methods: {
		onSetRating,
	},
	props: {
		isLoading: {
			default: false,
			type: Boolean,
		},
		row: {
			default: () => ({ product: {}, additionalInformation: {} }),
			type: Object,
		},
	},
};
</script>
<style lang="scss" scoped>
span:not(.rating-label) {
	color: color(paginationText);
	font-family: font(regular);
	font-size: size(medium);
}

.rating-label {
	font-family: font(lato-bold);
	font-size: size(medium);
}
</style>
