<template>
	<div class="screen-loading">
		<div class="screen-loading__load mb-3">
			<v-progress-linear
			indeterminate
			color="white"
			class="mb-0"
		>
			</v-progress-linear>
		</div>
		<span class="screen-loading__text">Espere unos segundos porfavor</span>
	</div>
</template>
<script>
export default {
	name: 'screen-loading',
};
</script>
<style lang="scss" scoped>
	.screen-loading {
		align-items: center;
		background-color: rgba(0, 0, 0, 0.47);
		bottom: 0;
		display: flex;
		flex-direction: column;
		height: 100vh;
		justify-content: center;
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		z-index: 206;

		&__text {
			color: white;
			font-size: 16px;
		}

		&__load {
			width: 15%;
		}
	}
</style>