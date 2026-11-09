<template>
	<div
		class="app-table"
		style="overflow-y: auto"
		:class="[padding, margin, { 'oveflow-auto': !stickyHeader }]"
	>
		<table
			class="table-list"
			:class="{ 'responsive-table': isResponsive }"
			border="0"
			cellpadding="0"
			cellspacing="0"
		>
			<thead class="primary lighten-2" :class="[{ 'sticky-header': stickyHeader }]">
				<tr v-if="inputSearch || filterColumns || includeFilter || addButton">
					<th
						:colspan="totalVisibleColumns"
						:class="`text-xs-${direction}`"
						class="th-radius"
					>
						<div class="head-container">
							<div class="content-product">
								<span> Total filas: {{ this.rows && this.rows.length }} </span>
							</div>
							<div class="content-product" v-if="selectable">
								<span> {{ selectedRows.length }} seleccionados </span>
								<button class="success" @click="deleteItems">
									<v-icon color="white" x-sm> delete_sweep </v-icon>
								</button>
							</div>

							<div style="flex-grow: 1">
								<!-- spacer -->
							</div>
							<div class="search-input" v-if="inputSearch">
								<input
									ref="inputSearchRef"
									type="text"
									:disabled="disabledSearch"
									v-model="search"
									@keyup.exact="setSearch"
									@keyup.enter="searchRows"
									@keyup.esc="searchRows"
									@input="search = search.replace(/[^ -~À-ÿ]+/g, '')"
									:style="{ width: inputWidth }"
								/>
								<v-icon class="mr-1">search</v-icon>
							</div>
							<v-menu
								offset-y
								max-height="300"
								content-class="columns-menu"
								fixed
								v-model="showMenu"
								v-if="filterColumns"
								:close-on-content-click="false"
							>
								<button class="success" slot="activator">
									<v-icon>view_column</v-icon>
								</button>
								<div>
									<template v-for="column in columns">
										<v-checkbox
											:key="column.id"
											v-model="column.checked"
											:label="column.name"
											hide-details
											v-if="!column.flagVisible"
											color="success"
											style="background: white; width: 300px; line-height: normal"
										>
										</v-checkbox>
									</template>
									<div class="apply text-xs-center">
										<button @click="toggleColumns">Aplicar</button>
									</div>
								</div>
							</v-menu>
							<!-- <div class="content-filter">
							<button
								class="icon-button"
								v-if="includeFilter"
								type="button"
								@click="tableOption">
								<v-icon>filter_list</v-icon>
							</button>
							<small @click="tableOption" class="text-cut">
								Filtros
							</small>
						</div> -->
							<span @click="tableOption" v-if="includeFilter" class="width-filter">
								Filtrar
								<button
									class="icon-button"
									v-if="includeFilter"
									type="button"
									@click="tableOption"
								>
									<v-icon>filter_list</v-icon>
								</button>
							</span>
							<button v-if="addButton" type="button" @click="addOption">
								<v-icon>add</v-icon>
							</button>
							<div
								:class="[
									'show-arrow',
									showArrow ? 'active' : null,
									hideDetails ? 'backward-arrow' : 'forward-arrow',
								]"
							>
								<app-tooltip-button
									v-if="showDetailsInfo"
									text="detalles"
									color="white"
									:icon="'arrow_forward'"
									@click-icon="clickIcon"
								/>
							</div>
						</div>
					</th>
				</tr>
				<tr>
					<th v-if="selectable">
						<input
							type="checkbox"
							:value="checkAll"
							:checked="checkAll"
							class="input-checkbox"
							:disabled="checkAllDisabled"
							v-on:change="selectedAll($event)"
						/>
					</th>
					<th
						is="table-column-item"
						v-for="column in columns"
						:key="column.id"
						:column="column"
						v-show="column.visible"
						class="text-xs-center"
						:is-button="isButton"
						@show-list="$emit('show-list', $event)"
						@column-input="$emit('column-input', $event)"
						@on-column-sortable="$emit('on-column-sortable', $event)"
						ref="columnTable"
					></th>
				</tr>
			</thead>
			<tbody @dragover="overDrag">
				<template>
					<tr
						v-for="(row, indexRow) in rows"
						tabindex="0"
						:disabled="
							row.cancelUserId ||
							row.cancelRow ||
							(!!row.flagUse && row.typeDocumentCode !== 'ORC') ||
							row.flagAdvanceInvoice ||
							!!row.disabledRowApply
						"
						:draggable="isDraggable"
						:key="row[keyValue] || indexRow"
						:data-index="indexRow"
						:class="[
							(row.flagUse === true && row.typeDocumentCode !== 'ORC') ||
							!!row.flagUseNTC ||
							row.cancelUserId ||
							row.cancelRow ||
							!!row.disabledRowApply ||
							row.flagTransfer ||
							row.flagAdvanceInvoice ||
							row.statusTax === 11
								? 'row-disabled'
								: null,
							row.isSelected && selectable ? 'row-checked' : null,
							row.quantityDispatch > 0 && row.quantitySend > 0 ? 'row-dispatch' : null,
							paintRow.length > 0
								? { 'paint-red-row': paintRedRow(row, paintRow) }
								: null,
							row.line ? 'line' : null,
							row.flagFree ? 'paint-green-row' : null,
							row.notStockComposed ? 'background-red-row' : null,
							(isDebt(row) && rowRed) || row.productDeleted
								? 'row-red-transparent'
								: null,
							getClassCancel(indexRow) ? 'cancel-style' : null,
							row.cancelUserId || row.cancelRow ? 'line-through' : null,
						]"
						:ref="`row-${indexRow}`"
						@click="rowIsSelected(row, indexRow)"
						@keydown.stop="showDetails($event, row, indexRow)"
						@dragstart="startDrag"
						@dragend="endDrag"
					>
						<td
							v-if="selectable && !isSmallScreen"
							:class="selectable ? 'is-selectable' : ''"
						>
							<input
								v-model="row.isSelected"
								class="input-checkbox"
								:disabled="
									disabledCheck(row) ||
									row.documentNumberBe === '' ||
									row.disabledCheck ||
									null
								"
								type="checkbox"
							/>
						</td>
						<slot name="rows" :row="row" :index="indexRow"></slot>
					</tr>
				</template>
			</tbody>
			<slot name="footerSemi"></slot>
			<tfoot class="table-pagination" v-if="!showPagination">
				<tr v-if="mainList && rows.length > 0">
					<td
						v-if="!!totalQuantity"
						:class="{ 'total-quantity-label': totalQuantityLabel }"
						:colspan="beforeColumn('quantity')"
					>
						{{ totalQuantityLabel }}
					</td>
					<td
						v-if="!!totalQuantity"
						class="total-quantity"
						:class="{ 'total-quantity-input': totalQuantityLabel }"
					>
						{{ totalQuantity }}
					</td>
					<td :colspan="totalsOnFooter" class="text-xs-right">
						<template
							v-if="
								captionQuantity && (itemsQuantity != null || itemsTotalQuantity != null)
							"
						>
							<span class="caption-quantity pr-2"
								>{{ itemsQuantity }} <span>de</span> {{ itemsTotalQuantity }}</span
							>
						</template>
						<input
							type="text"
							@input="selectPage($event.target.value)"
							:value="currentPage"
							class="search-input unique-input"
						/>
						<template v-for="(page, index) in pages">
							<span v-if="page === '...'">
								{{ page }}
							</span>
							<a
								v-else
								:key="index"
								:class="{ 'active-page': page === currentPage }"
								@click="selectPage(page)"
								>{{ page }}
							</a>
						</template>
						<span v-if="pages.length >= 2">|</span>
						<a v-if="pages.length >= 2" @click="selectLastPage">>></a>
					</td>
				</tr>
				<tr v-if="rows.length === 0">
					<td :colspan="totalVisibleColumns">
						<p style="text-align: center; margin: 5px 0 0 5px">
							No hay información que mostrar
						</p>
					</td>
				</tr>
				<slot name="footer"></slot>
			</tfoot>
		</table>
		<slot name="table-details" :details="currentRow"></slot>
	</div>
