<template>
	<v-layout row :wrap="wrap">
		<v-flex xs6 v-for="tab in tabs" :key="tab.id">
			<v-btn
				class="btn-tab btn-auto btn-full py-1 ma-0"
				depressed
				:class="`${tab.active ? 'border-btn white--text' : 'success--text'} ${
					small ? 'btn-tab-small' : ''
				}`"
				:color="tab.active ? 'success' : 'transparent'"
				:outline="!tab.active"
				@click="$emit('change-tab', tab.code)"
			>
				{{ tab.title }}
			</v-btn>
		</v-flex>
	</v-layout>
</template>

<script>
export default {
	name: 'tab-buttons',
	props: {
		tabs: {
			default: () => [],
			type: Array,
		},
		small: {
			default: false,
			type: Boolean,
		},
		wrap: {
			type: Boolean,
			default: true,
		},
	},
};
</script>

<style lang="scss" scoped>
.btn-tab {
	font-family: font(lato-bold);
	font-size: size(medium);
	text-transform: none !important;

	&-small {
		font-size: size(small10) !important;
	}
}

.border-btn {
	border: 1px solid color(success);
}
</style>
