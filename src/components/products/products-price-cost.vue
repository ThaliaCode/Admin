<template>
	<div>
		<form action="" method="POST" @submit.prevent="$emit('save')">
			<v-layout wrap pa-4>
				<v-flex xs12 px-2>
					<app-input-text
						label="Precio de Costo"
						:text="price"
						@input="$emit('set-data', Number($event.value))"
					/>
				</v-flex>
			</v-layout>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					button-type="submit"
					:is-loading="loading"
					@cancel-button-clicked="$emit('close')"
				/>
			</section>
		</form>
	</div>
</template>

<script>
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function created() {
		this.price = this.priceCost || 0;
	}

	function data() {
		return {
			price: 0,
		};
	}

	export default {
		name: 'products-price-cost',
		components: {
			modalSidebarButton,
		},
		created,
		data,
		props: {
			loading: {
				default: false,
				tpye: Boolean,
			},
			priceCost: [Number, String],
		},
	};
</script>