</template>

<script>
import helper from '@/shared/helper';
import TableColumnItem from './table-column-item';

const ADD_REQUEST_EVENT = 'on-add-event';
const LOCAL_SEARCH_EVENT = 'on-local-search';
const SEARCH_EVENT = 'on-search-event';
const ON_DRAG_EVENT = 'on-drag-event';
const ON_DRAG_ENTER = 'on-drag-enter';
const ON_DRAG_LEAVE = 'on-drag-leave';
const ON_DROP_EVENT = 'on-drop-event';
const ON_PAGE_EVENT = 'on-page';
const ROW_IS_SELECTED = 'row-is-selected';
const SELECTED_ALL_EVENT = 'on-selected-all';
const TABLE_OPTION_EVENT = 'table-option-event';
const ON_DRAG_OVER = 'on-drag-over';
const ON_DRAG_START = 'on-drag-start';
const ON_DRAG_END = 'on-drag-end';

const components = {
	TableColumnItem,
};

function addOption() {
	this.$emit(ADD_REQUEST_EVENT);
}

function paintRedRow(row, arr) {
	const newRow = row;
	const [props, value] = [...arr];
	let result = false;
	if (newRow[props]) {
		result = newRow[props] === value;
	}
	return result;
}

function pagination(pageNumber, totalRecords) {
	const current = pageNumber;
	const last = totalRecords;
	const delta = 2;
	const left = current - delta;
	const right = current + delta + 1;
	const range = [];
	const rangeWithDots = [];
	let l = null;

	for (let i = 1; i <= last; i += 1) {
		/* eslint-disable no-mixed-operators */
		if (i === 1 || i === last || (i >= left && i < right)) {
			range.push(i);
		}
	}

	/* eslint-disable no-restricted-syntax */
	for (const i of range) {
		if (l) {
			if (i - l === 2) {
				rangeWithDots.push(l + 1);
			} else if (i - l !== 1) {
				rangeWithDots.push('...');
			}
		}
		rangeWithDots.push(i);
		l = i;
	}

	return rangeWithDots;
}

