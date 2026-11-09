<template>
	<v-layout
		wrap
		align-center
		justify-center
		primary
		darken-1
		py-2
		white--text
	>
		<template v-if="title">
			<v-flex class="title-list" text-xs-center>
				{{ title }}
			</v-flex>
		</template>
		<template v-else v-for="detail in details">
			<v-flex text-xs-center caption :key="detail.id" :class="{ 'border-right' : detail.value }">
				<span class="semibold-text">{{ detail.label }}:</span>
				<span class="regular-text">
					<template v-if="detail.field === 'emissionDate'">
						{{ detail.value | exactDate('DD-MM-YYYY HH:mm:ss', true) }}
					</template>
					<template v-else-if="detail.field === 'debtAmount'">
						{{ Number(detail.value) | round }}
					</template>
					<template v-else>
						{{ detail.value }}
					</template>
				</span>
			</v-flex>
		</template>
		<slot name="action-button"></slot>
	</v-layout>
</template>

<script>
	export default {
		name: 'heading-list',
		props: {
			details: {
				default: () => [],
				type: Array,
			},
			title: String,
		},
	};
</script>

<style lang="scss" scoped>
	.title-list {
		font-family: font(open-bold);
		font-size: size(small13);
	}

	.semibold-text {
		font-family: font(open-semibold);
	}

	.regular-text {
		font-family: font(open-regular);
	}

	.border-right:not(:last-child) {
		border-right: 1px solid color(white);
	}
</style>