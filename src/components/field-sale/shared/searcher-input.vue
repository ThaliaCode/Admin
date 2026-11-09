<template>
	<div class="search-input-container">
		<img :src="iconSearch" alt="search icon" class="search-icon">
		<app-input-text
			clearable
			:placeholder="placeholder"
			model="search"
			:readonly="readonly"
			:text="search"
			@input="$emit('search-value', $event)"
			@input-enter="$emit('search-value', { value: $event.target.value })"
		></app-input-text>
	</div>
</template>

<script>
	export default {
		name: 'searcher-input',
		props: {
			iconSearch: {
				default: '/static/img/search-icon.svg',
				type: String,
			},
			placeholder: {
				default: 'Buscar',
				type: String,
			},
			readonly: {
				default: false,
				type: Boolean,
			},
			search: String,
		},
	};
</script>

<style lang="scss" scoped>
	.search-input-container {
		position: relative;
	}

	.search-icon {
		bottom: 0px;
		height: 18px;
		left: 15px;
		margin: auto 0px;
		position: absolute;
		top: 0px;
		z-index: 1;
	}
</style>