function clickIcon() {
	this.$emit('show-details', this.hideDetails);
}

function totalsOnFooter() {
	return this.totalQuantity
		? this.totalVisibleColumns - this.beforeColumn('quantity')
		: this.totalVisibleColumns;
}

function beforeColumn(colVal) {
	return this.columns.findIndex((c) => c.value === colVal) + this.addColValue;
}

function mounted() {
	this.direction = 'right';
	this.checkScreenSize();
	// window.addEventListener('resize', this.checkScreenSize);
	const columnsInLocalStorage = helper.getLocalData(`${this.$attrs.name}::columns`);
	if (columnsInLocalStorage) {
		this.columns.forEach((col) => {
			const newCol = col;
			const colToChange = columnsInLocalStorage.find((c) => c && c.id === newCol.id);
			newCol.visible = !colToChange;
			newCol.checked = !colToChange;
		});
	}
	if (this.localStorage) {
		const searchFromLocalStorage = helper.getLocalData(`${this.$attrs.name}::search`);
		if (searchFromLocalStorage) {
			this.search = searchFromLocalStorage;
			this.$emit(SEARCH_EVENT, searchFromLocalStorage);
		}
	}
	this.$nextTick(() => {
		if (this.$refs.inputSearchRef) {
			setTimeout(() => {
				this.$refs.inputSearchRef.focus();
			}, 0);
		}
	});
}

function toggleColumns() {
	this.selectedColumns = this.columns.filter((c) => !c.checked);
	this.columns.forEach((col) => {
		const newCol = col;
		const colToChange = this.selectedColumns.find((c) => c && c.id === newCol.id);
		newCol.visible = typeof colToChange === 'undefined';
	});
	helper.setLocalData(`${this.$attrs.name}::columns`, this.selectedColumns);
	this.showMenu = false;
}

function selectedAll({ target }) {
	// this.rows = this.rows.map((row) => {
	// 	const newRow = { ...row };
	// 	newRow.isSelected = !newRow.isSelected;
	// 	return newRow;
	// });
	this.validSelectedRows();
	this.$emit(SELECTED_ALL_EVENT, target.checked);
}

function rowIsSelected(row, indexRow) {
	if (this.selectable && !row.flagUse && !row.cancelUserId) {
		const newRow = { ...row };
		this.$set(row, 'isSelected', !newRow.isSelected);
		newRow.isSelected = !newRow.isSelected;
		this.$emit(ROW_IS_SELECTED, newRow);
		if (this.selectByArrow) {
			const currentRef = this.$refs[`row-${indexRow}`];
			if (currentRef) {
				this.currentRow = this.rows[indexRow];
				this.$refs[`row-${indexRow}`][0].focus();
			}
		}
		this.validSelectedRows();
	}
}

