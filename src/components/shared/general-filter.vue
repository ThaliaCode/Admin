<template>
	<div class="general-filter px-4">
		<slot></slot>
	</div>
</template>

<script>
	export default {
		name: 'general-filter',
	};
</script>

<style lang="scss" scoped>
.align-col {
	align-self: center;
	margin-bottom: 10px;
	margin-top: 10px;
}

.general-filter {
	align-items: center;
	background: map-get($colors, background-table);
	display: flex;
	min-height: 50px;
	margin-bottom: 11px;

	&-button {
		background-color: white !important;
		border-radius: 3px;
		box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, .2);
		color: map-get($colors, subheaderText);
		height: 33px;
		font-family: map-get($fonts, open-semibold);
		font-size: 13px;
		margin: 0px;
		text-transform: lowercase;
		width: 100%;

		.icon {
			font-size: 20px;
			height: 13px;
			line-height: .7;
			width: 16px;
		}
	}

	&.align-end {
		align-items: flex-end !important;
	}
}
</style>