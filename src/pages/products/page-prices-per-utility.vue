<template>
	<div>
		<app-loading
			:show-loading="loadingGeneral"
			:label="`La carga terminará en un momento y podrás ver
				toda la información precio por utilidad`"
		/>
		<header-page
			name="price-per-utility"
			title="PRECIO DE ARTÍCULOS POR FECHA DE COMPRA"
			:limit-title="48"
			:emit-excel="true"
			show-excel
			to-show
			@emit-excel="downLoadExcelReport"
			:show-clean="false"
			:excel-loading="isLoading"
		/>
		<general-filter class="layout wrap flex-start py-0 mt-3 b-2">
			<v-flex xs2 mr-2>
				<app-select
					label="Empresa"
					item-text="rzSocial"
					item-value="id"
					:items="subsidiaries"
					model="subsidiaryId"
					:item="params.subsidiaryId"
					@input="setParams"
					:return-object="false"
				/>
				<span class="form-group__message" v-if="!params.subsidiaryId"
					>Seleccione una empresa</span
				>
			</v-flex>
			<v-flex xs2 mr-2>
				<app-select
					label="Tienda"
					item-text="name"
					item-value="id"
					:items="warehouses"
					model="warehouseId"
					:item="params.warehouseId"
					@input="setParams"
					:disabled="!params.subsidiaryId"
					chips
					multiple
					deletable-chips
					:return-object="false"
				/>
			</v-flex>
			<v-flex xs2 md2 mr-2>
				<app-select
					label="Fecha"
					item-text="name"
					item-value="code"
					:items="periodTypes"
					:item="period"
					model="period"
					@input="setPeriod"
				/>
			</v-flex>
			<v-flex xs3 v-if="showRange" mr-2>
				<v-layout row wrap justify-space-between>
					<v-flex xs6 pr-2>
						<app-date-select
							label="Fecha Inicio"
							model="startDate"
							:date-formatted="params.startDate"
							@input="setDate"
						/>
					</v-flex>
					<v-flex xs6 pl-2>
						<app-date-select
							label="Fecha Fin"
							model="endDate"
							:date-formatted="params.endDate"
							@input="setDate"
						/>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs1 ml-2 mt-3>
				<v-btn
					type="button"
					color="primary"
					class="btn-action btn-action-block"
					@click="searchDataFiltered"
					:disabled="disabledSearch"
				>
					Buscar
				</v-btn>
			</v-flex>
			<v-flex xs1 ml-2 mt-3>
				<v-btn
					type="button"
					color="error"
					class="btn-action btn-action-block"
					@click="clearFilters"
				>
					Limpiar
				</v-btn>
			</v-flex>
		</general-filter>
		<v-layout xs12 align-center row justify-space-between px-4 mt-2 mb-3>
			<v-flex xs2 mr-2>
				<!-- <v-select
					bottom
					autocomplete
					single-line
					hide-details
					:items="categories"
					v-model="categoryId"
					label="Categoría"
					item-text="name"
					item-value="id"
					class="filter-select"
					content-class="filter-select-content"
				></v-select> -->
				<categories-autocomplete
					:item="categoryId"
					:items="categories"
					item-text="name"
					item-value="id"
					:slot-custom="true"
					label-value="Categoria"
					@return-data="setData({ model: 'categoryId', value: $event })"
				></categories-autocomplete>
			</v-flex>
			<v-flex xs2 mr-5>
				<app-select
					:item="priceListId"
					model="priceListId"
					label="Lista de precio"
					:items="pricesLists"
					item-text="name"
					item-value="id"
					@input="setPriceListId"
				/>
			</v-flex>
			<v-flex xs8 mt-2>
				<v-layout row align-center justify-space-between>
					<v-flex class="content-utlity" v-if="showProm">
						UTILIDAD = PRECIO UNITARIO - C. PROMEDIO
					</v-flex>
					<v-flex class="content-utlity" v-else ml-2>
						UTILIDAD = PRECIO DE VENTA - PRECIO DE COMPRA
					</v-flex>
					<v-flex class="content-utlity" v-if="showProm" ml-2>
						% UTIL= (UTILIDAD / C. PROMEDIO) x 100
					</v-flex>
					<v-flex class="content-utlity" v-else ml-2>
						% UTIL= (UTILIDAD / PRECIO COMPRA) x 100
					</v-flex>
					<v-flex ml-2>
						<p class="primary--text ft-8 mb-0 text-xs-left" text-xs-left>
							Calcular la Utilidad:
						</p>
						<v-layout row align-center class="border-left">
							<label class="label-switch">Costo. Prom</label>
							<v-flex xs2 ml-2>
								<v-switch
									color="success"
									hide-details
									:false-value="0"
									:true-value="1"
									v-model="changeCost"
									@change="changeOneSwitch"
								></v-switch>
							</v-flex>
							<label class="label-switch ml-2">P. Utl.Compra</label>
						</v-layout>
					</v-flex>
					<v-flex text-xs-left ml-2>
						<p class="primary--text ft-8 mb-0">Editar:</p>
						<v-layout row align-center class="border-left">
							<label class="label-switch">% Util</label>
							<v-flex xs2 ml-2>
								<v-switch
									color="success"
									hide-details
									:false-value="0"
									:true-value="1"
									v-model="changeUtility"
									@change="changeSwitchUtil"
								></v-switch>
							</v-flex>
							<label class="label-switch ml-4">Util</label>
						</v-layout>
					</v-flex>
					<v-flex pl-2 mt-1>
						<label class="label-switch primary--text ft-10"> {{ labelProductIgv }}</label>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<app-table
			name="prices-per-utily"
			:columns="columns"
			:rows="data"
			:main-list="false"
			@column-input="columnInput"
			@on-search-event="onSearch"
			style="padding-bottom: 70px;"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)" class="is-not-selectable">
					{{ props.row.code }}
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.productName }}</td>
				<td v-show="showRow(columns, 3)">
					{{ props.row.unitCode ? props.row.unitCode : props.row.unitName }}
				</td>
				<td v-show="showRow(columns, 4)">{{ props.row.createdAt }}</td>
				<td v-show="showRow(columns, 5)">{{ props.row.unitCost | round }}</td>
				<td v-show="showRow(columns, 6)">
					{{ props.row.cProm | round }}
				</td>
				<td v-show="showRow(columns, 7)">
					<a
						:href="`purchase/${props.row.documentId}/detail`"
						target="_blank"
						class="link-purchase"
					>
						{{ props.row.pricePurchase | round }}
					</a>
				</td>
				<td v-show="showRow(columns, 8)">
					<v-text-field
						:id="`input-quantity-sale-${props.index}`"
						hide-details
						single-line
						type="number"
						class="filter-select shadow-inset input-max-width"
						:ref="`quantity${props.index}`"
						:value="props.row.unitPrice | round"
						:disabled="!props.row.unitCost"
						@click.stop="stopClick"
						@input="changeUnitPrice(props.row, $event)"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 9)">
					<v-text-field
						:id="`input-quantity-sale-${props.index}`"
						:value="props.row.priceSale | round"
						hide-details
						single-line
						type="number"
						class="filter-select shadow-inset input-max-width"
						@input="changePriceSale(props.row, $event)"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 10)">
					<v-text-field
						v-if="showUtility"
						:id="`input-quantity-sale-${props.index}`"
						hide-details
						single-line
						type="number"
						class="filter-select shadow-inset input-max-width"
						:ref="`quantity${props.index}`"
						:value="props.row.profit | round"
						@click.stop="stopClick"
						:disabled="!props.row.priceCost"
						@input="changeImportProfit(props.row, $event)"
					></v-text-field>
					<span v-else>{{ props.row.profit | round }}</span>
				</td>
				<td v-show="showRow(columns, 11)">
					<v-text-field
						v-if="showUtility"
						:id="`input-quantity-sale-${props.index}`"
						hide-details
						single-line
						type="number"
						class="filter-select shadow-inset input-max-width"
						:ref="`quantity${props.index}`"
						:value="props.row.profitUlt | round"
						@click.stop="stopClick"
						:disabled="!props.row.priceCost"
						@input="changeImportProfitUlt(props.row, $event)"
					></v-text-field>
					<span v-else>{{ props.row.profitUlt | round }}</span>
				</td>
				<td v-show="showRow(columns, 12)">
					<v-text-field
						v-if="!showUtility"
						:id="`input-quantity-sale-${props.index}`"
						hide-details
						single-line
						type="number"
						class="filter-select shadow-inset input-max-width"
						:ref="`quantity${props.index}`"
						:value="props.row.percentageProfit | round"
						@click.stop="stopClick"
						:disabled="!props.row.priceCost"
						@input="changePercentageProfit(props.row, $event)"
					></v-text-field>
					<span v-else>{{ props.row.percentageProfit | round }}</span>
				</td>
				<td v-show="showRow(columns, 13)">
					<v-text-field
						v-if="!showUtility"
						:id="`input-quantity-sale-${props.index}`"
						hide-details
						single-line
						type="number"
						class="filter-select shadow-inset input-max-width"
						:ref="`quantity${props.index}`"
						:value="props.row.percentageProfitUlt | round"
						@click.stop="stopClick"
						:disabled="!props.row.priceCost"
						@input="changePercentageProfitUlt(props.row, $event)"
					></v-text-field>
					<span v-else>{{ props.row.percentageProfitUlt | round }}</span>
				</td>
				<td v-show="showRow(columns, 14)">{{ props.row.stock }}</td>
				<td v-show="showRow(columns, 15)">
					<app-tooltip-button
						color="error"
						icon="highlight_off"
						text="Eliminar"
						@click-icon="deleteProduct(props.row)"
					/>
				</td>
			</template>
			<template slot="footer">
				<td :colspan="colspanTableUtility" class="footer-table"></td>
				<td class="footer-table--select">
					<div class="footer-table--text">% Util</div>
					<div>{{ totalPercentageProfit | round }}</div>
				</td>
				<td class="footer-table--select">
					<div class="footer-table--text">Imp. Uti</div>
					<div>{{ totalProfit | round }}</div>
				</td>
				<td class="footer-table" colspan="2"></td>
			</template>
		</app-table>
		<v-layout wrap justify-center align-center class="modal-filter-footer page-buttons">
			<v-flex xs12 text-xs-center>
				<v-btn
					type="button"
					color="primary"
					class="btn-action my-3 ecommerce-btn"
					@click="validatedUtility"
					:disabled="!data.length"
				>
					Guardar
				</v-btn>
			</v-flex>
		</v-layout>
		<v-dialog v-model="showConfirmUtility" persistent max-width="400px">
			<modal-items
				:show-regular="false"
				show-select
				v-if="showConfirmUtility"
				:items="warehouses"
				labelNotExist="La empresa seleccionada no cuenta con tiendas relacionadas"
				:select-items="params.warehouseId"
				title="Seleccionar Tienda"
				name-action="Guardar"
				label-value="id"
				show-utility
				:return-object="false"
				@close-modal="closeModalUtility"
				@action-modal="funcionSaveUtility"
			>
			</modal-items>
		</v-dialog>
	</div>
</template>
<script>
import { format, subDays } from 'date-fns';
import appTable from '@/components/shared/table/app-table';
import dateComponent from '@/components/shared/date-component';
import headerPage from '@/components/shared/header-page';
import generalFilter from '@/components/shared/general-filter';
import modalItems from '@/components/shared/modal-items';
import helper from '@/shared/helper';
import lib from '@/shared/lib';
import categoriesAutocomplete from '@/components/shared/autocomplete/categories-autocomplete';

const { round } = lib;
const twoDecimals = round(2);

async function searchDataFiltered() {
	const params = { ...this.params };
	params.startDate = params.startDate || this.$today();
	params.endDate = params.endDate || this.$today();
	params.categories = this.categoryId;
	params.priceListId = this.priceListId;
	params.subsidiaryId = this.params.subsidiaryId;
	params.warehouseId =
		this.params.warehouseId && this.params.warehouseId.length > 0
			? this.params.warehouseId.map((p) => p).join(', ')
			: undefined;
	this.loadingGeneral = true;
	try {
		const valuedKardex =
			this.$userInfo.company.settings && this.$userInfo.company.settings.flagNotMoveKardex
				? this.$userInfo.company.settings.flagNotMoveKardex
				: false;
		let response = '';
		if (valuedKardex) {
			response = await this.$httpSales.get('purchase-item-price-utility', {
				params,
			});
		} else {
			response = await this.$httpProducts.get('products/article-price', {
				params,
			});
		}
		let sumTotalProfit = 0;
		let sumTotalProfitUlt = 0;
		let sumTotalPercentageProfit = 0;
		let sumTotalPercentageProfitUlt = 0;
		this.data = response.data.map((d) => {
			const newD = { ...d };
			newD.priceSale = d.priceList ? d.priceList.price : 0;
			newD.pricePurchase = d.priceCost;
			newD.unitPrice = d.priceList ? d.priceList.unitPrice : 0;
			newD.priceCalc = d.priceList ? d.priceList.price : 0;
			newD.profit = newD.unitPrice - d.cProm;
			newD.percentageProfit =
				d.cProm !== 0 ? twoDecimals((newD.profit / newD.cProm) * 100) : 0;
			newD.profitUlt = newD.priceCalc - newD.pricePurchase;
			newD.percentageProfitUlt =
				newD.priceCalc !== 0
					? twoDecimals((newD.profitUlt / newD.pricePurchase) * 100)
					: 0;
			newD.tax = d.priceList ? d.priceList.taxes : 0;
			newD.money = this.$userInfo.company.currency;
			sumTotalProfit += newD.profit || 0;
			sumTotalProfitUlt += newD.profitUlt || 0;
			sumTotalPercentageProfit += newD.percentageProfit || 0;
			sumTotalPercentageProfitUlt += newD.percentageProfitUlt || 0;
			return newD;
		});
		this.totalPercentageProfit = sumTotalPercentageProfit / this.data.length;
		this.totalPercentageProfitUlt = sumTotalPercentageProfitUlt / this.data.length;
		this.totalProfit = sumTotalProfit;
		this.totalProfitUlt = sumTotalProfitUlt;
	} catch (error) {
		this.showGenericError();
	} finally {
		this.loadingGeneral = false;
	}
}

function created() {
	this.priceListId = this.$userInfo.salPriceList.id;
	this.columns[4].name = `Costo. Unit	(${this.countryCurrencySymbol})`;
	this.columns[6].name = `P. Compra (${this.countryCurrencySymbol})`;
	this.columns[7].name = `Precio Unit. (${this.countryCurrencySymbol})`;
	this.columns[8].name = `P. Venta (${this.countryCurrencySymbol})`;
	this.period = this.periodTypes[0].code;
	this.params.startDate = this.$today();
	this.params.endDate = this.$today();
	this.loadData();
	this.loadPriceList();
}

async function loadPriceList() {
	try {
		const response = await this.listPricingPromise();
		this.pricesLists = response.data;
	} catch (error) {
		this.showGenericError();
	}
}

async function loadData() {
	const params = { flagMain: 1, relationAdd: 'subCategories' };
	const request = [
		this.categoriesList(params),
		this.listPricingPromise(),
		this.$httpSales.get('subsidiaries'),
		this.listOfUnits(),
	];
	try {
		const responses = await Promise.all(request);
		this.categories = responses[0].data;
		this.priceLists = responses[1].data;
		this.subsidiaries = responses[2].data;
		this.units = responses[3].data;
		if (this.categories.length === 1) {
			this.categoryId = this.categories[0].id;
		}
		if (this.subsidiaries.length === 1) {
			this.$set(this.params, 'subsidiaryId', this.subsidiaries[0].id);
			this.loadWarehouse();
		}
	} catch (error) {
		this.showGenericError();
	}
}

function deleteProduct({ productId }) {
	const index = this.data.findIndex((d) => d.productId === productId);
	if (index > -1) {
		this.data.splice(index, 1);
		let sumTotalProfit = 0;
		let sumTotalPercentageProfitUlt = 0;
		let sumTotalProfitUlt = 0;
		let sumTotalPercentageProfit = 0;
		this.data = this.data.map((d) => {
			const newD = { ...d };
			sumTotalProfit += newD.profit;
			sumTotalProfitUlt += newD.sumTotalProfitUlt;
			sumTotalPercentageProfit += newD.percentageProfit;
			sumTotalPercentageProfitUlt += newD.sumTotalPercentageProfitUlt;
			return newD;
		});
		this.totalPercentageProfit = sumTotalPercentageProfit / this.data.length;
		this.sumTotalPercentageProfitUlt = sumTotalPercentageProfitUlt / this.data.length;
		this.totalProfit = sumTotalProfit;
		this.totalProfitUlt = sumTotalProfitUlt;
	}
}

function changeUnitPrice(row, value) {
	const index = this.data.findIndex((d) => d.productId === row.productId);
	if (index > -1) {
		this.data[index].unitPrice = Number(value);
		this.data[index].profit = this.data[index].unitPrice - this.data[index].cProm;
		this.data[index].percentageProfit = twoDecimals(
			(this.data[index].profit / this.data[index].cProm) * 100
		);
		this.data[index].priceSale = Number(value) * Number(`1.${row.percentage}`);
		this.data[index].profitUlt = this.data[index].priceSale - this.data[index].priceCost;
		this.data[index].percentageProfitUlt =
			(this.data[index].profitUlt / this.data[index].priceCost) * 100;
	}
}

function changePriceSale(row, value) {
	const index = this.data.findIndex((d) => d.productId === row.productId);
	if (index > -1) {
		this.data[index].priceSale = Number(value);
		this.data[index].profitUlt = Number(value) - this.data[index].priceCost;
		this.data[index].percentageProfitUlt = twoDecimals(
			(this.data[index].profitUlt / this.data[index].priceCost) * 100
		);
		this.data[index].unitPrice = Number(value) / Number(`1.${row.percentage}`);
		this.data[index].profit = this.data[index].unitPrice - this.data[index].cProm;
		this.data[index].percentageProfit =
			(this.data[index].profit / this.data[index].unitCost) * 100;
	}
}

function changePercentageProfit(row, value) {
	const index = this.data.findIndex((d) => d.productId === row.productId);
	if (index > -1) {
		this.data[index].unitPrice =
			(value * this.data[index].cProm) / 100 + this.data[index].cProm;
		this.data[index].profit = this.data[index].unitPrice - this.data[index].cProm;
		this.data[index].percentageProfit = Number(value);
		this.data[index].priceSale =
			Number(this.data[index].unitPrice) * Number(`1.${row.percentage}`);
		this.data[index].profitUlt = this.data[index].priceSale - this.data[index].priceCost;
		this.data[index].percentageProfitUlt = twoDecimals(
			(this.data[index].profitUlt / this.data[index].priceCost) * 100
		);
	}
}

function changePercentageProfitUlt(row, value) {
	const index = this.data.findIndex((d) => d.productId === row.productId);
	if (index > -1) {
		this.data[index].priceSale =
			(value * this.data[index].priceCost) / 100 + this.data[index].priceCost;
		this.data[index].profitUlt = this.data[index].priceSale - this.data[index].priceCost;
		this.data[index].percentageProfitUlt = Number(value);
		this.data[index].unitPrice =
			this.data[index].priceSale / Number(`1.${row.percentage}`);
		this.data[index].profit = this.data[index].unitPrice - this.data[index].cProm;
		this.data[index].percentageProfit =
			(this.data[index].profit / this.data[index].unitCost) * 100;
	}
}

function changeImportProfit(row, value) {
	const index = this.data.findIndex((d) => d.productId === row.productId);
	if (index > -1) {
		this.data[index].unitPrice = Number(value) + this.data[index].cProm;
		this.data[index].profit = Number(value);
		this.data[index].percentageProfit = twoDecimals(
			(value / this.data[index].cProm) * 100
		);
		this.data[index].priceSale =
			this.data[index].unitPrice * Number(`1.${row.percentage}`);
		this.data[index].profitUlt = this.data[index].priceSale - this.data[index].priceCost;
		this.data[index].percentageProfitUlt = twoDecimals(
			(this.data[index].profitUlt / this.data[index].priceCost) * 100
		);
	}
}

function changeImportProfitUlt(row, value) {
	const index = this.data.findIndex((d) => d.productId === row.productId);
	if (index > -1) {
		this.data[index].priceSale = Number(value) + this.data[index].priceCost;
		this.data[index].percentageProfitUlt = twoDecimals(
			(value / this.data[index].priceCost) * 100
		);
		this.data[index].profitUlt = Number(value);
		this.data[index].unitPrice =
			this.data[index].priceSale / Number(`1.${row.percentage}`);
		this.data[index].profit = this.data[index].unitPrice - this.data[index].cProm;
		this.data[index].percentageProfit = twoDecimals(
			(this.data[index].profit / this.data[index].unitCost) * 100
		);
	}
}

function changeOneSwitch(value) {
	this.showProm = value === 0;
	this.switchProductIgv = value;
	this.colspanTableUtility = value === 1 ? 6 : 7;
	this.labelProductIgv = value === 1 ? 'Productos Con IGV' : 'Productos Sin IGV';
	this.columns[4].visible = value === 0;
	this.columns[5].visible = value === 0;
	this.columns[6].visible = value === 1;
	this.columns[7].visible = value === 0;
	this.columns[8].visible = value === 1;
	this.columns[9].visible = value === 0;
	this.columns[10].visible = value === 1;
	this.columns[11].visible = value === 0;
	this.columns[12].visible = value === 1;
	let sumTotalProfit = 0;
	let sumTotalProfitUlt = 0;
	let sumTotalPercentageProfit = 0;
	let sumTotalPercentageProfitUlt = 0;
	this.data = this.data.map((d) => {
		const newD = { ...d };
		sumTotalProfit += newD.profit;
		sumTotalPercentageProfit += newD.percentageProfit;
		sumTotalProfitUlt += newD.profitUlt || 0;
		sumTotalPercentageProfitUlt += newD.percentageProfitUlt || 0;
		return newD;
	});
	this.totalPercentageProfit =
		value === 1
			? sumTotalPercentageProfitUlt / this.data.length
			: sumTotalPercentageProfit / this.data.length;
	this.totalProfit =
		value === 1
			? sumTotalProfitUlt / this.data.length
			: sumTotalProfit / this.data.length;
}

function validatedUtility() {
	if (!this.params.warehouseId || this.params.warehouseId.length === 0) {
		this.showConfirmUtility = true;
	} else {
		this.savePricePerUtility();
	}
}

async function savePricePerUtility() {
	const body = {
		flagArticleDate: true,
		flagEditAll: !this.params.warehouseId,
		salPriceListId: this.priceListId,
		warehousesId: this.params.warehouseId ? this.params.warehouseId : undefined,
		productsPriceSale: this.data.map((d) => {
			const newD = {
				productId: d.productId,
				unitPrice: twoDecimals(d.unitPrice),
				priceSale: twoDecimals(d.priceSale),
				taxes: twoDecimals(Number(d.priceSale) - Number(d.unitPrice)),
			};
			return newD;
		}),
	};
	try {
		await this.$httpProducts.patch('products/price-sale/multiple', body);
		this.showConfirmUtility = false;
		this.clearFilters();
		this.showNotification(
			'La precios se actualizaron a las tiendas seleccionadas correctamente.'
		);
	} catch (error) {
		this.showGenericError();
	}
}

function columnInput(event) {
	const value = Number(event.event.target.value);
	let sumTotalProfit = 0;
	let sumTotalPercentageProfit = 0;
	if (event.column.value === 'util') {
		this.data = this.data.map((d) => {
			const newD = { ...d };
			newD.percentageProfit = value;
			newD.priceCalc = twoDecimals(newD.priceCost / (1 - value / 100)) || 0;
			newD.unitPrice = newD.priceCalc - newD.tax || 0;
			newD.profit = newD.priceCalc - newD.priceCost || 0;
			sumTotalProfit += newD.profit || 0;
			sumTotalPercentageProfit += newD.percentageProfit || 0;
			return newD;
		});
	} else {
		this.data = this.data.map((d) => {
			const newD = { ...d };
			newD.unitPrice = value;
			newD.priceCalc = Number(value) + newD.tax;
			newD.percentageProfit = twoDecimals(
				((newD.priceCalc - newD.priceCost) / newD.priceCalc) * 100
			);
			newD.profit = newD.priceCalc - newD.priceCost || 0;
			return newD;
		});
	}
	this.totalPercentageProfit = sumTotalPercentageProfit / this.data.length;
	this.totalProfit = sumTotalProfit / this.data.length;
}

function onSearch(search) {
	const searchTrim = search ? search.trim() : '';
	this.params.search = searchTrim || null;
	this.searchDataFiltered();
}

function priceCal(row) {
	return row.priceCalc.toFixed(2);
}

function clearFilters() {
	this.categoryId = null;
	this.priceListId = this.$userInfo.salPriceList.id;
	this.period = this.periodTypes[0].code;
	this.data = [];
	this.showRange = false;
	this.params = {
		startDate: null,
		endDate: null,
	};
	if (this.subsidiaries.length === 1) {
		this.params.subsidiaryId = this.subsidiaries[0].id;
	} else {
		this.params.subsidiaryId = null;
	}
	if (this.warehouses.length === 1) {
		this.params.warehouseId = this.warehouses[0].id;
	} else {
		this.params.warehouseId = [];
	}
}

function setPeriod({ model, value }) {
	this[model] = value.code;
	this.showRange = this[model] === 'range';
	if (this[model] === 'day') {
		const startDate = this.$today();
		const endDate = this.$today();
		this.setFilter({ model: 'startDate', value: startDate });
		this.setFilter({ model: 'endDate', value: endDate });
	} else if (this[model] === 'yesterday') {
		const startDate = format(subDays(this.$today(), 1), 'YYYY-MM-DD');
		const endDate = format(subDays(this.$today(), 1), 'YYYY-MM-DD');
		this.setFilter({ model: 'startDate', value: startDate });
		this.setFilter({ model: 'endDate', value: endDate });
	} else if (this[model] !== 'range') {
		const endDate =
			this[model] === 'yesterday'
				? format(subDays(this.$today(), 1), 'YYYY-MM-DD')
				: this.$today();
		const startDate =
			this[model] === 'yesterday'
				? format(subDays(this.$today(), 1), 'YYYY-MM-DD')
				: format(subDays(this.$today(), 7), 'YYYY-MM-DD');
		this.setFilter({ model: 'startDate', value: startDate });
		this.setFilter({ model: 'endDate', value: endDate });
	} else {
		this.setFilter({ model: 'startDate', value: null });
		this.setFilter({ model: 'endDate', value: null });
	}
}

function setFilter({ model, value }) {
	this.params[model] = model === 'startDate' || model === 'endDate' ? value : value.code;
}

function labelTwoSwitch() {
	return this.changeCost ? 'C. Promedio' : 'P. Ult. Compra';
}

function changeSwitchUtil(value) {
	this.showProm = false;
	this.showUtility = value === 1;
	this.showPercentage = value === 0;
	this.showPercentageUlt = value === 1;
}

function changeIgvTable(value) {
	this.columns[6].visible = value === 1;
	this.columns[7].visible = value === 1;
	this.columns[4].visible = value === 0;
	this.columns[5].visible = value === 0;
}

function setPriceListId({ model, value }) {
	this[model] = value.id;
}

function setDate({ model, value }) {
	this.params[model] = format(value, 'YYYY-MM-DD');
}

function setParams({ model, value }) {
	if (model === 'subsidiaryId') {
		this.params[model] = value;
		this.params.warehouseId = [];
		this.loadWarehouse();
	} else {
		this.params[model] = [...value];
	}
}

async function loadWarehouse() {
	const params = {
		subsidiariesId: this.params.subsidiaryId,
	};
	try {
		const response = await this.$httpProducts.get('warehouses', { params });
		this.warehouses = response.data.map((p) => {
			const newRow = { ...p };
			newRow.isSelected = false;
			return newRow;
		});
		if (this.warehouses.length === 1) {
			this.params.warehouseId = this.warehouses.map((p) => p.id);
		}
	} catch (error) {
		this.showGenericError();
	}
}

function closeModalUtility() {
	this.showConfirmUtility = false;
}

function funcionSaveUtility(values) {
	this.params.warehouseId = values;
	this.savePricePerUtility();
}

async function downLoadExcelReport() {
	this.isLoading = true;
	const code = 'xlsx';
	const name = 'Reporte de Precio por Utilidad';
	const body = {
		columns: this.columns.reduce((acum, pl) => {
			const newAcum = [...acum];
			if (pl.id !== 12) {
				const newCol = {
					name: pl.name,
					value: pl.value,
				};
				newAcum.push(newCol);
			}
			return newAcum;
		}, []),
		rows: this.data.map((p) => {
			const newRow = {};
			newRow.code = p.code;
			newRow.productName = p.productName;
			newRow.unitName = p.unitName;
			newRow.createdAt = p.createdAt;
			newRow.unitCost = p.unitCost;
			newRow.cProm = p.cProm;
			newRow.pricePurchase = p.pricePurchase;
			newRow.unitPrice = p.unitPrice;
			newRow.priceSale = p.priceSale;
			newRow.profit = p.profit;
			newRow.profitUlt = p.profitUlt;
			newRow.percentageProfitUlt = p.percentageProfitUlt;
			newRow.stock = p.stock;
			return newRow;
		}),
		code: 'xlsx',
	};
	const params = { ...this.params };
	try {
		const response = await this.$httpSales.post('reports', body, {
			params,
			responseType: 'blob',
		});
		const blob = helper.generateBlob(
			response.data,
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		helper.showDownloadDialog(blob, name, code);
	} catch (error) {
		this.showGenericError();
	} finally {
		this.isLoading = false;
	}
}

function data() {
	return {
		loadingGeneral: false,
		showProm: true,
		showPercentage: false,
		showPercentageUlt: false,
		selectChecks: [],
		colspanTableUtility: 7,
		changeCost: false,
		changeIgv: false,
		changeUtility: false,
		categories: [],
		categoryId: null,
		data: [],
		columns: [
			{
				id: 1,
				name: '# Cod',
				value: 'code',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Descripción',
				value: 'productName',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Und',
				tooltip: 'Unidad',
				value: 'unitName',
				visible: true,
				checked: true,
			},
			{
				id: 4,
				name: 'Fecha de Compra',
				value: 'createdAt',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: '',
				value: 'unitCost',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'C. Prom.',
				value: 'cProm',
				borderBottom: true,
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'P. Compra',
				value: 'pricePurchase',
				visible: false,
				checked: false,
				borderBottom: true,
			},
			{
				id: 8,
				name: 'Precio Unit.',
				value: 'unitPrice',
				visible: true,
				checked: true,
				showInput: false,
				isEditable: true,
				borderBottom: true,
			},
			{
				id: 9,
				name: 'P. Venta.',
				value: 'priceSale',
				visible: false,
				checked: false,
				showInput: false,
				borderBottom: true,
			},
			{
				id: 10,
				name: 'Utilidad',
				value: 'profit',
				visible: true,
				checked: true,
				borderBottom: true,
			},
			{
				id: 11,
				name: 'Utilidad',
				value: 'profitUlt',
				visible: false,
				checked: false,
				borderBottom: true,
			},
			{
				id: 12,
				name: '% Util',
				tooltip: '% Utilidad - Formula: (Util - C.Prom) * 100',
				value: 'percentageProfit',
				visible: true,
				checked: true,
				showInput: false,
				isEditable: true,
			},
			{
				id: 13,
				name: '% Util',
				tooltip: '% Utilidad - (Util - P.Compra) * 100',
				value: 'percentageProfitUlt',
				visible: false,
				checked: false,
				showInput: false,
				isEditable: true,
			},
			{
				id: 14,
				name: 'Stock',
				value: 'stock',
				visible: true,
				checked: true,
			},
			{
				id: 15,
				name: 'Accciones',
				value: 'actions',
				visible: true,
				checked: true,
			},
		],
		isLoading: false,
		endDate: null,
		labelProductIgv: 'Productos Sin IGV',
		params: {
			warehouseId: null,
			subsidiaryId: null,
			endDate: null,
			startDate: null,
			search: null,
			limit: 100,
		},
		periodTypes: [
			{
				id: 1,
				code: 'day',
				name: 'Hoy',
			},
			{
				id: 2,
				code: 'yesterday',
				name: 'Ayer',
			},
			{
				id: 3,
				code: 'lastweek',
				name: 'Última semana',
			},
			{
				id: 4,
				code: 'range',
				name: 'Rango de fechas',
			},
		],
		period: null,
		pricesLists: [],
		priceListId: null,
		rowsAssigned: [],
		subsidiaries: [],
		showConfirmUtility: false,
		showUtility: false,
		showRange: false,
		switchProductIgv: 0,
		startDate: null,
		totalPercentageProfit: 0,
		totalProfit: 0,
		priceLists: [],
		units: [],
		warehouses: [],
	};
}

export default {
	name: 'page-price-per-utility',
	data,
	created,
	computed: {
		labelTwoSwitch,
		disabledSearch() {
			const { subsidiaryId, startDate, endDate } = this.params;
			if (!subsidiaryId) {
				return true;
			}
			if (this.period === 'range') {
				return !(startDate && endDate);
			}
			return false;
		},
	},
	methods: {
		funcionSaveUtility,
		closeModalUtility,
		changeIgvTable,
		changeOneSwitch,
		changeSwitchUtil,
		clearFilters,
		downLoadExcelReport,
		loadPriceList,
		priceCal,
		searchDataFiltered,
		loadData,
		loadWarehouse,
		deleteProduct,
		changeUnitPrice: helper.debounce(changeUnitPrice, 1000),
		changePriceSale: helper.debounce(changePriceSale, 1000),
		changePercentageProfit: helper.debounce(changePercentageProfit, 1000),
		changePercentageProfitUlt: helper.debounce(changePercentageProfitUlt, 1000),
		changeImportProfit: helper.debounce(changeImportProfit, 1000),
		changeImportProfitUlt: helper.debounce(changeImportProfitUlt, 1000),
		savePricePerUtility,
		setDate,
		setFilter,
		setParams,
		setPeriod,
		setPriceListId,
		columnInput: helper.debounce(columnInput, 1000),
		onSearch,
		validatedUtility,
		setData({ model, value }) {
			if (model === 'categoryId') {
				this.categoryId = value;
			}
		},
	},
	components: {
		dateComponent,
		headerPage,
		generalFilter,
		modalItems,
		appTable,
		categoriesAutocomplete,
	},
};
</script>
<style lang="scss">
.footer-table {
	background-color: #e2f1f1;
	font-size: 12px;

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

.flex-start {
	align-items: flex-start !important;
}

.label-switch {
	color: #8f8f8f;
	font-family: map-get($fonts, open-bold);
	font-size: 10px;
}

.page-price-per {
	.input-group.input-group--selection-controls.switch {
		.input-group--selection-controls__toggle {
			height: 17px !important;
			width: 35px !important;
		}
	}
	.input-group--selection-controls__ripple {
		&::after {
			width: 18px !important;
			height: 16px !important;
		}
	}
}

.ft-8 {
	font-size: 8px;
}

.ft-10 {
	font-size: 10px;
	font-weight: bold;
}

.link-purchase {
	color: #006edb;
}

.product-add-btn {
	align-items: center;
	border-color: color(primary);
	border-style: solid;
	border-width: 1px;
	border-radius: 2px;
	color: color(primary);
	cursor: pointer;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	font-family: font(open-semibold);
	font-size: size(small);
	height: 27px;
	justify-content: space-between;
	padding: 0px 9px;
	width: 100%;

	span {
		text-align: center;
		width: calc(100% - 23px);
	}

	&.product-add-btn-active {
		background-color: color(primary);
		color: color(white);
	}
}

.headline {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(medium) !important;
	letter-spacing: normal !important;
	line-height: 1 !important;
	margin: auto;
	max-width: 340px;
	padding-top: 37px !important;
	text-align: center;
}

.text-dialog {
	background-color: #c3e7e8;
	color: color(primary);
	font-family: map-get($fonts, lato-regular);
	font-size: 12px;
}

.content-utlity {
	background-color: #e2f1f1;
	border-radius: 8px;
	color: color(primary);
	font-family: map-get($fonts, open-bold);
	font-size: 12px;
	padding: 10px 14px;
}
</style>
