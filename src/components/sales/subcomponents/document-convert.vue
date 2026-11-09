<template>
	<div>
		<v-layout wrap my-4 px-3>
			<v-flex xs12 sm3 px-3>
				<div>
					<button
						v-for="t in typeDocuments"
						:key="t.id"
						class="btn-document"
						:class="{ active: model.typeDocument === t.code }"
						@click="selectDocument(t.code)"
					>
						{{ t.code }}
					</button>
				</div>
				<span class="form-group__message" v-if="$v.model.typeDocument.$invalid">
					El tipo de documento es requerido para cargar las series
				</span>
			</v-flex>
			<v-flex xs12 sm9 px-3>
				<v-select
					class="filter-select"
					content-class="filter-select-content"
					item-text="rucName"
					item-value="id"
					:items="subsidiaries"
					hide-details
					label="RUC"
					v-model="subsidiary"
					@input="changeSubsidiary"
				></v-select>
			</v-flex>
		</v-layout>
		<v-layout wrap my-4 px-3>
			<v-flex xs12 sm6 px-3>
				<v-select
					class="filter-select"
					content-class="filter-select-content"
					item-text="name"
					item-value="type"
					:items="typeOfBill"
					:disabled="!disabledBill"
					hide-details
					label="Tipo de Factura"
					v-model="bill"
				></v-select>
			</v-flex>
			<v-flex xs12 sm6 px-3>
				<v-select
					class="filter-select"
					content-class="filter-select-content"
					item-text="availabilityTerminalName"
					item-value="id"
					:items="pointsOfSale"
					:disabled="!disabledPointSale"
					hide-details
					label="Punto de Venta"
					v-model="model.serie"
				></v-select>
			</v-flex>
		</v-layout>
		<v-layout wrap mb-4 px-3>
			<v-flex xs12 sm6 px-3>
				<v-select
					autocomplete
					class="filter-select shadow-inset"
					content-class="filter-select-content"
					hide-details
					item-text="fullName"
					item-value="id"
					:items="filteredCustomers"
					label="Cliente"
					:loading="loading"
					persistent-hint
					return-object
					:search-input.sync="search"
					v-model="customer"
					@input="setNewCustomer"
				></v-select>
				<span class="form-group__message" v-if="$v.customer.$invalid">
					El cliente es requerido
				</span>
			</v-flex>
			<v-flex xs12 sm6 px-3>
				<v-text-field
					class="filter-select shadow-inset"
					label="Documento de cliente"
					hide-details
					readonly
					single-line
					v-model="document"
				></v-text-field>
			</v-flex>
		</v-layout>
		<v-layout wrap mb-4 px-3>
			<v-flex xs12 sm3 px-3>
				<v-select
					class="filter-select"
					content-class="filter-select-content"
					hide-details
					item-text="code"
					item-value="code"
					:items="currencies"
					label="Tipo de moneda"
					v-model="model.currency"
				></v-select>
				<span class="form-group__message" v-if="$v.model.currency.$invalid">
					El tipo de moneda es requerido
				</span>
			</v-flex>
			<v-flex v-if="isPeru" xs12 sm3 pr-3 class="col-exchange">
				<v-chip label color="pink" text-color="white" class="chip-exchange">
					Cambio Maki: <span>S/.</span>
				</v-chip>
				<v-text-field
					class="filter-select shadow-inset-chip"
					hide-details
					label="00.00"
					single-line
					type="number"
					v-model.number="model.exchangeRate"
					@change="validateExchangeRate"
				></v-text-field>
			</v-flex>
			<v-flex xs12 sm6 px-3 v-if="displayStockDiscount">
				<v-checkbox label="Descontar stock" v-model="model.flagTransfer"></v-checkbox>
			</v-flex>
		</v-layout>
		<v-layout wrap justify-space-around mb-2>
			<v-flex xs12 sm10>
				<label class="list-title"> Lista de productos </label>
			</v-flex>
		</v-layout>
		<app-table
			:check-all="checkAll"
			:check-all-disabled="allDisabled"
			class="overflow-auto pb-0"
			:columns="columns"
			dispatch-detail
			disabled-value="flagUse"
			local-search
			local-storage
			:main-list="false"
			name="document-convert"
			:rows="rows"
			selectable
			@on-local-search="callServiceAndSearchDetails"
			@on-selected-all="selectedAll"
			@row-is-selected="rowIsSelected"
			@column-input="columnInput"
		>
			<template slot="rows" slot-scope="props">
				<td v-show="showRow(columns, 1)">
					{{ props.row.product.autoBarcode }}
				</td>
				<td v-show="showRow(columns, 2)">{{ props.row.product.code }}</td>
				<td v-show="showRow(columns, 3)">{{ props.row.product.name }}</td>
				<td v-show="showRow(columns, 4)">
					{{ props.row.product.description }}
				</td>
				<td v-show="showRow(columns, 5)">
					<div style="padding: 5px">
						<v-select
							autocomplete
							bottom
							single-line
							hide-details
							:items="props.row.pricesListArray"
							v-model="props.row.selectedPriceListId"
							label="Lista de Precios"
							item-text="name"
							item-value="id"
							class="filter-select"
							content-class="filter-select-content"
							@click.stop="stopClick"
							@input="updatePriceList(props.row)"
						></v-select>
					</div>
				</td>
				<td v-show="showRow(columns, 6)">
					<v-text-field
						hide-details
						single-line
						type="number"
						:value="props.row.quantity"
						@input="quantityValidation(props.row, $event)"
						class="filter-select shadow-inset"
						@click.stop="stopClick"
					></v-text-field>
				</td>
				<td class="prices-width" v-show="showRow(columns, 7)">
					<v-text-field
						hide-details
						single-line
						type="number"
						v-model.number="props.row.priceUnitary"
						class="filter-select shadow-inset"
						@click.stop="stopClick"
						@input="editPriceUnitary(props.row, $event)"
					></v-text-field>
				</td>
				<td class="prices-width" v-show="showRow(columns, 8)">
					<v-text-field
						hide-details
						single-line
						type="number"
						v-model.number="props.row.pricePerSale"
						class="filter-select shadow-inset"
						@click.stop="stopClick"
						@input="editPricePerSale(props.row, $event)"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 9)" @click.stop="stopClick">
					<app-select
						:item="props.row.unitId"
						item-text="name"
						item-value="id"
						:items="props.row.units"
						model="unitId"
						:readonly="props.row.units.length === 1"
						@input="setData($event, props.row, true)"
					/>
				</td>
				<td v-show="showRow(columns, 10)">{{ props.row.stockQuantity }}</td>
				<td v-show="showRow(columns, 11)">
					<v-text-field
						hide-details
						single-line
						type="number"
						v-model.number="props.row.discountPercentage"
						class="filter-select shadow-inset"
						@click.stop="stopClick"
						@input="editDiscount(props.row, $event)"
					></v-text-field>
				</td>
				<td v-show="showRow(columns, 12)">{{ props.row.taxes }}</td>
				<td v-show="showRow(columns, 13)">
					{{ props.row.total | round | abs }}
				</td>
				<td v-show="showRow(columns, 14)">
					<button
						class="table-icon"
						@click.stop="deleteRow(props.row.autoBarcode, props.row.warProductId)"
					>
						<v-icon color="pink" size="19"> highlight_off </v-icon>
					</button>
				</td>
			</template>
		</app-table>
		<v-layout wrap mb-3>
			<v-flex xs8>
				<v-card class="white--text card-grey" height="76">
					<v-layout wrap justify-space-around mb-2 class="row-text row-text-title">
						<v-flex xs4 text-xs-center> Descuento </v-flex>
						<v-flex xs4 text-xs-center> Subtotal </v-flex>
						<v-flex xs1 text-xs-center> + </v-flex>
						<v-flex xs3 text-xs-center>
							{{ labelsByCountry.taxName }}
						</v-flex>
					</v-layout>
					<v-layout wrap justify-space-around class="row-text row-text-price">
						<v-flex xs4 text-xs-center>
							{{ defaultCurrency }} {{ priceAmounts.totalDiscount | round }}
						</v-flex>
						<v-flex xs4 text-xs-center>
							{{ defaultCurrency }} {{ priceAmounts.subtotal | round }}
						</v-flex>
						<v-flex xs1></v-flex>
						<v-flex xs3 text-xs-center>
							{{ priceAmounts.tax | round }}
						</v-flex>
					</v-layout>
				</v-card>
			</v-flex>
			<v-flex xs4>
				<v-card class="text-xs-center card-black" height="76">
					<v-layout column wrap class="row-text">
						<v-flex xs12 text-xs-center mb-2 class="row-text-title white--text">
							Total:
						</v-flex>
						<v-flex xs12 text-xs-center class="row-text-price white--text">
							{{ currencySymbol }} {{ priceAmounts.total | round }}
						</v-flex>
					</v-layout>
				</v-card>
			</v-flex>
		</v-layout>
		<v-layout px-2 mt-2 class="content-radio">
			<v-flex xs12 d-flex justify-center px-2>
				<v-flex mt-3 flex xs3 text-xs-center>
					<span>Otros Cargos:</span>
				</v-flex>
				<v-flex xs9 mr-2>
					<v-radio-group row v-model="selectCharges">
						<v-radio
							v-for="(charge, index) in otherCharges"
							:key="index"
							:label="charge.name"
							:value="charge.value"
							class="radio-document"
						></v-radio>
					</v-radio-group>
				</v-flex>
				<v-flex xs4 mt-3>
					<v-text-field
						hide-details
						single-line
						type="number"
						:prefix="selectCharges === 'currency' ? countryCurrencySymbol : null"
						:suffix="selectCharges === 'percent' ? '%' : null"
						v-model.number="quantityCharge"
						class="filter-select shadow-inset"
					></v-text-field>
				</v-flex>
			</v-flex>
		</v-layout>
		<v-layout wrap mb-2 px-4>
			<v-text-field
				no-resize
				multi-line
				class="textarea-content filter-select shadow-inset mt-3"
				name="new-product-description"
				label="Comentario"
				v-model="model.commentary"
			></v-text-field>
		</v-layout>
		<section>
			<v-layout row my-3 d-flex justify-center>
				<v-flex xs10 d-flex justify-center>
					<v-flex xs4 mr-2>
						<span>Pagado: {{ updatePay.paid }}</span>
					</v-flex>
					<v-flex xs4 mr-2>
						<span>Vuelto: {{ updatePay.change }}</span>
					</v-flex>
					<v-flex xs4>
						<span>Pendiente: {{ updatePay.rest }}</span>
					</v-flex>
				</v-flex>
			</v-layout>
			<v-layout wrap justify-start mb-2 align-center pl-5>
				<v-flex xs12 sm4 text-xs-left>
					<label class="list-title">Forma de pago:</label>
				</v-flex>
				<v-flex xs12 sm5 pr-5>
					<v-radio-group v-model="typePayment" row class="sale-radio">
						<v-radio
							v-for="paymentMethod in paymentMethods"
							:key="paymentMethod.id"
							:label="paymentMethod.name"
							:value="paymentMethod.code"
							color="success"
							:class="{
								'sale-radio-note': paymentMethod.code === 'CONTADO',
								'sale-radio-ticket': paymentMethod.code === 'CREDITO',
							}"
							:title="paymentMethod.name"
							:ripple="false"
						></v-radio>
					</v-radio-group>
				</v-flex>
				<v-flex xs12 pr-5>
					<v-alert type="error" v-model="showAlert">
						<p class="mb-0">{{ alertMessage }}</p>
					</v-alert>
					<v-alert
						type="error"
						v-model="disabledAmountN"
						v-if="disabledAmountN && creditNote.amount"
					>
						<p class="mb-0">El monto de la nota de crédito es menor</p>
					</v-alert>
				</v-flex>
			</v-layout>
			<v-layout wrap justify-center v-if="cashTypePayment">
				<v-flex xs12 white py-3>
					<v-layout wrap class="justify-center">
						<v-flex xs10>
							<v-select
								chips
								clearable
								solo
								multiple
								color="info"
								item-text="name"
								hide-details
								label="Tipos de pago"
								:disabled="creditTypePayment"
								:items="typePayments"
								v-model="paymentsSelected"
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
						v-for="(cards, indexCards) in paymentsSelectedFn"
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
								@input="updatePayAmounts"
							></v-text-field>
						</v-flex>
						<v-flex xs2 text-xs-center v-if="isNotTypeCash(cards)">
							<v-btn icon flat @click="openForm(cards)">
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
							/>
							<credit-note-form
								v-show="isActiveForm(cards, 'Note')"
								:date="creditNote.date"
								:serie="creditNote.serie"
								:number="creditNote.number"
								:icon="icon"
								:validate-color="validateColor"
								:loading="noteLoading"
								:validate="noteValidated"
								:value-date="valueDate"
								@valid-note="validNote"
								@set-data="setNoteData"
							/>
						</v-flex>
						<v-flex xs12 pt-4>
							<v-divider></v-divider>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<v-layout wrap justify-center mt-2 mb-4>
				<v-flex xs12 px-3 mb-2>
					<v-layout row wrap v-if="creditTypePayment">
						<v-flex xs12 sm6 pl-3>
							<v-layout row align-end>
								<v-flex xs6>
									<v-subheader>Cuotas a pagar</v-subheader>
								</v-flex>
								<v-flex xs4>
									<v-text-field
										label="3"
										v-model.number="quotes"
										single-line
										hide-details
										bottom
										type="number"
										:disabled="cashTypePayment"
										@input="addQuote"
										class="filter-select shadow-inset"
									></v-text-field>
								</v-flex>
								<v-flex xs6 ml-4>
									<app-select
										label="Distribución de cuotas"
										item-text="text"
										item-value="value"
										:item="selectedDistribution"
										:items="feesDistribution"
										:return-object="false"
										v-model="selectedDistribution"
										@input="changeDistributionDates"
									>
									</app-select>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<v-layout row wrap justify-center mt-2 mb-4>
				<v-flex xs12 px-3 mb-2>
					<v-layout row wrap v-for="(quote, index) in quotesComplete" :key="index">
						<v-flex xs12 sm6 pl-3>
							<v-layout row wrap align-center>
								<v-flex xs6>
									<v-subheader class="justify-center pl-5">
										{{ index + 1 }}- Cuota
									</v-subheader>
								</v-flex>
								<v-flex xs4>
									<v-text-field
										label="00"
										v-model.number="quote.amount"
										single-line
										:name="`quote-${index}`"
										hide-details
										type="number"
										bottom
										class="filter-select shadow-inset"
									></v-text-field>
								</v-flex>
							</v-layout>
						</v-flex>
						<v-flex xs12 sm6 pl-3>
							<v-layout row wrap align-center>
								<v-flex xs6>
									<v-subheader class="pa-0"> Último día de pago </v-subheader>
								</v-flex>
								<v-flex xs6>
									<v-menu
										lazy
										v-model="quote.menu"
										transition="scale-transition"
										offset-y
										full-width
										:nudge-right="50"
									>
										<v-text-field
											slot="activator"
											label="DD/MM/AAAA"
											v-model="quote.expirationDate"
											single-line
											:name="`quote-${index}`"
											append-icon="event"
											class="filter-select shadow-inset shadow-inset-calendar"
											readonly
										></v-text-field>
										<v-date-picker
											v-model="quote.expirationDate"
											no-title
											scrollable
											locale="es"
											:min="today"
											:allowed-dates="allowedDates"
											@input="editFirstDay"
										></v-date-picker>
									</v-menu>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</section>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="
					applyDisabled ||
						blockedCustomer ||
						showAlert ||
						disabledValidateNote ||
						disabledAmountN
				"
				@accept-button-clicked="applyFilter"
				@cancel-button-clicked="closeModal"
			/>
		</section>
	</div>
