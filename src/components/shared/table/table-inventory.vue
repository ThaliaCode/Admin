<template>
	<div class="overflow-auto table-inventory" :class="padding">
		<div class="table-general-inventory">
			<div class="wrapper-table-inventory">
				<div class="table-product">
					<div class="table-name">
						<input
							type="checkbox"
							class="input-checkbox mr-2"
							@change="$emit('change-all', $event)"
							:checked="checkAll"
						/>
						<span>Código de Producto</span>
					</div>
					<div class="list-product">
						<div
							class="item-product"
							:class="`item-code-${index}`"
							v-for="(product, index) in listProduct"
							:key="index"
						>
							<input
								type="checkbox"
								class="input-checkbox mr-2"
								@change="changeSelect(product)"
								v-model="product.select"
							/>
							<span>{{ product.codeProduct }}</span>
						</div>
					</div>
				</div>
				<div class="table-product">
					<div class="table-name">
						<span>Nombre</span>
					</div>
					<div class="list-product">
						<div
							class="item-product"
							:class="`item-name-${index}`"
							v-for="(product, index) in listProduct"
							:key="index"
						>
							<v-tooltip
								bottom
								v-if="
									product.nameProduct ? product.nameProduct.length > 10 : false
								"
							>
								<p slot="activator">{{ product.nameProduct | limitTo(20) }}</p>
								<span>{{ product.nameProduct }}</span>
							</v-tooltip>
							<p v-else>{{ product.nameProduct }}</p>
						</div>
					</div>
				</div>
				<div class="table-list-inventories">
					<div class="item-inventory item-100" v-if="listDetail.length === 0">
						<div>
							<div class="item-name">
								<span>Inventariador</span>
								<span>Inventario 0</span>
							</div>
							<div class="item-date">
								<span>Fecha</span>
							</div>
							<div class="wrapper-item-detail">
								<div class="item-100 text-center">Conteo</div>
								<div class="item-100 text-center">Stock</div>
								<div class="item-100 text-center">Ubic.</div>
							</div>
						</div>
					</div>
					<div
						class="item-inventory"
						:style="style"
						v-for="(item, index) in listDetail"
						:key="index"
					>
						<div>
							<div class="item-name">
								<span>{{ item.inlineResponsibles }}</span>
								<span>Inventario {{ index + 1 }}</span>
							</div>
							<div class="item-date">
								<span>{{
									item.createdAt | formatDate('DD-MM-YYYY HH:mm:ss')
								}}</span>
							</div>
							<div class="wrapper-item-detail">
								<div class="text-center" :style="styleSeccion(numColumDetails)">
									Conteo
								</div>
								<div class="text-center" :style="styleSeccion(numColumDetails)">
									Stock
								</div>
								<div class="text-center" :style="styleSeccion(numColumDetails)">
									Ubic.
								</div>
							</div>
						</div>
						<div>
							<div
								v-for="(detail, indexDetail) in item.products"
								:key="indexDetail"
								class="wrapper-item-information"
							>
								<div
									class="text-center item-information"
									:style="`width: calc(100% / ${numColumDetails}); background:  ${
										detail[0] ? detail[0].color : ''
									}`"
								>
									{{ detail[0] ? detail[0].sumComputed : '' }}
								</div>
								<div
									class="text-center item-information"
									:style="`width: calc(100% / ${numColumDetails}); background:  ${
										detail[0] ? detail[0].color : ''
									}`"
								>
									{{ detail[0] ? detail[0].stock : '' }}
								</div>
								<div
									class="text-center item-information"
									:style="`width: calc(100% / ${numColumDetails}); background:  ${
										detail[0] ? detail[0].color : ''
									}`"
								>
									<app-tooltip-button
										text="Detalle"
										icon="remove_red_eye"
										color="success"
										v-if="detail.length > 0"
										@click-icon="
											$emit('detail', detail, item.inlineResponsibles)
										"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="table-slide">
					<div class="table-slide-header">
						<div class="slide-item">
							<span class="text-center">{{ countingOrStockWord }}</span>
						</div>
						<div class="slide-item">
							<span class="text-center">Ajuste</span>
						</div>
						<div class="slide-item">
							<span class="text-center">Conteo Ajustado</span>
						</div>
						<div class="slide-item">
							<span class="text-center">Diferencia</span>
						</div>
						<div class="slide-item w-120">
							<v-tooltip top>
								<span class="text-center" slot="activator"> Cost.Ant </span>
								<span>Costo Anterior</span>
							</v-tooltip>
						</div>
					</div>
					<div>
						<div
							class="table-slide-items"
							v-for="(product, index) in listProduct"
							:key="index"
						>
							<div class="text-center slider-number">
								{{ product.stock | round }}
							</div>
							<div class="text-center slider-number">
								{{ product.adjustment | round }}
							</div>
							<div class="text-center slider-number">
								{{ product.computed | round }}
							</div>
							<div class="text-center slider-number">
								{{ product.diff || (product.computed - product.stock) | round }}
							</div>
							<div class="text-center slider-number px-1">
								<v-text-field
									v-if="inventoryStatus === 1"
									hide-details
									single-line
									type="number"
									class="filter-select shadow-inset input-max-width"
									:value="product.priceCost"
									@input="updatePriceCost(product, $event)"
								/>
								<span v-else>
									{{ product.priceCost }}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="footer-table-total w-86 pl-4 pr-4">
				<div class="content-footer">
					<td class="footer-table-total--select px-2">
						<div class="footer-table-total--text">Total de Stock:</div>
						<div>{{ sumStock }}</div>
					</td>
					<td class="footer-table-total--select pl-5 px-2">
						<div class="footer-table-total--text">Total Conteo:</div>
						<div>{{ sumCont }}</div>
					</td>
				</div>
			</div>
			<div class="pag text-xs-right" v-if="lastPage > 1">
				<p class="px-2 pt-2">
					<a
						v-for="(page, index) in pages"
						:key="index"
						:class="{ 'active-page': page === currentPage }"
						@click="selectPage(page)"
						>{{ page }}</a
					>
					<span>|</span>
					<a @click="selectLastPage">>></a>
				</p>
			</div>
			<!-- <div class="footer-table">
					<p v-if="listDetail.length === 0">No hay información que mostrar</p>
				</div> -->
		</div>
	</div>
</template>
<script>
import helper from '@/shared/helper';

function style() {
	let styleClass;
	if (this.numColum > 4) {
		styleClass = 'width: 200px; min-width: 200px';
	} else {
		styleClass = `width: calc(100% / ${this.numColum})`;
	}
	return styleClass;
}

function updateRow(tightCount, stock, index) {
	this.listProduct[index].difference = tightCount - stock;
}

function styleSeccion(value) {
	return `width: calc(100%/ ${value})`;
}

function dateHour(value) {
	const date = helper.exactDate(value);
	const valueSplit = value.split('T');
	const hourSplit = valueSplit[1].split('.');
	const hour = hourSplit[0];
	return `${date} ${hour}`;
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

function pages() {
	return pagination(this.currentPage, this.lastPage);
}

function changeSelect(product) {
	this.$emit('change-select', product);
}

function countingOrStockWord() {
	return this.inventoryStatus === 2 ? 'Stock Anterior' : 'Stock Actual';
}

function updatePriceCost(row, $event) {
	this.$emit('update-price-cost', row, $event);
}

function changePage(page) {
	if (page !== '...') {
		if (page !== this.currentPage) {
			this.$emit('on-page', page);
		}
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

export default {
	name: 'table-invnetory',
	computed: {
		countingOrStockWord,
		style,
		pages,
	},
	methods: {
		changeSelect,
		changePage,
		dateHour,
		selectPage,
		selectLastPage,
		styleSeccion,
		updateRow,
		updatePriceCost,
	},
	props: {
		padding: {
			default: 'px-4',
			type: String,
		},
		numColum: {
			default: 1,
			type: Number,
		},
		numColumDetails: {
			default: 3,
			type: Number,
		},
		numColumSlide: {
			default: 4,
			type: Number,
		},
		sumCont: {
			type: Number,
			default: 0,
		},
		sumStock: {
			type: Number,
			default: 0,
		},
		listProduct: {
			default: () => [],
			type: [Array, Object],
		},
		listDetail: {
			default: () => [],
			type: [Array, Object],
		},
		checkAll: {
			default: false,
			type: Boolean,
		},
		inventoryStatus: {
			default: 0,
			type: Number,
		},
		showKardexValue: {
			type: Boolean,
			default: false,
		},
		showPagination: {
			default: true,
			type: Boolean,
		},
		currentPage: {
			type: Number,
			default: 1,
		},
		lastPage: {
			type: Number,
			default: 0,
		},
	},
};
</script>
<style lang="scss" scoped>
.wrapper-table-inventory {
	box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
	display: flex;

	.table-name {
		align-items: center;
		background: map-get($colors, primary);
		color: map-get($colors, white);
		display: flex;
		font-size: 13px;
		height: 79px;
		justify-content: center;
		min-width: 180px;
	}

	.item-product {
		background: map-get($colors, white);
		display: flex;
		font-size: 13px;
		height: 31px;
		min-height: 31px;
		padding: 6px 5px;
		text-align: center;

		&:nth-child(2n) {
			background: map-get($colors, background-table);
		}
	}
}

.table-list-inventories {
	color: map-get($colors, white);
	display: flex;
	overflow-x: scroll;
	width: calc(100% - 529px);

	.item-name {
		align-items: center;
		background: map-get($colors, primary);
		display: flex;
		flex-direction: column;
		font-size: 13px;
		height: 38px;
		justify-content: center;
	}

	.item-date {
		background: map-get($colors, table-inventory);
		font-size: 10px;
		padding: 5px;
		text-align: center;
	}

	.wrapper-item-detail {
		background: map-get($colors, background-sidebar);
		display: flex;
		font-size: 11px;
		padding: 0px 11px;
	}

	.wrapper-item-information {
		background: map-get($colors, white);
		color: rgba(0, 0, 0, 0.87);
		display: flex;
		font-size: 13px;

		&:nth-child(2n) {
			background: map-get($colors, background-table);
		}
	}

	.item-inventory {
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
	}

	.item-information {
		@include flex-center();
		border-right: 1px solid map-get($colors, border-item);
		height: 31px;
		min-height: 31px;
	}
}

.text-center {
	text-align: center;
}

.table-slide {
	border-left: 2px solid map-get($colors, success);
	font-size: 13px;
	width: 342px;

	.table-slide-header {
		background: map-get($colors, primary);
		color: map-get($colors, white);
		display: flex;
		font-size: 13px;
		height: 79px;
	}

	.table-slide-items {
		background: map-get($colors, white);
		display: flex;

		&:nth-child(2n) {
			background: map-get($colors, background-table);
		}

		.slider-number {
			border-right: 1px solid map-get($colors, border-item);
			flex: 1 1 25%;
			height: 31px;
			padding: 6px 0;
		}
	}

	.slide-item {
		align-items: center;
		display: flex;
		flex: 1 1 25%;
		justify-content: center;
	}
}

.table-product {
	border-right: 2px solid map-get($colors, success);
}

.footer-table {
	background: map-get($colors, white);
	border-radius: 0 0 20px 20px;
	box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
	height: 34px;
	text-align: center;
	width: 100%;
}

.table-general-inventory {
	margin-top: 13px;
}

.item-100 {
	width: 100%;
}

.footer-table-total {
	background-color: #e2f1f1;
	font-size: 12px;
	position: relative;

	&--select {
		background-color: rgba(195, 231, 232, 0.42);
		color: color(background-sidebar);
		font-size: 13px;
		font-weight: bold;
		text-align: center;
	}

	&--text {
		color: color(paginationText);
		font-size: 10px;
	}
}

.w-86 {
	width: 100%;
}

.content-footer {
	display: flex;
	justify-content: flex-end;
}

.w-120 {
	width: 150px;
}

.pag {
	background: map-get($colors, white) !important;
	box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.2);
	bottom: 0px !important;
	border-bottom-right-radius: 10px;
	border-bottom-left-radius: 10px;
	height: 35px;

	a {
		color: map-get($colors, paginationText) !important;
		font-size: 15px;
		font-weight: lighter;
		line-height: 10px;
		margin-left: 9px;

		&.active-page {
			color: map-get($colors, primary) !important;
		}

		&:hover {
			font-size: 18px;
		}
	}

	span {
		color: map-get($colors, grey-border);
	}
}
</style>
