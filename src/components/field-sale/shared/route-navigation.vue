<template>
	<router-link :to="route" class="link-navigation">
		<v-layout wrap class="pl-5">
			<v-flex xs1 pl-2 pr-3>
				<v-icon color="success">arrow_back_ios</v-icon>
			</v-flex>
			<v-flex xs10>
				<span class="route-navigation">{{ textNavigation }}</span>
			</v-flex>
		</v-layout>
	</router-link>
</template>

<script>
	export default {
		name: 'route-navigation',
		props: {
			textNavigation: String,
			route: {
				default: '',
				type: [String, Object],
			},
		},
	};
</script>

<style lang="scss" scoped>
	.link-navigation {
		text-decoration: none;
	}

	.route-navigation {
		color: color(brown-grey);
		font-family: font(lato-regular);
		font-size: size(medium);
	}
</style>