function validSelectedRows() {
	const localSelected = helper.getLocalData('master-products');
	if (
		localSelected &&
		localSelected.length > 0 &&
		this.$route.name === 'master-product'
	) {
		this.selectedRows = localSelected;
	} else {
		this.selectedRows = this.rows.filter((p) => p.isSelected);
	}
}

function searchRows($event) {
	const keyCode = $event.keyCode;
	if (keyCode === 27) {
		this.search = '';
	}
	if (this.localSearch) {
		const dataToLocalSearch = this.search.toLowerCase();
		helper.setLocalData(`${this.$attrs.name}::search`, dataToLocalSearch);
		this.$emit(LOCAL_SEARCH_EVENT, dataToLocalSearch);
	} else {
		helper.setLocalData(`${this.$attrs.name}::search`, this.search);
		this.$emit(SEARCH_EVENT, this.search);
	}
}

function onDragEnter(row) {
	this.$emit(ON_DRAG_ENTER, row);
}

function onDragLeave(row) {
	this.$emit(ON_DRAG_LEAVE, row);
}

function onDrop(row) {
	this.$emit(ON_DROP_EVENT, row);
}

function onDrag(row) {
	this.$emit(ON_DRAG_EVENT, row);
}

function changePage(page) {
	if (page !== '...') {
		if (page !== this.currentPage) {
			this.$emit(ON_PAGE_EVENT, page);
		}
	}
}

function deleteItems() {
	this.selectedRows = [];
	const localSelected = helper.getLocalData('master-products');
	if (
		localSelected &&
		localSelected.length > 0 &&
		this.$route.name === 'master-product'
	) {
		localStorage.removeItem(`${process.env.STORAGE_USER_KEY}::master-products`);
	}
	this.rows = this.rows.map((row) => {
		const newRow = { ...row };
		this.$set(row, 'isSelected', false);
		newRow.isSelected = false;
		this.$emit(ROW_IS_SELECTED, newRow);
		return newRow;
	});
}

function cleanSearch(val) {
	if (val) {
		this.search = '';
	}
}

function selectPage(page) {
	let newPage = page > this.lastPage ? this.lastPage : page;
	newPage = newPage <= 0 ? 1 : newPage;
	changePage.call(this, Number(newPage));
}

function selectLastPage() {
	changePage.call(this, this.lastPage);
}

function showDetails(e, row, index) {
	const keyCode = e.code;
	const arrowUp = keyCode === 'ArrowUp';
	const arrowDown = keyCode === 'ArrowDown';
	const enter = keyCode === 'Enter';

	if (this.selectByArrow && (arrowUp || arrowDown)) {
		const totalLen = this.rows.length;
		let nextPrevIndex = keyCode === 'ArrowUp' ? index - 1 : index + 1;

		if (nextPrevIndex > totalLen - 1) {
			nextPrevIndex = 0;
		} else if (nextPrevIndex < 0) {
			nextPrevIndex = totalLen;
		}

		this.currentRow = this.rows[nextPrevIndex];
		const nextRow = this.$refs[`row-${nextPrevIndex}`][0];
		nextRow.focus();
		this.resetSelectRowState(row);
		this.rowIsSelected(this.currentRow, nextPrevIndex);
	} else if (this.selectByArrow && enter) {
		this.$emit('enter-pressed', row);
	}
}

function resetSelectRowState(row) {
	this.$set(row, 'isSelected', false);
}

function tableOption() {
	const action = {
		active: true,
		code: 'filter-by',
		color: '#fafafa',
		imgSrc: `${this.$imageUrl}/close.svg`,
		open: true,
		title: 'FILTRAR POR',
		width: 259,
	};
	this.$emit(TABLE_OPTION_EVENT, action);
}

function totalVisibleColumns() {
	return this.columns.filter((c) => c.visible).length + 1;
}

function pages() {
	return pagination(this.currentPage, this.lastPage);
}

function overDrag(ev) {
	if (this.isDraggable) {
		this.$emit(ON_DRAG_OVER, ev);
	}
}

function startDrag(ev) {
	if (this.isDraggable) {
		this.$emit(ON_DRAG_START, ev);
	}
}