</template>

<script>
import typeBill from '@/shared/type-of-bill';
import { minValue, required, requiredIf } from 'vuelidate/lib/validators';
import { addDays, format } from 'date-fns';
import helper from '@/shared/helper';
import lib from '@/shared/lib';
import Sales from '@/shared/sale';
import creditNoteForm from '@/components/shared/type-payment-forms/credit-note-form';
import typePaymentForm from '@/shared/type-payment-form';
import cardForm from '@/components/shared/type-payment-forms/card-form';
import checkForm from '@/components/shared/type-payment-forms/check-form';
import bankDepositForm from '@/components/shared/type-payment-forms/bank-deposit-form';
import appTable from './../../shared/table/app-table';
import modalSidebarButton from './../../shared/utils/modal-sidebar-button';

const { debounce, removeLocalData, quotesDistribution } = helper;
const Sale = new Sales();
const {
	decimals,
	distributeAmount,
	equality,
	find,
	getDeeper,
	map,
	round,
	setNewProperty,
	updateAllItemInCollection,
	updateItemInCollection,
} = lib;

const roundDecimal = decimals();
const twoDecimals = round(2);

function created() {
	const newDate = new Date();
	this.dateOnline = newDate.getTime().toString();
	Sale.isEditing = true;
	this.today = this.$today();
	this.defaultCurrency = this.$userInfo.company.currency;
	this.flagIgv = this.$userInfo.company.flagIgv;
	this.discount = roundDecimal(this.sale.discount);
	Sale.user = this.$userInfo;
	this.columns = this.updateColumns(this.$userInfo, this.columns);
	this.generalTaxes = helper.getLocalData('general-taxes') || [];
	this.model.flagTransfer = getDeeper(
		'company',
		'settings',
		'flagTransferDefault'
	)(this.$userInfo);
	this.searchCustomers(this.sale.customer.autocomplete);
	this.setNewCustomer(this.sale.customer);
	this.loadResources();
}

