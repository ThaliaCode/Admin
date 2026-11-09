<template>
	<div class="text-xs-left pb-1">
		<div class="value-container" :class="{ large: large, min: min }">
			<div
				class="label-container"
				:class="{ 'large-h': largeHead, 'green-h': greenHead }"
			>
				<label
					class="label-detail secondary--text caption"
					:class="{ 'white--text': greenHead }"
					>{{ label }}:</label
				>
			</div>
			<p class="value-detail caption">
				<template v-if="isDate">
					{{ value | exactDate }}
				</template>
				<template v-else-if="isDateCreated">
					{{ value | formatPaymentDate }}
				</template>
				<template v-else-if="tooltip">
					<v-tooltip top>
						<template slot="activator">
							{{ value }}
						</template>
						<span>{{ tooltip }}</span>
					</v-tooltip>
				</template>
				<template v-else>
					{{ value }}
				</template>
			</p>
		</div>
	</div>
</template>

<script>
function isDate() {
	return (
		this.field === 'emissionDate' ||
		this.field === 'expirationDate' ||
		this.field === 'receptionDate'
	);
}

function isDateCreated() {
	return this.field === 'createdAt';
}

export default {
	name: 'register-detail',
	computed: {
		isDate,
		isDateCreated,
	},
	props: {
		field: String,
		label: String,
		large: {
			default: false,
			type: Boolean,
		},
		value: [String, Number],
		min: {
			default: false,
			type: Boolean,
		},
		largeHead: {
			default: false,
			type: Boolean,
		},
		greenHead: {
			default: false,
			type: Boolean,
		},
		tooltip: String,
	},
};
</script>

<style lang="scss" scoped>
.label-container {
	background-color: color(border-green-light);
	display: inline-flex;
	height: 31px;
	line-height: 31px;
	padding-left: 5px;
	width: 64px;

	&.large-h {
		width: 140px;
	}

	&.green-h {
		background-color: color(selector-color);
	}
}

.label-detail {
	font-family: font(open-semibold);
}

.value-container {
	align-items: center;
	background-color: color(green-extra-l);
	display: flex;
	height: 31px;
	min-width: 205px;
	padding-right: 11px;
	width: fit-content;

	&.large {
		width: calc((207px * 2) + 6px);
	}

	&.min {
		min-width: 147px;
	}
}

.value-detail {
	color: color(paginationText);
	font-family: font(open-regular);
	display: inline-flex;
	margin-bottom: 0px;
	padding-left: 11px;
}
</style>