function endDrag(ev) {
	if (this.isDraggable) {
		this.$emit(ON_DRAG_END, ev);
	}
}

function setSearch($event) {
	this.$emit('set-search-text', $event.target.value);
}

function disabledCheck(row) {
	return !!this.dispatchDetail && !!row[this.disabledValue];
}

function getClassCancel(indexR) {
	const indexMatch = this.indexesCancel.find((ic) => Number(ic) === Number(indexR));
	return indexMatch > -1;
}

function data() {
	return {
		currentRow: null,
		direction: 'right',
		search: '',
		showMenu: false,
		isSmallScreen: window.innerWidth < 600,
		startFocus: true,
	};
}

export default {
	name: 'app-table',
	components,
	computed: {
		pages,
		totalsOnFooter,
		totalVisibleColumns,
	},
	data,
	methods: {
		addOption,
		beforeColumn,
		clickIcon,
		deleteItems,
		disabledCheck,
		endDrag,
		onDrag,
		onDragEnter,
		onDragLeave,
		onDrop,
		overDrag,
		rowIsSelected,
		searchRows,
		selectedAll,
		selectPage,
		selectLastPage,
		showDetails,
		startDrag,
		tableOption,
		toggleColumns,
		paintRedRow,
		resetSelectRowState,
		setSearch,
		getClassCancel,
		// isDebt(debtsSales) {
		// 	return (
		// 		typeof debtsSales === 'object' &&
		// 		debtsSales !== null &&
		// 		Object.values(debtsSales).every(deuda => deuda === 0)
		// 	);
		// },
		isDebt(row) {
			const { customer } = row;
			if (!(customer && customer.debtsSales)) {
				return false;
			}
			if (Object.keys(customer.debtsSales).length === 0) {
				return false;
			}
			const isExitsDebts =
				(typeof customer.debtsSales === 'object' &&
					customer.debtsSales !== null &&
					Object.values(customer.debtsSales).some((d) => d > 0)) ||
				Object.values(customer.debtsSales).some((d) => d < 0);
			return isExitsDebts;
		},
		validSelectedRows,
		checkScreenSize() {
			// Determina si la pantalla es lo suficientemente pequeña para aplicar el diseño responsive
			this.isSmallScreen = window.innerWidth <= 800;
		},
		isFooterColumn(columnName) {
			return this.totalsFooter.some((f) => f.name === columnName);
		},
		getFooterValue(columnName) {
			const footerData = this.totalsFooter.find((f) => f.name === columnName);
			return footerData ? footerData.value : '';
		},
	},
	mounted,
	props: {
		isResponsive: {
			default: false,
			type: Boolean,
		},
		inputWidth: {
			type: String,
			default: '150px',
		},
		addButton: {
			default: false,
			type: Boolean,
		},
		addColValue: {
			default: 0,
			type: Number,
		},
		checkAll: {
			type: Boolean,
			default: false,
		},
		checkAllDisabled: {
			default: false,
			type: Boolean,
		},
		columns: {
			type: Array,
			required: true,
		},
		currentPage: {
			type: Number,
			default: 1,
		},
		isDraggable: {
			type: Boolean,
			default: false,
		},
		isButton: {
			type: Boolean,
			default: true,
		},
		disabledValue: {
			default: 'flagDispatch',
			type: String,
		},
		dispatchDetail: {
			default: false,
			type: Boolean,
		},
		filterColumns: {
			default: true,
			type: Boolean,
		},
		hideDetails: {
			default: false,
			type: Boolean,
		},
		includeFilter: {
			type: Boolean,
			default: false,
		},
		inputSearch: {
			default: true,
			type: Boolean,
		},
		localSearch: {
			type: Boolean,
			default: false,
		},
		localStorage: {
			type: Boolean,
			default: false,
		},
		padding: {
			default: 'px-4',
			type: String,
		},
		margin: {
			default: '',
			type: String,
		},
		rows: {
			type: Array,
			required: true,
		},
		rowRed: {
			type: Boolean,
			default: false,
		},
		selectable: {
			type: Boolean,
			default: false,
		},
		selectByArrow: {
			type: Boolean,
			default: false,
		},
		totalQuantity: {
			type: Number,
			default: 0,
		},
		lastPage: {
			type: Number,
			default: 0,
		},
		keyValue: {
			type: String,
			default: 'id',
		},
		mainList: {
			type: Boolean,
			default: true,
		},
		cleanSearch: {
			default: false,
			type: Boolean,
		},
		showDetailsInfo: {
			default: false,
			type: Boolean,
		},
		disabledSearch: {
			default: false,
			type: Boolean,
		},
		showArrow: {
			type: Boolean,
			default: false,
		},
		showPagination: {
			type: Boolean,
			default: false,
		},
		paintRow: {
			default: () => [],
			type: Array,
		},
		captionQuantity: {
			default: true,
			type: Boolean,
		},
		itemsQuantity: [Number, String],
		itemsTotalQuantity: [Number, String],
		totalQuantityLabel: String,
		indexesCancel: {
			default: () => [],
			type: Array,
		},
		autoFocus: {
			default: false,
			type: Boolean,
		},
		stickyHeader: {
			default: false,
			type: Boolean,
		},
		totalsFooter: {
			default: () => [],
			type: Array,
		},
	},
	watch: {
		cleanSearch,
		rows(newVal) {
			const valid = newVal.filter((p) => p.isSelected);
			if (valid && valid.length === 0) {
				this.selectedRows = [];
			}
			if (this.autoFocus && this.startFocus) {
				this.$nextTick(() => {
					if (this.$refs.inputSearchRef) {
						this.startFocus = false;
						setTimeout(() => {
							this.$refs.inputSearchRef.focus();
						}, 0);
					}
				});
			} else if (newVal && !this.currentRow) {
				if (newVal.length > 0) {
					this.currentRow = newVal[0];
					this.$nextTick(() => {
						if (this.$refs['row-0']) {
							this.$refs['row-0'][0].focus();
						}
					});
				}
			}
			this.selectedRows = this.rows.filter((p) => p.isSelected);
		},
	},
	beforeDestroy() {
		// Elimina el listener cuando el componente se destruye para evitar fugas de memoria
		window.removeEventListener('resize', this.checkScreenSize);
	},
};
</script>

