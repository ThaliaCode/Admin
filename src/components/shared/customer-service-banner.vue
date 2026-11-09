<template>
	<div
		class="customer-service-banner"
		:class="mini ? 'customer-service-banner--mini' : 'customer-service-banner--expanded'"
		v-if="isOpen"
	>
		<div class="customer-service-banner__inner">
			<div class="customer-service-banner__icon">
				<v-icon color="white" size="22">warning</v-icon>
			</div>
			<div class="customer-service-banner__content">
				<p class="customer-service-banner__title">
					Importante, cambiamos nuestro número de soporte.
				</p>
				<p class="customer-service-banner__text">
					Comunícate con nosotros al :
					<button
						type="button"
						class="customer-service-banner__number"
						@click="goToWhatsapp"
					>
						{{ supportNumber }}</button
					>.
				</p>
			</div>
			<button
				type="button"
				class="customer-service-banner__close"
				aria-label="Cerrar alerta"
				@click="close"
			>
				&times;
			</button>
		</div>
	</div>
</template>

<script>
function data() {
	return {
		isOpen: true,
		supportNumber: process.env.NUMBER_SUPPORT
	};
}

function close() {
	this.isOpen = false;
}

function goToWhatsapp() {
	window.open(
		`https://api.whatsapp.com/send?phone=${this.labelsByCountry.phoneCode}${this.supportNumber}`,
		'_blank'
	);
}

export default {
	name: 'CustomerServiceBanner',
	data,
	props: {
		mini: {
			type: Boolean,
			default: false,
		},
	},
	methods: {
		close,
		goToWhatsapp,
	},
};
</script>

<style lang="scss" scoped>
.customer-service-banner {
	margin: 13px 10px;
	transition: margin-left 0.2s ease, width 0.2s ease;

	&__inner {
		align-items: center;
		background-color: #fffbeb;
		border: 1px solid #fcd34d;
		border-radius: 10px;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		padding: 12px 16px;
	}

	&__icon {
		align-items: center;
		background-color: #f59e0b;
		border-radius: 10px;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
		color: white;
		display: flex;
		flex: 0 0 40px;
		height: 40px;
		justify-content: center;
		width: 40px;
	}

	&__content {
		flex: 1 1 auto;
		min-width: 0;
	}

	&__title {
		color: #92400e;
		font-size: 18px;
		font-weight: 700;
		line-height: 1.2;
		margin: 0 0 2px;
	}

	&__text {
		color: rgba(180, 83, 9, 0.9);
		font-size: 15px;
		font-weight: 500;
		line-height: 1.2;
		margin: 0;
	}

	&__number {
		background: none;
		border: 0;
		color: inherit;
		cursor: pointer;
		font-weight: 700;
		padding: 0;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	&__close {
		align-items: center;
		background: none;
		border: 0;
		color: #fbbf24;
		cursor: pointer;
		display: flex;
		font-size: 22px;
		line-height: 1;
		margin-left: auto;
		padding: 4px;

		&:hover {
			color: #d97706;
		}
	}
}

.customer-service-banner--mini {
	margin-left: 28px;
	width: calc(100% - 68px);
}

.customer-service-banner--expanded {
	margin-left: 170px;
	width: calc(100% - 220px);
}

@media (max-width: 600px) {
	.customer-service-banner {
		margin-left: 10px;
		width: calc(100% - 20px);

		&__inner {
			padding: 10px 12px;
		}

		&__title {
			font-size: 16px;
		}

		&__text {
			font-size: 13px;
		}
	}
}
</style>
