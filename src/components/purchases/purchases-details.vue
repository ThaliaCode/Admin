<template>
	<app-table
		class="is-not-selectable mb-0"
		name="purchases-details"
		:input-search="false"
		:columns="columns"
		:main-list="false"
		:rows="readonly ? rows : summaryData.rows"
		@column-input="$emit('column-input', $event)"
	>
		<template slot="rows" slot-scope="props">
			<td class="is-not-selectable" v-show="showRow(columns, 1)">
				{{ props.row.productCode }}
			</td>
			<td v-show="showRow(columns, 2)">
				<div class="d-flex justify-end align-center">
					<span text-xs-center xs10>{{ props.row.productName }}</span>
					<app-tooltip-button
						v-if="
							props.row.productLots ||
								(props.row.product && props.row.product.flagLotsEnabled)
						"
						height="13"
						img="/static/img/product-lot.svg"
						text="Producto tipo lote"
						@click-icon="$emit('commentaries', props.row)"
					/>
				</div>
			</td>
			<td class="small-td" v-show="showRow(columns, 3)">
				<template v-if="props.row.series">
					<v-text-field
						class="filter-select shadow-inset"
						type="number"
						:value="totalSerieValue(props.row, props.index)"
						disabled
					/>
				</template>
				<template v-else-if="readonly">
					{{ props.row.quantity }}
				</template>
				<template v-else>
					<v-text-field
						class="filter-select shadow-inset"
						type="number"
						:disabled="props.row.flagUseConvert"
						v-model.number="props.row.quantity"
						@input="$emit('update-amounts', props.row, props.index, 'quantity')"
					/>
				</template>
			</td>
			<td v-show="showRow(columns, 4)">
				{{ props.row.quantityConvert }}
			</td>
			<td v-show="showRow(columns, 5)">{{ props.row.stock }}</td>
			<td v-show="showRow(columns, 6)">
				{{ props.row.product && props.row.product.stock }}
			</td>
			<td v-show="showRow(columns, 7)" @click.stop="stopClick">
				<template v-if="readonly">
					{{ props.row.unitCode || props.row.unitName }}
				</template>
				<template v-else>
					<app-select
						item-text="code"
						item-value="id"
						model="unitId"
						:item="props.row.unitId"
						:items="props.row.units"
						@input="$emit('set-unit', $event, props.row, props.index)"
					/>
				</template>
			</td>
			<td :class="readonly ? '' : 'w-12'" v-show="showRow(columns, 8)">
				<template v-if="showBrandConfig || idPurchases">
					{{ props.row.brandName }}
				</template>
				<template v-else>
					<v-select
						class="filter-select shadow-inset mt-3"
						item-text="name"
						item-value="id"
						label="Marca"
						:value="props.row.brandId"
						:items="props.row.brands"
						:disabled="props.row.local"
						@click.stop="stopClick"
						@input="$emit('update-brand', $event, props.row, props.index)"
					></v-select>
				</template>
			</td>
			<td v-show="showRow(columns, 9)">
				{{ props.row.inlineFeatures }}
			</td>
			<td v-show="showRow(columns, 10)">
				{{ props.row.categoryName }}
			</td>
			<td :class="readonly ? '' : 'w-12'" v-if="showCostCenter && showRow(columns, 11)">
				<template v-if="readonly">
					{{ props.row.costCenterCode }}
				</template>
				<template v-else>
					<v-select
						class="filter-select shadow-inset mt-3"
						item-text="name"
						item-value="id"
						label="Centro de Costo"
						:value="props.row.costCenterId"
						:items="costsCenter"
						return-object
						@input="$emit('update-center-cost', $event, props.row, props.index)"
					></v-select>
				</template>
			</td>
			<td class="small-td" v-show="showRow(columns, 12)">
				<template v-if="readonly">
					{{ props.row.cost }}
				</template>
				<template v-else>
					<v-text-field
						class="filter-select shadow-inset"
						type="number"
						v-model.number="props.row.cost"
						@click.stop="stopClick"
						@input="$emit('update-amounts', props.row, props.index, 'cost')"
						@keyup.enter="$emit('update-amounts', props.row, props.index, 'cost')"
					/>
				</template>
			</td>
			<td class="small-td" v-show="showRow(columns, 13)">
				{{ props.row.price }}
				<!-- <template v-if="readonly">
					{{ props.row.price }}
				</template>
				<template v-else>
					<v-text-field
						class="filter-select shadow-inset"
						type="number"
						v-model.number="props.row.price"
						@click.stop="stopClick"
						@input="$emit('update-amounts', props.row, props.index, {})"
						@keyup.enter="$emit('update-amounts', props.row, props.index, {})"
					/>
				</template> -->
			</td>
			<td class="td-igv" v-show="showRow(columns, 14)">
				<template v-if="readonly">
					{{ props.row.discountPercentage | round }}
				</template>
				<template v-else>
					<v-text-field
						class="filter-select shadow-inset"
						type="number"
						v-model.number="props.row.discountPercentage"
						@input="$emit('update-amounts', props.row, props.index, 'discountPercentage')"
					/>
				</template>
			</td>
			<td class="td-igv" v-show="showRow(columns, 15)">
				<template v-if="readonly">
					{{ props.row.tax | round }}
				</template>
				<template v-else>
					<v-text-field
						class="filter-select shadow-inset"
						content-class="filter-select-content"
						type="number"
						v-model.number="props.row.tax"
						@input="$emit('update-amounts', props.row, props.index, 'tax')"
					/>
				</template>
			</td>
			<td v-show="showRow(columns, 16)">{{ props.row.subtotal | round }}</td>
			<td v-show="showRow(columns, 17)">{{ props.row.taxAmount | round }}</td>
			<td v-show="showRow(columns, 18)">
				<template v-if="readonly">
					{{ props.row.total | round }}
				</template>
				<template v-else>
					<v-text-field
						class="filter-select shadow-inset total-cell"
						content-class="filter-select-content"
						type="number"
						v-model.number="props.row.total"
						@click.stop="stopClick"
						@input="$emit('update-total', props.row, props.index, {})"
						@keyup.enter="$emit('update-total', props.row, props.index, {})"
					/>
				</template>
			</td>
			<td v-show="showRow(columns, 19)">{{ props.row.salePrice || 0 | round }}</td>
			<td v-show="showRow(columns, 20)">{{ props.row.profitAmount | round }}</td>
			<td v-show="showRow(columns, 21)">{{ props.row.markupPercentage | round }}%</td>
			<td v-show="showRow(columns, 22)">{{ props.row.marginPercentage | round }}%</td>
			<td v-if="columnActions">
				<app-tooltip-button
					v-if="showTooltip(props.row)"
					img="/static/img/icons/barcode.svg"
					:height="25"
					text="Control de series"
					@click-icon="openSeries(props.row)"
				/>
				<app-tooltip-button
					size="18"
					color="primary"
					icon="comment"
					text="Agregar comentario e información adicional"
					@click-icon="$emit('commentaries', props.row)"
				/>
				<app-tooltip-button
					color="red"
					icon="delete"
					text="Eliminar Producto"
					@click-icon="$emit('delete-product', props.row, props.index)"
				>
				</app-tooltip-button>
				<app-tooltip-button
					text="Visualizar Precio de Ventas"
					color="primary"
					icon="monetization_on"
					@click-icon="$emit('update-price-sale', props.row, props.index)"
				/>
				<app-tooltip-button
					v-if="props.row.expirationDate"
					color="success"
					icon="event_busy"
					:text="'Fecha de vencimiento: ' + props.row.expirationDate"
				/>
				<app-tooltip-button
					text="Historial de Compra"
					icon="history"
					color="primary"
					@click-icon="$emit('history-products', props.row, props.index)"
				/>
			</td>
		</template>
		<template v-if="footer" slot="footer">
			<tr>
				<td class="tfoot-bg" colspan="7"></td>
				<td class="tfoot-bg">
					<span class="tfoot-span">Desc.:</span> {{ currency }}
					{{ summaryData.discount | round }}
				</td>
				<td class="tfoot-bg">
					<span class="summary-row">
						<span>
							<span class="tfoot-span">IMP.:</span> {{ currency }}
							{{ (summaryData.taxes - retentionTaxAmount) | round }}
						</span>
						<button class="btn-collapse" type="button" @click="toggleSummary">
							{{ buttonLabel }}
						</button>
					</span>
				</td>
				<td class="tfoot-bg">
					<span class="tfoot-span">SubT.:</span> {{ currency }}
					{{ summaryData.subtotal | round }}
				</td>
				<td class="tfoot-bg">
					<span>
						<span class="tfoot-span">Total:</span> {{ currency }}
						{{ (summaryData.total - retentionAmount - retentionTaxAmount) | round }}
					</span>
					<button
						v-if="isEcuador"
						class="btn-collapse"
						type="button"
						@click="toggleSummary"
					>
						{{ buttonLabel }}
					</button>
				</td>
				<td class="tfoot-bg" colspan="1"></td>
			</tr>
			<tr v-show="showSubtotal">
				<td class="tfoot-bg" colspan="8"></td>
				<td class="tfoot-bg">
					<span class="summary-amount"
						>Total Imp. {{ currency }} {{ summaryData.taxes | round }}</span
					>
					<span class="summary-amount"
						>Ret. Imp. {{ currency }} {{ retentionTaxAmount | round }}</span
					>
					<span class="summary-amount"
						>Grav. {{ currency }} {{ summaryData.gravada | round }}</span
					>
					<span class="summary-amount"
						>Ex. {{ currency }} {{ summaryData.free | round }}</span
					>
				</td>
				<td class="tfoot-bg"></td>
				<td class="tfoot-bg">
					<span v-if="isEcuador">
						<span class="summary-amount"
							>Total. {{ currency }} {{ summaryData.total | round }}</span
						>
						<span class="summary-amount"
							>Ret. {{ currency }} {{ retentionAmount | round }}</span
						>
					</span>
				</td>
				<td class="tfoot-bg"></td>
			</tr>
		</template>
	</app-table>
