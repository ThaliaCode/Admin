<template>
	<div>
		<v-layout
			align-center
			justify-end
			lighten-1
			primary
			text-xs-center
			v-if="heading"
			white--text
			wrap
			class="table-scroll-header table-scroll-heading"
		>
			<v-flex xs5 pr-2 text-xs-right>
				<div class="search-input" v-if="showSearch">
					<input
						type="text"
						:value="search"
						@change="$emit('set-search', $event.target.value)"
						@keyup.enter="$emit('set-rows', $event.target.value)"
						@keyup.esc="$emit('set-rows', $event.target.value)"
					/>
					<v-icon>search</v-icon>
				</div>
			</v-flex>
			<v-flex xs1 text-xs-center v-if="btnFilter">
				<app-tooltip-button
					class="table-scroll-tooltip"
					icon="filter_list"
					color="white"
					text="Filtros"
				/>
			</v-flex>
			<v-layout row align-center justify-end pt-1 pb-1 v-if="showCxc">
				<button
					v-if="!isPeru"
					class="btn-table-scroll"
					:disabled="btnRetentionDisabled"
					type="button"
					@click="$emit('on-click-icon', 'retention')"
				>
					Retención
				</button>
				<button
					:disabled="btnAddDisabled"
					class="btn-table-scroll ml-2 mr-2"
					@click="$emit('on-click-icon')"
				>
					Nuevo Cobro
				</button>
			</v-layout>
			<v-layout row align-center justify-end pt-1 pb-1 v-if="showCxp">
				<button
					:disabled="btnAddDisabled"
					class="btn-table-scroll ml-2 mr-2"
					@click="$emit('on-click-icon')"
				>
					Nuevo Pago
				</button>
			</v-layout>
			<v-flex xs1 text-xs-center v-if="btnAdd">
				<app-tooltip-button
					class="table-scroll-tooltip btn-add"
					:disabled="btnAddDisabled"
					icon="add"
					color="primary"
					:text="btnAddText"
					@click-icon="$emit('on-click-icon')"
				/>
			</v-flex>
		</v-layout>
		<v-layout
			wrap
			align-center
			text-xs-center
			primary
			lighten-1
			white--text
			class="table-scroll-header"
		>
			<v-flex xs0 v-if="selectable">
				<input
					:checked="allChecked"
					class="input-checkbox"
					:disabled="!rows || rows.length === 0"
					type="checkbox"
					:value="allChecked"
					@change="$emit('selected-all', $event.target.checked)"
				/>
			</v-flex>
			<slot name="header"></slot>
		</v-layout>
		<v-layout
			class="table-scroll-body"
			:style="`height: calc(100vh - ${tableHeight});`"
			align-content-start
			align-center
			text-xs-center
			white
			wrap
		>
			<template v-if="rows.length === 0 && (entity || loadMessage)">
				<v-layout row wrap align-center justify-center class="loading-table">
					<v-flex xs7 px-4 py-2 class="loading-table-container">
						<p class="loading-table-text mb-0">
							<template v-if="loadMessage">
								{{ loadMessage }}
							</template>
							<template v-else>
								Es necesario seleccionar un {{ entity }} para ver los registro.
							</template>
						</p>
					</v-flex>
				</v-layout>
			</template>
			<template v-else>
				<v-flex v-for="row in rows" :key="row.id" xs12 class="table-scroll-row">
					<v-layout
						wrap
						text-xs-center
						align-center
						:class="{
							'row-selected': row.isSelected,
							'error--text': validClass(row),
							'blue--text': validAmount(row),
						}"
						@click="$emit('on-row-clicked', row)"
					>
						<v-flex xs0 v-if="selectable" @click.stop="stopClick">
							<input
								:disabled="row[disabledProp]"
								:checked="row[selectableProp]"
								class="input-checkbox"
								type="checkbox"
								:value="row[selectableProp]"
								@change="$emit('row-selected', row)"
							/>
						</v-flex>
						<slot name="body" :row="row"></slot>
					</v-layout>
				</v-flex>
			</template>
		</v-layout>
		<v-layout align-center row wrap class="footer-table" justify-end v-if="footerShow">
			<label class="label-text pr-2">{{ footerLabel }}</label>
			<span class="value-text">{{ footerValue }}</span>
		</v-layout>
		<v-layout justify-end v-if="pagination">
			<v-pagination
				:length="lastPage"
				:total-visible="totalVisible"
				:value="page"
				@input="$emit('change-page', $event)"
			></v-pagination>
		</v-layout>
		<v-layout v-if="showDetail" wrap justify-start class="table__container">
			<div v-for="detail in details" :key="detail.id">
				<register-detail
					min
					:field="detail.field"
					:label="detail.label"
					:value="detail.value"
					:tooltip="detail.tooltip"
				></register-detail>
			</div>
		</v-layout>
	</div>
