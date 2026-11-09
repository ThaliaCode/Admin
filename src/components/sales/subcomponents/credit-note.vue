<template>
	<v-container px-3>
		<v-layout wrap mb-3 justify-space-between>
			<v-flex xs5 class="body-2">
				<span>#{{ sale.typeDocumentName }}</span>
				<span> {{ sale.serie }} - {{ sale.number }} </span>
			</v-flex>
			<v-flex xs5 mr-3 text-xs-right>{{ getCurrency }}{{ totalAmount | round }}</v-flex>
		</v-layout>
		<v-layout wrap mb-3 v-show="hasAdvancePayment">
			<h3 class="red--text">
				El comprobante relacionado tiene descuentos, debe agregar los productos
			</h3>
		</v-layout>
		<v-layout wrap mb-3 align-center>
			<v-flex xs4 pr-2 v-if="showSunatCatalog">
				<app-select
					:disabled="disabledNdd"
					item-text="description"
					item-value="id"
					:item="creditType"
					:items="sunatCatalog"
					label="Tipo de nota de crédito"
					@input="getCreditType"
				/>
			</v-flex>
			<v-flex xs5>
				<v-layout row wrap>
					<v-flex xs6 pr-2>
						<app-select
							item-text="name"
							item-value="id"
							label="Método de Pago"
							:items="paymentMethods"
							:item="paymentMethodId"
							@input="getPaymentMethod"
						/>
					</v-flex>
					<v-flex xs4 v-if="!!sale.flagOldSale">
						<app-input-text
							label="Número"
							model="saleNumber"
							:text="saleNumber"
							@input="updateNumber"
						></app-input-text>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-flex xs12 pt-2 pb-2 pl-2>
			<v-checkbox
				:disabled="creditType === 5"
				class="checkbox-sale"
				color="primary"
				hide-details
				label="Devolver mercadería"
				v-model="flagTransfer"
			></v-checkbox>
		</v-flex>
		<v-layout wrap>
			<v-flex xs12>
				<v-alert type="error" v-model="showAlert">
					<p class="mb-0">{{ alertMessage }}</p>
				</v-alert>
			</v-flex>
		</v-layout>
		<v-divider></v-divider>
		<v-layout wrap v-if="needTypePayments">
			<v-flex xs12 white py-4>
				<v-layout column wrap class="justify-center">
					<v-flex>
						<label>Tipo de Pago</label>
					</v-flex>
					<v-flex xs10 mt-2>
						<v-select
							chips
							clearable
							solo
							multiple
							color="success"
							item-text="name"
							hide-details
							label="Seleccione tipos de pago"
							:items="typePayments"
							v-model="selectedCards"
							@change="changeCards"
						>
							<template slot="selection" slot-scope="data">
								<v-chip
									color="info"
									outline
									:selected="data.selected"
									close
									@input="remove(data.item)"
								>
									<strong>{{ data.item.name }}</strong
									>&nbsp;
								</v-chip>
							</template>
						</v-select>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12>
				<v-layout
					wrap
					align-center
					v-for="(cards, indexCards) in selectedCardsFn"
					:key="indexCards"
					pt-3
					pb-2
					px-5
				>
					<v-flex xs4 px-2>
						<label>{{ cards.name }}</label>
					</v-flex>
					<v-flex xs3>
						<v-text-field
							hide-details
							type="number"
							v-model.number="cards.paid"
							class="filter-select shadow-inset"
							@input="updatePayAmounts(indexCards, cards.paid)"
						></v-text-field>
					</v-flex>
					<v-flex xs2 text-xs-center v-if="isNotTypeCash(cards)">
						<v-btn icon flat class="ma-0" @click="openForm(cards)">
							<v-icon color="info">
								{{ cards.icon }}
							</v-icon>
						</v-btn>
					</v-flex>
					<v-flex xs12>
						<bank-deposit-form
							v-show="isActiveForm(cards, 'Deposit')"
							:code="cards.code"
							:bank-account-id="cards.deposit.bankAccountId"
							:bank-accounts="bankAccounts"
							:document-number="cards.deposit.documentNumber"
							:date-reference="cards.deposit.additionalInformation.dateReference"
							:url-image="cards.deposit.urlImage"
							@get-data="setDepositData"
						/>
						<check-form
							v-show="isActiveForm(cards, 'Check')"
							:code="cards.code"
							:bank-account-id="cards.check.bankAccountId"
							:bank-accounts="bankAccounts"
							:document-number="cards.check.documentNumber"
							:date-reference="cards.check.additionalInformation.dateReference"
							:reference="cards.check.reference"
							@get-data="setCheckData"
						/>
						<card-form
							v-show="isActiveForm(cards, 'Card')"
							:code="cards.code"
							:bank-account-id="cards.card.bankAccountId"
							:bank-accounts="bankAccounts"
							:document-number="cards.card.documentNumber"
							@get-data="setCardData"
							is-sale
						/>
					</v-flex>
					<v-flex xs12 pt-4>
						<v-divider></v-divider>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout wrap px-5 pt-4 v-else-if="isMethodPaymentCredit">
			<v-flex xs6>
				<v-layout wrap align-center>
					<v-flex xs6>
						<span class="body-1">Número de cuotas:</span>
					</v-flex>
					<v-flex xs6>
						<v-text-field
							hide-details
							single-line
							placeholder="00"
							type="number"
							v-model.number="quotesNumber"
							class="filter-select shadow-inset"
							@input="addFees"
						></v-text-field>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-layout mt-3 pl-5 v-for="(fee, indexQ) in fees" :key="indexQ">
				<v-flex xs2 pt-4>
					<span>Cuota - {{ indexQ + 1 }}</span>
				</v-flex>
				<v-flex xs2 mr-5>
					<label class="caption">Monto a Pagar</label>
					<v-text-field
						hide-details
						single-line
						placeholder="00"
						type="number"
						v-model.number="fee.amount"
						class="filter-select shadow-inset"
					></v-text-field>
				</v-flex>
				<v-flex xs4>
					<app-date-mask
						:id="`${indexQ}-date`"
						label="Fecha de Pago"
						v-model="fee.dateWithOutFormat"
						@format-date="
							setValue({
								model: 'expirationDate',
								value: $event,
								index: indexQ,
							})
						"
					/>
				</v-flex>
			</v-layout>
		</v-layout>
		<v-layout column wrap px-2 mt-3>
			<v-flex>
				<label>Comentario</label>
			</v-flex>
			<v-flex>
				<v-text-field
					textarea
					multi-line
					no-resize
					label="Comentario"
					v-model="commentary"
					class="filter-select shadow-inset mt-3 textarea-content"
				>
				</v-text-field>
			</v-flex>
		</v-layout>
		<v-layout wrap px-2>
			<v-flex>
				<span class="form-group__message mb-3" v-if="!isPeru && commentary.length === 0">
					El comentario es requerido
				</span>
			</v-flex>
		</v-layout>
		<general-filter
			v-if="!creditType === 6"
			class="no-padding layout wrap justify-space-between"
		>
			<v-flex xs12 sm6 md5 class="align-col">
				<label class="caption">Productos</label>
				<v-select
					autocomplete
					single-line
					hide-details
					:search-input.sync="searchProduct"
					:items="products"
					v-model="newProduct.product"
					label="Productos"
					item-text="autocomplete"
					class="filter-select"
					content-class="filter-select-content"
					@input="updateNewProduct"
				></v-select>
			</v-flex>
			<v-flex xs12 sm6 md3 class="align-col">
				<autocomplete-component
					label-value="Lista de Precios"
					item-text="name"
					item-value="id"
					:items="newProduct.product.pricesListArray"
					:on-clean="onClean"
					:resource-url="'/sal-price-lists'"
					:http-code="'$httpSales'"
					:item="this.newProduct.selectedPriceListId"
					return-object
					@return-data="setPriceList"
				></autocomplete-component>
			</v-flex>
			<v-flex xs12 sm6 md3 ml-3 pt-4 class="align-col">
				<v-layout row justify-space-between align-center>
					<v-flex>
						<span mr-2>Cantidad:</span>
					</v-flex>
					<v-flex mx-2>
						<v-text-field
							bottom
							single-line
							hide-details
							type="number"
							v-model.number="newProduct.quantity"
							label="0"
							class="filter-select shadow-inset"
							content-class="filter-select-content"
							@keypress.enter="addProduct"
						></v-text-field>
					</v-flex>
					<v-flex>
						<button
							:disabled="
								!newProduct.product.name ||
								!newProduct.quantity ||
								!newProduct.selectedPriceListId
							"
							class="pl-add-container height-button"
							:class="{
								opacyble:
									!newProduct.product.name ||
									!newProduct.quantity ||
									!newProduct.selectedPriceListId,
							}"
							@click="addProduct"
						>
							<v-icon id="add-icon" color="white">add</v-icon>
						</button>
					</v-flex>
				</v-layout>
			</v-flex>
		</general-filter>
		<v-layout row mb-2 mt-2 v-if="creditType === 5 || creditType === 7">
			<v-flex>
				<v-btn
					type="button"
					color="pink"
					class="delete-products mr-1 mt-3"
					@click="removeData"
				>
					Eliminar Seleccionados
				</v-btn>
			</v-flex>
		</v-layout>
		<v-layout wrap mb-3 mt-4 class="layout justify-space-between">
			<v-flex class="product-list">Lista de productos</v-flex>
			<v-flex class="product-list" v-if="creditType === 5">
				<v-checkbox
					class="checkbox-sale"
					color="primary"
					hide-details
					label="Calcular descuento por monto"
					v-model="calculateDiscountByAmount"
					@change="clearDiscountByAmountAndPercentage"
				/>
				<div v-show="calculateDiscountByAmount" class="">CANT X DISC = TOTAL</div>
			</v-flex>
		</v-layout>
		<div class="mb-2">
			<div class="alertQuantity">
				{{ messageAlert }}
			</div>
			<div class="alertQuantity">
				{{ isDecimalFour ? '' : 'Todas las cantidades debe ser menor a 4 decimales' }}
			</div>
			<app-table
				name="credit-note"
				:columns="columns"
				disabled-value="disabledRow"
				:filter-columns="false"
				:include-filter="false"
				:input-search="false"
				:main-list="false"
				:selectable="true"
				:check-all="checkAll"
				:check-all-disabled="creditType === 6 || creditType === 1"
				:rows="dataSelected"
				@row-is-selected="rowIsSelected"
				:dispatch-detail="rowDisabled"
				@column-input="editDiscountColumn"
				@on-selected-all="selectedAll"
				padding="px-0"
			>
				<template slot="rows" slot-scope="props">
					<td v-show="showRow(columns, 1)">
						{{ props.row.product ? props.row.product.code : props.row.productCode }}
					</td>
					<td v-show="showRow(columns, 2)">{{ props.row.product.name }}</td>
					<td v-show="showRow(columns, 3)">
						<v-text-field
							v-if="creditType === 3 || hasAdvancePayment"
							hide-details
							single-line
							class="filter-select shadow-inset"
							:value="props.row.description"
							@input="setDescription(props.index, $event)"
						></v-text-field>
						<span v-else>
							{{ props.row.product.description }}
						</span>
					</td>
					<td v-show="showRow(columns, 4)">{{ props.row.unitName }}</td>
					<td v-show="showRow(columns, 5)">
						<v-layout row align-start>
							<v-flex>
								<v-text-field
									hide-details
									single-line
									type="number"
									class="filter-select shadow-inset input-table-quantity"
									:readonly="isReadOnlyQuantity || props.row.flagUse"
									:value="props.row.quantity"
									:disabled="creditType === 5 || creditType === 3 || rowsSeries"
									@input="quantityValidation(props.index, $event)"
									@click.stop="stopClick"
								></v-text-field>
							</v-flex>
							<v-flex>
								<v-tooltip top>
									<v-icon size="12" class="secuense-icon" slot="activator" color="primary"
										>help_outline</v-icon
									>
									<span>Cantidad Devuelta: {{ props.row.quantityRefund || 0 }}</span>
								</v-tooltip>
							</v-flex>
						</v-layout>
					</td>
					<td v-show="showRow(columns, 6)">
						<v-text-field
							hide-details
							single-line
							type="number"
							:readonly="isReadOnlyPrice"
							:disabled="props.row.flagFree === 1 || creditType === 5 || creditType === 3"
							class="filter-select shadow-inset input-table-price"
							v-model.number="props.row.priceUnitary"
							@click.stop="stopClick"
							@input="editPrice(props.row, $event)"
						></v-text-field>
					</td>
					<td v-show="showRow(columns, 7)">
						{{ props.row.pricePerSale | round }}
					</td>
					<td v-show="showRow(columns, 8)">
						<!-- <app-input-text
							@click.stop="stopClick"
							:readonly="isReadOnlyData"
							:disabled="props.row.flagFree === 1 || creditType === 7 || creditType === 3"
							type="number"
							model="discountPercentage"
							:text="props.row.discountPercentage"
							@change="editDiscountNdc(props.row, $event)"
						/> -->
						<label
							v-if="
								calculateDiscountByAmount
									? validateAmountDiscount(props.row)
									: !validateDescuent(props.row.ocultPercentage)
							"
							class="red--text caption"
							>Desc. no válido</label
						>
						<v-text-field
							v-if="calculateDiscountByAmount"
							hide-details
							single-line
							type="number"
							:readonly="isReadOnlyDescuent"
							:disabled="props.row.flagFree === 1 || creditType === 7 || creditType === 3"
							v-model.number="props.row.ocultAmountDiscount"
							class="filter-select shadow-inset input-table-quantity"
							@click.stop="stopClick"
							@change="editDiscountByAmountNdc(props.row, $event)"
						/>
						<v-text-field
							v-else
							hide-details
							single-line
							type="number"
							:readonly="isReadOnlyDescuent || props.row.flagUse"
							:disabled="props.row.flagFree === 1 || creditType === 7 || creditType === 3"
							v-model.number="props.row.ocultPercentage"
							class="filter-select shadow-inset input-table-quantity"
							@click.stop="stopClick"
							@change="editDiscountNdc(props.row, $event)"
						/>
					</td>
					<td v-show="showRow(columns, 9)">{{ props.row.taxes }}</td>
					<td v-show="showRow(columns, 10)">
						<v-layout row align-start>
							<v-flex> {{ props.row.total | round }}</v-flex>
							<v-flex>
								<v-tooltip top>
									<v-icon size="12" class="secuense-icon" slot="activator" color="primary"
										>help_outline</v-icon
									>
									<span>Total Retornado: {{ props.row.totalRefund || 0 }}</span>
								</v-tooltip>
							</v-flex>
						</v-layout>
					</td>
					<td v-show="showRow(columns, 11)">
						<app-tooltip-button
							v-if="props.row.product.flagControlSerie && isReadOnlySeries"
							img="/static/img/icons/barcode.svg"
							:height="25"
							text="Control de series"
							@click-icon="openSeries(props.row)"
						/>
					</td>
				</template>
			</app-table>
		</div>
		<v-layout row wrap px-4 py-1>
			<v-flex xs12 class="totales-section d-flex text-xs-center">
				<v-flex>
					<span>Desc.: </span>
					<span>{{ salesCurrency }} {{ priceAmounts.totalDiscount | round }}</span>
				</v-flex>
				<v-flex>
					<span>{{ getTaxByCountry }}: </span>
					<span>{{ salesCurrency }} {{ priceAmounts.tax | round }}</span>
				</v-flex>
				<v-flex class="subtotal-container">
					<div class="subtotal">
						<span>SubT.: </span>
						<span>{{ salesCurrency }} {{ priceAmounts.subtotal | round }}</span>
						<button type="button" class="btn-totales" @click="active = !active">
							<v-icon v-if="active" color="info">remove</v-icon>
							<v-icon v-else color="info">add</v-icon>
						</button>
					</div>
					<transition name="fade" mode="out-in">
						<div class="subtotal-menu" v-if="active">
							<div class="subtotal-menu-content">
								<p v-for="(tax, indexTax) in generalTaxes" :key="indexTax">
									<span class="taxes-title">{{ tax.description }}</span>
									<span>{{ salesCurrency }} {{ resumeTaxes[tax.code] | round }}</span>
								</p>
							</div>
						</div>
					</transition>
				</v-flex>
				<v-flex>
					<span>Total: </span>
					<span>{{ salesCurrency }} {{ priceAmounts.total | round }}</span>
				</v-flex>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer py-0">
			<modal-sidebar-button
				success-color="primary"
				:is-loading="validating"
				@accept-button-clicked="makeCreditNote"
				@cancel-button-clicked="$emit('cancel-button')"
			/>
		</section>
		<action-sidebar
			:active="action.active"
			:code-action="action.code"
			:title="action.title"
			:width="action.width"
			:help-actions="actionsToHelp"
			v-model="action.open"
			@close-modal="closeModal"
		>
			<view-series
				v-if="action.code === 'view-series'"
				:product="saleSeriesProduct"
				:type="creditType"
				:serie="saleSeries"
				@send-series="sendSeries"
				@close="closeModal"
			/>
		</action-sidebar>
		<!-- {{ log }} -->
	</v-container>
