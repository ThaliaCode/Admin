<template>
	<div
		class="main-header-page hide-and-print"
		:style="`${captionNavigation && alignEnd ? 'padding-bottom: 5px;' : ''}`"
	>
		<v-layout
			wrap
			justify-space-between
			class="px-4-page"
			:class="captionNavigation && alignEnd ? 'align-end' : 'align-center'"
		>
			<v-flex class="navigation-column">
				<template
					v-if="$route.name === 'dashboard-report' && $route.query.origin === 'dashboard'"
				>
					<app-tooltip-button
						color="success"
						icon="arrow_back_ios"
						text="Volver a dashboard general"
						@click-icon="$router.push('/dashboard')"
					></app-tooltip-button>
				</template>
				<template v-else-if="navigation">
					<app-tooltip-button
						color="success"
						icon="arrow_back_ios"
						:text="$route.meta.navigationText"
						@click-icon="$emit('navigation-back')"
					></app-tooltip-button>
				</template>
				<template
					v-else-if="
						$route.name !== 'accountant-configuration' &&
						$route.meta.navigation &&
						!$route.query.navigationValidation
					"
				>
					<template v-if="$route.meta.navigation">
						<app-tooltip-button
							color="success"
							icon="arrow_back_ios"
							:text="$route.meta.navigationText"
							@click-icon="
								$router.push(
									$route.meta.navigationChange
										? $route.query.origin
										: $route.meta.navigationRoute
								)
							"
						></app-tooltip-button>
					</template>
				</template>
			</v-flex>
			<v-flex :class="listSubsidiaries ? 'pb-3' : 'pb-0'">
				<span class="caption-navigation">
					{{ captionNavigation }}
				</span>
				<h1 class="header-page-title">
					<template v-if="title.length > 29">
						{{ document }}
						<v-tooltip top>
							<span slot="activator">{{ title | limitTo(limitTitle) }} </span>
							<span>{{ title }}</span>
						</v-tooltip>
						{{ numberBill }}
					</template>
					<template v-else> {{ document }} {{ title }} {{ numberBill }} </template>
					<router-link v-if="btnHeaderShow" :to="btnHeaderLink" class="btn-header-link">
						{{ btnHeaderText }}
					</router-link>
				</h1>
			</v-flex>
			<v-flex :class="btnsColumn">
				<v-layout wrap align-center :class="justifyClass">
					<v-flex :class="columnClass" v-if="toShow">
						<v-layout
							:class="captionNavigation && alignEnd ? 'align-end' : 'align-center'"
							justify-end
						>
							<slot></slot>
							<v-menu
								content-class="excel-menu-content"
								offset-y
								:nudge-bottom="5"
								:nudge-left="70"
								v-if="exportToPdfList"
								:open-on-click="openOnClick"
							>
								<v-btn
									slot="activator"
									@click.prevent="downloadDispatchList"
									class="btn-download-excel btn-auto py-1 px-1 mr-3"
								>
									<img src="/static/img/icon-pdf.svg" height="17" class="align-img" />
								</v-btn>
								<v-list>
									<v-list-tile
										v-for="option in optionsAmortizations"
										:key="option.id"
										@click="downloadDispatchList(option.code)"
									>
										<v-list-tile-title>
											{{ option.name }}
										</v-list-tile-title>
									</v-list-tile>
								</v-list>
							</v-menu>
							<v-btn
								v-if="exportToPdf"
								@click.prevent="downloadDispatch"
								class="header-page-download-document primary mr-1"
							>
								<img src="/static/img/icon-pdf.svg" height="17" class="align-img" />
							</v-btn>
							<v-btn
								v-if="showExcel"
								class="header-page-download-document primary btn-auto py-1 px-1 mr-3"
								:disabled="excelLoading"
								@click="downloadDocument"
							>
								<img src="/static/img/excel.svg" alt="download" height="17" />
							</v-btn>
							<v-menu
								content-class="excel-menu-content"
								offset-y
								:nudge-bottom="5"
								:nudge-left="120"
								v-if="showExcelMenu"
								:open-on-click="openOnClick"
							>
								<v-btn
									slot="activator"
									class="btn-download-excel btn-auto py-1 px-1 mr-3"
									:disabled="excelLoading"
									@click="$emit('click-menu')"
								>
									<img src="/static/img/excel.svg" alt="download" height="17" />
								</v-btn>
								<v-list>
									<v-list-tile
										v-for="option in options"
										:key="option.id"
										@click="downloadDocument(option.code)"
									>
										<v-list-tile-title>
											{{ option.name }}
										</v-list-tile-title>
									</v-list-tile>
								</v-list>
							</v-menu>
							<v-btn
								color="pink"
								:disabled="cleanDisabled"
								v-if="showClean"
								class="btn-auto my-0 mr-0 py-2 px-3"
								@click="cleanFilter"
							>
								Limpiar
							</v-btn>
						</v-layout>
					</v-flex>
					<v-flex xs3 v-if="quotation || sale">
						<v-layout wrap align-center justify-end>
							<v-flex xs3>
								<v-tooltip top>
									<v-btn
										flat
										slot="activator"
										class="header-page-download-document"
										@click="downloadDispatch"
									>
										<v-icon color="primary">print</v-icon>
									</v-btn>
									<span>Descarga simple</span>
								</v-tooltip>
							</v-flex>
							<v-flex xs3 v-if="dispatchByGroup">
								<v-tooltip top>
									<v-btn
										flat
										slot="activator"
										class="header-page-download-document"
										v-if="dispatchByGroup"
										@click="downloadGroupDispatch"
									>
										<v-icon color="primary">save_alt</v-icon>
									</v-btn>
									<span>Descarga Agrupados</span>
								</v-tooltip>
							</v-flex>
							<v-flex xs3>
								<app-tooltip-button
									img="/static/icon/whatsapp-icon.svg"
									text="WhatsApp"
									color="primary"
									height="20"
									x-large
									@click-icon="$emit('show-modal-send')"
								/>
							</v-flex>
							<v-flex xs3>
								<app-tooltip-button
									class="hide-and-print"
									color="primary"
									icon="fit_screen"
									text="Imprimir pantalla"
									@click-icon="print"
								></app-tooltip-button>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs4 v-if="listSubsidiaries" pt-3 pb-3>
						<app-select
							append-icon="keyboard_arrow_down"
							class="border-select select-outline border-outline"
							content-class="content-outline"
							:item="subsidiaryId"
							:item-text="itemText"
							item-value="id"
							:items="subsidiaries"
							place-holder="Sucursales"
							model="subsidiaryId"
							@input="$emit('selected-subsidiary', $event)"
							v-if="subsidiaries.length > 1 || !subsidiaryId"
						></app-select>
						<span v-else-if="subsidiaries.length" class="header-title-header">{{
							subsidiaries[0][itemText]
						}}</span>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex v-if="showActions" text-xs-right>
				<action-mobile
					:resource-uri="$route.name"
					:value-disabled="valueDisabled"
					@run-action="runAction"
				/>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