function updateColumns(user, columns) {
	const taxLabel =
		user.company && user.company.country ? user.company.country.taxName : null;
	if (taxLabel) {
		const item = find(equality('value', 'taxes'), columns);
		return map(updateItemInCollection(item, 'value', 'name', `% ${taxLabel}`), columns);
	}
	return columns;
}

function allIsSelected(currentData, isSelected) {
	return currentData.map((row) => {
		const newRow = { ...row };
		if (!row.flagUse) {
			newRow.isSelected = isSelected;
		}
		return newRow;
	});
}

function applyDisabled() {
	const rowsQuantity = this.rows.every((row) => row.quantity);
	const totalyPaid = this.updatePay.rest === 0;
	let disabled = true;
	if (
		this.customer &&
		rowsQuantity &&
		this.model.typeDocument &&
		this.typePayment &&
		totalyPaid
	) {
		if (this.typePayment === 'CONTADO') {
			disabled = false;
		} else if (this.typePayment === 'CREDITO') {
			if (
				this.quotesComplete &&
				this.quotesComplete.length > 0 &&
				this.quotesComplete.every((quote) => quote.amount && quote.expirationDate) &&
				!this.isLoading
			) {
				disabled = false;
			}
		}
	}
	return this.$v.$invalid || this.negativeValue || this.noDataSelected || disabled;
}

function noDataSelected() {
	const dataSelected = this.getDataSelected();
	return dataSelected.length === 0;
}

function getDataSelected() {
	return this.rows.filter((r) => r.isSelected);
}

function applyFilter() {
	const dataSelected = this.getDataSelected();
	const amounts = Sale.getAmounts(
		dataSelected,
		this.defaultCurrency
		// this.model.currency,
		// this.model.exchangeRate,
		// false,
	);
	const url = `sales-documents/${this.model.typeDocument}/convert`;
	const { transactions, transactionId } = this.getTransactions();
	const body = {
		amount: amounts.total,
		amountCash: this.cash || 0,
		amountCredit: this.creditCardAmount || 0,
		considerations: this.sale.considerations,
		commentary: this.model.commentary,
		creditCardName: '',
		currency: this.model.currency,
		customerId: this.customer.id || 0,
		details: dataSelected.map((row) => {
			const tax = Sales.getTaxesByProduct(this.generalTaxes, row);
			const buildTaxes = Sales.buildTaxes(row);
			const newRow = {
				categoryId: row.categoryId,
				categoryName: row.categoryName,
				subCategoryId: row.subCategoryId,
				subCategoryName: row.subCategoryName,
				description: row.description,
				discount: twoDecimals(row.discount * row.quantity) || 0,
				discountPercentage: row.discountPercentage,
				id: row.id,
				price: twoDecimals(row.total / row.quantity),
				salePrice: twoDecimals(row.total / row.quantity),
				quantity: row.quantity,
				tax,
				taxAmount: twoDecimals(buildTaxes[0].amount),
				taxes: buildTaxes,
				unitCode: row.unitCode,
				unitConversion: row.unitConversion,
				unitId: row.unitId,
				unitName: row.unitName,
				unitPrice: row.priceUnitary,
				subtotalWithoutTax: twoDecimals(
					Sales.getSubtotalWithoutTax(row) - row.discount * row.quantity
				),
				unitQuantity: row.unitQuantity,
			};
			newRow.additionalInformation = {
				descriptionProducts: row.description,
			};
			return newRow;
		}),
		discount: amounts.totalDiscount,
		exchangeRate: this.model.exchangeRate,
		flagTransfer: this.model.flagTransfer,
		paymentMethodId: this.paymentMethods.find((pm) => pm.code === this.typePayment).id,
		detailsPayments: this.quotesComplete.map((quote) => {
			const newQuote = { ...quote };
			delete newQuote.menu;
			return newQuote;
		}),
		subtotal: Number((amounts.subtotal - amounts.totalDiscount).toFixed(2)),
		serieId: this.model.serie,
		taxes: amounts.tax,
		taxesAmount: Sale.getPeruTaxesAmounts(amounts, dataSelected),
		totalTaxesAmount: Sale.getEcuadorTaxesAmounts(amounts, dataSelected),
		transactions,
		transactionId,
		warehouseName: this.$userInfo.warehouse.name,
		workToDo: this.sale.workToDo,
	};
	body.dateOnline = this.dateOnline;
	this.$emit('convert', { body, url });
}