</template>

<script>
import { format } from 'date-fns';
import appSelect from '@/components/shared/app-select';
import appTable from '@/components/shared/table/app-table';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';
import generalFilter from '@/components/shared/general-filter';
import helper from '@/shared/helper';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import Sales from '@/shared/sale';
import lib from '@/shared/lib';
import bankDepositForm from '@/components/shared/type-payment-forms/bank-deposit-form';
import checkForm from '@/components/shared/type-payment-forms/check-form';
import cardForm from '@/components/shared/type-payment-forms/card-form';
import typePaymentForm from '@/shared/type-payment-form';
import TypeCreditNote from '@/shared/type-credit-note';
import actionSidebar from '@/components/shared/action-sidebar';
import viewSeries from '@/components/transfers/view-series';

const {
	decimals,
	distributeAmount,
	equality,
	find,
	getDeeper,
	map,
	removeItemFromArray,
	setNewProperty,
	updateItemInCollection,
} = lib;
const Sale = new Sales();
const twoDecimals = decimals(2);
const fourDecimals = decimals(4);
const { getLocalData } = helper;

async function created() {
	Sale.isEditing = true;
	this.show10Percentage = this.$userInfo.company.settings.flagTaxesIgvTemporary || false;
	this.generalTaxes = getLocalData('general-taxes') || [];
	this.generalTaxes = this.generalTaxes.map((p) => {
		const newRow = { ...p };
		newRow.idCodeReference = `${p.code}${p.percentage}`;
		newRow.show = true;
		return newRow;
	});
	if (this.show10Percentage) {
		const newIgvTeen = {
			name: 'IGV IMPUESTO GENERAL A LAS VENTAS',
			description: 'IGV IMPUESTO GENERAL A LAS VENTAS - Porcentaje: 10',
			code: '01',
			id: 33,
			flagTypeTaxes: 1,
			isSelected: false,
			value: '01',
			catalogSunatId: 6,
			percentage: 10,
			show: false,
		};
		newIgvTeen.idCodeReference = `${newIgvTeen.code}${newIgvTeen.percentage}`;
		this.generalTaxes.push(newIgvTeen);
	}
	this.columns = this.updateColumns(this.$userInfo, this.columns);
	Sale.user = this.$userInfo;
	this.defaultCurrency = this.$userInfo.company.currency;
	this.salesCurrency = this.sale.currency;
	await this.loadResources();
	await this.loadData();
}

