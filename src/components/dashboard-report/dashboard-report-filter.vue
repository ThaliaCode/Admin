<template>
	<div>
		<div v-if="commerce.length === 0">
			<v-flex primary--text class="bold">
				Usted no cuenta con un comercio.
			</v-flex>
		</div>
		<div v-else>
			<app-select
				v-if="commerce.length > 1"
				:item="commerceId"
				item-text="name"
				item-value="id"
				:items="commerce"
				label="Comercio"
				model="commerceId"
				:return-object="false"
				@input="$emit('get-data', $event)"
			></app-select>
			<div v-else-if="commerce.length">
				<div class="title-select mb-2">Comercio</div>
				<span class="item-select">{{ commerce[0].name }}</span>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'dashboard-report-filter',
		props: {
			commerce: {
				default: () => [],
				type: Array,
			},
			commerceId: [Number, String],
		},
	};
</script>

<style lang="scss" scoped>
.bold {
	font-size: map-get($sizes, medium20);
	font-weight: bold;
}
</style>