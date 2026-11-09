<template>
	<div class="mail-btn">
		<v-btn
			class="btn-auto wrapper-btn ma-0"
			:class="{ 'btn-check' : !isConfigured }"
			depressed
			icon
			@click="$emit('open-check')"
		>
			<v-icon
				v-if="isConfigured"
				color="secondary"
			>
				check_circle
			</v-icon>
		</v-btn>
		<v-tooltip top class="see-data">
			<button
				slot="activator"
				class="see-data-btn"
				@click="$emit('open-slide')"
			>
				<img src="/static/icon/icon-see-configuration.svg" alt="" height="10">
			</button>
			<span>No configurado</span>
		</v-tooltip>
		<button
			class="wrapper-image mb-4"
			:class="{ 'select': isConfigured }"
			@click="$emit('open-slide')"
		>
			<span class="integration-name">Claude AI</span>
		</button>
	</div>
</template>

<script>
export default {
	name: 'claude-box',
	props: {
		isConfigured: {
			type: Boolean,
			default: false,
		},
	},
};
</script>

<style lang="scss" scoped>
	.mail-btn {
		position: relative;
		margin: 0px 10px;
		max-width: min-content;
		max-width: -moz-min-content;
	}

	.wrapper-image {
		background-color: color(white);
		border-radius: 3px;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.09);
		height: 80px;
		margin: 0 auto;
		position: relative;
		text-align: center;
		width: 202px;

		&.select {
			border: 2px solid color(primary);
		}

		.integration-name {
			line-height: 80px;
			font-size: 14px;
			font-weight: 500;
			color: #333;
		}
	}

	.wrapper-btn {
		height: 22px !important;
		left: 9px;
		position: absolute;
		top: 9px;
		width: 22px !important;
		z-index: 1;

		&.btn-check {
			border: 1px solid color(tableLink);
			background-color: color(check-background) !important;
		}
	}

	.see-data {
		position: absolute;
		right: 8px;
		text-align: center;
		top: 5px;
		z-index: 1;

		&-btn {
			align-items: center;
			background-color: color(background-action);
			border: 1px solid color(silver-detail-table);
			border-radius: 100%;
			display: flex;
			height: 24px;
			justify-content: center;
			width: 24px;
		}
	}
</style>
