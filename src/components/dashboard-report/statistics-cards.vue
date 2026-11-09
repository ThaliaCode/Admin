<template>
	<v-layout
		wrap
		align-center
		class="statistics-cards"
		:style="`background-color: ${info.background}`"
	>
		<v-flex :class="inline || showIcon ? 'xs2 text-xs-center' : 'xs3'" text-xs-center>
			<div class="contianer-image">
				<template v-if="info.icon && showIcon">
					<v-icon color="primary" size="36">{{ info.icon }}</v-icon>
				</template>
				<template v-else>
					<img :src="info.urlImage" height="30" />
				</template>
			</div>
		</v-flex>
		<v-flex :class="inline || showIcon ? 'xs10' : 'xs9'">
			<template v-if="inline">
				<span
					class="statistics-cards-title statistics-cards-title-inline"
					:style="`color: ${info.titleColor}`"
				>
					{{ info.title }}
				</span>
				<span
					class="statistics-cards-content statistics-cards-content-inline"
					:style="`color: ${info.color}`"
				>
					<span>{{ info.total | round }} {{ info.currency }}</span>
				</span>
			</template>
			<template v-else-if="showIcon && items.length > 0">
				<v-layout row wrap>
					<v-flex xs4 v-for="(item, itemIdx) in items" :key="item.id">
						<v-layout row wrap align-center>
							<v-flex
								:class="itemIdx === 0 || itemIdx === 1 || itemIdx === 2 ? 'xs9' : 'xs12'"
								text-xs-center
							>
								<p class="statistics-cards-title white--text caption">
									{{ item.title }}
								</p>
								<p class="statistics-cards-content mb-0" :style="`color: ${item.color}`">
									<span v-if="item.labelTotal"
										>{{ item.total }} {{ item.labelTotal }}</span
									>
									<span v-else
										>{{ $userInfo.company.currencyDefault.symbol }}
										{{ item.total | round }}</span
									>
								</p>
							</v-flex>
							<v-flex
								xs3
								pt-3
								v-if="itemIdx === 0 || itemIdx === 1 || itemIdx === 2"
								:style="`color: ${item.color}`"
								text-xs-center
							>
								<span v-if="itemIdx === 0">=</span>
								<span v-if="itemIdx === 1 || itemIdx === 2">-</span>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</template>
			<template v-else>
				<p class="statistics-cards-title white--text">
					{{ info.title }}
				</p>
				<p class="statistics-cards-content mb-0" :style="`color: ${info.color}`">
					<span v-if="info.labelTotal">{{ info.total }} {{ info.labelTotal }}</span>
					<span v-else>{{ info.total | round }} {{ info.currency }}</span>
				</p>
			</template>
		</v-flex>
	</v-layout>
</template>

<script>
export default {
	name: 'statistics-cards',
	props: {
		info: {
			default: () => {},
			type: Object,
		},
		inline: {
			default: false,
			type: Boolean,
		},
		items: {
			default: () => [],
			type: Array,
		},
		showIcon: {
			default: false,
			type: Boolean,
		},
	},
};
</script>

<style lang="scss" scoped>
.statistics-cards {
	border-radius: 7px;
	box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.13);
	height: 64px;
	margin-left: 10px;

	&-title {
		font-family: font(open-regular);
		margin-bottom: 4px;

		&.statistics-cards-title-inline {
			font-family: font(open-bold);
			font-size: size(medium);
			padding: 0px 15px;
		}
	}

	&-content {
		font-family: font(open-bold);
		font-size: size(medium17);

		&.statistics-cards-content-inline {
			font-size: size(medium18);
		}
	}
}

.container-statistics-cards {
	&:first-of-type {
		.statistics-cards {
			margin-left: 0px;
		}
	}
}

.contianer-image {
	background-color: rgba(0, 0, 0, 0.17);
	border-radius: 100%;
	height: 32px;
	margin: auto;
	width: 32px;
}
</style>
