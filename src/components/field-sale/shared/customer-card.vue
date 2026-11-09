<template>
	<v-btn
		class="card-btn btn-auto btn-full px-2 py-1 ma-0"
		:class="{ active: active }"
		color="white"
		depressed
		:ripple="false"
		@click.prevent.stop="$emit('card-action', customer)"
	>
		<v-flex xs12>
			<v-layout class="card-heading" wrap align-center>
				<v-flex xs10>
					<v-checkbox
						v-if="selectable"
						:id="`card-checkbox-${customer.customerId}`"
						class="card-checkbox pa-0"
						:disabled="checkedDisabled"
						hide-details
						v-model="customer.isChecked"
						@change="$emit('on-checked', { customer, value: $event })"
					></v-checkbox>
					<label
						class="card-heading-label"
						:for="`card-checkbox-${customer.customerId}`"
					>
						<template
							v-if="customer.customerName && customer.customerName.length > 32"
						>
							<v-tooltip top>
								<span slot="activator">{{
									customer.customerName | limitTo(32)
								}}</span>
								<span>{{ customer.customerName }} </span>
							</v-tooltip>
						</template>
						<template v-if="customer.customerFullName">
							{{ customer.customerFullName }}
						</template>
						<template v-else-if="customer.rzSocial">
							{{ customer.rzSocial }}
						</template>
						<template v-else-if="customer.name">
							{{ customer.name }}
						</template>
					</label>
				</v-flex>
				<v-flex xs2 text-xs-right v-if="showStatus">
					<app-tooltip-button
						v-if="mainCustomer"
						color="warning"
						:icon="customer.isMain ? 'star' : 'star_border'"
						text="Cliente Principal"
						size="20"
						@click-icon="$emit('click-icon', customer)"
					></app-tooltip-button>
					<app-tooltip-button
						:color="customer.stateColor"
						icon="radio_button_checked"
						:text="customer.stateName || ''"
						size="20"
					></app-tooltip-button>
				</v-flex>
				<v-flex xs2 text-xs-right v-if="showZone">
					<span class="card-heading-label">| </span>
					<img
						src="/static/img/zone-icon-gray.svg"
						alt=""
						height="9"
						width="9"
					/>
				</v-flex>
			</v-layout>
		</v-flex>
		<!-- <v-flex xs12 v-if="cardBody">
			<v-layout class="card-body" wrap align-center>
				<bar-information
					border-color="primary"
					:information="information"
					label-img
					:show-colon="false"
				></bar-information>
			</v-layout>
		</v-flex> -->
	</v-btn>
</template>

<script>
import barInformation from '@/components/field-sale/shared/bar-information';

export default {
	name: 'customer-card',
	components: {
		barInformation,
	},
	props: {
		active: {
			default: false,
			type: Boolean,
		},
		cardBody: {
			default: false,
			type: Boolean,
		},
		checkedDisabled: {
			default: false,
			type: Boolean,
		},
		customer: {
			default: () => {},
			type: Object,
		},
		information: {
			default: () => [],
			type: Array,
		},
		mainCustomer: {
			default: false,
			type: Boolean,
		},
		selectable: {
			default: false,
			type: Boolean,
		},
		showStatus: {
			default: true,
			type: Boolean,
		},
		showZone: {
			default: false,
			type: Boolean,
		},
	},
};
</script>

<style lang="scss" scoped>
.card-btn {
	border-color: transparent;
	border-style: solid;
	border-width: 2px;
	height: auto !important;
	text-transform: none;

	p {
		margin: 0px;
	}

	&.active {
		border-color: color(primary) !important;
	}
}

.card-heading {
	text-align: left;

	&-label {
		color: color(header) !important;
		display: inline-flex;
		font-family: font(open-semibold);
		font-size: size(small);
		vertical-align: middle;
	}
}

.card-body {
	border-top-color: color(header);
	border-top-style: solid;
	border-top-width: 1px;
	margin-top: 6px;
	padding-top: 8px;
}

.card-title {
	font-family: font(open-semibold);
	font-size: size(medium);
	letter-spacing: 0;
}

.regular-text {
	color: color(pagintationText);
	font-family: font(open-regular);
	font-size: size(small13);
}

.card-checkbox {
	display: inline-flex;
	height: 15px;
	vertical-align: middle;
	width: 24px;

	.icon {
		font-size: size(medium15) !important;
	}
}
</style>