</template>

<script>
import registerDetail from '@/components/movements-in-accounts/register-detail';

function validClass({ amount }) {
	return amount < 0;
}

function validAmount({ amount }) {
	return amount > 0;
}

export default {
	name: 'table-scroll',
	components: {
		registerDetail,
	},
	methods: {
		validClass,
		validAmount,
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
			default: true,
			type: Boolean,
		},
		btnAddText: {
			default: '',
			type: String,
		},
		btnFilter: {
			default: true,
			type: Boolean,
		},
		btnRetentionDisabled: {
			default: true,
			type: Boolean,
		},
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
		page: Number,
		pagination: {
			default: false,
			type: Boolean,
		},
		rows: {
			default: () => [],
			type: Array,
		},
		search: String,
		selectable: {
			default: false,
			type: Boolean,
		},
		selectableProp: String,
		tableHeight: {
			default: '630px',
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
.table-scroll-body {
	border: 1px solid color(blue-grey) !important;
	overflow: auto;
	position: relative;
}

.table-scroll-header {
	font-family: font(open-semibold);
	font-size: size(small13);
	height: 36px;

	&.table-scroll-heading {
		height: 29px;
	}
}

.table-scroll-row {
	color: color(paginationText);
	font-family: font(open-regular);
	font-size: size(small13);

	.table-scroll-col {
		align-items: center;
		display: flex;
		height: 30px;
		justify-content: center;
	}

	&:nth-child(2n):not(.tooltip) {
		background-color: color(background-table);
	}

	:nth-child(2n):not(.tooltip):not(:last-child) {
		border-left: 1px solid color(blue-grey);
		border-right: 1px solid color(blue-grey);
	}

	:nth-child(2n):not(.tooltip):last-child {
		border-left: 1px solid color(blue-grey);
	}
}

.input-checkbox {
	border: 1px solid color(grey-border);
	border-radius: 1px;
	height: 12px;
	width: 12px;
}

.search-input {
	background-color: rgba(0, 0, 0, 0.2);
	border-radius: 3px;
	box-shadow: inset 0 1px 1px 0 rgba(0, 0, 0, 0.2);
	display: inline-flex;
	height: 23px;
	max-width: 153px;
	vertical-align: middle;

	input {
		color: color(white);
		font-size: 14px;
		outline: none;
		padding: 0 5px;
		width: calc(100% - 25px);
	}

	.icon {
		align-self: center;
		color: color(white);
		font-size: size(medium20);
		transform: rotate(90deg);
	}
}

.table-scroll-tooltip {
	display: inline-block;
	height: 24px;
}

.row-selected {
	background-color: color(rowSelected);
	border: 1px solid color(borderRowSelected);
}

.footer-table {
	background-color: #e2f1f1;
	border-bottom-left-radius: 10px;
	border-bottom-right-radius: 10px;
	color: color(generalText);
	font-family: font(open-semibold);
	font-size: size(small13);
	height: 50px;
	padding: 0px 26px;
}

.value-text {
	color: color(background-sidebar);
	font-family: font(open-bold);
	font-size: 19px;
}

.loading-table {
	height: 100%;
	left: 0;
	position: absolute;
	top: 0;
	width: 100%;
	z-index: 1;

	&-container {
		background-color: color(white);
		border: 2px solid color(background-sidebar);
		border-radius: 6px;
	}

	&-text {
		color: color(paginationText);
		font-family: font(open-semibold);
		font-size: size(small13);
	}
}

.btn-table-scroll {
	background-color: white;
	border-radius: 5px;
	color: color(primary) !important;
	font-family: map-get($fonts, lato-bold) !important;
	font-size: size(small13);
	padding: 0.35rem 1rem;
}

.table {
	&__container {
		background-color: #e2f1f1;
		color: color(generalText);
		font-family: font(open-semibold);
		font-size: size(small13);
		height: 92px;
		padding: 11px 7px;
	}
}
</style>