function getTransactions() {
	const transactions = [];
	const transactionsId = [];
	if (this.typePayment === 'CONTADO') {
		const transaction = {
			currency: this.model.currency,
			paymentDate: new Date(this.$today()),
		};
		if (this.cash) {
			const newCashTransaction = { ...transaction };
			const typePaymentSelected = this.typePayments.find((tp) => tp.code === 'efectivo');
			newCashTransaction.amount = this.cash;
			newCashTransaction.paymentAmount = this.cash;
			newCashTransaction.typePaymentId = typePaymentSelected.id;
			transactions.push(newCashTransaction);
		}
		if (this.creditCardAmount) {
			this.paymentsSelectedFn.forEach((p) => {
				const flag = p.flagForm;
				if (Number(flag) !== typePaymentForm.Cash) {
					if (Number(flag) === typePaymentForm.Card) {
						const newTransaction = { ...transaction };
						newTransaction.amount = p.paid;
						newTransaction.paymentAmount = p.paid;
						newTransaction.typePaymentId = p.id;
						transactions.push(newTransaction);
					} else if (Number(flag) === typePaymentForm.Deposit) {
						const newTransaction = { ...transaction };
						newTransaction.additionalInformation = {
							dateReference: p.deposit.additionalInformation.dateReference,
						};
						newTransaction.amount = p.paid;
						newTransaction.paymentAmount = p.paid;
						newTransaction.typePaymentId = p.id;
						newTransaction.bankAccountId = p.deposit.bankAccountId;
						newTransaction.documentNumber = p.deposit.documentNumber;
						newTransaction.urlImage = p.deposit.urlImage;
						transactions.push(newTransaction);
					} else if (Number(flag) === typePaymentForm.Note) {
						const newTransaction = { ...transaction };
						newTransaction.amount = p.paid;
						newTransaction.paymentAmount = p.paid;
						newTransaction.typePaymentId = p.id;
						newTransaction.documentNumber = p.creditNote.documentNumber;
						transactions.push(newTransaction);
					} else {
						const newTransaction = { ...transaction };
						newTransaction.additionalInformation = {
							dateReference: p.check.additionalInformation.dateReference,
						};
						newTransaction.amount = p.paid;
						newTransaction.paymentAmount = p.paid;
						newTransaction.typePaymentId = p.id;
						newTransaction.bankId = p.check.bankId;
						newTransaction.documentNumber = p.check.documentNumber;
						newTransaction.reference = p.check.reference;
						transactions.push(newTransaction);
					}
				}
			});
		}
		for (let index = 0; index < transactions.length; index += 1) {
			transactionsId[index] = index + 1;
		}
	}
	return { transactions, transactionsId };
}

function callServiceAndSearchDetails(searchValue) {
	this.localSearch = searchValue;
	if (searchValue) {
		this.rows = this.rows.filter(
			(item) =>
				item.product.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1 ||
				item.product.code.toLowerCase().indexOf(searchValue.toLowerCase()) > -1 ||
				item.product.description.toLowerCase().indexOf(searchValue.toLowerCase()) > -1
		);
	} else {
		const rowsQuantity = this.rows.filter((row) => row.quantity && row.quantity !== 0);
		const newData = this.data.map((row) => {
			const newRow = { ...row };
			rowsQuantity.forEach((rowQ) => {
				if (row.product.warehouseProductId === rowQ.product.warehouseProductId) {
					newRow.quantity = rowQ.quantity;
				}
			});
			return newRow;
		});
		this.rows = newData.filter((item) => !item.isDeleted);
	}
}

function changeData({ id, price, quantity }) {
	this.dataSelected = this.dataSelected.map((row) => {
		const newRow = { ...row };
		if (row.id === id) {
			newRow.price = price;
			newRow.quantity = quantity;
			this.negativeValue = quantity < 0 || price < 0;
		}
		return newRow;
	});
}

function changePriceList({ id }) {
	this.rows = this.mapAction(this.rows, id);
}

function clearModal() {
	this.customer = {
		fullName: '',
	};
	this.customers = [];
	this.listPrices = [];
	this.model.priceList = null;
	this.data = [];
	this.rows = [];
	removeLocalData('products-selected');
}

function closeModal() {
	this.clearModal();
	this.$emit('cancel-modal', false);
}

function currencySymbol() {
	const currencySelected =
		this.currencies.find((cur) => cur.code === this.model.currency) || {};
	return currencySelected.symbol;
}

function deleteRow(code, id) {
	const index = this.rows.findIndex(
		(rowData) =>
			(rowData.autoBarcode === code && rowData.warProductId === id) ||
			(rowData.product &&
				rowData.product.autoBarcode === code &&
				rowData.product.warehouseProductId === id)
	);
	this.data = this.data.map((row) => {
		const newRow = { ...row };
		if (
			(row && row.autoBarcode === code && row.warProductId === id) ||
			(row.product &&
				row.product.autoBarcode === code &&
				row.product.warehouseProductId === id)
		) {
			newRow.isDeleted = true;
		}
		return newRow;
	});
	this.rows.splice(index, 1);
}

function document() {
	let customerDocument = null;
	if (this.customer) {
		customerDocument = this.customer.dni ? this.customer.dni : this.customer.ruc;
	}
	return customerDocument;
}

function filteredCustomers() {
	let typePerson = null;
	const typeDocument = this.isPeru ? this.model.typeDocument : null;
	if (typeDocument === 'BOL') {
		typePerson = 1;
	} else if (typeDocument === 'FAC') {
		typePerson = 2;
	}
	if (typePerson === null) {
		return this.customers;
	}
	return this.customers.filter((c) => c.flagTypePerson === typePerson);
}

function isBilling() {
	return this.model.typeDocument === 'FAC';
}

function getUnitCode(product) {
	const { unitId } = product;
	if (unitId) {
		const { code } = find(equality('id', unitId), this.units);
		return code;
	}
	return false;
}

function getPrice(product) {
	const { unitPrice, tax } = product;
	const igv = this.$userInfo.company.flagIgv;
	if (igv) {
		return unitPrice * (1 + tax / 100);
	}
	return unitPrice;
}

