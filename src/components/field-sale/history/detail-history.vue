<template>
	<div class="mt-4 pr-4">
		<v-layout class="detail-history">
			<v-flex xs8>
				<span class="detail-history-name">RUTA {{ detail.routeName }}</span>
			</v-flex>
			<v-flex xs3>
				<span class="detail-history-date">{{ detail.createdAt | exactDate('DD/MM/YYYY') }}</span>
			</v-flex>
			<v-flex xs1 class="border-left">
				<button @click="$emit('close-detail')">
					<v-icon color="white">clear</v-icon>
				</button>
			</v-flex>
		</v-layout>
		<div class="wrapper-information">
			<v-layout wrap class="wrapper-information-header">
				<v-flex xs8>
					<p class="mb-0 title">{{ detail.sellerFullName }}</p>
					<p class="mb-0 information">{{ detail.address }}</p>
				</v-flex>
				<v-flex xs1>
					<v-icon size="16" color="primary">directions_walk</v-icon>
				</v-flex>
				<v-flex xs3>
					<span class="distance">A {{detail.routeDistance }}km</span>
				</v-flex>
			</v-layout>
			<v-layout row wrap class="wrapper-information-content">
				<v-flex xs12>
					<v-layout wrap mb-1>
						<v-flex xs5>
							<span class="label-detail">{{ labelsByCountry.labelParish }}:</span>
						</v-flex>
						<v-flex xs7>
							<span class="value-detail">{{ zoneParish }}</span>
						</v-flex>
					</v-layout>
					<v-layout wrap mb-1>
						<v-flex xs5 mb-1>
							<span class="label-detail">Días de visita:</span>
						</v-flex>
						<v-flex xs7>
							<span class="value-detail">{{ detail.routeDays }}</span>
						</v-flex>
					</v-layout>
					<v-layout wrap mb-1>
						<v-flex xs5 mb-2>
							<span class="label-detail">Tiempo estimado:</span>
						</v-flex>
						<v-flex xs7>
							<span class="value-detail">{{ detail.estimatedTime }}</span>
						</v-flex>
					</v-layout>
					<v-layout wrap mb-1>
						<v-flex xs5 mb-2>
							<span class="label-detail">Prioridad:</span>
						</v-flex>
						<v-flex xs7>
							<span class="value-detail">{{ detail.priority }}</span>
						</v-flex>
					</v-layout>
					<v-layout wrap mb-1>
						<v-flex xs5 mb-2>
							<span class="label-detail">Ventas de hoy:</span>
						</v-flex>
						<v-flex xs7>
							<span class="value-detail">{{ detail.totalSales }}</span>
						</v-flex>
					</v-layout>
					<v-layout wrap mb-1>
						<v-flex xs5 mb-2>
							<span class="label-detail">Total de ventas:</span>
						</v-flex>
						<v-flex xs7>
							<span class="value-detail">{{ countryCurrencySymbol }}{{ detail.totalSales }}</span>
						</v-flex>
					</v-layout>
					<v-layout align-center wrap mb-1>
						<v-flex xs8>
							<v-layout row wrap>
								<v-flex xs12 mb-2>
									<v-layout wrap>
										<v-flex xs1>
											<v-icon color="success">chat_typing_outline</v-icon>
										</v-flex>
										<v-flex xs5>
											<span class="phone-detail">{{ detail.routeWhatsappPhone }}</span>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex xs12>
									<v-layout wrap>
										<v-flex xs1 pt-2>
											<v-icon color="success">call</v-icon>
										</v-flex>
										<v-flex xs11 pt-2>
											<span class="phone-detail">{{ detail.routePhone }}</span>
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs4 text-xs-right>
							<button
								class="btn-detail"
								type="button"
							>
								Ver detalle
							</button>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</div>
	</div>
</template>
<script>
export default {
	name: 'detail-history',
	props: {
		detail: {
			default: () => {},
			type: Object,
		},
		zoneParish: String,
	},
};
</script>
<style lang="scss" scoped>
	.detail-history {
		background: color(primary);
		color: color(white);
		padding: 13px 10px 10px 10px;;
		width: 100%;

		&-name {
			font-family: font(open-semibold);
			font-size: size(small);
		}

		&-date {
			font-family: font(open-semibold);
			font-size: size(small13);
		}
	}

	.border-left {
		border-left: 1px solid color(white);
		padding-left: 4px;
	}

	.wrapper-information {
		background: map-get($colors, white);
		border: 1px solid map-get($colors, title-table);
		padding: 10px;

		&-header {
			background: map-get($colors, background-modal);
			border: 1px solid map-get($colors, silver-detail);
			color: map-get($colors, generalText);
			padding: 10px;
		}

		&-content {
			background: map-get($colors, white);
			border: 1px solid map-get($colors, silver-detail);
			border-radius: 0 0 4px 4px;
			color: map-get($colors, generalText);
			padding: 10px;
		}

		.title {
			color: color(background-sidebar);
			font-family: font(open-semibold);
			font-size: size(medium);
		}

		.information {
			color: color(route-detail);
			font-family: font(open-regular);
			font-size: size(small10);
		}

		.distance {
			color: color(number-header);
			font-family: font(open-regular);
			font-size: size(small10);
		}
	}

	.bold {
		font-weight: 600;
	}

	.btn-detail {
		border: 1px solid map-get($colors, primary);
		border-radius: 5px;
		color: color(primary);
		font-family: font(open-semibold);
		font-size: size(small13);
		height: 30px;
		width: 80px;
	}

	.label-detail {
		color: color(number-header);
		font-family: font(open-bold);
		font-size: size(small11);
	}

	.value-detail {
		color: color(number-header);
		font-family: font(open-regular);
		font-size: size(small11);
	}

	.phone-detail {
		color: color(silver-footer);
		font-family: font(lato-regular);
		font-size: size(small13);
	}
</style>