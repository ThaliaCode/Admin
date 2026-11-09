<template>
	<div class="overflow-auto">
		<table class="table-list" border="0" cellpadding="0" cellspacing="0" width="100%">
			<thead>
				<tr>
					<th colspan="2"
						class="text-xs-center caption white--text py-1 mw-129 background-primary"
					>
						Nombre
					</th>
					<th colspan="2"
						class="text-xs-center caption white--text py-1 background-primary"
						v-for="day in days"
						:key="day.id"
					>
						{{ day.value }}
					</th>
				</tr>
				<tr>
					<td class="text-xs-center small-caption white--text w-64 primary td-in-header">
						T. Ingresos
					</td>
					<td class="text-xs-center small-caption white--text w-64 primary td-in-header">
						T. Salidas
					</td>
					<td colspan="2"
						class="primary"
						v-for="day in days"
						:key="day.id"
					>
						<table border="0" cellpadding="0" cellspacing="0" width="100%" class="border-blue td-in-header">
							<tr>
								<td class="small-caption white--text td-label">I</td>
								<td class="small-caption white--text td-label">O</td>
							</tr>
						</table>
					</td>
				</tr>
			</thead>
			<tbody>
				<tr v-for="product in products"
					:key="`${product.id}${product.brandId}`">
					<td colspan="2" class="white mw-129">
						<table border="0" cellpadding="0" cellspacing="0" width="129px">
							<tr>
								<td
									colspan="2"
									class="caption black--text pd-top pl-2">
									<v-tooltip top>
										<span slot="activator">{{ product.name | limitTo(14) }}</span>
										<span>Nombre: {{ product.name }}</span>
									</v-tooltip>
								</td>
							</tr>
							<tr>
								<td colspan="2" class="small-caption black--text pl-2">
									<v-tooltip top>
										<span slot="activator">({{ product.code | limitTo(14) }})</span>
										<span>Código: {{ product.code }}</span>
									</v-tooltip>
								</td>
							</tr>
							<tr>
								<td class="small-caption black--text pd-bottom pl-2 pr-2">
									T.I. {{ product.totalIn | formatNumber }}
								</td>
								<td class="small-caption black--text pd-bottom">
									T.S. {{ product.totalOut | formatNumber }}
								</td>
							</tr>
						</table>
					</td>
					<td colspan="2" class="white py-0"
						v-for="(value, valIndex) in product.values"
						:key="valIndex"
					>
						<table border="0" cellpadding="0" cellspacing="0" width="100%" class="border-blue">
							<tr>
								<td class="text-xs-center small-caption grey--text py-4 td-label td-width">
									{{ value.totalIn }}
								</td>
								<td class="text-xs-center small-caption grey--text border-grey py-4 td-label td-width">
									{{ value.totalOut }}
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</tbody>
			<tfoot class="table-pagination white">
				<tr v-if="products.length > 0">
					<td :colspan="totalVisibleColumns" class="text-xs-right pr-2">
						<input
							type="text"
							@input="selectPage($event.target.value)"
							:value="currentPage"
							class="search-input unique-input"
						/>
						<a
							v-for="(page, index) in pages"
							:key="index"
							:class="{ 'active-page': page === currentPage }"
							@click="selectPage(page)">
							{{ page }}
						</a>
						<span>|</span>
						<a @click="selectLastPage">>></a>
					</td>
				</tr>
				<tr v-else>
					<td :colspan="totalVisibleColumns">
						<p style="text-align:center; margin: 5px 0 0 5px">
							No hay información que mostrar
						</p>
					</td>
				</tr>
			</tfoot>
		</table>
	</div>
</template>

<script>
	function changePage(page) {
		if (page !== '...' && page !== this.currentPage) {
			this.$emit('on-page', page);
		}
	}

	function pages() {
		return this.pagination(this.currentPage, this.lastPage);
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
			if (i === 1 || i === last || i >= left && i < right) {
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

	function selectPage(page) {
		let newPage = page > this.lastPage ? this.lastPage : page;
		newPage = newPage <= 0 ? 1 : newPage;
		changePage.call(this, Number(newPage));
	}

	function selectLastPage() {
		changePage.call(this, this.lastPage);
	}

	function totalVisibleColumns() {
		return (this.days.length * 2) + 2;
	}

	export default {
		name: 'reports-calendar',
		computed: {
			pages,
			totalVisibleColumns,
		},
		methods: {
			pagination,
			selectLastPage,
			selectPage,
		},
		props: {
			currentPage: Number,
			days: {
				default: () => [],
				type: Array,
			},
			lastPage: Number,
			products: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>

<style lang="scss" scoped>
	.table-list {
		border-bottom: 1px solid map-get($colors, blue-purchase);
		position: relative;
	}

	.border-blue {
		border-left: 1px solid color(background-sidebar);
	}

	.border-grey {
		border-left: 1px solid map-get($colors, blue-grey);
	}

	.td-label {
		text-align: center;
		width: 50%;
	}

	.mw-129 {
		max-width: 129px;
	}

	.small-caption {
		font-size: 10px;
	}

	.caption {
		font-weight: bold !important;
	}

	.w-64 {
		width: 64.5px;
	}

	tbody > tr:nth-child(even) td {
		background-color: map-get($colors, background-table);
	}

	tbody > tr:nth-child(odd) td {
		background-color: map-get($colors, white);
	}

	.pd-bottom {
		padding-bottom: 7.5px;
	}

	.pd-top {
		padding-top: 7.5px;
	}

	.td-width {
		min-width: 33px;
	}

	.td-in-header {
		padding: 3px 0px;
	}

	tfoot {
		tr {
			td {
				background-color: white;
				border-bottom-left-radius: 10px;
				border-bottom-right-radius: 10px;
				border-top: 1px solid map-get($colors, subheaderText);
				box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, .2);
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
						color: red;
					}
					&:hover {
						font-size: 18px;
					}
				}
			}
		}
	}

	.search-input {
		background-color: rgba(0, 0, 0, .2);
		border: 1px solid map-get($colors, black);
		border-radius: 3px;
		box-shadow: inset 0 1px 1px 0 rgba(0, 0, 0, .2);
		color: map-get($colors, white);
		display: inline-flex;
		font-size: 14px;
		height: 23px;
		max-width: 153px;
		opacity: 0.1;
		outline: none;
		padding: 0 5px;
		vertical-align: middle;
		width: 50px;
	}

	.background-primary {
		background-color: color(primary);
	}
</style>
