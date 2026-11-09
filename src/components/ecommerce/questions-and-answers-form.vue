<template>
	<div>
		<v-layout wrap pa-4>
			<v-flex xs12 mb-2>
				<span class="black--text questions-label">Nombre:</span>
				<span>{{ row.additionalInformation.name }}</span>
			</v-flex>
			<v-flex xs12 mb-2>
				<span class="black--text questions-label">Correo:</span>
				<span>{{ row.additionalInformation.email }}</span>
			</v-flex>
			<v-flex xs12 mb-2>
				<span class="black--text questions-label">Producto:</span>
				<span>{{ row.product.name }}</span>
			</v-flex>
			<v-flex xs12>
				<span class="black--text questions-label">Pregunta:</span>
				<span>{{ row.description }}</span>
			</v-flex>
			<v-flex xs12 my-4>
				<v-divider></v-divider>
			</v-flex>
			<v-flex xs12>
				<label class="black--text questions-label">Respuesta</label>
				<v-text-field
					placeholder="Respuesta"
					v-model="answer"
					no-resize
					textarea
					class="filter-select textarea-content"
				></v-text-field>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabled"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="$emit('save', answer)"
			>
			</modal-sidebar-button>
		</section>
	</div>
</template>

<script>
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function created() {
		this.answer = this.row.answer ? this.row.answer.description : '';
	}

	function disabled() {
		return this.isLoading || !this.answer;
	}

	function data() {
		return {
			answer: '',
		};
	}

	export default {
		name: 'questions-and-answers-form',
		components: {
			modalSidebarButton,
		},
		computed: {
			disabled,
		},
		created,
		data,
		props: {
			isLoading: {
				default: false,
				type: Boolean,
			},
			row: {
				default: () => ({ answer: {}, additionalInformation: {}, product: {} }),
				type: Object,
			},
		},
	};
</script>
<style lang="scss" scoped>
	span:not(.questions-label) {
		color: color(paginationText);
		font-family: font(regular);
		font-size: size(medium);
	}

	.questions-label {
		font-family: font(lato-bold);
		font-size: size(medium);
	}
</style>