</template>

<script>
import appTable from '@/components/shared/table/app-table';
import lib from '@/shared/lib';
import documentState from '@/components/shared/document-state';

const { round } = lib;

// const twoDecimals = round(2);
const fourDecimals = round(4);
const sevenDecimals = round(7);

function data() {
	return {
		showSubtotal: false,
	};
}

function isFree(row) {
	if (!row.price) {
		const { utility } = row.additionInformationPriceList || {};
		if (utility !== null && utility > 0) {
			const price =
				sevenDecimals(Number(row.total / (row.quantity * Number(`1.${row.tax}`)))) || 0;
			return price ? 0 : 1;
		}
		const price = sevenDecimals(row.cost / row.unitConversion);
		return price ? 0 : 1;
	}
	if (row.flagFree) {
		return 1;
	}
	if (row.additionalInformation) {
		if (row.additionalInformation.flagFree) {
			return 1;
		}
	}
	return 0;
}

function buttonLabel() {
	return this.showSubtotal ? '-' : '+';
}

/* eslint-disable no-param-reassign */
function summaryData() {
	const sd = this.rows.reduce(
		(acum, item) => {
			const { product } = item || {};
			const brandSpId = this.showBrandConfig ? item.brandSpId : undefined;
			const newRow = {
				codeTaxes: item.codeTaxes,
				features: item.features,
				categoryName: item.categoryName,
				inlineFeatures: item.inlineFeatures,
				conversions: item.conversions || (product && product.conversions),
				total: item.total,
				totalW: item.totalW,
				local: item.local,
				brands: item.brands,
				brandId: item.brandId,
				brandName: item.brandName,
				brandSpId,
				brandSimple: item.brandSimple,
				costCenterCode: item.costCenterCode,
				descriptionProduct: item.descriptionProduct,
				costCenterId: item.costCenterId,
				commentary: item.commentary || '',
				lot: item.lot || '',
				expirationDate: item.expirationDate || null,
				description: product ? `${product.code} - ${product.name}` : null,
				discountPercentage: item.discountPercentage,
				id: item.id,
				location: item.location,
				// price: item.price,
				priceList: item.priceList || (product && product.priceList) || {},
				salePrice: product && product.priceList ? product.priceList.price || 0 : 0,
				priceWithAllDecimals: item.price,
				productCode: product && product.code,
				productId: item.productId,
				productName: product && product.name,
				units: item.units,
				productType: item.productType || (product && product.typeId),
				quantity: item.quantity,
				quantityConvert: item.quantityConvert,
				flagUseConvert: item.flagUseConvert,
				rawPrice: (item.priceWithAllDecimals || item.price || 0) * item.quantity,
				stockQuantity: item.stockQuantity,
				tax: item.tax,
				unitCode: item.unitCode || item.product.unitCode,
				unitName: item.unitName || item.product.unitName,
				unitId: item.unitId || item.product.unitId,
				unitConversion: item.unitConversion || 1,
				unitQuantity: item.unitQuantity ? item.unitQuantity : item.quantity,
				warWarehousesId: item.warWarehousesId,
				warehouseProductId: item.warehouseProductId,
				series: item.series || null,
				categoryId: item.categoryId,
				flagControlSerie:
					item.flagControlSerie || (item.product && item.product.flagControlSerie),
				additionalForm: item.additionalForm,
				additionInformationPriceList: item.additionInformationPriceList,
				priceListId: item.priceListId,
				stock: [item.stock, item.stockQuantity, item.product && item.product.stock].find(
					(val) => val !== null && val !== undefined
				),
				subtotalWithoutTax: item.subtotalWithoutTax,
				flagEdit: true,
				flagFree: isFree(item),
				productLots: item.productLots || undefined,
				flagUse: item.flagUse ? 1 : 0,
				priceListAll: item.priceListAll,
				costOrigin: item.costOrigin,
				productDeleted: item.productDeleted || false,
			};
			let rawSubtotal = 0;
			const { profitAmount, markupPercentage, priceSale } =
				newRow.additionInformationPriceList || {};
			if (profitAmount !== null && profitAmount > 0) {
				newRow.price =
					sevenDecimals(Number(item.total / (item.quantity * (1 + item.tax / 100)))) || 0;
				newRow.cost =
					sevenDecimals(item.cost) ||
					Number(item.total) / (item.quantity * (1 + item.tax / 100));
				newRow.priceWithAllDecimals = Number(newRow.price.toFixed(7)) || 0;
				newRow.discountAmount = newRow.price * (item.discountPercentage / 100) || 0;
				rawSubtotal = item.total / (1 + item.tax / 100);
				const subtotal = this.flagIncludesTaxes
					? rawSubtotal / (1 + item.tax / 100)
					: rawSubtotal;
				newRow.subtotal = item.subtotal || Number(subtotal.toFixed(2));
				newRow.taxAmount =
					item.total || item.total >= 0
						? item.taxAmount || newRow.total - newRow.subtotal
						: item.taxAmount || 0;
				newRow.pricePurchase = newRow.price * (1 + item.tax / 100);
				newRow.utilityRow = profitAmount;
				newRow.utilityPercentage = markupPercentage;
				newRow.salePrice = priceSale;
				newRow.profitAmount = profitAmount;
				newRow.markupPercentage = markupPercentage;
				newRow.marginPercentage =
					priceSale > 0 ? fourDecimals((profitAmount / priceSale) * 100) : 0;
			} else {
				newRow.cost =
					sevenDecimals(item.cost) ||
					Number(item.total) / (item.quantity * (1 + item.tax / 100));
				newRow.price = sevenDecimals(newRow.cost / item.unitConversion) || 0;
				newRow.priceWithAllDecimals = sevenDecimals(Number(newRow.price)) || 0;
				newRow.discountAmount =
					item.discountAmount || newRow.rawPrice * (item.discountPercentage / 100);
				rawSubtotal = newRow.rawPrice - newRow.discountAmount;
				const subtotal = this.flagIncludesTaxes
					? rawSubtotal / (1 + item.tax / 100)
					: rawSubtotal;
				newRow.subtotal = item.subtotal || Number(subtotal.toFixed(2));
				newRow.taxAmount =
					item.total || item.total >= 0
						? item.taxAmount || newRow.total - newRow.subtotal
						: item.taxAmount || 0;
				newRow.pricePurchase =
					newRow.price === 0 ? 0 : Number(newRow.price) * (1 + item.tax / 100);
				let salePrice = item.price || 0;
				if (item.additionalInformation && item.additionalInformation.priceList) {
					salePrice = item.additionalInformation.priceList.price;
				}
				if (item.priceList) {
					if (this.idPurchases) {
						salePrice =
							item.additionalInformation && item.additionalInformation.editPriceSale
								? item.additionalInformation.editPriceSale.priceSale
								: item.priceList.priceSale || item.priceList.price;
					} else {
						salePrice = item.product.priceList
							? priceSale || item.product.priceList.price || 0
							: 0;
					}
				}
				newRow.salePrice = salePrice;

				// El costo sólo está en moneda extranjera mientras la compra sigue activa en esa
				// moneda: exchangeRate no se resetea al volver a soles, así que sin comparar
				// contra purchaseCurrency la utilidad se quedaba calculada como si siguiera en
				// dólares aunque ya se hubiera vuelto a soles.
				const pricePurchaseInSoles =
					this.purchaseCurrency === 'USD' && this.exchangeRate
						? Number(newRow.pricePurchase) * this.exchangeRate
						: Number(newRow.pricePurchase);

				newRow.profitAmount = pricePurchaseInSoles > 0
						? fourDecimals(newRow.salePrice - pricePurchaseInSoles)
						: 0;

				newRow.markupPercentage = pricePurchaseInSoles > 0
						? fourDecimals((newRow.profitAmount / pricePurchaseInSoles) * 100)
						: 0;

				newRow.marginPercentage = pricePurchaseInSoles > 0 && newRow.salePrice > 0
						? fourDecimals((newRow.profitAmount / Number(newRow.salePrice)) * 100)
						: 0;

				newRow.totalRow =
					newRow.total || newRow.total >= 0
						? newRow.total
						: Number(newRow.subtotalWithoutTax.toFixed(2)) +
						  Number(newRow.taxAmount.toFixed(2));
				newRow.totalOrigin = newRow.totalRow;
				newRow.flagEdit = newRow.totalOrigin === newRow.totalRow;
			}

			const total = this.flagIncludesTaxes
				? newRow.subtotal
				: Number((newRow.subtotal * (1 + item.tax / 100)).toFixed(4));
			newRow.total =
				this.idPurchases && item.subtotalWithoutTax > 0 && newRow.flagEdit
					? fourDecimals(newRow.totalRow)
					: Number(total);
			acum.total += Number(newRow.total);
			acum.subtotal += newRow.subtotal;
			acum.discount += newRow.discountAmount;
			if (item.tax > 0) {
				acum.gravada += newRow.total;
			} else {
				acum.free += newRow.total;
			}
			acum.taxes += newRow.taxAmount;
			acum.rows.push(newRow);
			return acum;
		},
		{
			rows: [],
			free: 0,
			gravada: 0,
			total: 0,
			subtotal: 0,
			discount: 0,
			taxes: 0,
		}
	);
	this.$emit('summary-data', sd);
	return sd;
}