<style lang="scss" scoped>
.icon-button {
	left: 5px;

	z-index: 4;
}

.content-filter {
	display: inline-flex;
}

.content-header-first {
	display: inline-flex;
	gap: 0 5px;
	text-align: center;
	align-items: start;
}

.text-cut {
	background-color: color(success);
	border-radius: 11px;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
	color: #fbfbfb;
	font-size: 11.5px;
	font-weight: 600;
	right: 14px;
	padding: 1px 16px;
	position: relative;
	width: 70px;
}

.line-through {
	text-decoration: line-through;
}

input {
	background-color: transparent;
	border-style: none;
}

table {
	border-collapse: collapse;
}

table.table-list {
	border-collapse: collapse;
	width: 100%;

	thead {
		color: white;

		th {
			align-items: center;
			background-color: map-get($colors, primary);
			font-family: map-get($fonts, opens-semibold);
			font-size: 13px;
			font-weight: 500;
			height: 30.5px;
			padding: 0 5px;
			text-align: center;

			&:first-child {
				padding-left: 9px;
				text-align: left;
				width: 34px;
			}

			.check-list {
				margin-top: -1px !important;
			}
		}
		&.sticky-header {
			position: sticky;
			z-index: 5;
		}

		tr:first-child {
			th {
				&:last-child {
					padding-right: 5px;
				}
			}
		}

		button {
			background-color: map-get($colors, borderRowSelected);
			border: 0px;
			border-radius: 50%;
			height: 22px;
			line-height: 22px;
			// margin-left: 3px;
			outline: none;
			width: 23px;

			.icon {
				color: white;
				height: 20px;
				line-height: 19px;
			}
		}
	}

	tbody {
		tr {
			background-color: white;
			color: map-get($colors, tableText);
			font-family: map-get($fonts, opens-semibold);
			font-size: 13px;

			&:nth-child(odd) {
				background: #f3fafb;
			}

			td {
				align-items: center;
				border-right: 1px solid map-get($colors, grey-border);
				height: 30px;
				padding: 0px 5px;
				position: relative;
				text-align: center;

				&:first-child .is-selectable {
					border-left: 1px solid transparent;
					border-right: 0px;
					padding-left: 8px;
					text-align: left;
					width: 34px;
				}

				&:last-child {
					border-right: 1px solid transparent;
				}

				.check-list {
					margin-top: -1px !important;
				}

				.table-icon {
					img {
						vertical-align: middle;
					}

					&.btn {
						background-color: transparent;
						box-shadow: none;
						margin: 0px;
						min-width: auto;
					}
				}
			}

			// &:hover {
			// 	td:not(.td-employee) {
			// 		border-bottom: 1px solid map-get($colors, borderRowSelected);
			// 		border-top: 1px solid map-get($colors, borderRowSelected);
			// 		color: black;
			// 		font-family: map-get($fonts, opens-bold);

			// 		&:first-child {
			// 			border-left: 1px solid map-get($colors, borderRowSelected);
			// 		}

			// 		&:last-child {
			// 			border-right: 1px solid map-get($colors, borderRowSelected) !important;
			// 		}
			// 	}
			// }

			&.line td:before {
				border-bottom: 1px solid map-get($colors, background-card-black);
				content: ' ';
				left: 0;
				position: absolute;
				top: 49%;
				width: 100%;
				z-index: 1;
			}
		}

		tr.is-select {
			td:not(.td-employee) {
				border-bottom: 1px solid map-get($colors, primary);
				border-top: 1px solid map-get($colors, primary);
				color: grey;
				font-family: map-get($fonts, opens-regular);

				&:first-child {
					border-left: 1px solid map-get($colors, primary);
				}

				&:last-child {
					border-right: 1px solid map-get($colors, primary);
				}
			}

			&-employee {
				td.td-employee {
					border-bottom: 1px solid map-get($colors, primary);
					border-top: 1px solid map-get($colors, primary);
					color: grey;
					font-family: map-get($fonts, opens-regular);

					&:first-child {
						border-left: 1px solid map-get($colors, primary);
					}

					&:last-child {
						border-right: 1px solid map-get($colors, primary);
					}
				}
			}
		}
	}

	tfoot {
		tr {
			background-color: white;

			td:first-child {
				border-bottom-left-radius: 10px;
			}
			td:last-child {
				border-bottom-right-radius: 10px;
			}
			td {
				border-top: 1px solid map-get($colors, subheaderText);
				box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.2);
				height: 29px;
				padding-right: 17px;

				a {
					color: map-get($colors, paginationText);
					font-family: map-get($fonts, open-regular);
					font-size: 15px;
					font-weight: lighter;
					line-height: 10px;
					margin-left: 7px;
					padding: 5px;

					& + span {
						color: map-get($colors, grey-border);

						& + a {
							margin-left: 0px;
						}
					}

					&.active-page {
						color: map-get($colors, primary);
					}
					&:hover {
						color: map-get($colors, success);
					}
				}
			}
		}
	}

	.search-input {
		background-color: rgba(0, 0, 0, 0.2);
		box-shadow: inset 0 1px 1px 0 rgba(0, 0, 0, 0.2);
		border-radius: 12px;
		display: inline-flex;
		height: 23px;
		vertical-align: middle;

		input {
			color: white;
			font-size: 14px;
			outline: none;
			padding: 0 5px;
			width: calc(100% - 25px);
		}

		.icon {
			align-self: center;
			color: white;
			font-size: 20px;
			transform: rotate(90deg);
		}
	}

	.checkbox {
		.icon {
			font-size: 14px;
		}

		.input-group--selection-controls__ripple {
			height: 15px;
			left: 13px;
			width: 15px;
		}
	}

	.input-checkbox {
		border: 1px solid map-get($colors, grey-border);
		border-radius: 1px;
		height: 12px;
		width: 12px;
	}
}