async function loadResources() {
	const requests = [
		this.getTypePayments('sales'),
		this.$httpSales.get('bank-account'),
		this.exchangeByDate(),
		this.getPaymentsMethods(),
	];
	[
		{ data: this.typePayments },
		{ data: this.bankAccounts },
		{ data: this.exchangeRate },
		{ data: this.paymentMethods },
	] = await Promise.all(requests);
}

function updateColumns(user, columns) {
	const taxLabel = getDeeper('company', 'country', 'taxName')(user);
	if (taxLabel) {
		const item = find(equality('value', 'taxes'), columns);
		return map(updateItemInCollection(item, 'value', 'name', `% ${taxLabel}`), columns);
	}
	return columns;
}

async function loadData() {
	const requests = [this.listOfUnits(), this.listPricingPromise()];
	if (this.showSunatCatalog) {
		requests.push(this.$httpSales.get('catalog-sunat-details-list/09'));
	}
	try {
		const responses = await Promise.all(requests);
		[{ data: this.units }, { data: this.pricesList }] = responses;
		if (this.showSunatCatalog) {
			[, , { data: this.sunatCatalog }] = responses;
			const newType = this.sunatCatalog.find((sc) => sc.code === '06') || {};
			newType.fullName = `${newType.description}-${newType.code}`;
			this.creditType = newType.id;
		}

		this.sunatCatalog = this.sunatCatalog.filter(
			(a) => a.id === 1 || a.id === 5 || a.id === 6 || a.id === 7 || a.id === 3
		);
		if (this.showReturn) {
			// creditType === 7 DEVOLUCION POR ITEM
			// creditType === 5 DESCUENTO POR ITEM
			this.sunatCatalog = this.sunatCatalog.filter(
				(a) => a.id === TypeCreditNote.ItemReturn || a.id === TypeCreditNote.ItemDisc
			);
			this.creditType = TypeCreditNote.ItemReturn;
		}
		if (this.hasAdvancePayment) {
			this.sunatCatalog = this.sunatCatalog.filter((e) =>
				[TypeCreditNote.FullReturn, TypeCreditNote.CancelOp].includes(e.id)
			);
			this.creditType = this.sunatCatalog.length && this.sunatCatalog[0].id;
		}

		this.flagTransfer = this.creditType !== 5;
		Sale.pricesLists(this.pricesList);
		await this.dataSelectedFormatting();
		this.typePayments = this.typePayments.map((c) => {
			let newC = { ...c.paymentType };
			newC = setNewProperty('paid', 0)(newC);
			newC.open = false;
			newC.icon = 'add_circle_outline';
			newC.card = {
				bankAccountId: null,
				documentNumber: '',
			};
			newC.check = {
				additionalInformation: {
					dateReference: null,
				},
				bankAccountId: null,
				documentNumber: '',
				reference: '',
			};
			newC.deposit = {
				additionalInformation: {
					dateReference: null,
				},
				bankAccountId: null,
				documentNumber: '',
				urlImage: '',
			};
			newC.disabled = false;
			return newC;
		});
		const saleTransactions = this.sale.transactions || [];
		const codesTypePaymentSale = saleTransactions.map((t) => t.typePayment?.code);
		this.selectedCards = this.typePayments.filter((t) =>
			codesTypePaymentSale.includes(t.code)
		);
		this.selectedCards = this.selectedCards.map((s) => {
			const newCard = { ...s };
			const transaction =
				saleTransactions.find((t) => t.typePayment?.code === s.code) || {};
			if (s.flagForm === typePaymentForm.Card) {
				newCard.card.bankAccountId = transaction.bankAccountId;
				newCard.card.documentNumber = transaction.documentNumber;
			} else if (s.flagForm === typePaymentForm.Check) {
				newCard.check.bankAccountId = transaction.bankAccountId;
				newCard.check.documentNumber = transaction.documentNumber;
				newCard.check.reference = transaction.reference;
				newCard.check.additionalInformation = transaction.additionalInformation;
			} else if (s.flagForm === typePaymentForm.Deposit) {
				newCard.deposit.bankAccountId = transaction.bankAccountId;
				newCard.deposit.documentNumber = transaction.documentNumber;
				newCard.deposit.urlImage = transaction.urlImage;
				newCard.deposit.additionalInformation = transaction.additionalInformation;
			}
			return newCard;
		});
	} catch (err) {
		console.error(err);
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function isReadOnlyDescuent() {
	return (
		this.creditType === TypeCreditNote.CancelOp ||
		this.creditType === TypeCreditNote.FullReturn ||
		this.creditType === TypeCreditNote.ItemReturn
	);
}

function isReadOnlyQuantity() {
	return (
		this.creditType === TypeCreditNote.CancelOp ||
		this.creditType === TypeCreditNote.FullReturn
	);
}
function isReadOnlyPrice() {
	return (
		this.creditType === TypeCreditNote.CancelOp ||
		this.creditType === TypeCreditNote.FullReturn ||
		this.creditType === TypeCreditNote.ItemReturn
	);
}

function isReadOnlySeries() {
	return (
		this.creditType === TypeCreditNote.FullReturn ||
		this.creditType === TypeCreditNote.ItemReturn
	);
}

async function dataSelectedFormatting() {
	const withAllItems =
		this.creditType === TypeCreditNote.CancelOp ||
		this.creditType === TypeCreditNote.FullReturn ||
		this.creditType === TypeCreditNote.DescFix;

	const isSelected = true;
	let itemsNoFree = this.data.filter((p) => (withAllItems ? true : !p.flagFree));

	if (this.creditType === TypeCreditNote.ItemReturn) {
		itemsNoFree = this.data;
	}
	
	this.dataSelected = itemsNoFree.map((item) => {
		const newItem = { ...item };
		if (item.flagFree && this.creditType === TypeCreditNote.ItemReturn) {
			newItem.price = item.salePrice;
		}
		const { product } = item;
		const isDisabled = item.quantityRefund >= item.quantity;
		newItem.product.taxes = product.taxes.map((p) => {
			const newRow = { ...p };
			newRow.idCodeReference = `${p.code}${p.percentage}`;
			newRow.show = true;
			return newRow;
		});
		newItem.oldDescription = product.name || '';
		newItem.flagUse = withAllItems || isDisabled;
		newItem.disabledRow = withAllItems || isDisabled;
		newItem.priceList = product.priceList;
		newItem.discountPercentage = 0;
		newItem.ocultPercentage = 0;
		newItem.discount = 0;
		newItem.pricePerSale = item.price;
		newItem.salePrice = Sales.getPriceWithOutDiscount(newItem);
		newItem.warProductsId = item.product.id;
		return newItem;
	});
	this.dataSelected = await Sale.formattedProducts(
		this.dataSelected,
		this.pricesList,
		this.generalTaxes,
		false,
		isSelected
	);
	this.dataSelected = this.dataSelected.map((item, index) => {
		const originalDetail = itemsNoFree[index];
		const newItem = { ...item };
		if (originalDetail && originalDetail.taxes) {
			newItem.product = { ...newItem.product };
			newItem.product.taxes = newItem.product.taxes.map((pt) => {
				const orig = originalDetail.taxes.find((t) => t.code === pt.code);
				return orig ? { ...pt, percentage: orig.percentage } : pt;
			});
		}

		const originalTax = originalDetail.tax;
		if (typeof originalTax === 'number' && originalTax !== newItem.taxes) {
			const plusTaxes = 1 + originalTax / 100;
			newItem.taxes = originalTax;
			newItem.priceUnitary = fourDecimals(newItem.price / (plusTaxes || 1));
			newItem.subtotalWithoutTax = Sales.getSubtotalWithoutTax(newItem);
			newItem.total = Sales.getTotal(newItem);
			newItem.totalOld = newItem.total;
		}
		return newItem;
	});
	this.rowDisabled =
		this.creditType === TypeCreditNote.FullReturn ||
		this.creditType === TypeCreditNote.CancelOp;
}

function showSunatCatalog() {
	return this.$userInfo.company.country.countryCode === 'PER';
}

function updateNewProduct() {
	const { autoBarcode, category, code, conversions, description, name, unit, unitId } =
		this.newProduct.product.product;
	this.newProduct.product.autoBarcode = autoBarcode;
	this.newProduct.product.categoryName = category.name;
	this.newProduct.product.code = code;
	this.newProduct.product.description = description;
	this.newProduct.product.name = name;
	this.newProduct.product.unitConversion = 1;
	this.newProduct.product.unitId = unitId;
	this.newProduct.product.unitName = unit.name;
	this.newProduct.product.units = conversions
		? this.unitsByProduct(this.newProduct.product)
		: [{ ...unit }];
	this.newProduct.product.pricesListArray = Sale.pricesListByProduct(
		this.newProduct.product
	);
	this.getPriceListId(this.sale.customer);
}

function setPriceList(list) {
	if (list && list.id) {
		this.newProduct.selectedPriceListId = list.id;
	}
}

async function addProduct() {
	const index = this.dataSelected.findIndex(
		(prod) => prod.id === this.newProduct.product.id
	);
	if (index < 0) {
		const product = await Sales.addProducts(
			this.newProduct,
			this.generalTaxes,
			this.$userInfo
		);
		this.dataSelected = this.dataSelected.concat(product);
		this.newProduct = {
			product: {},
			quantity: 0,
			selectedPriceListId: 0,
		};
	} else {
		this.showNotification('El producto ya ha sido agregado.', 'info');
	}
}

function getPriceListId(customer) {
	const listByCustomer = customer
		? this.newProduct.product.pricesListArray.find(
				(pl) => pl.comCustomersId === customer.id
		  ) || {}
		: {};
	const listByEmployee =
		this.newProduct.product.pricesListArray.find(
			(pl) => pl.comEmployeeId === this.$userInfo.id
		) || {};
	const listByWarhouse =
		this.newProduct.product.pricesListArray.find(
			(pl) => pl.warWarehousesId === this.$userInfo.warWarehousesId
		) || {};
	const listDefault = Sale.defaultPriceList.id;
	const priceListId =
		listByCustomer.id || listByEmployee.id || listByWarhouse.id || listDefault;
	this.setPriceList({ id: priceListId });
}

function newData(products) {
	this.dataSelected = [...products];
}

async function searchValue(value) {
	const searchTrim = value ? value.toLowerCase().trim() : '';
	const exist = this.newProduct.product.autocomplete === value;
	if (searchTrim && !exist) {
		this.loading = true;
		try {
			const response = await this.productsSelections(searchTrim);
			this.products = [...response.data];
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			}
		} finally {
			this.loading = false;
		}
	}
}

function unitsByProduct(item) {
	if (item.conversions) {
		const keys = Object.keys(item.conversions);
		const newUnits = this.units.reduce((acum, unt) => {
			const index = keys.findIndex((k) => Number(k) === unt.id);
			if (index > -1) {
				acum.push(unt);
			}
			return acum;
		}, []);
		if (item.unit) {
			newUnits.push(item.unit);
		} else {
			const unit = {
				id: item.unitId,
				code: item.unitCode,
				name: item.unitName,
			};
			newUnits.push(unit);
		}
		return newUnits;
	}
	return [];
}

function rowIsSelected() {
	this.checkAll = this.dataSelected.every((d) => d.isSelected);
	if (this.dataSelected.length === 0) {
		this.checkAll = false;
		this.selectedCards = [];
	}
}

function selectedAll(val) {
	this.checkAll = val;
	this.dataSelected = this.dataSelected.map(setNewProperty('isSelected', val));
}

function removeData() {
	this.dataSelected = removeItemFromArray('isSelected', true)(this.dataSelected);
	if (this.dataSelected.length === 0) {
		this.flagTransfer = false;
	}
	this.rowIsSelected();
}

function quantityValidation(index, value) {
	const newVal = Math.abs(Number(value));
	const product = this.dataSelected[index];
	const newProduct = { ...product, quantity: newVal };
	const total = Sales.getTotal(newProduct);
	const subtotalWithoutTax = total / `1.${product.taxes}` + product.discount;
	if (total > product.totalOld) {
		this.showNotification('El total no puede superar al total anterior del producto.');
	}
	const buildTaxes = Sales.buildTaxes(newProduct);
	// const taxAmount = twoDecimals(buildTaxes[0].amount);
	const taxAmount = buildTaxes[0].amount;
	this.dataSelected = this.dataSelected.map((prod, idx) => {
		if (idx !== index) return prod;
		return {
			...prod,
			quantity: newVal,
			total,
			subtotalWithoutTax,
			taxAmount,
		};
	});
}

function stopClick() {
	return false;
}

function editPrice(product, value) {
	this.dataSelected = this.dataSelected.map((p) => {
		const newP = { ...p };
		const prop = p.warWarehouseProductBrandId ? 'warWarehouseProductBrandId' : 'id';
		if (product[prop] === newP[prop]) {
			const unitPrice = Number(value);
			const discount = unitPrice * (Number(p.discountPercentage) / 100);
			const buildTaxes = Sales.buildTaxes(newP);
			newP.priceEdited = true;
			newP.priceNegative = unitPrice < 0;
			newP.discount = discount;
			newP.priceUnitary = unitPrice;
			newP.taxAmount = twoDecimals(buildTaxes[0].amount);
			newP.pricePerSale = Sales.getPricePerSale(newP);
			newP.subtotalWithoutTax = (unitPrice - discount) * p.quantity;
			newP.total = Sales.getTotal(newP);
		}
		return newP;
	});
}

function getTaxAmount(product) {
	const { tax, quantity, priceUnitary, discount } = product;
	const taxAmount = tax / 100;
	return (priceUnitary - discount) * quantity * taxAmount;
}

function editDiscount(product, value, discountByAmount) {
	this.dataSelected = this.dataSelected.map((p) => {
		const newP = { ...p };
		const prop = p.warWarehouseProductBrandId ? 'warWarehouseProductBrandId' : 'id';
		if (product[prop] === p[prop]) {
			const unitPrice = p.priceUnitary;
			const buildTaxes = Sales.buildTaxes(newP);
			newP.discountPercentage = value ? Number(value) : 0;
			newP.ocultPercentage = value ? 100 - Number(value) : 0;
			newP.discount = Sales.getDiscountAmount(newP);
			newP.taxAmount = twoDecimals(buildTaxes[0].amount);
			newP.pricePerSale = Sales.getPricePerSale(newP, false, false, false);
			newP.total = Sales.getTotal(newP);
			newP.pricePerSale = fourDecimals(newP.pricePerSale);
			newP.ocultAmountDiscount = newP.discountPercentage;
			newP.amountDiscount = discountByAmount || 0;
			newP.subTotal = newP.total - newP.taxAmount;
			newP.subtotalWithoutTax = (unitPrice - Sales.getDiscountAmount(newP)) * p.quantity;
		}
		return newP;
	});
}

function editDiscountNdc(product, value, discountByAmount) {
	if (value < 100 && value >= 0) {
		const number = value === 0 ? 0 : 100 - Number(value);
		this.editDiscount(product, number, discountByAmount);
	} else {
		this.editDiscount(product, 0, discountByAmount);
	}
}

function editDiscountByAmountNdc(product, newAmount) {
	const newPercentage = (newAmount / product.totalOld) * 100;
	this.editDiscountNdc(product, newPercentage, newAmount);
}

function noProductsSelected() {
	return !this.dataSelected.some((d) => d.isSelected);
}

function validateCashPay() {
	const isSelected =
		this.selectedCards.find((c) => c.code === 'efectivo' || c.code === 'cash-dollars') &&
		this.cashPay === 0;
	if (isSelected) {
		this.alertMessage =
			'Uno o más tipos de pago seleccionados se encuentran con monto cero (0). Puede eliminar la selección y continuar con el proceso.';
	}
	this.showAlert = isSelected;
}

function cardPay(value) {
	const existCash = this.cashPay > 0;
	let greaterThan = false;
	if (value) {
		greaterThan = twoDecimals(value) > twoDecimals(this.totalAmount);
	}
	const payByType = this.selectedCardsFn.some((sc) => !sc.paid);
	const same = this.cardPay === this.totalAmount;
	if (greaterThan) {
		this.alertMessage =
			'El monto a pagar con tarjetas de crédito, depósito bancario o cheque no puede ser mayor al monto total de la venta.';
	} else if (same && existCash) {
		this.alertMessage =
			'El vuelto no puede ser igual al monto en efectivo. Las transacciones por tipo de pago se deben generar con un monto mayor a cero (0).';
	} else if (payByType) {
		this.alertMessage =
			'Uno o más tipos de pago seleccionados se encuentran con monto cero (0). Puede eliminar la selección y continuar con el proceso.';
	}
	this.showAlert = greaterThan || (same && existCash) || payByType;
}

function cashPay(value) {
	const same = this.cardPay === this.totalAmount && value > 0;
	const isSelected =
		this.selectedCardsFn.find(
			(c) => c.code === 'efectivo' || c.code === 'cash-dollars'
		) &&
		!value &&
		this.creditType !== 3;
	if (same) {
		this.alertMessage =
			'El vuelto no puede ser igual al monto en efectivo. Las transacciones por tipo de pago se deben generar con un monto mayor a cero (0).';
	} else if (isSelected && this.creditType !== 3) {
		this.alertMessage =
			'Uno o más tipos de pago seleccionados se encuentran con monto cero (0). Puede eliminar la selección y continuar con el proceso.';
	}

	const filteredSelected = this.dataSelected.filter((p) => p.isSelected);
	if (this.creditType === 7 && filteredSelected.every((p) => p.flagFree)) {
		this.showAlert = false;
	} else {
		this.showAlert = same || isSelected;
	}
}

function selectedCards(values) {
	const isSelected =
		values.find((c) => c.code === 'efectivo' || c.code === 'cash-dollars') &&
		this.cashPay === 0;
	if (isSelected) {
		this.alertMessage =
			'Uno o más tipos de pago seleccionados se encuentran con monto cero (0). Puede eliminar la selección y continuar con el proceso.';
	}
	this.showAlert = isSelected;
}

function selectedCardsFn() {
	let newSelectedCards = [...this.selectedCards];
	if (this.selectedCards.length > 0) {
		const divider = this.selectedCards.length;
		// if (this.initFlag) {
		// 	newSelectedCards = newSelectedCards.map((s) => {
		// 		const newCard = { ...s };
		// 		const index = this.sale.transactions.findIndex(t => t.typePayment.code === s.code);
		// 		newCard.paid = this.sale.transactions[index].amount;
		// 		return newCard;
		// 	});
		// } else {
		newSelectedCards = this.selectedCards.map(
			distributeAmount(this.totalAmount, divider)
		);
		// }
		this.setCashAndCreditAmount(newSelectedCards);
	}
	return newSelectedCards;
}

function setCashAndCreditAmount(collection) {
	// No se esta sumando todos los tipos de pago, solo efectivo o cash-dollars
	// const cashPayVal = collection.find(
	// 	(c) => c.code === 'efectivo' || c.code === 'cash-dollars'
	// );
	const cashPayVal = collection.reduce((a, col) => a + col.paid, 0);
	this.cashPay = cashPayVal || 0;
	this.cardPay = collection.reduce((total, item) => {
		if (item.code !== 'efectivo' && item.code !== 'cash-dollars') {
			return total + (item.paid || 0);
		}
		return total;
	}, 0);
}

function remove(item) {
	this.selectedCards.splice(this.selectedCards.indexOf(item), 1);
}

function updatePayAmounts(index, paid) {
	this.setCashAndCreditAmount(this.selectedCardsFn);
	this.$set(this.selectedCards[index], 'paid', paid);
}

function openForm(cards) {
	const { id, open, code } = cards;
	const cc = this.selectedCards.find((c) => c.id === id);
	this.$set(cc, 'open', !open);
	this.$set(cc, 'icon', !open ? 'remove_circle_outline' : 'add_circle_outline');
	let typeCard = '';
	if (code === 'deposito-bancario') {
		typeCard = 'Deposit';
	} else {
		typeCard = code === 'cheque' ? 'Check' : 'Card';
	}
	this.isActiveForm(cards, typeCard);
}

function isActiveForm({ flagForm, open }, type) {
	return open && typePaymentForm[type] === flagForm;
}

function setDepositData({ code, model, newValue }) {
	const deposit = this.selectedCards.find((c) => c.code === code);
	if (model === 'dateReference') {
		this.$set(deposit.deposit.additionalInformation, model, newValue);
	} else {
		this.$set(deposit.deposit, model, newValue);
	}
}

function setCheckData({ code, model, newValue }) {
	const check = this.selectedCards.find((c) => c.code === code);
	if (model === 'dateReference') {
		this.$set(check.check.additionalInformation, model, newValue);
	} else {
		this.$set(check.check, model, newValue);
	}
}

function setCardData({ code, model, newValue }) {
	const card = this.selectedCards.find((c) => c.code === code);
	this.$set(card.card, model, newValue);
}

function totalAmount() {
	if (
		this.creditType === TypeCreditNote.CancelOp ||
		this.creditType === TypeCreditNote.FullReturn
	) {
		return this.sale.amount - this.totalAdvanceInvoice;
	}
	const accum = this.dataSelected.reduce((total, item) => {
		if (item.isSelected && !item.flagFree) {
			return total + item.total;
		}
		return total;
	}, 0);
	return twoDecimals(accum);
}

function getCurrency() {
	return this.$userInfo.company.currency;
}

function getPaymentMethod({ value }) {
	this.paymentMethodId = value.id;
	this.quotesNumber = value.code === 'CREDITO' ? 1 : 0;
	if (this.quotesNumber) {
		this.addFees();
	}
}

async function getCreditType({ value }) {
	this.messageAlert = '';
	this.disableConfirm = false;
	({ id: this.creditType } = value);
	this.flagTransfer = value.id !== 5;
	await this.dataSelectedFormatting();
	if (
		this.creditType === TypeCreditNote.CancelOp ||
		this.creditType === TypeCreditNote.FullReturn
	) {
		this.dataSelected = this.dataSelected.map(setNewProperty('isSelected', true));
		this.dataSelected = this.dataSelected.map(setNewProperty('flagUse', true));
		this.dataSelected = this.dataSelected.map(setNewProperty('disabledRow', true));
		this.rowIsSelected();
	} else if (
		this.creditType === TypeCreditNote.ItemDisc ||
		this.creditType === TypeCreditNote.ItemReturn
	) {
		this.dataSelected = this.dataSelected.map((obj) => {
			const isDisabled = obj.quantityRefund >= obj.quantity;
			return {
				...obj,
				flagUse: isDisabled,
				disabledRow: isDisabled,
			};
		});
	} else {
		this.dataSelected = this.dataSelected.map(setNewProperty('flagUse', false));
		this.dataSelected = this.dataSelected.map(setNewProperty('disabledRow', false));
	}
	if (this.creditType === TypeCreditNote.DescFix || this.hasAdvancePayment) {
		this.columns[2].visible = true;
	}

	if (this.creditType === TypeCreditNote.DescFix) {
		this.flagTransfer = false;
		this.dataSelected = this.dataSelected.map(setNewProperty('total', 0));
		this.dataSelected = this.dataSelected.map(setNewProperty('priceUnitary', 0));
		this.dataSelected = this.dataSelected.map(setNewProperty('pricePerSale', 0));
		this.dataSelected = this.dataSelected.map(setNewProperty('subTotal', 0));
		this.dataSelected = this.dataSelected.map(setNewProperty('tax', 0));
	} else if (
		this.creditType === TypeCreditNote.ItemDisc
	) {
		this.dataSelected = this.dataSelected.filter((d) => d.flagFree !== 1);
	} else {
		await this.dataSelectedFormatting();
	}
	this.columns[7].isEditable = this.creditType === TypeCreditNote.ItemDisc;
}

function validateAmount() {
	if (this.flagTypeReturn === 1) {
		const paid = Number((this.cashPay + this.cardPay).toFixed(2));
		return !(paid === Number(this.totalAmount.toFixed(2)) && this.totalAmount > 0);
	}
	return false;
}

function getAcumulateOf(...args) {
	const obj = {};
	args.forEach((ar) => {
		obj[ar] = 0;
	});
	return function inner(acc, item) {
		args.forEach((ar) => {
			obj[ar] += item[ar];
		});
		return obj;
	};
}

function getDataSelectedAndAcumulates() {
	let acumSubTotal = 0;
	let acumDiscount = 0;
	let acumTaxes = 0;
	const dataSelected = this.dataSelected.reduce((list, item) => {
		if (item.isSelected) {
			const { discount, priceUnitary, pricePerSale, quantity, taxes } = item;
			acumDiscount += quantity * discount;
			acumSubTotal += quantity * (priceUnitary - discount);
			acumTaxes += (taxes / 100) * pricePerSale * quantity;
			return list.concat(item);
		}
		return list;
	}, []);
	return { acumSubTotal, acumDiscount, acumTaxes, dataSelected };
}

function makeCreditNote() {
	const seriesFlag = this.dataSelected.filter((p) => p.product.flagControlSerie);
	if (seriesFlag.length) {
		if (!this.rowsSeries && this.creditType === TypeCreditNote.ItemReturn) {
			this.showGenericError('Debe de seleccionar al menos una serie');
			return;
		}
	}
	let dataSelected = [];
	if (
		this.creditType === TypeCreditNote.CancelOp ||
		this.creditType === TypeCreditNote.FullReturn
	) {
		dataSelected = this.dataSelected.map(setNewProperty('isSelected', true));
	} else if (
		this.creditType === TypeCreditNote.ItemDisc ||
		this.creditType === TypeCreditNote.ItemReturn
	) {
		dataSelected = this.dataSelected.filter((d) => d.isSelected && !d.flagUse);
	} else {
		dataSelected = this.dataSelected.filter((d) => d.isSelected);
	}

	// const a = {
	// 	total: this.sale.amount - this.totalAdvanceInvoice,

	// }
	const amounts = Sale.getAmountsNoteCredit(dataSelected, true);
	const { subtotal: subTotalRow, tax, total, totalDiscount: discountAmount } = amounts;
	const obj = {
		tip: this.sale.tip,
		cardPay:
			this.creditType === TypeCreditNote.ItemDisc
				? this.priceAmounts.total
				: this.cardPay,
		cashPay:
			this.creditType === TypeCreditNote.ItemDisc
				? this.priceAmounts.total
				: this.cashPay,
		creditType: this.creditType,
		commentary: this.commentary,
		dataSelected,
		discountAmount,
		flagTransfer: this.flagTransfer,
		total,
		selectedCardsFn: this.selectedCardsFn,
		subTotal:
			this.creditType === TypeCreditNote.ItemDisc
				? this.resumeTaxes.subtotalWithoutTax
				: subTotalRow,
		tax,
		saleNumber: this.saleNumber,
		paymentMethodId: this.paymentMethodId,
		detailsPayments:
			this.paymentMethodId === this.paymentMethods.find((p) => p.code === 'CONTADO').id
				? []
				: this.quotes(),
		totalTaxesAmount: Sale.getEcuadorTaxesAmounts(amounts, dataSelected),
		taxesAmount: Sale.getPeruTaxesAmounts(amounts, dataSelected),
		exchangeRate: this.exchangeRate.amount,
	};
	if (
		this.creditType === TypeCreditNote.FullReturn ||
		this.creditType === TypeCreditNote.CancelOp ||
		this.creditType === TypeCreditNote.ItemDisc
	) {
		const isFullOrCancel = this.creditType === TypeCreditNote.FullReturn || this.creditType === TypeCreditNote.CancelOp;
		let exactOriginalSubtotal = this.priceAmounts.subtotal;
		if (isFullOrCancel) {
			if (this.sale.totalTaxesAmount && typeof this.sale.totalTaxesAmount.subtotalWithoutTax === 'number') {
				exactOriginalSubtotal = this.sale.totalTaxesAmount.subtotalWithoutTax;
			} else if (this.sale.taxesAmount && typeof this.sale.taxesAmount.recorded === 'number') {
				exactOriginalSubtotal = this.sale.taxesAmount.recorded;
			}
		}

		obj.totalTaxesAmount = {
			...obj.totalTaxesAmount,
			subtotalWithoutTax: exactOriginalSubtotal,
			total: this.totalAmount,
		};
		if (this.creditType === TypeCreditNote.ItemDisc) {
			const { taxesAmount } = this.sale;
			const exempt = Number(taxesAmount.recorded);
			const recorded =
				exempt === 0
					? exempt
					: (obj.taxesAmount.recorded &&
							this.roundFixedToNumber(obj.taxesAmount.recorded)) ||
					  0;
			obj.taxesAmount = {
				...obj.taxesAmount,
				recorded,
			};
			obj.dataSelected = obj.dataSelected.map((select) => ({
				...select,
				quantity: select.quantity - (select.quantityRefund || 0),
			}));
		} else {
			obj.taxesAmount = {
				...obj.taxesAmount,
				recorded: obj.taxesAmount.recorded
					? Number(this.sale.taxesAmount.recorded) ||
					  this.roundFixedToNumber(obj.taxesAmount.recorded)
					: 0,
			};
		}
		obj.subTotal = this.priceAmounts.subtotal;
		obj.tax = this.priceAmounts.tax;
	} else if (this.creditType === TypeCreditNote.DescFix) {
		const { taxesAmount } = this.sale;
		const objTax = {
			exonerated: Number(taxesAmount.exonerated),
			export: Number(taxesAmount.export),
			free: Number(taxesAmount.free),
			icbper: Number(taxesAmount.icbper),
			inactive: Number(taxesAmount.inactive),
			recorded: Number(taxesAmount.recorded),
		};
		obj.taxesAmount = objTax;
	}

	const excededProd = obj.dataSelected.find(
		(d) => d.quantityOrigin - d.quantityRefund < d.quantity
	);
	if (excededProd) {
		this.showGenericError(
			`La cantidad a devolver del producto "${
				excededProd.product && excededProd.product.name
			}" no puede ser mayor a la cantidad vendida.`
		);
		return;
	}
	this.$emit('generate-credit-note', obj);
}

function searchValueDebounced(value) {
	return this.searchValue(value);
}

function getTaxByCountry() {
	return getDeeper('company', 'country', 'taxName')(this.$userInfo);
}

function priceAmounts() {
	const saleId = !!this.$route.query.cloneId || !!this.$route.params.id;
	let dataSelected = this.dataSelected.filter((d) => d.isSelected);
	dataSelected = dataSelected.map((d) => {
		const newD = { ...d };
		newD.price = Sales.getProductPrice(
			d,
			this.defaultCurrency,
			this.salesCurrency,
			this.exchangeRate,
			saleId,
			false
		);
		newD.priceEdited = true;
		newD.salePrice = newD.price;
		return newD;
	});
	dataSelected = Sale.priceAmounts(
		dataSelected,
		this.defaultCurrency,
		this.salesCurrency,
		this.exchangeRate,
		saleId
	);
	if (this.creditType === TypeCreditNote.DescFix) {
		return {
			subtotal: 0,
			tax: 0,
			total: 0,
			totalOrigin: 0,
		};
	}
	if (
		this.creditType === TypeCreditNote.CancelOp ||
		this.creditType === TypeCreditNote.FullReturn
	) {
		if (this.hasAdvancePayment) {
			const { total, priceUnitary } =
				this.data && this.data[0] ? this.data[0] : { total: 0, priceUnitary: 0 };
			const tax = fourDecimals(total - priceUnitary);
			return {
				totalDiscount: 0,
				total,
				totalOrigin: total,
				subtotal: priceUnitary,
				tax,
			};
		}
		return {
			subtotal: this.sale.subtotal,
			tax: this.sale.taxes,
			totalOrigin: this.sale.amount,
			total: this.sale.amount,
		};
	}
	const descuent = Sale.getAmountsNoteCredit(dataSelected, this.isPeru);
	if (this.creditType === TypeCreditNote.ItemDisc) {
		descuent.subtotal = descuent.total - descuent.tax;
	}
	return descuent;
}

function resumeTaxes() {
	const amounts = this.priceAmounts;
	return Sale.getTotalTaxesAmounts(amounts, this.dataSelected);
}

function nonCeroTotal() {
	const dataSelected = this.dataSelected.filter((d) => d.isSelected);
	let ceroTotal = null;
	if (this.creditType !== 3) {
		ceroTotal = dataSelected.some((d) => d.total === 0);
		if (ceroTotal) {
			this.showNotification(
				'No pueden haber productos con "Total" igual a "Cero"',
				'warning'
			);
		}
	}
	return this.creditType !== 3 ? ceroTotal : false;
}

function validateAllDescuent() {
	const discounts = this.dataSelected.map((d) => d.ocultPercentage);
	return !discounts.some((d) => d >= 100 || d < 0);
}

function validating() {
	const commentValidate = this.isPeru ? false : this.commentary.length === 0;
	const isValid = !this.dataSelected.some(
		(item) => item.isSelected && !item.flagUse && !item.disabledRow
	);

	console.log({
		creditTypeValid:
			(this.creditType === TypeCreditNote.ItemDisc ||
				this.creditType === TypeCreditNote.ItemReturn) &&
			isValid,

		isDecimalFour: !this.isDecimalFour,
		disabled: this.disabled,
		commentValidate,
		isInvalidCredit: this.isInvalidCredit,
		noProductsSelected: this.noProductsSelected,
		validateAmount: this.validateAmount,
		validateQuantity: this.validateQuantity,
		validateAllDescuent: !this.validateAllDescuent,
		nonCeroTotal: this.nonCeroTotal,
		paymentMethodMissing: !this.paymentMethodId,

		payment1NoCards: this.paymentMethodId === 1 && this.selectedCardsFn.length === 0,

		payment1Mismatch:
			this.paymentMethodId === 1 && Number(this.cashPay.toFixed(2)) !== this.totalAmount,

		payment2NoFees: this.paymentMethodId === 2 && this.fees.length === 0,

		payment2NoExpiration:
			this.paymentMethodId === 2 && this.fees.some((f) => !f.expirationDate),

		payment2Mismatch:
			this.paymentMethodId === 2 &&
			this.fees.reduce((acum, fee) => Number(acum) + Number(fee.amount), 0) !==
				this.totalAmount,
	});

	return (
		((this.creditType === TypeCreditNote.ItemDisc ||
			this.creditType === TypeCreditNote.ItemReturn) &&
			isValid) ||
		!this.isDecimalFour ||
		this.disabled ||
		commentValidate ||
		this.isInvalidCredit ||
		this.noProductsSelected ||
		this.validateAmount ||
		this.validateQuantity ||
		!this.validateAllDescuent ||
		this.nonCeroTotal ||
		!this.paymentMethodId ||
		(this.paymentMethodId === 2 && this.fees.length === 0) ||
		(this.paymentMethodId === 2 && this.fees.some((f) => !f.expirationDate)) ||
		(this.paymentMethodId === 2 &&
			this.fees.reduce((acum, fee) => Number(acum) + Number(fee.amount), 0) !==
				this.totalAmount)
	);
}

function validateQuantity() {
	this.messageAlert = '';
	const isQuantityNoValid = this.dataSelected.some((item) => {
		if (item.quantitySend) {
			return item.quantity > item.quantitySend;
		} else if (item.formatNumbers) {
			return Number(item.formatNumbers.quantity)
				? twoDecimals(item.quantity) > Number(item.formatNumbers.quantity)
				: false;
		}
		return false;
	});
	if (isQuantityNoValid) {
		this.messageAlert = 'La cantidad introducida no debe ser mayor a la cantidad total';
	} else {
		this.messageAlert = '';
	}

	return isQuantityNoValid;
}

function isInvalidCredit() {
	if (this.needTypePayments) {
		if (this.selectedCards.length === 0) return true;
		return Number(this.cashPay.toFixed(2)) !== this.totalAmount;
	}
	return false;
}

function addFees() {
	this.fees = [];
	for (let i = 1; i <= this.quotesNumber; i += 1) {
		if (this.quotesNumber) {
			// const amount = this.getFeesAmounts(i);
			let amount = this.totalAmount / this.quotesNumber;
			const amountStr = amount.toString();
			const decimalPart = amountStr.split('.')[1];
			if (decimalPart && decimalPart.length > 4) {
				amount = parseFloat(amount.toFixed(4));
			}
			this.fees.push({
				amount,
				dateWithOutFormat: null,
				expirationDate: '',
				invalidDate: false,
			});
		} else {
			this.fees = [];
		}
	}
	if (this.fees.length > 0) {
		const currentDate = format(new Date(), 'YYYY-MM-DD');
		const currentDateWithOutFormat = format(new Date(), 'DD/MM/YYYY');
		this.fees[0].dateWithOutFormat = currentDateWithOutFormat;
		this.fees[0].expirationDate = currentDate;
	}
}

function setValue({ model, value, index }) {
	this.$set(this.fees[index], model, value);
}

function quotes() {
	return this.fees.map((fee) => {
		const newFee = { ...fee };
		delete newFee.dateWithOutFormat;
		delete newFee.invalidDate;
		newFee.amount = -fee.amount;
		return newFee;
	});
}

function updateNumber({ model, value }) {
	this[model] = value;
}

function isNotTypeCash({ flagForm }) {
	return typePaymentForm.Cash !== Number(flagForm);
}

// function openForm({ id, typePayment }) {
// 	const { code } = typePayment;
// 	this.selectedPaymentId = this.selectedPaymentId === id ? null : id;
// 	let typeCard = '';
// 	if (code === 'deposito-bancario' || code === 'DP') {
// 		typeCard = 'Deposit';
// 	} else {
// 		typeCard = code === 'cheque' ? 'Check' : 'Card';
// 	}
// 	this.isActiveForm({ id, typePayment }, typeCard);
// }

function changeCards() {
	this.initFlag = false;
}

function validateDescuent(desc) {
	if (desc >= 100 || desc < 0) {
		return false;
	}
	return true;
}

function validateAmountDiscount(product) {
	const valueCalculated = this.valueEditDiscount || product.ocultAmountDiscount;
	if (
		product.amountDiscount > product.totalOld ||
		product.amountDiscount < 0 ||
		valueCalculated >= product.totalOld
	) {
		return true;
	}
	return false;
}

function setDescription(idx, value) {
	this.dataSelected[idx].description = value;
}

function data() {
	return {
		active: false,
		alertMessage: '',
		bankAccounts: [],
		cardPay: 0,
		cashPay: 0,
		checkAll: true,
		columns: [
			{
				id: 1,
				name: 'Código',
				value: 'code',
				visible: true,
				checked: true,
			},
			{
				id: 2,
				name: 'Nombre',
				value: 'name',
				visible: true,
				checked: true,
			},
			{
				id: 3,
				name: 'Descripción',
				value: 'description',
				visible: this.hasAdvancePayment,
				checked: this.hasAdvancePayment,
			},
			{
				id: 4,
				name: 'Unidad',
				tooltip: 'Unidad',
				value: 'quantity',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Cant.',
				tooltip: 'Cantidad',
				value: 'quantity',
				visible: true,
				checked: true,
			},
			{
				id: 6,
				name: 'P. Unit.',
				tooltip: 'Precio Unitario',
				value: 'priceUnitary',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'PVP',
				value: 'pricePerSale',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'Desc. (%)',
				tooltip: 'Descuento por porcentaje',
				value: 'discountPercentage',
				visible: true,
				checked: true,
				showInput: false,
				isEditable: false,
			},
			{
				id: 9,
				name: '',
				value: 'taxes',
				visible: true,
				checked: true,
			},
			{
				id: 10,
				name: 'Total',
				value: 'total',
				visible: true,
				checked: true,
			},
			{
				id: 11,
				name: 'Acciones',
				value: 'action',
				visible: true,
				checked: true,
			},
		],
		action: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 0,
		},
		actionDefault: {
			active: false,
			code: null,
			open: false,
			title: '',
			width: 0,
		},
		commentary: '',
		creditType: null,
		dataSelected: [],
		defaultCurrency: '',
		exchangeRate: 0,
		fees: [],
		flagTransfer: true,
		generalTaxes: [],
		loading: false,
		newProduct: {
			product: {},
			quantity: 0,
			selectedPriceListId: 0,
		},
		onClean: false,
		paymentMethodId: 1,
		paymentMethods: [],
		pricesList: [],
		products: [],
		quotesNumber: 0,
		refundType: '',
		refundTypes: [
			{ id: 1, text: 'Devolución dinero' },
			{ id: 2, text: 'Canje' },
		],
		rowDisabled: false,
		salesCurrency: '',
		searchProduct: null,
		selectedCards: [],
		showAlert: false,
		show10Percentage: false,
		sunatCatalog: [],
		typePayments: [],
		units: [],
		saleNumber: null,
		selectedPaymentId: null,
		initFlag: true,
		messageAlert: '',
		disableConfirm: false,
		saleSeriesProduct: {},
		saleSeries: {},
		rowsSeries: false,
		calculateDiscountByAmount: false,
		valueEditDiscount: 0,
	};
}