async function loadData() {
	this.data = this.products.map((row) => {
		const newRow = { ...row };
		const unitByProd = {
			id: row.unitId || row.product.unitId,
			code: this.getUnitCode(row) || row.product.unitCode,
			name: row.unitName || row.product.unitName,
		};
		newRow.units =
			row.product && row.product.conversions
				? this.unitsByProduct(row.product)
				: [{ ...unitByProd }];
		newRow.unitConversion = newRow.unitConversion || 1;
		newRow.unitQuantity = row.unitQuantity;
		newRow.priceList = getDeeper('product', 'priceList')(row);
		newRow.salePrice = Sales.getPriceWithOutDiscount(newRow);
		newRow.priceBaseToCalculate = this.sale.flagBasePrice;
		return newRow;
	});
	this.rows = await Sale.formattedProducts(this.data, this.listPrices, this.generalTaxes);
	this.createWarWarehouseProductBrandIdProperty();
	this.allDisabled = this.rows.every((r) => !!r.flagUse);
	const rowsToSelect = this.rows.filter((r) => !r.flagUse);
	const checked = rowsToSelect.every((rts) => rts.isSelected);
	this.selectedAll(checked);
	this.itemsUsed(this.rows);
}

function createWarWarehouseProductBrandIdProperty() {
	this.rows = this.rows.map((product) => {
		const newProduct = { ...product };
		newProduct.warWarehouseProductBrandId = getDeeper(
			'product',
			'warehouseProductId'
		)(product);
		return newProduct;
	});
}

async function loadResources() {
	const currencySelected = this.sale ? this.sale.currency : this.defaultCurrency;
	const request = [
		this.getCurrencies(),
		this.exchangeByDate(),
		this.listPricingPromise(),
		this.getPaymentsMethods(),
		this.getTypeDocuments('sales'),
		this.getTypePayments('sales'),
		this.listOfUnits(),
		this.getBankAccount(),
		this.$httpSales.get('subsidiaries'),
	];
	[
		{ data: this.currencies },
		{ data: this.exchangeRates },
		{ data: this.listPrices },
		{ data: this.paymentMethods },
		{ data: this.typeDocuments },
		{ data: this.typePayments },
		{ data: this.units },
		{ data: this.bankAccounts },
		{ data: this.subsidiaries },
	] = await Promise.all(request);
	this.currencies = this.currencyByCountry(this.currencies);
	this.typeDocuments = this.typeDocuments.reduce((accum, td) => {
		if (td.documentType.code === 'BOL' || td.documentType.code === 'FAC') {
			accum.push(td.documentType);
		}
		return accum;
	}, []);
	this.model.currency = this.currencies.find((cur) => cur.code === currencySelected).code;
	this.model.exchangeRate = this.exchangeRates.amount;
	this.model.commentary = this.sale.commentary;
	this.model.priceList = this.listPrices.length > 0 ? this.listPrices[0] : null;
	this.typePayments = this.typePayments.map((c) => {
		let newC = { ...c.paymentType };
		newC = setNewProperty('paid', 0)(newC);
		newC.open = true;
		newC.icon = 'remove_circle_outline';
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
		return newC;
	});
	this.model.typeDocument = this.typeDocuments[0].code;
	this.loadData();
}

