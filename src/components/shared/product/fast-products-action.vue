<template>
	<div class="py-4">
		<v-layout
			wrap mb-2 align-center
			justify-space-around
			v-show="isQuickSale">
			<v-flex xs12 sm5 class="align-col-responsive">
				<label class="list-title">Tipo de documento:</label>
			</v-flex>
			<v-flex xs12 sm7 class="pd-col-responsive">
				<v-radio-group v-model="typeDocument" row class="sale-radio">
					<v-radio
						v-for="documentType in typeDocuments"
						:key="documentType.comTypeDocumentId"
						:label="documentType.documentType.name"
						:value="documentType.documentType.code"
						color="success"
						:class="{ 'sale-radio-note' : documentType.documentType.code === 'NTV',
							'sale-radio-ticket' :  documentType.documentType.code === 'BOL',
							'sale-radio-bill' : documentType.documentType.code === 'FAC' }"
						:title="documentType.documentType.name"
						:ripple="false"></v-radio>
				</v-radio-group>
			</v-flex>
		</v-layout>
		<v-layout row wrap d-flex justify-start mb-2 pl-3>
			<v-flex xs12 sm5 px-3 mb-2 mr-5>
				<v-select
					autofocus
					autocomplete
					persistent-hint
					bottom
					hide-details
					label="Cliente"
					:loading="loading"
					:items="customers"
					item-text="autocomplete"
					:search-input.sync="search"
					v-model="customer"
					class="filter-select shadow-inset"
					content-class="filter-select-content"
					@input="setNewCustomer"
				></v-select>
			</v-flex>
			<v-flex xs12 sm5 px-3 mb-2>
				<v-text-field
					label="Documento de cliente"
					readonly
					v-model="document"
					single-line
					hide-details
					class="filter-select shadow-inset"
				></v-text-field>
			</v-flex>
		</v-layout>
		<v-layout row wrap d-flex justify-start mb-2 pl-3>
			<v-flex xs12 sm5 px-3 mb-2 mr-5>
				<v-select
					:items="listPricing"
					v-model="pricingListSelected"
					label="Lista de precio regular"
					item-text="name"
					single-line
					bottom
					hide-details
					class="filter-select"
					@input="changePriceList"
					content-class="filter-select-content"
				></v-select>
			</v-flex>
			<v-flex xs12 sm6 px-3 mb-2 class="col-exchange" v-if="isPeru">
				<v-chip
					label
					color="pink"
					text-color="white"
					class="chip-exchange">
					Cambio Maki: <span>S/.</span>
				</v-chip>
				<v-text-field
					label="00.00"
					type="number"
					v-model.number="exchangeRate"
					@change="validateExchangeRate"
					single-line
					hide-details
					class="filter-select shadow-inset-chip"
				></v-text-field>
			</v-flex>
		</v-layout>
		<v-layout row wrap d-flex justify-start mb-2 pl-3 v-if="isPeru">
			<v-flex xs12 sm5 px-3 mb-2>
				<v-select
					single-line
					hide-details
					:items="currencies"
					label="Tipo de moneda"
					item-text="code"
					item-value="code"
					class="filter-select"
					content-class="filter-select-content"
					v-model="salesCurrency"
				></v-select>
			</v-flex>
		</v-layout>
		<v-layout row wrap justify-space-around mb-2>
			<v-flex xs12 sm10>
				<label
					class="list-title">
					Lista de productos
				</label>
			</v-flex>
		</v-layout>
		<v-layout wrap>
			<v-flex xs12>
				<app-table
					name="fastActions"
					:columns="columns"
					:rows="rows"
					:key-value="keyValue"
					local-storage
					local-search
					:main-list="false"
					@on-toggle-columns="toggleColumns"
					@on-local-search="callServiceAndSearch"
					@column-input="columnInput"
					class="is-not-selectable mb-0">
					<template slot="rows" slot-scope="props">
						<td v-show="showRow(columns, 1)"
							class="is-not-selectable">{{ props.row.autoBarcode }}</td>
						<td v-show="showRow(columns, 2)">{{ props.row.warehouseName }}</td>
						<td v-show="showRow(columns, 3)">{{ props.row.code }}</td>
						<td v-show="showRow(columns, 4)">{{ props.row.name }}</td>
						<td v-show="showRow(columns, 5)">{{ props.row.description }}</td>
						<td v-show="showRow(columns, 6)">
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
						<td v-show="showRow(columns, 7)">
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
						<td class="prices-width" v-show="showRow(columns, 8)">
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
						<td class="prices-width" v-show="showRow(columns, 9)">
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
						<td v-show="showRow(columns, 10)" @click.stop="stopClick">
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
						<td v-show="showRow(columns, 11)">{{ props.row.stock }}</td>
						<td v-show="showRow(columns, 12)">
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
						<td v-show="showRow(columns, 13)">{{ props.row.taxes }}</td>
						<td v-show="showRow(columns, 14)">{{ props.row.total | round | abs }}</td>
						<td v-show="showRow(columns, 15)">
							<button
								class="table-icon"
								@click.stop="deleteRow(props.row.autoBarcode, props.row.warProductId)">
								<v-icon
									color="pink"
									size="19">
									highlight_off
								</v-icon>
							</button>
						</td>
					</template>
				</app-table>
			</v-flex>
		</v-layout>
		<v-layout wrap mb-3 px-4>
			<v-flex xs8>
				<v-card class="white--text card-grey" height="76">
					<v-layout row wrap justify-space-around mb-2 class="row-text row-text-title">
						<v-flex xs5 text-xs-left pl-5>
							Descuento
						</v-flex>
						<v-flex xs3 text-xs-center>
							Subtotal
						</v-flex>
						<v-flex xs2 text-xs-center>
							+
						</v-flex>
						<v-flex xs2 text-xs-center>
							{{labelsByCountry.taxName}}
						</v-flex>
					</v-layout>
					<v-layout row wrap justify-space-around class="row-text row-text-price">
						<v-flex xs5 text-xs-left pl-5>
							{{ priceAmounts.totalDiscount | round }}
						</v-flex>
						<v-flex xs5 text-xs-left pl-5>
							{{ priceAmounts.subtotal | round }}
						</v-flex>
						<v-flex xs2 text-xs-center>
							{{ priceAmounts.tax | round }}
						</v-flex>
					</v-layout>
				</v-card>
			</v-flex>
			<v-flex xs4>
				<v-card class="text-xs-center card-black" height="76">
					<v-layout column wrap class="row-text">
						<v-flex xs12 text-xs-center mb-2 class="row-text-title white--text">
							Total
						</v-flex>
						<v-flex xs12 text-xs-center class="row-text-price white--text">
							{{salesCurrencySymbol}} {{ priceAmounts.total | round }}
						</v-flex>
					</v-layout>
				</v-card>
			</v-flex>
		</v-layout>
		<v-layout d-flex justify-center py-2>
			<v-flex xs10>
				<v-text-field
					no-resize
					multi-line
					single-line
					class="textarea-content filter-select shadow-inset"
					name="new-product-description"
					label="Comentario"
					v-model="commentary"
				></v-text-field>
			</v-flex>
		</v-layout>
		<v-layout row my-3 d-flex justify-center>
			<v-flex xs10 d-flex justify-center>
				<v-flex xs4 mr-2>
					<span>Pagado: {{updatePay.paid}}</span>
				</v-flex>
				<v-flex xs4 mr-2>
					<span>Vuelto: {{updatePay.change}}</span>
				</v-flex>
				<v-flex xs4>
					<span>Pendiente: {{updatePay.rest}}</span>
				</v-flex>
			</v-flex>
		</v-layout>
		<v-layout
			wrap
			justify-start
			mb-2
			align-center
			pl-5
			v-if="isQuickSale">
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
						:class="{ 'sale-radio-note' : paymentMethod.code === 'CONTADO',
							'sale-radio-ticket' : paymentMethod.code === 'CREDITO' }"
						:title="paymentMethod.name"
						:ripple="false"></v-radio>
				</v-radio-group>
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
							:items="typesPayments"
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
									<strong>{{ data.item.name }}</strong>&nbsp;
								</v-chip>
							</template>
						</v-select>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12>
				<v-layout wrap align-center
					v-for="(cards, indexCards) in paymentsSelectedFn"
					:key="indexCards"
					pt-3 pb-2 px-5>
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
					<v-flex
						xs2
						text-xs-center
						v-if="isNotTypeCash(cards)">
						<v-btn
							icon
							flat
							@click="openForm(cards)"
						>
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
					</v-flex>
					<v-flex xs12 pt-4>
						<v-divider></v-divider>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout wrap justify-center mt-2 mb-4
			v-if="isQuickSale">
			<v-flex xs12 px-3 mb-2>
				<v-layout row wrap v-if="creditTypePayment">
					<v-flex xs12 sm6 pl-3>
						<v-layout row align-center>
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
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout
			row
			wrap
			justify-center
			mt-2
			mb-4
			v-if="isQuickSale">
			<v-flex xs12 px-3 mb-2>
				<v-layout
					row
					wrap
					v-for="(quote, index) in quotesComplete"
					:key="index">
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
								<v-subheader class="pa-0">
									Último día de pago
								</v-subheader>
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
										locale
										:min="today"
										:allowed-dates="allowedDates"
									></v-date-picker>
								</v-menu>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="applyDisabled || blockedCustomer"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="applyFilter"
			/>
		</section>
	</div>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';
	import bankDepositForm from '@/components/shared/type-payment-forms/bank-deposit-form';
	import cardForm from '@/components/shared/type-payment-forms/card-form';
	import checkForm from '@/components/shared/type-payment-forms/check-form';
	import helper from '@/shared/helper';
	import lib from '@/shared/lib';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
	import Sales from '@/shared/sale';
	import typePaymentForm from '@/shared/type-payment-form';

	const Sale = new Sales();
	const {
		distributeAmount,
		equality,
		getDeeper,
		map,
		round,
		setNewProperty,
		updateAllItemInCollection,
		updateItemInCollection,
	} = lib;

	const round2 = round(2);

	function addQuote(value) {
		const newArray = [];
		for (let index = 0; index < value; index += 1) {
			const newObject = { amount: null, expirationDate: null, menu: false };
			newArray.push(newObject);
		}
		this.quotesComplete = newArray;
	}

	function allowedDates(val) {
		if (val.split('-')[0] === this.today.split('-')[0]
			&& val.split('-')[1] === this.today.split('-')[1]) {
			return val.split('-')[2] >= this.today.split('-')[2];
		}
		return val;
	}

	function applyDisabled() {
		const everyRowQuantity = this.rows.every(row => row.quantity);
		const totalyPaid = this.updatePay.rest === 0;
		let disabled = true;
		if (this.isQuickSale) {
			if (this.customer && everyRowQuantity && this.typeDocument && this.typePayment && totalyPaid) {
				if (this.typePayment === 'CONTADO') {
					disabled = false;
				} else if (this.typePayment === 'CREDITO') {
					if (this.quotesComplete
						&& this.quotesComplete.length > 0
						&& this.quotesComplete.every(quote =>
							quote.amount && quote.expirationDate)
						&& !this.isLoading) {
						disabled = false;
					}
				}
			}
		} else if (this.isQuickQuotation) {
			if (this.customer && everyRowQuantity && !this.isLoading) {
				disabled = false;
			}
		} else {
			disabled = false;
		}
		return disabled;
	}

	async function applyFilter() {
		this.isLoading = true;
		const postUrl = this.isQuickSale ? this.typeDocument : 'COT';
		const message = this.isQuickSale ? 'venta se creó' : 'cotización se creó';
		const currentDetails = this.rows.map((row) => {
			const tax = Sales.getTaxesByProduct(this.generalTaxes, row);
			const newRow = {
				alternateCode: row.alternateCode,
				brandId: row.brandId,
				brandName: row.brandName,
				categoryId: row.categoryId,
				categoryName: row.categoryName,
				description: row.description,
				discount: (row.discount * row.quantity) || 0,
				discountPercentage: row.discountPercentage,
				price: Sales.getTotal(row) / row.quantity,
				priceCost: row.priceCost,
				productCode: row.code,
				productType: row.type ? row.type : row.product.type,
				quantity: row.quantity,
				salePrice: Sales.getTotal(row) / row.quantity,
				stockQuantity: row.stock || row.stockQuantity,
				subtotalWithoutTax: row.quantity * (row.priceUnitary - row.discount),
				tax,
				taxAmount: Sales.buildTaxes(row).amount,
				taxes: [Sales.buildTaxes(row)],
				unitConversion: row.unitConversion,
				unitCode: row.unitCode,
				unitId: row.unitId,
				unitName: row.unitName,
				unitPrice: row.priceUnitary,
				unitQuantity: row.unitQuantity,
				warProductsId: getDeeper('product', 'id')(row) || row.id,
				warWarehousesId: row.warehouseId || row.warWarehousesId,
			};
			return newRow;
		});
		const details = currentDetails.map((product) => {
			const newProduct = { ...product };
			if (!product.stockQuantity) {
				newProduct.stockQuantity = 0;
			}
			if (product.productType === 2) {
				delete newProduct.brandId;
				delete newProduct.warWarehousesId;
			}
			return newProduct;
		});
		const amounts = this.priceAmounts;
		const model = {
			amount: amounts.total,
			change: this.updatePay.change,
			commentary: this.commentary,
			currency: this.salesCurrency,
			customerId: this.customer.id,
			dateOnline: this.dateOnline,
			details,
			discount: amounts.totalDiscount,
			exchangeRate: this.exchangeRate,
			subtotal: amounts.subtotal,
			taxes: amounts.tax,
			transactionId: [],
			transactions: [],
			warehouseName: this.$userInfo.warehouse.name,
		};
		if (this.isQuickSale) {
			model.amountCash = this.cash || 0;
			model.amountCredit = this.creditCardAmount || 0;
			model.creditCardName = this.typeCard ? this.typeCard.name : '';
			model.paymentMethodId = this.paymentMethods.find(p => p.code === this.typePayment).id;
			model.detailsPayments = this.quotesComplete.map((quote) => {
				const newQuote = { ...quote };
				delete newQuote.menu;
				return newQuote;
			});
			model.taxesAmount = Sale.getPeruTaxesAmounts(amounts, this.rows);
			model.totalTaxesAmount = Sale.getEcuadorTaxesAmounts(amounts, this.rows);
		}
		if (this.typePayment === 'CONTADO') {
			const transaction = {
				currency: this.salesCurrency,
				paymentDate: new Date(this.$today()),
			};
			if (this.cash) {
				const newCashTransaction = { ...transaction };
				const typePaymentSelected = this.typesPayments.find(tp => tp.code === 'efectivo');
				newCashTransaction.amount = this.cash;
				newCashTransaction.paymentAmount = this.cash;
				newCashTransaction.typePaymentId = typePaymentSelected.id;
				model.transactions.push(newCashTransaction);
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
							newTransaction.bankAccountId = p.card.bankAccountId;
							newTransaction.documentNumber = p.card.documentNumber;
							model.transactions.push(newTransaction);
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
							model.transactions.push(newTransaction);
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
							model.transactions.push(newTransaction);
						}
					}
				});
			}
			const newTransactionId = Array(model.transactions.length);
			for (let index = 0; index < newTransactionId.length; index += 1) {
				newTransactionId[index] = index + 1;
			}
			model.transactionId = newTransactionId;
		}
		try {
			await this.$httpSales.post(`sale-documents/${postUrl}/type-document`, model);
			this.showNotification(`La ${message} correctamente`);
			this.$emit('finish-action');
			this.isLoading = false;
			this.closeModal();
		} catch (err) {
			if (err.status === 500) {
				this.showGenericError();
			} else if (err.status === 400) {
				if (err.data.message === 'SALE_DUPLICATE_ERROR') {
					this.showGenericError('La venta ya ha sido registrada');
				}
			}
			this.isLoading = false;
		}
	}

	function callServiceAndSearch(searchValue) {
		this.localSearch = searchValue;
		if (searchValue) {
			const rowsFilter = this.rows.filter(item =>
				(item.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1
					&& !item.isDeleted)
				|| (item.code.toLowerCase().indexOf(searchValue.toLowerCase()) > -1
					&& !item.isDeleted)
				|| (item.description.toLowerCase().indexOf(searchValue.toLowerCase()) > -1
					&& !item.isDeleted));
			this.rows = rowsFilter;
		} else {
			const rowsQuantity = this.rows.filter(row => row.quantity && row.quantity !== 0);
			const listOfPrice = this.pricingListSelected.id;
			const newRows = this.data.map((row) => {
				const newRow = { ...row };
				rowsQuantity.forEach((rowQuantity) => {
					if (row.autoBarcode === rowQuantity.autoBarcode
						&& row.warProductId === rowQuantity.warProductId) {
						newRow.quantity = rowQuantity.quantity;
					}
				});
				newRow.pricePerSale = row.priceList && row.priceList[listOfPrice] ?
					row.priceList[listOfPrice].price : 0;
				if (row.priceList && row.priceList[listOfPrice]) {
					row.priceList[listOfPrice].ranges.forEach((range) => {
						if (newRow.quantity && (newRow.quantity > (range.from - 1)
							&& newRow.quantity < (range.to + 1))) {
							newRow.pricePerWholeSale = range.price;
						} else {
							newRow.pricePerWholeSale = 0;
						}
					});
				}
				return newRow;
			});
			this.rows = newRows.filter(newRow => !newRow.isDeleted);
		}
	}

	function callServiceAndSearchDetails(searchValue) {
		this.localSearch = searchValue;
		if (searchValue) {
			const rowsFilter = this.rows.filter(item =>
				(item.product.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1)
				|| (item.product.code.toLowerCase().indexOf(searchValue.toLowerCase()) > -1)
				|| (item.product.description.toLowerCase().indexOf(searchValue.toLowerCase()) > -1));
			this.rows = rowsFilter;
		} else {
			const rowsQuantity = this.rows.filter(row => row.quantity && row.quantity !== 0);
			const newRows = this.data.map((row) => {
				const newRow = Object.assign({}, row);
				rowsQuantity.forEach((rowQuantity) => {
					if (row.product.autoBarcode === rowQuantity.product.autoBarcode
						&& row.warProductId === rowQuantity.warProductId) {
						newRow.quantity = rowQuantity.quantity;
					}
				});
				return newRow;
			});
			this.rows = newRows;
		}
	}

	function changePriceList({ id }) {
		this.rows = this.rows.map((row) => {
			const newRow = Object.assign({}, row);
			newRow.quantity = row.quantity ? row.quantity : 1;
			if (newRow.product) {
				newRow.pricePerSale = row.product.priceList && row.product.priceList[id] ?
					row.product.priceList[id].price : 0;
				newRow.pricePerWholeSale = row.product.priceList && row.product.priceList[id] ?
					row.product.priceList[id].wholeSalePrice : 0;
			} else {
				newRow.pricePerSale = row.priceList && row.priceList[id] ? row.priceList[id].price : 0;
				if (row.priceList && row.priceList[id]) {
					row.priceList[id].ranges.forEach((range) => {
						if (newRow.quantity && (newRow.quantity > (range.from - 1)
							&& newRow.quantity < (range.to + 1))) {
							newRow.pricePerWholeSale = range.price;
						} else {
							newRow.pricePerWholeSale = 0;
						}
					});
				}
			}
			return newRow;
		});
	}

	function clearModal() {
		this.customer = {
			fullName: '',
		};
		this.customers = [];
		this.listPricing = [];
		this.pricingListSelected = null;
		this.data = [];
		this.rows = [];
	}

	function closeModal() {
		this.clearModal();
		this.$emit('cancel-modal', false);
	}

	function created() {
		const newDate = new Date();
		this.dateOnline = newDate.getTime().toString();
		this.today = this.$today();
		this.flagIgv = this.$userInfo.company.flagIgv;
		this.defaultCurrency = this.$userInfo.company.currency;
		this.salesCurrency = this.$userInfo.company.currency;
		this.columns = this.updateColumns(this.$userInfo, this.columns);
		Sale.user = this.$userInfo;
		this.generalTaxes = helper.getLocalData('general-taxes') || [];
		this.loadData();
	}

	function updateColumns(user, columns) {
		const taxLabel = user.company && user.company.country ? user.company.country.taxName : null;
		if (taxLabel) {
			const item = find(equality('value', 'taxes'), columns);
			return map(
				updateItemInCollection(item, 'value', 'name', `% ${taxLabel}`),
				columns,
			);
		}
		return columns;
	}

	function deleteRow(code, id) {
		const index = this.rows.findIndex(rowData => (rowData.autoBarcode
			=== code && rowData.warProductId === id) || (rowData.product
			&& rowData.product.autoBarcode === code
			&& rowData.product.warehouseProductId === id));
		this.data = this.data.map((row) => {
			const newRow = { ...row };
			if ((row && row.autoBarcode === code && row.warProductId === id)
				|| (row.product && row.product.autoBarcode === code
				&& row.product.warehouseProductId === id)) {
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

	async function loadData() {
		const request = [
			this.listPricingPromise(),
			this.exchangeByDate(),
			this.getCurrencies(),
			this.listOfUnits(),
		];
		if (this.isQuickSale) {
			request.push(
				this.getTypeDocuments('sales'),
				this.getPaymentsMethods(),
				this.getTypePayments('sales'),
				this.getBankAccount(),
			);
		}
		if (this.saleData && this.saleData.customer) {
			const saleCustomer = this.saleData.customer;
			saleCustomer.fullName = `${saleCustomer.name} ${saleCustomer.lastname}`;
			this.customer = saleCustomer;
			this.typePayment = this.saleData.payment ? this.saleData.payment.id : this.saleData.payment;
			this.cash = this.saleData.amountCash;
			this.creditCardAmount = this.saleData.amountCredit;
			this.typeCard = this.saleData.creditCardName;
		}
		try {
			const responses = await Promise.all(request);
			this.listPricing = responses[0].data;
			this.exchangeRate = responses[1].data.amount;
			this.currencies = responses[2].data;
			this.units = responses[3].data;
			if (responses[4] && this.isQuickSale) {
				this.typeDocuments = responses[4].data.filter(newDocument =>
					newDocument.documentType.code === 'BOL'
					|| newDocument.documentType.code === 'FAC'
					|| newDocument.documentType.code === 'NTV');
			} else {
				this.typeDocuments = [];
				this.paymentMethods = [];
				this.typeCards = [];
			}
			if (responses[5] && responses[6] && responses[7]) {
				this.paymentMethods = responses[5].data;
				this.typesPayments = responses[6].data.map((c) => {
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
					return newC;
				});
				this.bankAccounts = responses[7].data;
			}
			this.pricingListSelected = this.listPricing.length > 0 ? this.listPricing[0] : null;
			const listOfPrice = this.pricingListSelected.id;
			this.data = this.dataSelected.map((row) => {
				const newRow = Object.assign({}, row);
				newRow.isDeleted = false;
				const unitByProd = {
					id: row.unitId,
					code: row.unitCode,
					name: row.unitName,
				};
				newRow.units = row.conversions ?
					this.unitsByProduct(row) : [{ ...unitByProd }];
				newRow.unitConversion = 1;
				newRow.unitQuantity = row.quantity;
				if (row.product) {
					newRow.pricePerSale = row.product.priceList && row.product.priceList[listOfPrice] ?
						row.product.priceList[listOfPrice].price : 0;
					newRow.pricePerWholeSale = row.product.priceList && row.product.priceList[listOfPrice] ?
						row.product.priceList[listOfPrice].wholeSalePrice : 0;
				} else {
					newRow.pricePerSale = row.priceList && row.priceList[listOfPrice] ?
						row.priceList[listOfPrice].price : 0;
					if (row.priceList && row.priceList[listOfPrice]) {
						row.priceList[listOfPrice].ranges.forEach((range) => {
							if (newRow.quantity && (newRow.quantity > (range.from - 1)
								&& newRow.quantity < (range.to + 1))) {
								newRow.pricePerWholeSale = range.price;
							} else {
								newRow.pricePerWholeSale = 0;
							}
						});
					}
				}
				return newRow;
			});
			this.rows = await Sale.formattedProducts(this.data, this.listPricing, this.generalTaxes);
		} catch (err) {
			this.showGenericError();
		}
	}

	function priceAmounts() {
		const saleId = !!this.$route.query.cloneId;
		this.rows = Sale.priceAmounts(
			this.rows,
			this.defaultCurrency,
			this.salesCurrency,
			this.exchangeRate,
			saleId,
		);
		return Sale.getAmounts(
			this.rows,
			this.defaultCurrency,
			// this.salesCurrency,
			// this.exchangeRate,
			// saleId,
		);
	}

	function filteredCustomers() {
		return this.customers;
	}

	function isQuickQuotation() {
		return this.pageCode === 'quick-quotation';
	}

	function isQuickSale() {
		return this.pageCode === 'quick-sale';
	}

	function typeDocument() {
		this.customer = {};
	}

	function search(val) {
		return this.searchCustomers(val);
	}

	async function searchCustomers(value) {
		const searchTrim = value ? value.trim() : '';
		const customerAlreadySelected = searchTrim && this.customer.fullName &&
			(searchTrim.toLowerCase() === this.customer.fullName.toLowerCase());
		if (searchTrim && !customerAlreadySelected) {
			this.loading = true;
			try {
				const response = await this.customerSelections(searchTrim);
				this.customers = response.data.map((customer) => {
					const newCustomer = Object.assign({}, customer);
					newCustomer.fullName = customer.typePerson.fullName;
					return newCustomer;
				});
				this.loading = false;
			} catch (err) {
				this.showNotification('Ocurrió un error en el servidor al intentar cargar la data', 'error');
				this.loading = false;
			}
		}
	}

	function toggleColumns() {
		return true;
	}

	function remove(item) {
		this.paymentsSelected.splice(this.paymentsSelected.indexOf(item), 1);
		this.paymentsSelected = [...this.paymentsSelected];
	}

	function updatePayAmounts() {
		this.setCashAndCreditAmount(this.paymentsSelectedFn);
	}

	function setCashAndCreditAmount(collection) {
		const cash = collection.find(
			c => c.code === 'efectivo' || c.code === 'cash-dollars',
		);
		this.cash = cash ? cash.paid : 0;
		this.creditCardAmount = collection
			.map((c) => {
				const newC = { ...c };
				if (!c.paid) newC.paid = 0;
				return newC;
			})
			.filter(f => f.code !== 'efectivo' && f.code !== 'cash-dollars')
			.reduce((acc, el) => acc + el.paid, 0);
	}

	function paymentsSelectedFn() {
		let paymentsSelected = [...this.paymentsSelected];
		if (this.paymentsSelected.length >= 0) {
			const total = this.priceAmounts.total;
			const divider = this.paymentsSelected.length;
			paymentsSelected = this.paymentsSelected.map(distributeAmount(total, divider));
			this.setCashAndCreditAmount(paymentsSelected);
		}
		return paymentsSelected;
	}

	function getPaid(type, cash, cards, quotes) {
		if (type === 'CONTADO') {
			return round2(cash + cards);
		}
		return quotes.reduce((acc, quote) => acc + quote.amount, 0);
	}

	function updatePay() {
		const total = this.priceAmounts.total;
		const paid = this.getPaid(
			this.typePayment,
			this.cash,
			this.creditCardAmount,
			this.quotesComplete,
		);
		const rest = total > paid ? round2(total - paid) : 0;
		const change = paid > total ? round2(paid - total) : 0;
		return {
			change,
			paid,
			rest,
		};
	}

	function watcherTypePayment() {
		if (this.typePayment === 'CREDITO') {
			this.paymentsSelected = [];
			this.cash = 0;
			this.creditCardAmount = 0;
		} else {
			this.quotesComplete = [];
			this.quotes = null;
		}
	}

	function cashTypePayment() {
		return this.typePayment === 'CONTADO';
	}

	function creditTypePayment() {
		return this.typePayment === 'CREDITO';
	}

	function salesCurrencySymbol() {
		if (this.currencies.length > 0) {
			return this.currencies.find(c => c.code === this.salesCurrency).symbol;
		}
		return null;
	}

	function validateExchangeRate(value) {
		let newValue = Number(value);
		if (newValue < 1) {
			newValue = 1;
		}
		this.exchangeRate = newValue;
	}

	function updatePriceList(product) {
		this.rows = this.rows.map((p) => {
			const newP = { ...p };
			if (product.id === p.id
				&& product.brandId === p.brandId
				&& product.warWarehouseId === p.warWarehouseId) {
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

	function getConversionQuantity(product, value, conversion, unitBaseFlag) {
		if (!unitBaseFlag) {
			return getDeeper('conversions', value.id, 'quantity')(product) || conversion.quantity || 1;
		}
		return 1;
	}

	function setData({ model, value }, row, flagUnitChanged) {
		const newRow = Sale.updateByUnitChange(model, value, row, flagUnitChanged);
		if (flagUnitChanged) {
			const matchProperty = newRow.warWarehouseProductBrandId
				? 'warWarehouseProductBrandId' : 'id';
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
				const index = keys.findIndex(k => Number(k) === unt.id);
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

	function stopClick() {
		return false;
	}

	function isNotTypeCash({ code }) {
		return code !== 'efectivo' || code !== 'cash-dollars';
	}

	function openForm(cards) {
		const { id, open, code } = cards;
		const cc = this.paymentsSelected.find(c => c.id === id);
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
		return open && (typePaymentForm[type] === flagForm);
	}

	function setDepositData({ code, model, newValue }) {
		const deposit = this.paymentsSelected.find(c => c.code === code);
		if (model === 'dateReference') {
			this.$set(deposit.deposit.additionalInformation, model, newValue);
		} else {
			this.$set(deposit.deposit, model, newValue);
		}
	}

	function setCheckData({ code, model, newValue }) {
		const check = this.paymentsSelected.find(c => c.code === code);
		if (model === 'dateReference') {
			this.$set(check.check.additionalInformation, model, newValue);
		} else {
			this.$set(check.check, model, newValue);
		}
	}

	function setCardData({ code, model, newValue }) {
		const card = this.paymentsSelected.find(c => c.code === code);
		this.$set(card.card, model, newValue);
	}
	
	function columnInput(event) {
		const val = Number(event.event.target.value);
		this.rows = Sales.applyDiscountToAllItems(val, this.rows);
	}

	function setNewCustomer(newCustomer) {
		if (newCustomer) {
			this.customer = { ...newCustomer };
			if (newCustomer.flagActive === 0) {
				this.showNotification(
					'El cliente se encuentra bloqueado, no se pude continuar con la cotización.',
					'warning',
				);
			}
		}
	}

	function blockedCustomer() {
		return this.customer.flagActive === 0;
	}

	function salesCurrency(newValue, oldValue) {
		const conversion = oldValue === 'PEN' ? 1 / this.exchangeRate : this.exchangeRate;
		this.rows = this.rows.map((d) => {
			const newD = { ...d };
			newD.price *= conversion;
			return newD;
		});
	}

	function data() {
		return {
			bankAccounts: [],
			cash: null,
			columns: [
				{ id: 1, name: 'Número', value: 'autoBarcode', visible: true, checked: true },
				{ id: 2, name: 'Almacén', value: 'warehouse', visible: true, checked: true },
				{ id: 3, name: 'Código', value: 'code', visible: true, checked: true },
				{ id: 4, name: 'Nombre', value: 'name', visible: true, checked: true },
				{ id: 5, name: 'Descripción', value: 'description', visible: true, checked: true },
				{ id: 6, name: 'Lista de Precios', value: 'priceList', visible: false, checked: false },
				{ id: 7, name: 'Cantidad', value: 'quantity', visible: true, checked: true },
				{ id: 8, name: 'Precio Unitario', value: 'priceUnitary', visible: true, checked: true },
				{ id: 9, name: 'PVP', value: 'pricePerSale', visible: true, checked: true },
				{ id: 10, name: 'Unidad', value: 'unitName', visible: true, checked: true },
				{ id: 11, name: 'Stock', value: 'stock', visible: true, checked: true },
				{
					id: 12,
					name: 'Descuento (%)',
					value: 'discountPercentage',
					visible: true,
					checked: true,
					showInput: false,
					isEditable: true,
				},
				{ id: 13, name: '', value: 'taxes', visible: true, checked: true },
				{ id: 14, name: 'Total', value: 'total', visible: true, checked: true },
				{ id: 15, name: 'Acciones', visible: true, checked: true, flagVisible: true },
			],
			commentary: '',
			conversion: 0,
			creditCardAmount: null,
			customer: {
				fullName: '',
			},
			customers: [],
			currencies: [],
			data: [],
			dateOnline: '',
			defaultCurrency: '',
			exchangeRate: null,
			flagIgv: 0,
			generalTaxes: [],
			isLoading: false,
			keyValue: 'warProductId',
			listPricing: [],
			localSearch: '',
			loading: false,
			paymentMethods: [],
			paymentsSelected: [],
			pricingListSelected: null,
			quotes: null,
			quotesComplete: [],
			rows: [],
			saleDetailsKeyValue: 'warProductsId',
			salesCurrency: '',
			search: null,
			today: null,
			typeCard: null,
			typeCards: [],
			typeDocument: 'BOL',
			typeDocuments: [],
			typePayment: null,
			typesPayments: [],
			units: [],
		};
	}

	export default {
		name: 'fast-products-action',
		components: {
			appTable,
			bankDepositForm,
			cardForm,
			checkForm,
			modalSidebarButton,
		},
		computed: {
			applyDisabled,
			blockedCustomer,
			cashTypePayment,
			creditTypePayment,
			document,
			filteredCustomers,
			isQuickQuotation,
			isQuickSale,
			paymentsSelectedFn,
			priceAmounts,
			salesCurrencySymbol,
			updatePay,
		},
		created,
		data,
		methods: {
			addQuote,
			allowedDates,
			applyFilter,
			callServiceAndSearch,
			callServiceAndSearchDetails,
			changePriceList,
			clearModal,
			closeModal,
			columnInput,
			editDiscount,
			editPricePerSale,
			editPriceUnitary,
			deleteRow,
			getConversionQuantity,
			getPaid,
			isActiveForm,
			isNotTypeCash,
			loadData,
			openForm,
			quantityValidation,
			remove,
			searchCustomers: helper.debounce(searchCustomers),
			setCardData,
			setCashAndCreditAmount,
			setCheckData,
			setNewCustomer,
			setData,
			setDepositData,
			stopClick,
			toggleColumns,
			unitsByProduct,
			updateColumns,
			updatePayAmounts,
			updatePriceList,
			validateExchangeRate,
			watcherTypePayment,
		},
		props: {
			dataSelected: {
				default: () => [],
				required: true,
				type: Array,
			},
			pageCode: {
				default: '',
				type: String,
			},
			saleData: {
				default: () => {},
				type: Object,
			},
		},
		watch: {
			search,
			typeDocument,
			typePayment: watcherTypePayment,
			salesCurrency,
		},
	};
</script>

<style lang="scss" scoped>
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

	.list-title {
		color: map-get($colors, paginationText);
		font-family: map-get($fonts, open-semibold);
		font-size: map-get($sizes, medium18);
		padding-left: 30px;

		@media (min-width: 768px) {
			padding-left: 0px;
		}
	}

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

	.radio-group.sale-radio {
		height: 19px;
		padding: 0px;

		.input-group__input {
			min-height: 19px;
		}
	}

	.col-opacity {
		opacity: .69;
	}

	.subheader {
		color: map-get($colors, background-card-black);
		font-family: map-get($fonts, open-regular);
		font-size: map-get($sizes, medium);
	}
</style>
