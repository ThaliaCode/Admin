<template>
	<v-layout row pt-5 px-3 f-flex justify-center>
		<v-flex xs10 d-flex justify-center align-center>
			<img class="image" :src="url" alt="">
		</v-flex>
	</v-layout>
</template>

<script>
export default {
	name: 'image-component',
	props: {
		url: {
			type: String,
			required: false,
		},
	},
};
</script>

<style lang="scss" scoped>
.image {
	object-fit: contain;
	width: 100%;
}
</style>

