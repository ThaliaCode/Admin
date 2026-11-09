<template>
	<v-layout wrap class="information-vendor">
		<v-flex xs12>
			<v-layout row wrap align-center>
				<v-flex xs4 class="information-vendor-title bold">Estado:</v-flex>
				<v-flex xs1>
					<document-state
						color="success"
						icon="radio_button_checked"
						height="16"
						:tooltip="route.statusName"
					></document-state>
				</v-flex>
				<v-flex xs7 class="status-label">{{ route.statusName }}</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs12>
			<p class="title-location">Ubicación</p>
		</v-flex>
		<v-flex xs5 class="text-green">Fecha Creación:</v-flex>
		<v-flex xs7>
			<p class="text-gray">
				<span>{{ route.createdAt | exactDate('DD-MM-YYYY HH:mm:ss', true) }}</span>
			</p>
		</v-flex>
		<v-flex xs5 class="text-green">Fecha Inicio:</v-flex>
		<v-flex xs7>
			<p class="text-gray">
				<span>{{ route.dateStart | exactDate('DD-MM-YYYY HH:mm:ss', true) }}</span>
			</p>
		</v-flex>
		<v-flex xs4 class="text-green">Fecha Final:</v-flex>
		<v-flex xs8>
			<p class="text-gray">
				<span>{{ route.dateEnd | exactDate('DD-MM-YYYY HH:mm:ss', true) }},</span>
			</p>
		</v-flex>
		<v-flex xs3 class="text-green">Vendedor:</v-flex>
		<v-flex xs9>
			<p class="text-gray ml-2">
				<span>{{ route.seller }}</span>
			</p>
		</v-flex>
		<v-flex xs3 class="text-green">Inicio:</v-flex>
		<v-flex xs9>
			<p class="text-gray">
				<span>{{ initLocationUp }}</span><br/>
				{{ initLocationDown }}
			</p>
		</v-flex>
		<v-flex xs3 class="text-green">Fin:</v-flex>
		<v-flex xs9>
			<p class="text-gray">
				<span>{{ endLocationUp }}</span><br/>
				{{ endLocationDown }}
			</p>
		</v-flex>
		<v-flex xs3 class="text-green">Estado:</v-flex>
		<v-flex xs9>
			<p class="text-gray">
				<span>{{ route.statusName }}</span>
			</p>
		</v-flex>
	</v-layout>
</template>
<script>
import documentState from '@/components/shared/document-state';

export default {
	name: 'information-vendor',
	components: {
		documentState,
	},
	props: {
		endLocationDown: '',
		endLocationUp: '',
		initLocationDown: '',
		initLocationUp: '',
		route: {
			default: () => {},
			type: Object,
		},
	},
};
</script>
<style lang="scss" scoped>
	.information-vendor {
		background-color: color(white);
		border-radius: 2px;
		color: color(number-header);
		// max-height: 189px;
		max-width: 300px;
		padding: 14px;

		&-title {
			color: color(paginationText);
			font-family: font(open-semibold);
			font-size: size(medium);
		}
	}

	.text-green {
		color: color(primary);
		font-family: font(open-semibold);
		font-size: size(small13);
	}

	.title-location {
		border-bottom: 1px solid color(background-even-modal);
		color: color(opacity-list-price);
		font-family: font(open-semibold);
		font-size: size(medium);
		margin-top: 14px;
		text-transform: uppercase;
	}

	.status-label {
		color: color(opacity-list-price);
		font-family: font(open-semibold);
		font-size: size(medium);
	}

	.text-gray {
		color: color(opacity-list-price);
		font-family: font(open-semibold);
		font-size: size(small);
		line-height: normal;

		span {
			font-family: font(open-bold);
			font-size: size(medium);
		}
	}
</style>