import actionMobile from '@/components/shared/action-bar/action-mobile';
import trackFiltersMixin from '@/mixins/trackFiltersMixin';

function cleanFilter() {
	this.$emit('clean-product-filter');
}

function columnsToExport() {
	const columnsSelected = this.columns.filter(
		(column) => column.visible && !column.flagVisible
	);
	const newColumns = columnsSelected.map((col) => {
		const newCol = Object.assign({}, col);
		if (col.tooltip) {
			delete newCol.tooltip;
		}
		delete newCol.id;
		delete newCol.visible;
		delete newCol.checked;
		return newCol;
	});
	return newColumns;
}

function dataToExport() {
	let tableDataToExport = [];
	const columnsSelected = this.columns.filter(
		(column) => column.visible && !column.flagVisible
	);
	const columnsValues = columnsSelected.map((colVal) => {
		const newColVal = Object.assign({}, colVal);
		return newColVal.value;
	});
	if (this.rows.length > 0) {
		tableDataToExport = this.rows.map((dataExport) => {
			const newData = Object.assign({}, dataExport);
			const keysData = Object.keys(dataExport);
			keysData.forEach((keyData) => {
				if (columnsValues.every((keyCol) => keyCol !== keyData)) {
					delete newData[keyData];
				}
			});
			return newData;
		});
	}
	return tableDataToExport;
}

function downloadDispatchList(code) {
	this.$emit('download-dispatch-list', code);
}

function downloadDispatch() {
	this.$emit('download-dispatch');
}

function downloadGroupDispatch() {
	this.$emit('download-dispatch', true);
}

function downloadDocument(code) {
	if (this.inventoryExcel) {
		this.$emit('generate-inventory-excel');
	} else if (this.emitExcel) {
		this.$emit('emit-excel');
	} else if (this.showExcelMenu) {
		this.$emit('emit-excel', code);
	} else {
		this.exportTable(this.columnsToExport, this.dataToExport, this.name);
	}
}

function print() {
	window.print();
}

function runAction(item) {
	this.$emit('run-action', item);
}

