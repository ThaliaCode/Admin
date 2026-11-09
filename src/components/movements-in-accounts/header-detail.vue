<template>
	<div class="text-xs-left header-detail pr-5">
		<label class="header-detail-title">{{ title }}</label>
		<p class="ma-0 header-detail-content">{{ detail }}</p>
	</div>
</template>

<script>
	export default {
		name: 'header-detail',
		props: {
			detail: String,
			title: String,
		},
	};
</script>

<style lang="scss" scoped>
	.header-detail {
		line-height: normal;
		margin-left: auto;
		width: fit-content;

		&-title {
			color: color(generalText);
			font-family: font(open-semibold);
			font-size: size(small11);
			letter-spacing: 0px;
			line-height: 23px;
		}

		&-content {
			color: color(background-sidebar);
			font-family: font(open-bold);
			font-size: size(medium19);
			letter-spacing: 0px;
			line-height: 23px;
		}
	}
</style>