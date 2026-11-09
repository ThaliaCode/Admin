<template>
	<button
		class="btn-card"
		type="button"
		@click="$emit('on-click')"
	>
		<slot name="heading"></slot>
		<div class="border-body">
			<slot></slot>
		</div>
	</button>
</template>

<script>
	export default {
		name: 'btn-card',
	};
</script>

<style lang="scss" scoped>
	.btn-card {
		background-color: color(white);
		border-radius: 8px;
		box-shadow: 0px 2px 7px 0px rgba(0, 0, 0, .14);
		min-width: 100%;

		.border-body {
			border-bottom: 1px solid transparent;
			border-bottom-left-radius: 8px;
			border-bottom-right-radius: 8px;
			border-left: 1px solid transparent;
			border-right: 1px solid transparent;

			&:hover {
				border-color: color(dashboard-base);
			}
		}

		&:hover {
			.border-body {
				border-color: color(primary);
			}
		}
	}
</style>