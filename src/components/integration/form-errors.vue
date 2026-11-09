<template>
	<v-layout row wrap pt-3 pb-5 mb-5>
		<v-flex xs12 v-for="(error, errorIndex) in errors" :key="errorIndex" mb-2>
			<v-alert type="error" :value="true">
				<h4>{{ error.name }}:</h4> <span>{{ error.message }}</span>
			</v-alert>
		</v-flex>
	</v-layout>
</template>

<script>
	export default {
		name: 'form-errors',
		props: {
			errors: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>

<style lang="scss" scoped>

</style>