export default {
	name: 'credit-note',
	components: {
		actionSidebar,
		appSelect,
		appTable,
		autocompleteComponent,
		bankDepositForm,
		cardForm,
		checkForm,
		generalFilter,
		modalSidebarButton,
		viewSeries,
	},
	computed: {
		getCurrency,
		getTaxByCountry,
		isReadOnlyDescuent,
		isReadOnlyQuantity,
		isReadOnlyPrice,
		isReadOnlySeries,
		nonCeroTotal,
		noProductsSelected,
		priceAmounts,
		resumeTaxes,
		selectedCardsFn,
		showSunatCatalog,

		totalAmount,
		validateAmount,
		validateQuantity,
		isInvalidCredit,
		validating,
		validateAllDescuent,
		isDecimalFour() {
			const isDecimal = this.dataSelected.every((d) => {
				const decimalCount = (d.quantity.toString().split('.')[1] || '').length;
				return decimalCount <= 4;
			});
			return isDecimal;
		},
		errorNTCAdvancePayment() {
			if (!this.hasAdvancePayment) {
				return null;
			}
			const taxes = (this.sale.details || []).map((detail) => detail.tax); // obtiene el array de taxes, puede ser vacío
			// El valor está "bien" si queremos verificar si hay algún impuesto diferente al primero:
			// taxes.some(tax => tax !== taxes[0]) será true si algún elemento es distinto del primero,
			// y false si todos son iguales o si el array está vacío.
			const hasDiferentesTaxes =
				taxes.length > 1 && taxes.some((tax) => tax !== taxes[0]);
			if (hasDiferentesTaxes) {
				return 'La venta tiene productos con diferentes tipos de impuesto, no se puede realiza una NTC con anticipo';
			}
			return null;
		},
		isMethodPaymentCredit() {
			return this.paymentMethodId === 2;
		},
		needTypePayments() {
			const isCreditSale = this.sale?.paymentMethodId === 2;
			const isCashPaymentMethod = this.paymentMethodId === 1;

			const direct = isCreditSale && !this.hasAdvancePayment;
			return isCashPaymentMethod && !direct;
		},
	},
	created,
	data,
	methods: {
		addFees,
		addProduct,
		dataSelectedFormatting,
		editDiscount,
		editDiscountNdc,
		editDiscountByAmountNdc,
		editPrice,
		getAcumulateOf,
		getCreditType,
		getDataSelectedAndAcumulates,
		// getFeesAmounts(currentQuote) {
		// 	const truncAmounts = Math.trunc(this.totalAmount / this.quotesNumber);
		// 	if (this.quotesNumber === 1) {
		// 		return this.totalAmount;
		// 	} else if (currentQuote !== this.quotesNumber) {
		// 		return truncAmounts;
		// 	}
		// 	const lastQuote = this.totalAmount - truncAmounts * (currentQuote - 1);
		// 	return Number(lastQuote.toFixed(2));
		// },
		getPaymentMethod,
		getPriceListId,
		getTaxAmount,
		isActiveForm,
		isNotTypeCash,
		loadData,
		loadResources,
		newData,
		makeCreditNote,
		remove,
		removeData,
		rowIsSelected,
		quantityValidation,
		quotes,
		searchValue: helper.debounce(searchValue),
		searchValueDebounced: helper.debounce(searchValueDebounced),
		selectedAll,
		setCardData,
		setCashAndCreditAmount,
		setCheckData,
		setDescription,
		setDepositData,
		setPriceList,
		setValue,
		stopClick,
		unitsByProduct,
		updateColumns,
		updateNewProduct,
		updateNumber,
		updatePayAmounts,
		validateCashPay,
		openForm,
		changeCards,
		validateDescuent,
		validateAmountDiscount,
		openSeries(row) {
			this.action.code = 'view-series';
			this.action.open = true;
			this.action.title = `${row.product.code}-${row.product.name} - SERIES`;
			this.action.width = 970;
			this.saleSeries = row;
			this.saleSeriesProduct = row.product;
		},
		closeModal() {
			this.idRow = null;
			this.action = { ...this.actionDefault };
		},
		sendSeries(rows, id, sumSeries) {
			this.rowsSeries = Boolean(rows);
			const index = this.dataSelected.findIndex((p) => p.product.id === id);
			if (index > -1) {
				this.dataSelected[index].aditionalInformation.seriesSelect = rows;
				this.dataSelected[index].quantity = sumSeries;
				this.dataSelected[index].product.series = rows;
				this.dataSelected[index].total =
					sumSeries * this.dataSelected[index].pricePerSale;
			}
			this.closeModal();
		},
		clearDiscountByAmountAndPercentage(newValue) {
			const columnDiscount = this.columns.find((item) => item.id === 8); // Column discount
			columnDiscount.name = newValue ? 'Desc. x Monto' : 'Desc. (%)';
			const value = 0;
			this.dataSelected = this.dataSelected.map((p) => {
				const newP = { ...p };
				const unitPrice = p.priceUnitary;
				const buildTaxes = Sales.buildTaxes(newP);
				newP.discountPercentage = value ? Number(value) : 0;
				newP.ocultPercentage = value ? 100 - Number(value) : 0;
				newP.ocultAmountDiscount = 0;
				newP.discount = Sales.getDiscountAmount(newP);
				newP.taxAmount = twoDecimals(buildTaxes[0].amount);
				newP.pricePerSale = Sales.getPricePerSale(newP, false, false, false);
				newP.total = Sales.getTotal(newP);
				newP.pricePerSale = fourDecimals(newP.pricePerSale);
				newP.subTotal = newP.total - newP.taxAmount;
				newP.subtotalWithoutTax =
					(unitPrice - Sales.getDiscountAmount(newP)) * p.quantity;

				return newP;
			});
			if (this.valueEditDiscount) {
				this.updateDiscountColumn(this.valueEditDiscount);
			}
		},
		editDiscountColumn(value) {
			const { event } = value;
			const numberValue = Number(event.target.value);
			this.valueEditDiscount = numberValue;
			this.updateDiscountColumn(numberValue);
		},
		updateDiscountColumn(numberValue) {
			if (this.calculateDiscountByAmount) {
				for (let i = 0; i < this.dataSelected.length; i += 1) {
					const product = this.dataSelected[i];
					const newPercentage = (numberValue / product.totalOld) * 100;
					this.editDiscountNdc(product, newPercentage, numberValue);
				}
			} else {
				const newPercentage = 100 - numberValue;
				const number = newPercentage === 100 ? 0 : newPercentage;
				for (let i = 0; i < this.dataSelected.length; i += 1) {
					const item = this.dataSelected[i];
					this.editDiscount(item, number);
				}
			}
		},
	},

	props: {
		data: {
			type: Array,
			default: () => [],
		},
		disabled: {
			default: false,
			type: Boolean,
		},
		sale: {
			default: () => {},
			type: Object,
		},
		showReturn: {
			type: Boolean,
			default: false,
		},
		disabledNdd: {
			type: Boolean,
			default: false,
		},
		hasAdvancePayment: {
			type: Boolean,
			default: false,
		},
		totalAdvanceInvoice: {
			type: Number,
			default: 0,
		},
	},
	watch: {
		data: newData,
		searchProduct: searchValueDebounced,
		cashPay,
		cardPay,
		selectedCards,
		dataSelected: {
			handler(value) {
				if (value && this.paymentMethodId === 2) {
					const selected = this.dataSelected.filter((d) => d.isSelected);
					const totalDataSelected = selected.reduce((acc, obj) => acc + obj.total, 0);
					const num = totalDataSelected / this.fees.length;
					this.fees = this.fees.map((fee) => ({
						...fee,
						amount: Math.floor(num * 100) / 100,
					}));
				}
			},
			deep: true,
		},
	},
};
</script>
<style lang="scss" scoped>
.delete-products {
	border-radius: 5px !important;
	box-shadow: none !important;
	color: white !important;
	height: 30px !important;
	margin: 0px;
	text-transform: none !important;
}

.no-padding {
	padding: 0 !important;
}

.height-button {
	height: 30px;
}

.input-table {
	&-quantity {
		max-width: 60px;
	}

	&-price {
		max-width: 90px;
	}
}

.alertQuantity {
	color: red;
	margin: 0 0 10px 500px;
}
</style>