async function loadSeries() {
	this.model.serie = null;
	const params = {
		subsidiaryId: this.subsidiary,
		typeBilling: this.bill,
	};
	try {
		const { data: series } = await this.$httpSales.get(
			`types-document/${this.model.typeDocument}/series`,
			{
				params,
			}
		);
		this.pointsOfSale = series;
		if (!this.pointsOfSale.length) {
			this.showNotification('No existe series', 'error');
		}
	} catch (err) {
		if (err.status === 400) {
			if (err.data.message === 'TYPE_DOCUMENT_CODE_ERROR') {
				this.showNotification('No existen series para el documento de venta.', 'error');
			}
		} else if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function mapAction(items, priceId, type) {
	const newItems = items.map((item) => {
		const newItem = { ...item };
		const listExist = getDeeper('product', 'priceList', 'priceId')(item);
		if (type) {
			newItem.isDeleted = false;
		}
		newItem.isSelected = item.flagUse ? !item.flagUse : !!item.flagUse;
		newItem.quantity = item.quantity ? item.quantity : 1;
		newItem.pricePerSale = listExist ? item.product.priceList[priceId].price : 0;
		newItem.pricePerWholeSale = listExist
			? item.product.priceList[priceId].wholeSalePrice
			: 0;
		return newItem;
	});
	return newItems;
}

function negativeValue(val) {
	if (val) {
		this.showNotification(
			'No se pueden enviar productos con valores menores a cero (0).',
			'error'
		);
	}
}

function priceAmounts() {
	const saleId = !!this.$route.query.cloneId;
	this.rows = Sale.priceAmounts(
		this.rows,
		this.defaultCurrency,
		this.model.currency,
		this.model.exchangeRate,
		saleId
	);
	const dataSelected = this.getDataSelected();
	const amounts = Sale.getAmounts(
		dataSelected,
		this.defaultCurrency
		// this.model.currency,
		// this.model.exchangeRate,
		// saleId,
	);
	amounts.totalOriginal = amounts.total;
	return amounts;
}

function rowIsSelected() {
	const rowsToSelect = this.rows.filter((r) => !r.flagUse);
	this.checkAll = rowsToSelect.every((row) => row.isSelected);
}

function search(val) {
	return this.searchCustomers(val);
}

async function searchCustomers(value) {
	const searchTrim = value ? value.trim() : '';
	const customerAlreadySelected =
		searchTrim &&
		this.customer.fullName &&
		searchTrim.toLowerCase() === this.customer.fullName.toLowerCase();
	if (searchTrim && !customerAlreadySelected) {
		this.loading = true;
		try {
			const { data: customers } = await this.customerSelections(searchTrim);
			this.customers = customers.map((customer) => {
				const newCustomer = { ...customer };
				newCustomer.fullName = customer.typePerson.fullName;
				return newCustomer;
			});
		} catch (err) {
			this.showNotification(
				'Ocurrió un error en el servidor al intentar cargar la data',
				'error'
			);
		} finally {
			this.loading = false;
		}
	}
}

function selectedAll(isSelected) {
	this.checkAll = isSelected;
	this.rows = this.allIsSelected(this.rows, isSelected);
}

function stopClick() {
	return false;
}

function validateExchangeRate(value) {
	this.model.exchangeRate = Number(value) < 1 ? 1 : Number(value);
}

function validations() {
	return {
		customer: {
			required: requiredIf(() => this.isBilling),
		},
		model: {
			currency: {
				required: requiredIf(() => this.isBilling),
			},
			priceList: {
				required: requiredIf(() => this.isBilling),
			},
			serie: {
				required,
			},
			typeDocument: {
				required,
			},
		},
		priceAmounts: {
			total: {
				required,
				minValue: minValue(0),
			},
		},
	};
}

function updatePriceList(product) {
	this.rows = this.rows.map((p) => {
		const newP = { ...p };
		if (
			product.id === p.id &&
			product.brandId === p.brandId &&
			product.warWarehouseId === p.warWarehouseId
		) {
			newP.pricePerSale = p.priceList[p.selectedPriceListId].price;
		}
		return newP;
	});
}

function quantityValidation(product, quantity) {
	this.rows = Sale.quantityValidation(product, quantity, this.rows);
}

function editPriceUnitary(product, newPrice) {
	this.rows = Sales.editPriceUnitary(product, newPrice, this.rows);
}

function editPricePerSale(product, newPrice) {
	this.rows = Sales.editPricePerSale(product, newPrice, this.rows);
}

function setData({ model, value }, row, flagUnitChanged) {
	const newRow = Sale.updateByUnitChange(model, value, row, flagUnitChanged);
	const matchProperty = newRow.warWarehouseProductBrandId
		? 'warWarehouseProductBrandId'
		: 'id';
	if (flagUnitChanged) {
		this.rows = updateAllItemInCollection(matchProperty, newRow, this.rows);
		return false;
	}
	return newRow;
}

function editDiscount(product, value) {
	this.rows = Sales.editDiscount(product, value, this.rows);
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

function itemsUsed(rows) {
	const allItemsUsed = rows.every((r) => !!r.flagUse);
	const someItemsUsed = rows.some((r) => !!r.flagUse);
	const message = 'productos ya fueron convertidos';
	if (allItemsUsed) {
		this.showNotification(`Los ${message}`, 'warning');
	} else if (someItemsUsed) {
		this.showNotification(`Algunos ${message}`, 'warning');
	}
}

function columnInput(event) {
	const val = Number(event.event.target.value);
	this.rows = Sales.applyDiscountToAllItems(val, this.rows);
}

function handlerModelCurrency(newValue, oldValue) {
	const { exchangeRate } = this.model;
	if (oldValue.length > 0) {
		const conversion = oldValue === 'PEN' ? 1 / exchangeRate : exchangeRate;
		this.rows = this.rows.map((d) => {
			const newD = { ...d };
			newD.price *= conversion;
			return newD;
		});
	}
}

function displayStockDiscount() {
	return getDeeper('company', 'settings', 'flagTransferDisplay')(this.$userInfo);
}

function updatePayAmounts() {
	this.setCashAndCreditAmount(this.paymentsSelectedFn);
}

function setCashAndCreditAmount(collection) {
	const cashNew = collection.find(
		(c) => c.code === 'efectivo' || c.code === 'cash-dollars'
	);
	this.cash = cashNew ? cashNew.paid : 0;
	this.creditCardAmount = collection
		.map((c) => {
			const newC = { ...c };
			if (!c.paid) newC.paid = 0;
			return newC;
		})
		.filter((f) => f.code !== 'efectivo' && f.code !== 'cash-dollars')
		.reduce((acc, el) => acc + el.paid, 0);
	const indexNote = collection.findIndex((c) => c.code === 'cntc');
	this.disabledAmountN =
		indexNote > -1 ? collection[indexNote].paid > this.creditNote.amount : false;
}

function updatePay() {
	const total = Number(this.priceAmounts.total.toFixed(2));
	const paid = this.getPaid(
		this.cash,
		this.creditCardAmount,
		this.quotesComplete,
		this.typePayment
	);
	const rest = total > paid ? total - paid : 0;
	const change = paid > total ? paid - total : 0;
	return {
		change: Number(change.toFixed(2)),
		paid,
		rest: Number(rest.toFixed(2)),
	};
}

function cashTypePayment() {
	return this.typePayment === 'CONTADO';
}

function creditTypePayment() {
	return this.typePayment === 'CREDITO';
}

function remove(item) {
	this.paymentsSelected.splice(this.paymentsSelected.indexOf(item), 1);
	this.paymentsSelected = [...this.paymentsSelected];
	if (item.code === 'cntc') {
		this.validateColor = 'primary';
		this.creditNote = { ...this.defaultCreditNote };
		const index = this.typePayments.findIndex((t) => t.code === 'cntc');
		if (index > -1) {
			this.typePayments[index].paid = 0;
		}
	}
}

function paymentsSelectedFn() {
	let paymentsSelected = [...this.paymentsSelected];
	if (this.paymentsSelected.length >= 0) {
		const total = this.priceAmounts.total;
		const divider = this.paymentsSelected.length;
		paymentsSelected = this.paymentsSelected.map(
			distributeAmount(total, divider, null, null, this.validateColor)
		);
		this.setCashAndCreditAmount(paymentsSelected);
		const index = this.paymentsSelected.findIndex((p) => p.code === 'cntc');
		this.disabledValidateNote = index > -1 ? this.validateColor !== 'success' : false;
		if (this.paymentsSelected.length === 0) {
			const indexN = this.typePayments.findIndex((t) => t.code === 'cntc');
			if (indexN > -1) {
				this.typePayments[indexN].paid = 0;
				this.validateColor = 'primary';
				this.creditNote = { ...this.defaultCreditNote };
			}
		}
	}
	return paymentsSelected;
}

function isNotTypeCash({ code }) {
	return code !== 'efectivo' || code !== 'cash-dollars';
}

function openForm(cards) {
	const { id, open, code } = cards;
	const cc = this.paymentsSelected.find((c) => c.id === id);
	this.$set(cc, 'open', !open);
	this.$set(cc, 'icon', !open ? 'remove_circle_outline' : 'add_circle_outline');
	let typeCard = '';
	if (code === 'deposito-bancario') {
		typeCard = 'Deposit';
	} else if (code === 'cntc') {
		typeCard = 'Note';
	} else {
		typeCard = code === 'cheque' ? 'Check' : 'Card';
	}
	this.isActiveForm(cards, typeCard);
}

function isActiveForm({ flagForm, open }, type) {
	return open && typePaymentForm[type] === flagForm;
}

function editFirstDay() {
	this.changeDistributionDates({ value: this.selectedDistribution });
}

function changeDistributionDates({ value }) {
	this.selectedDistribution = value;
	this.quotesComplete = this.quotesComplete.map((f, index, fees) => {
		const newF = f;
		newF.expirationDate = this.distributionDates(fees[0].expirationDate, index);
		return newF;
	});
}

function distributionDates(initialDate, iterator) {
	return format(addDays(initialDate, iterator * this.selectedDistribution), 'YYYY-MM-DD');
}

function addQuote(value) {
	this.quotesComplete = [];
	const quotesArray = quotesDistribution(this.priceAmounts.total, this.quotes);
	for (let i = 1; i <= value; i += 1) {
		const index = i - 1;
		const amount = quotesArray[index];
		const expirationDate = index
			? this.distributionDates(this.quotesComplete[0].expirationDate, index)
			: format(new Date(), 'YYYY-MM-DD');
		this.quotesComplete.push({ amount, menu: false, expirationDate });
	}
}

function getPaid(cashNew, cards, quotes, type) {
	if (type === 'CONTADO') {
		return cashNew + cards || 0;
	}
	return quotes.reduce((acc, quote) => acc + quote.amount, 0);
}

function setDepositData({ code, model, newValue }) {
	const deposit = this.paymentsSelected.find((c) => c.code === code);
	if (model === 'dateReference') {
		this.$set(deposit.deposit.additionalInformation, model, newValue);
	} else {
		this.$set(deposit.deposit, model, newValue);
	}
}

function setCheckData({ code, model, newValue }) {
	const check = this.paymentsSelected.find((c) => c.code === code);
	if (model === 'dateReference') {
		this.$set(check.check.additionalInformation, model, newValue);
	} else {
		this.$set(check.check, model, newValue);
	}
}

function setCardData({ code, model, newValue }) {
	const card = this.paymentsSelected.find((c) => c.code === code);
	this.$set(card.card, model, newValue);
}

function allowedDates(val) {
	if (
		val.split('-')[0] === this.today.split('-')[0] &&
		val.split('-')[1] === this.today.split('-')[1]
	) {
		return val.split('-')[2] >= this.today.split('-')[2];
	}
	return val;
}

function watcherTypePayment() {
	if (this.typePayment === 'CREDITO') {
		this.paymentsSelected = [];
		this.cash = 0;
		this.creditCardAmount = 0;
		this.showAlert = false;
	} else {
		this.quotesComplete = [];
		this.quotes = null;
	}
}

function setNewCustomer(newCustomer) {
	if (newCustomer) {
		this.customer = { ...newCustomer };
		if (newCustomer.flagActive === 0) {
			this.showNotification(
				'El cliente se encuentra bloqueado, no se pude continuar con la venta.',
				'warning'
			);
		}
	}
}

function blockedCustomer() {
	return this.customer.flagActive === 0;
}

function cash(value) {
	const same = this.creditCardAmount === this.priceAmounts.total && value;
	const isSelected =
		this.paymentsSelectedFn.find(
			(c) => c.code === 'efectivo' || c.code === 'cash-dollars'
		) && !value;
	if (same) {
		this.alertMessage =
			'El vuelto no puede ser igual al monto en efectivo. Las transacciones por tipo de pago se deben generar con un monto mayor a cero (0).';
	} else if (isSelected) {
		this.alertMessage =
			'Uno o más tipos de pago seleccionados se encuentran con monto cero (0). Puede eliminar la selección y continuar con el proceso.';
	}
	this.showAlert = same || isSelected;
}

function creditCardAmount(value) {
	if (value) {
		const existCash = this.cash > 0;
		const greaterThan = twoDecimals(value) > this.priceAmounts.total;
		const payByType = this.paymentsSelectedFn.some((sc) => !sc.paid);
		const same = this.creditCardAmount === this.priceAmounts.total;
		if (greaterThan) {
			this.alertMessage =
				'El monto a pagar con tarjetas de crédito, depósito bancario, cheque o nota de crédito no puede ser mayor al monto total de la venta.';
		} else if (same && existCash) {
			this.alertMessage =
				'El vuelto no puede ser igual al monto en efectivo. Las transacciones por tipo de pago se deben generar con un monto mayor a cero (0).';
		} else if (payByType) {
			this.alertMessage =
				'Uno o más tipos de pago seleccionados se encuentran con monto cero (0). Puede eliminar la selección y continuar con el proceso.';
		}
		this.showAlert = greaterThan || (same && existCash) || payByType;
	}
}

function quantityCharge(value) {
	const cant =
		this.selectCharges === 'percent'
			? (Number(value) / 100) * this.priceAmounts.totalOriginal
			: Number(value);
	this.priceAmounts.total = this.priceAmounts.totalOriginal + cant;
}

function selectCharges() {
	this.quantityCharge = null;
}

function selectDocument(code) {
	this.model.typeDocument = code;
	this.loadSeries();
}

function disabledPointSale() {
	return Boolean(
		this.model.typeDocument &&
			this.subsidiary &&
			this.bill &&
			this.pointsOfSale.length > 0
	);
}

async function changeSubsidiary(value) {
	this.bill = null;
	try {
		const { data: response } = await this.$httpSales.get(
			`type-billing?subsididaryId=${value}`
		);
		this.typeOfBill = response;
		if (this.typeOfBill.length === 1) {
			this.bill = this.typeOfBill[0].type;
		} else {
			const indexElec = this.typeOfBill.findIndex((t) => t.type === typeBill.Electronic);
			if (indexElec > -1) {
				this.bill = this.typeOfBill[indexElec].type;
			}
		}
	} catch (error) {
		this.showGenericError();
	}
}

function changeBill(bill) {
	if (bill) {
		this.loadSeries();
	}
}

function disabledBill() {
	return Boolean(this.subsidiary && this.typeOfBill.length > 1);
}

function changeSerie(id) {
	const indexSerie = this.pointsOfSale.findIndex((p) => p.id === id);
	if (indexSerie > -1) {
		if (!this.pointsOfSale[indexSerie].availability) {
			this.showGenericError(
				'No se puede seleccionar este punto de venta por que esta siendo usado desde un dispositivo móvil'
			);
			this.model.serie = null;
		}
	}
}

async function validNote(model) {
	if (!this.noteValidated) {
		this.noteLoading = true;
		const body = {
			customerId: this.customer.id,
			serie: model.serie,
			number: model.number,
		};
		try {
			const { data: response } = await this.$httpSales.post(
				'sale-documents-validate',
				body
			);
			this.valueDate = format(response.localDate.date, 'DD/MM/YYYY', false, ' ');
			this.creditNote = {
				id: response.id,
				amount: response.amount,
				date: format(response.localDate.date, 'YYYY-MM-DD', false, ' '),
				serie: response.serie,
				number: response.number,
				documentNumber: response.documentNumber,
			};
			const card = this.paymentsSelected.find((sc) => sc.code === 'cntc');
			this.$set(
				card,
				'documentNumber',
				`${this.creditNote.serie}-${this.creditNote.number}`
			);
			this.$set(card, 'creditNote', this.creditNote);
			this.$set(card, 'paid', this.creditNote.amount);
			this.openForm(card);
			this.icon = 'check';
			this.validateColor = 'success';
			this.disabledValidateNote = false;
		} catch (err) {
			this.icon = 'close';
			this.validateColor = 'error';
			if (err.data && err.data.message === 'DOCUMENT_NUMBER_NOT_FOUND') {
				this.showGenericError(
					`No se ha encontrado el documento #${model.serie}-${model.number} en el sistema.`
				);
			} else if (err.data && err.data.message === 'CUSTOMER_GENERIC_NOT_FOUND') {
				this.showGenericError('La compañía no cuenta con cliente genérico registrado.');
			} else if (err.data && err.data.message === 'CUSTOMER_SALES_EXIST_ERROR') {
				this.showGenericError('El cliente no existe en la compañía.');
			} else if (err.data && err.data.message === 'CUSTOMER_NOT_ACTIVE_ERROR') {
				this.showGenericError('El cliente no se encuentra activo para la compañía.');
			} else {
				this.showGenericError();
			}
			this.disabledValidateNote = true;
		} finally {
			this.noteLoading = false;
			this.noteValidated = true;
		}
	}
}

function setNoteData({ model, value }) {
	this.creditNote[model] = value;
	if (model === 'serie' || model === 'number') {
		this.creditNote.amount = null;
		this.noteValidated = false;
		this.validateColor = 'primary';
	}
}

function data() {
	return {
		originalTotal: 0,
		quantityCharge: null,
		selectCharges: 'currency',
		otherCharges: [
			{
				name: 'Porcentaje',
				value: 'percent',
			},
			{
				name: 'Moneda',
				value: 'currency',
			},
		],
		allDisabled: false,
		bankAccounts: [],
		cash: 0,
		checkAll: false,
		creditCardAmount: 0,
		columns: [
			{
				id: 1,
				name: 'Número',
				value: 'autoBarcode',
				visible: true,
				checked: true,
			},
			{ id: 2, name: 'Código', value: 'code', visible: true, checked: true },
			{ id: 3, name: 'Nombre', value: 'name', visible: true, checked: true },
			{
				id: 4,
				name: 'Descripción',
				value: 'description',
				visible: true,
				checked: true,
			},
			{
				id: 5,
				name: 'Lista de Precios',
				value: 'priceList',
				visible: false,
				checked: false,
			},
			{
				id: 6,
				name: 'Cantidad',
				value: 'quantity',
				visible: true,
				checked: true,
			},
			{
				id: 7,
				name: 'Precio Unitario',
				value: 'priceUnitary',
				visible: true,
				checked: true,
			},
			{
				id: 8,
				name: 'PVP',
				value: 'pricePerSale',
				visible: true,
				checked: true,
			},
			{
				id: 9,
				name: 'Unidad',
				value: 'unitName',
				visible: true,
				checked: true,
			},
			{ id: 10, name: 'Stock', value: 'stock', visible: true, checked: true },
			{
				id: 11,
				name: 'Descuento (%)',
				value: 'discountPercentage',
				visible: true,
				checked: true,
				showInput: false,
				isEditable: true,
			},
			{ id: 12, name: '', value: 'taxes', visible: true, checked: true },
			{ id: 13, name: 'Total', value: 'total', visible: true, checked: true },
			{ id: 14, name: '', visible: true, checked: true, flagVisible: true },
		],
		currencies: [],
		customer: {},
		customers: [],
		data: [],
		dataSelected: [],
		dateOnline: '',
		defaultCurrency: '',
		discount: 0,
		exchangeRates: {},
		flagIgv: 0,
		feesDistribution: [
			{ value: 2, text: 'Ninguno' },
			{ value: 7, text: 'Semanal' },
			{ value: 15, text: 'Quincenal' },
			{ value: 30, text: 'Mensual' },
		],
		listPrices: [],
		loading: false,
		localSearch: '',
		model: {
			commentary: '',
			currency: '',
			exchangeRate: 0,
			flagTransfer: true,
			priceList: 0,
			serie: '',
			typeDocument: '',
		},
		negativeValue: false,
		paymentMethods: [],
		paymentsSelected: [],
		pricingListSelected: null,
		quotes: [],
		quotesComplete: [],
		rows: [],
		search: '',
		selectedDistribution: 2,
		series: [],
		today: null,
		typeDocuments: [],
		typePayment: null,
		typePayments: [],
		units: [],
		alertMessage: '',
		showAlert: false,
		rucs: [],
		typeOfBill: [],
		pointsOfSale: [],
		subsidiaries: [],
		subsidiary: null,
		bill: null,
		creditNote: {
			amount: null,
			date: null,
			documentNumber: null,
			id: null,
			serie: null,
			number: null,
		},
		validateColor: 'primary',
		noteLoading: false,
		noteValidated: false,
		valueDate: null,
		icon: '',
		disabledValidateNote: false,
		disabledAmountN: false,
		defaultCreditNote: {
			amount: null,
			date: null,
			documentNumber: null,
			id: null,
			serie: null,
			number: null,
		},
	};
}

export default {
	name: 'document-convert',
	components: {
		appTable,
		bankDepositForm,
		cardForm,
		checkForm,
		modalSidebarButton,
		creditNoteForm,
	},
	computed: {
		applyDisabled,
		blockedCustomer,
		cashTypePayment,
		creditTypePayment,
		currencySymbol,
		displayStockDiscount,
		document,
		filteredCustomers,
		isBilling,
		noDataSelected,
		paymentsSelectedFn,
		priceAmounts,
		updatePay,
		disabledPointSale,
		disabledBill,
	},
	created,
	data,
	methods: {
		addQuote,
		allIsSelected,
		allowedDates,
		applyFilter,
		callServiceAndSearchDetails,
		clearModal,
		closeModal,
		changeData,
		changeDistributionDates,
		changePriceList,
		columnInput,
		createWarWarehouseProductBrandIdProperty,
		deleteRow,
		distributionDates,
		editDiscount,
		editFirstDay,
		editPricePerSale,
		editPriceUnitary,
		handlerModelCurrency,
		isActiveForm,
		isNotTypeCash,
		getDataSelected,
		getPaid,
		getPrice,
		getTransactions,
		getUnitCode,
		setNewCustomer,
		itemsUsed,
		loadData,
		loadSeries,
		loadResources,
		mapAction,
		openForm,
		quantityValidation,
		remove,
		rowIsSelected,
		searchCustomers: debounce(searchCustomers),
		selectedAll,
		setCardData,
		setCashAndCreditAmount,
		setCheckData,
		setDepositData,
		setData,
		stopClick,
		unitsByProduct,
		updatePayAmounts,
		updateColumns,
		updatePriceList,
		validateExchangeRate,
		watcherTypePayment,
		selectDocument,
		changeSubsidiary,
		validNote,
		setNoteData,
	},
	props: {
		products: {
			default: () => [],
			required: true,
			type: Array,
		},
		sale: {
			default: () => {},
			type: Object,
		},
	},
	validations,
	watch: {
		'model.currency': handlerModelCurrency,
		negativeValue,
		typePayment: watcherTypePayment,
		search,
		cash,
		creditCardAmount,
		quantityCharge,
		selectCharges,
		bill: changeBill,
		'model.serie': changeSerie,
	},
};
</script>

<style lang="scss" scoped>
.card {
	border-radius: 0px;
	box-shadow: none;

	&-grey {
		background-color: map-get($colors, background-card);
	}

	&-black {
		background-color: map-get($colors, background-card-black);
	}

	.row-text {
		color: map-get($colors, paginationText);
		font-size: map-get($sizes, medium);

		&-title {
			font-family: map-get($fonts, open-bold);
		}

		&-price {
			font-family: map-get($fonts, open-semibold);
			font-size: map-get($sizes, large);
		}
	}
}

.chip-exchange {
	border-radius: 5px;
	font-family: map-get($fonts, open-semibold);
	font-size: map-get($sizes, small10);
	height: 30px;
	margin: 0px;
	text-align: left;
	width: 84px;
	z-index: 1;

	span:not(.chip__content) {
		align-self: flex-end;
		display: flex;
		font-size: map-get($sizes, medium);
		white-space: normal;
	}
}

.col-exchange {
	padding-top: 1.5px;
	position: relative;
}

.col-opacity {
	opacity: 0.69;
}

.list-title {
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, open-semibold);
	font-size: map-get($sizes, medium18);
	padding-left: 30px;

	@media (min-width: 768px) {
		padding-left: 0px;
	}
}

.subheader {
	color: map-get($colors, background-card-black);
	font-family: map-get($fonts, open-regular);
	font-size: map-get($sizes, medium);
}

.radio-document {
	padding-top: 0 !important;
}

.btn-document {
	background: color(white);
	border-radius: 3px;
	font-size: 12px;
	height: 31px;
	margin-right: 15px;
	width: 31px;

	&.active {
		background: color(secondary);
		color: color(white);
	}
}
</style>
