<template>
	<button 
		@click="$emit('click-add')" 
		class="btn-add-item"
		:disabled="disabled"
		:class="{ 'active': active }">
		<v-layout>
			<v-flex xs10 class="wrapper-text">
				<span>{{ title }}</span>
			</v-flex>
			<v-flex xs2>
				<v-icon :color="active ? 'white' : 'primary'">add_circle</v-icon>
			</v-flex>
		</v-layout>
	</button>
</template>
<script>
export default {
	name: 'btn-add-item',
	props: {
		title: String,
		active: {
			type: Boolean,
			default: false,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
};
</script>
<style lang="scss" scoped>
	.btn-add-item {
		border: 1px solid color(primary);
		color: color(primary);
		font-size: 13px;
		max-width: 100%;
		padding: 1px 10px;
		width: 241px;

		&.active {
			background-color: color(primary);
			color: color(white);
		}
	}

	.wrapper-text {
		align-items: center;
		display: flex;
    justify-content: center;
	}
</style>