.unique-input {
	border: 1px solid map-get($colors, black);
	opacity: 0.1;
	padding-left: 5px;
	width: 50px;
}

.unique-input:focus-within {
	opacity: 1;
}

.row-checked {
	background-color: rgba(178, 221, 0, 0.06) !important;
	border: 2px solid map-get($colors, borderRowSelected) !important;

	td:not(.td-employee) {
		&:first-child {
			border-left: 2px solid map-get($colors, borderRowSelected) !important;
		}

		&:last-child {
			border-right: 2px solid map-get($colors, borderRowSelected) !important;
		}
	}
}

.row-dispatch {
	background-color: #e0f3f3 !important;
}

.row-disabled {
	opacity: 0.5;
}

.row-transfered {
	background-color: map-get($colors, subheaderText) !important;

	td:not(.td-employee) {
		border-right: 1px solid map-get($colors, tableText) !important;

		&:first-child,
		&:last-child {
			border-right: 0px !important;
		}
	}
}

.paint-red-row {
	color: color(error) !important;
}

.backward-arrow {
	display: inline-block;
	transform: rotate(180deg);
}

.forward-arrow {
	display: inline-block;
	transform: rotate(0);
}

tr:focus {
	border: solid 1px map-get($colors, borderRowSelected);
	outline: none;

	td:not(.td-employee) {
		&:first-child {
			border-left: 1px solid map-get($colors, borderRowSelected) !important;
		}

		&:last-child {
			border-right: 1px solid map-get($colors, borderRowSelected) !important;
		}
	}
}

