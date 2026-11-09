<template>
	<div class="map-container">
		<map-component
			:center-location="centerLocation"
			:markers="markers"
			:zoom="zoom"
			show-info
			@selected-marker="$emit('selected-marker', $event)"
		></map-component>
	</div>
</template>

<script>
	import mapComponent from '@/components/shared/map/map-component';

	export default {
		name: 'distributors-tracking-map',
		components: {
			mapComponent,
		},
		props: {
			centerLocation: {
				default: () => {},
				type: Object,
			},
			markers: {
				default: () => [],
				type: Array,
			},
			zoom: [Number, String],
		},
	};
</script>

<style lang="scss" scoped>
	.map-container {
		.gmap-container {
			height: calc(100vh - 92px) !important;
		}
	}
</style>