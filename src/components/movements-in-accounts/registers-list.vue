<template>
	<div>
		<table-scroll
			:all-checked="allChecked"
			:btn-add="btnAdd"
			:btn-add-disabled="btnAddDisabled"
			:btn-add-text="btnAddText"
			:btn-filter="btnFilter"
			:btn-retention-disabled="btnRetentionDisabled"
			:disabled-prop="disabledProp"
			:entity="entity"
			:footer-label="footerLabel"
			:footer-show="footerShow"
			:footer-value="footerValue"
			:heading="heading"
			:last-page="lastPage"
			:load-message="loadMessage"
			:page="currentPage"
			:pagination="pagination"
			:rows="rows"
			:selectable="selectable"
			:selectable-prop="selectableProp"
			:table-height="tableHeight"
			:total-visible="totalVisible"
			:validate-class="validateClass"
			:show-cxc="showCxc"
			:search="search"
			:show-cxp="showCxp"
			:showSearch="showSearch"
			:show-detail="showDetail"
			:details="details"
			@change-page="$emit('change-page', $event)"
			@on-click-icon="$emit('on-click-icon', $event)"
			@on-row-clicked="$emit('on-row-clicked', $event)"
			@row-selected="$emit('row-selected', $event)"
			@selected-all="$emit('selected-all', $event)"
			@set-search="$emit('set-search', $event)"
			@set-rows="$emit('search-registers', $event)"
		>
			<template slot="header">
				<v-flex
					v-for="column in columns"
					:key="column.id"
					:class="column.class"
					v-if="column.visible"
				>
					{{ column.name }}
				</v-flex>
			</template>
			<template slot="body" slot-scope="props">
				<v-flex
					v-for="column in columns"
					v-if="column.visible"
					:key="column.id"
					class="table-scroll-col"
					:class="[
						column.class,
						getClass(props.row),
						props.row.flagActive === 0 ? 'transaction-disabled' : null,
					]"
				>
					<template v-if="column.value === 'actions'">
						<slot name="actions" :row="props.row"></slot>
					</template>
					<template v-else>
						<span class="table-scroll-text">
							<template
								v-if="
									column.value === 'debtAmount' || column.value === 'amount'
								"
							>
								{{ props.row[column.value] | round }}
							</template>
							<template
								v-else-if="
									column.value === 'emissionDate' ||
									column.value === 'receptionDate'
								"
							>
								{{ props.row[column.value] | exactDate }}
							</template>
							<template v-else-if="column.value === 'documentNumberType'">
								<a @click="preGoTo(props.row)" class="red-text underline">
									{{ props.row[column.value] }}
								</a>
							</template>
							<template v-else-if="column.tooltip">
								<v-tooltip top>
									<template slot="activator">
										{{ props.row[column.value] }}
									</template>
									<span>{{ props.row[column.tooltip] }}</span>
								</v-tooltip>
							</template>
							<template v-else>
								{{ props.row[column.value] || '-' }}
							</template>
						</span>
					</template>
				</v-flex>
			</template>
		</table-scroll>
	</div>
</template>

<script>
import tableScroll from '@/components/shared/table/table-scroll';

function getClass({ debtsSalesCustomer, status }) {
	if (debtsSalesCustomer >= 0) {
		return status !== 3 ? 'red-text' : '';
	}
	return status !== 3 ? 'red-text' : '';
}

export default {
	name: 'registers-list',
	components: {
		tableScroll,
	},
	methods: {
		getClass,
		preGoTo(document) {
			this.$emit('click-document-link', document);
		},
	},
	props: {
		allChecked: {
			default: false,
			type: Boolean,
		},
		btnAdd: {
			default: true,
			type: Boolean,
		},
		btnAddDisabled: {
			default: false,
			type: Boolean,
		},
		btnAddText: String,
		btnFilter: {
			default: true,
			type: Boolean,
		},
		btnRetentionDisabled: {
			default: true,
			type: Boolean,
		},
		columns: {
			default: () => [],
			type: Array,
		},
		currentPage: Number,
		disabledProp: String,
		entity: String,
		footerLabel: [String, Number],
		footerShow: {
			default: false,
			type: Boolean,
		},
		footerValue: [String, Number],
		heading: {
			default: false,
			type: Boolean,
		},
		lastPage: Number,
		loadMessage: String,
		pagination: {
			default: false,
			type: Boolean,
		},
		rows: {
			default: () => [],
			type: Array,
		},
		selectable: {
			default: false,
			type: Boolean,
		},
		selectableProp: String,
		tableHeight: {
			default: '600px',
			type: String,
		},
		totalVisible: {
			default: 5,
			type: Number,
		},
		validateClass: String,
		showCxc: {
			type: Boolean,
			default: false,
		},
		search: String,
		showCxp: {
			type: Boolean,
			default: false,
		},
		showSearch: {
			type: Boolean,
			default: true,
		},
		showDetail: {
			default: false,
			type: Boolean,
		},
		details: {
			type: Array,
			default: () => [],
		},
	},
};
</script>

<style lang="scss" scoped>
.table-scroll-text {
	line-height: 1;
}

.red-text {
	color: #f40029;
	font-family: font(open-regular);
	font-size: size(medium);
}

.underline {
	text-decoration: underline;
}

.col1 {
	flex-basis: 12%;
	max-width: 12%;
	width: 100%;
}

.col2 {
	flex-basis: 14%;
	max-width: 14%;
	width: 100%;
}

.col3 {
	flex-basis: 17%;
	max-width: 17%;
	width: 100%;
}

.transaction-disabled {
	color: color(subheader);
	text-decoration: line-through;
}
</style>