export default {
	name: 'header-page',
	mixins: [trackFiltersMixin],
	computed: {
		columnsToExport,
		dataToExport,
	},
	components: {
		actionMobile,
	},
	methods: {
		downloadGroupDispatch,
		downloadDispatch,
		downloadDispatchList,
		downloadDocument,
		cleanFilter,
		print,
		runAction,
	},
	props: {
		btnHeaderLink: {
			default: () => {},
			type: [Object, String],
		},
		btnHeaderText: String,
		btnHeaderShow: {
			default: false,
			type: Boolean,
		},
		captionNavigation: String,
		cleanDisabled: {
			default: false,
			type: Boolean,
		},
		columnClass: {
			default: 'xs8',
			type: String,
		},
		columns: {
			type: Array,
		},
		dispatchByGroup: {
			deafult: false,
			type: Boolean,
		},
		emitExcel: {
			default: false,
			type: Boolean,
		},
		excelLoading: {
			default: false,
			type: Boolean,
		},
		exportToPdf: {
			default: false,
			type: Boolean,
		},
		exportToPdfList: {
			default: false,
			type: Boolean,
		},
		showDocuments: {
			default: false,
			type: Boolean,
		},
		justifyClass: {
			default: 'justify-end',
			type: String,
		},
		name: {
			type: String,
		},
		options: {
			default: () => [],
			type: Array,
		},
		optionsAmortizations: {
			default: () => [],
			type: Array,
		},
		rows: {
			type: Array,
		},
		showClean: {
			default: true,
			type: Boolean,
		},
		showExcel: {
			default: true,
			type: Boolean,
		},
		showExcelMenu: {
			default: false,
			type: Boolean,
		},
		title: {
			type: String,
		},
		toShow: {
			default: false,
			type: Boolean,
		},
		quotation: {
			default: false,
			type: Boolean,
		},
		sale: {
			default: false,
			type: Boolean,
		},
		openOnClick: {
			deafult: true,
			type: Boolean,
		},
		inventoryExcel: {
			default: false,
			type: Boolean,
		},
		numberBill: {
			type: String,
			required: false,
		},
		document: {
			type: String,
			required: false,
		},
		alignEnd: {
			default: true,
			type: Boolean,
		},
		listSubsidiaries: {
			default: false,
			type: Boolean,
		},
		subsidiaries: {
			type: Array,
			default: () => [],
		},
		subsidiaryId: [Number, String],
		itemText: {
			default: 'rzSocial',
			type: String,
		},
		limitTitle: Number,
		btnsColumn: {
			default: 'xs8',
			type: String,
		},
		showActions: {
			default: false,
			type: Boolean,
		},
		resourceUri: String,
		valueDisabled: {
			default: () => [],
			type: Array,
		},
		navigation: {
			default: false,
			type: Boolean,
		},
		trackFilters: Object,
		trackKeys: Array,
	},
};
</script>

<style lang="scss" scoped>
.main-header-page {
	@include flex-between;
	background-color: color(white);
	flex-wrap: wrap;
	// margin: 0 -12px;
	min-height: 52px;

	.header-page-title {
		align-items: center;
		color: map-get($colors, paginationText);
		display: flex;
		font-family: map-get($fonts, open-semibold);
		font-size: 12px;
		line-height: 0.8;
		margin: 0px;

		@media (min-width: 1024px) {
			font-size: 20px;
		}
	}

	.btn {
		@include txt-config(open-semibold, small10);
		background-color: map-get($colors, orange-btn);
		border-radius: 5px;
		color: color(white);
		height: 25px;
		min-width: 58px;
		text-transform: capitalize;
	}

	.header-page-download-document {
		@include flex-center;
		height: 25px;
		min-width: 25px;
		margin: 0px;
	}
}

.caption-navigation {
	color: color(brown-grey);
	font-family: font(lato-regular);
	font-size: size(medium);
	line-height: 0.8;
}

.btn-header-link {
	border: 1px solid color(success);
	border-radius: 4px;
	color: color(success);
	font-family: font(open-semibold);
	font-size: size(small10);
	height: 21px;
	margin-left: 10px;
	min-width: 66px;
	padding: 5px;
	text-align: center;
	text-decoration: none;
}

.select-subsidiaries {
	border: 1px solid map-get($colors, selector-color);
	border-radius: 40px;
	color: map-get($colors, selector-color) !important;
	text-overflow: ellipsis;
	white-space: nowrap !important;
	overflow: hidden !important;
}

.navigation-column {
	max-width: fit-content;
	max-width: -moz-fit-content;
}

.px-4-page {
	padding: 0px 24px;

	@media (max-width: 760px) {
		padding: 0px 16px;
	}
}
</style>
