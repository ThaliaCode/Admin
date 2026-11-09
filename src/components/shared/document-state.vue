<template>
	<app-tooltip-button
		:icon="icon"
		:img="img"
		:height="height"
		:color="color"
		:text="tooltip"
		@click-icon="$emit('click-state')"
	/>
</template>

<script>
	import appTooltipButton from '@/components/shared/app-tooltip-button';

	export default {
		name: 'document-state',
		components: {
			appTooltipButton,
		},
		props: {
			color: {
				default: 'success',
				type: String,
			},
			height: [Number, String],
			icon: {
				default: 'adjust',
				type: String,
			},
			img: String,
			tooltip: {
				default: '',
				type: String,
			},
		},
	};
</script>
