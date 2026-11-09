<template>
	<div class="content-images">
		<a 
			:href="image"
			:style="`height: ${measure}px; width: ${measure}px`"
			class="content-images__wrapper"
			target="_blank"
			v-for="image in images" 
			:key="image">
			<div 
				:style="`background-image: url(${image})`"
				class="content-images__image"
			>
			</div>
		</a>
	</div>
</template>
<script>
export default {
	name: 'content-images',
	props: {
		images: {
			default: () => [],
			type: Array,
		},
		measure: {
			type: [Number, String],
			default: '100',
		},
	},
};
</script>
<style lang="scss" scoped>
.content-images {
	background-color: map-get($colors, green-opacity);
	border-radius: 5px;
	display: flex;
	justify-content: space-between;
	padding: 10px;

	&__image {
		background-size: cover;
		background-repeat: no-repeat;
		height: 100%;
		width: 100%;
	}

	&__wrapper {
		display: inline-block;
	}
}
</style>