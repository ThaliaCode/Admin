<template>
	<div class="pr-3 mt-3">
		<v-layout wrap align-center pl-3 pr-1 class="additional-data">
			<v-flex xs11>
				<span class="text-data">{{ additionalData }}</span>
			</v-flex>
			<v-flex xs1 v-if="showRemove">
				<v-btn icon small class="error--text ma-0" @click="$emit('remove-data')">
					<v-icon>cancel</v-icon>
				</v-btn>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
export default {
	name: 'additional-data',
	props: {
		additionalData: String,
		showRemove: {
			type: Boolean,
			default: true,
		},
	},
};
</script>

<style lang="scss" scoped>
.additional-data {
	border: 1px solid map-get($colors, primary);
	border-radius: 2px;
}

.text-data {
	font-size: 12px;
}
</style>