.show-arrow {
	display: none;
}

.show-arrow.active {
	display: inline-block;
}

div.no-main-list table {
	border-bottom: 1px solid map-get($colors, grey-border);
}

.total-quantity {
	font-size: size(medium);
	text-align: center;
	padding-right: 0px !important;
}

.paint-green-row {
	background: rgba(77, 198, 140, 0.28) !important;
}

.background-red-row {
	background-color: rgba(165, 96, 84, 0.28) !important;
}

.row-red-transparent {
	background-color: rgba(255, 38, 0, 0.067) !important;
	border-bottom: 1px solid #00000021 !important;
}

.caption-quantity {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(medium);
}

.th-radius {
	border-top-left-radius: 10px;
	border-top-right-radius: 10px;
}
.head-container {
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	align-items: stretch;
	padding-top: 4px;
	gap: 0 10px;
}

.total-quantity {
	&-input {
		color: color(paginationText);
		font-family: font(open-semibold);
		padding-right: 0px !important;
		text-align: center;
	}

	&-label {
		color: color(paginationText);
		font-family: font(open-semibold);
		font-size: size(small13);
		text-align: right;
	}
}

.opacity-warehouse {
	background-color: rgba(255, 255, 255, 0.52);
	bottom: 0;
	left: 0;
	padding-top: 15%;
	position: absolute;
	right: 0;
	top: 0;
	z-index: 2;
}

.text-opacity {
	border: solid 3px color(primary);
	border-style: dashed;
	color: #828282;
	font-family: map-get($fonts, open-semibold);
	font-size: 14px;
	margin: 0 auto;
	max-width: 339px;
	padding: 28px 33px;
}

.cancel-style {
	opacity: 0.5;
}

.content-product {
	background-color: rgba(0, 0, 0, 0.2);
	border-radius: 11px;
	font-size: 12px;
	font-weight: bold;

	align-content: center;
	// gap: 2px;
	span {
		padding: 4px 8px;
	}
}

.width-filter {
	background-color: color(success);
	border-radius: 11px;
	cursor: pointer;
	color: white;
	font-size: 12px;
	font-weight: bold;
	padding: 1px 4px;
}

@media screen and (max-width: 800px) {
	table.table-list.responsive-table {
		thead {
			display: none;
		}
		tbody {
			width: 100%;
			display: flex;
			flex-direction: column;
			.row-checked td {
				border: none;
			}

			tr {
				margin-bottom: 10px;
				display: grid;
				grid-template-columns: repeat(2, 1fr); /*los elementos ocuparan 3 columnas*/
				border: 1px solid map-get($colors, borderRowSelected);

				td {
					border: none;
					border-right: none;
					border-left: none;
					height: auto;

					&:first-child .is-selectable {
						border-left: 1px solid transparent;
						border-right: 0px;
						padding-left: 8px;
						text-align: left;
						width: 34px;
					}

					&:last-child {
						border-right: 1px solid transparent;
					}
				}
			}

			tr.is-select {
				td:not(.td-employee) {
					border-bottom: none;
					border-top: 1px solid map-get($colors, primary);
					color: grey;
					font-family: map-get($fonts, opens-regular);

					&:first-child {
						border-left: none;
					}

					&:last-child {
						border-right: none;
					}
				}
			}
		}
		// .row-checked{
		// 	border: none;
		// 	td:not(.td-employee) {
		// 		border: none;
		// 	}
		// }

		// tr:focus{
		// 	border: none

		// }
		// tr:hover {
		// 	border: none

		// }
	}
}
</style>
