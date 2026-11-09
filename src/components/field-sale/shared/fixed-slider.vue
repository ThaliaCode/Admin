<template>
	<v-layout
		wrap
		align-content-start
		px-2
		py-3
		class="fixed-slider"
		:style="`height: calc(100vh - ${heightVar}px);`"
	>
		<slot></slot>
		<modal-sidebar-button
			:img="false"
			:is-loading="disabled"
			:on-run-service="loading"
			:padding-success="paddingSuccess"
			:cancel-text="cancelText"
			:success-text="successText"
			@cancel-button-clicked="$emit('cancel')"
			@accept-button-clicked="$emit('success-action')"
		/>
	</v-layout>
</template>

<script>
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	export default {
		name: 'fixed-slider',
		components: {
			modalSidebarButton,
		},
		props: {
			cancelText: String,
			disabled: {
				default: false,
				type: Boolean,
			},
			heightVar: {
				default: 132,
				type: [Number, String],
			},
			loading: {
				default: false,
				type: Boolean,
			},
			paddingSuccess: {
				default: 'px-2',
				type: String,
			},
			successText: String,
		},
	};
</script>

<style lang="scss" scoped>
	.fixed-slider {
		background-color: color(background-table);
		border-left: 2px solid color(background-card);
		position: relative;
	}

	.footer-modal {
		background-color: color(white);
		bottom: 0px;
		left: 0px;
		position: absolute;
	}
</style>
