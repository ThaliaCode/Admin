<template>
	<div class="mail-btn">
		<v-btn
			class="btn-auto wrapper-btn ma-0"
			:class="{ 'btn-check' : !integration.flagActive }"
			depressed
			:disabled="!integration.flagCustomizer"
			flat
			icon
			@click="$emit('check-integration')"
		>
			<v-icon
				v-if="integration.flagActive"
				color="secondary"
			>
				check_circle
			</v-icon>
		</v-btn>
		<v-tooltip top class="see-data">
			<button
				slot="activator"
				class="see-data-btn"
				:disabled="!integration.flagCustomizer"
				@click="$emit('open-slide', true)"
			>
				<img src="/static/icon/icon-see-configuration.svg" alt="" height="10">
			</button>
			<span v-if="!integration.seeConfig && integration.flagCustomizer">Ver datos ingresados</span>
			<span v-else-if="integration.seeConfig">Ver datos configurados</span>
			<span v-else>No se ha configurado</span>
		</v-tooltip>
		<button
			class="wrapper-image mb-4"
			:class="{ 'select': integration.flagCustomizer }"
			@click="$emit('open-slide')"
		>
			<img
				:src="integration.urlImage"
				:alt="integration.name"
			/>
		</button>
		<v-btn
			v-if="integration.flagAdditional && integration.flagCustomizer"
			class="wrapper-btn ma-0 additional-information"
			flat
			icon
			@click="$emit('check-additional-information')"
		>
			<v-icon color="secondary">more_horiz</v-icon>
		</v-btn>
	</div>
</template>
<script>
export default {
	name: 'mail-btn',
	props: {
		integration: {
			default: () => {},
			type: Object,
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

		img {
			max-width: 72%;
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

		&:disabled {
			border-color: color(subheaderText) !important;
			opacity: 0.3;
		}
	}

	.additional-information {
		left: auto;
		right: 8px;
		top: 40px;
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