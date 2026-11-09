<template>
	<fixed-slider
		:disabled="disabled"
		:height-var="heightVar"
		:loading="loading"
		:padding-success="paddingSuccess"
		:success-text="successText"
		@cancel="$emit('cancel-action')"
		@success-action="$emit('success-action')"
	>
		<v-flex xs6>
			<searcher-input
				:search="search"
				:readonly="searchReadonly"
				@search-value="$emit('search-value', $event)"
			></searcher-input>
		</v-flex>
		<v-flex xs6 px-2 mb-1>
			<app-select
				:item="groupId"
				item-text="name"
				item-value="id"
				:items="groups"
				model="groupId"
				:return-object="true"
				:place-holder="'Selecciona el grupo'"
				@input="$emit('get-data', $event)"
			/>
		</v-flex>
		<v-flex xs12 py-3>
			<p class="name-title">
				{{ titleList }}
			</p>
		</v-flex>
		<v-flex xs12 mb-2 v-if="customerList">
			<bar-information
				:information="info"
				:row-style="false"
				:show-colon="false"
			></bar-information>
		</v-flex>
		<v-flex xs12 id="scroll-target">
			<v-layout
				wrap
				class="customers-container"
				align-content-start
				v-scroll:#scroll-target="onScroll"
			>
				<v-flex v-for="customer in customers" :key="customer.id" py-1 xs12>
					<customer-card
						:active="customer.isSelected"
						:customer="customer"
						:information="cardInfo"
						:selectable="selectable"
						:show-status="showStatus"
						:show-zone="showZone"
						@card-action="$emit('card-action', $event)"
						@on-checked="$emit('on-checked', $event, customer)"
					></customer-card>
				</v-flex>
				<div v-if="loadingPagination" class="loading-container text-xs-center">
					<v-progress-circular
						v-if="loadingPagination"
						:width="3"
						indeterminate
						color="gray"
					></v-progress-circular>
				</div>
			</v-layout>
		</v-flex>
	</fixed-slider>
</template>

<script>
import barInformation from '@/components/field-sale/shared/bar-information';
import customerCard from '@/components/field-sale/shared/customer-card';
import fixedSlider from '@/components/field-sale/shared/fixed-slider';
import searcherInput from '@/components/field-sale/shared/searcher-input';

function onScroll(event) {
	this.$emit('on-scroll', event);
}

export default {
	name: 'list-aside',
	components: {
		barInformation,
		customerCard,
		fixedSlider,
		searcherInput,
	},
	methods: {
		onScroll,
	},
	props: {
		cardInfo: {
			default: () => [],
			type: Array,
		},
		customerList: {
			default: false,
			type: Boolean,
		},
		customers: {
			default: () => [],
			type: Array,
		},
		disabled: {
			default: false,
			type: Boolean,
		},
		heightVar: {
			default: 132,
			type: [Number, String],
		},
		info: {
			default: () => [],
			type: Array,
		},
		loading: {
			default: false,
			type: Boolean,
		},
		loadingPagination: {
			default: false,
			type: Boolean,
		},
		paddingSuccess: String,
		search: String,
		searchReadonly: {
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
		successText: String,
		titleList: String,
		groups: {
			default: () => [],
			type: Array,
		},
		groupId: [Number, String],
	},
};
</script>

<style lang="scss" scoped>
.name-title {
	border-bottom: 2px solid color(blue-card);
	color: color(blue-card);
	font-family: font(lato-regular);
	font-size: size(medium);
	margin-bottom: 0px;
	padding-bottom: 6px;
}

#scroll-target {
	height: calc(100% - 185px);
	overflow: auto;

	.customers-container {
		height: 100%;
	}
}

.loading-container {
	padding-top: 5px;
	width: 100%;
}
</style>
