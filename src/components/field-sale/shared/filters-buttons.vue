<template>
	<v-layout wrap align-center px-2>
		<v-flex :class="columnClass" pr-2 v-if="successButton">
			<v-btn
				class="btn-action btn-full"
				:class="successClass"
				:color="successColor"
				:disabled="successDisabled"
				@click="$emit('success-action')"
			>
				{{ successText }}
			</v-btn>
		</v-flex>
		<v-flex :class="{ columnClass, 'pl-2': successButton }">
			<v-btn
				class="btn-action btn-full"
				outline
				:class="outlineBtnClass"
				:color="outlineBtnColor"
				:disabled="outlineBtnDisabled"
				@click="$emit('outline-btn-action')"
			>
				{{ outlineBtnText }}
			</v-btn>
		</v-flex>
	</v-layout>
</template>

<script>
	export default {
		name: 'filters-buttons',
		props: {
			columnClass: {
				default: 'xs6',
				type: String,
			},
			outlineBtnClass: String,
			outlineBtnColor: {
				default: 'pink',
				type: String,
			},
			outlineBtnDisabled: {
				default: false,
				type: Boolean,
			},
			outlineBtnText: {
				default: 'Limpiar',
				type: String,
			},
			successButton: {
				default: false,
				type: Boolean,
			},
			successClass: String,
			successColor: {
				default: 'primary',
				type: String,
			},
			successDisabled: {
				default: false,
				type: Boolean,
			},
			successText: {
				default: 'Buscar',
				type: String,
			},
		},
	};
</script>

<style lang="scss" scoped>

</style>