function toggleSummary() {
	this.showSubtotal = !this.showSubtotal;
}

function openSeries(row) {
	this.$emit('open-series', row);
}

function showTooltip(row) {
	const { flagControlSerie, product } = row;
	return product ? product.flagControlSerie : flagControlSerie;
}

function retentionAmount(val) {
	if (val) {
		this.showSubtotal = true;
	}
}

function retentionTaxAmount(val) {
	if (val) {
		this.showSubtotal = true;
	}
}

function stopClick() {
	return false;
}

export default {
	name: 'purchases-details',
	components: {
		appTable,
		documentState,
	},
	computed: {
		summaryData,
		buttonLabel,
	},
	data,
	props: {
		sum: {
			type: Number,
		},
		columns: {
			type: Array,
			default: () => [],
		},
		currency: {
			type: String,
			default: 'S/',
		},
		flagIncludesTaxes: {
			default: false,
			type: Boolean,
		},
		retentionAmount: {
			default: 0,
			type: Number,
		},
		retentionTaxAmount: {
			default: 0,
			type: Number,
		},
		rows: {
			type: Array,
			default: () => [],
		},
		detail: {
			type: Boolean,
			default: false,
		},
		costsCenter: {
			type: Array,
			default: () => [],
		},
		showCostCenter: {
			type: Boolean,
			default: false,
		},
		readonly: {
			default: false,
			type: Boolean,
		},
		columnActions: {
			default: true,
			type: Boolean,
		},
		footer: {
			default: true,
			type: Boolean,
		},
		idPurchases: {
			type: [String, Number],
		},
		showBrandConfig: {
			default: false,
			type: Boolean,
		},
		priceLists: {
			type: Array,
			default: () => [],
		},
		exchangeRate: {
			type: Number,
			default: 0,
		},
		purchaseCurrency: {
			type: String,
			default: '',
		},
	},
	methods: {
		openSeries,
		showTooltip,
		stopClick,
		toggleSummary,
		isFree,
		totalSerieValue(row, index) {
			this.$emit('update-amounts', row, index, 'totalW');
			return row.totalW ? row.totalW.toFixed(2) : row.quantity;
		},
	},
	watch: {
		retentionAmount,
		retentionTaxAmount,
	},
};
</script>

<style lang="scss" scoped>
.icon-package {
	display: inline-flex;
}
.btn-collapse {
	background-color: map-get($colors, blue-grey);
	border: solid 1px map-get($colors, background-card);
	border-radius: 2px;
	color: map-get($colors, header);
	font-family: map-get($fonts, open-semibold);
	font-size: 12px;
	height: 12px;
	line-height: 1px;
	margin-left: 5px;
	width: 12px;
}

.small-td {
	width: 95px;
}

.medium-td {
	width: 210px;
}

.td-igv {
	width: 5%;
}

.summary-row {
	align-items: center;
	display: flex;
	justify-content: center;
}

.tfoot-bg {
	background-color: #e5eaef !important;
	border-bottom-left-radius: 0 !important;
	border-bottom-right-radius: 0 !important;
	color: black !important;
	font-family: map-get($fonts, open-semibold);
	font-size: 12px;
	padding-right: 0px !important;
	text-align: center;

	.summary-amount {
		display: inline-block;
		font-size: 10px;
	}
}

.w-12 {
	padding-bottom: 10px !important;
	width: 10%;
}

.tfoot-span {
	font-weight: weight(bold);
}

.total-cell {
	width: 100px;
}
</style>
