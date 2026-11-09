import lib from '@/shared/lib';
import helper from '@/shared/helper';
import BasePrice from '@/shared/basePrice';
import { productsInstance } from '@/axios';
import TypeProduct from '@/shared/type-product';
import typePaymentForm from './type-payment-form';

const { formatPaymentDate } = helper;

const {
	compose,
	find,
	equality,
	getDeeper,
	matchBetweenArrays,
	map,
	setNewProperty,
	setNewPropertyByFunction,
} = lib;

const twoDecimals = lib.round(2);
const fourDecimals = lib.round(4);

class Sale {
	constructor() {
		this.change = 0;
		this.cashAmount = 0;
		this.cardAmount = {};
		this.cardsUsedToPay = [];
		this.composedProduct = {};
		this.groups = [];
		this.creditNoteData = {};
		this.creditCards = [];
		this.customer = {};
		this.currency = '';
		this.defaultAmounts = {
			totalDiscount: 0,
			subtotal: 0,
			tax: 0,
			total: 0,
			icbper: 0,
			free: 0,
		};
		this.defaultPriceList = {};
		this.isEditing = false;
		this.exchangeRate = 0;
		this.entryDate = '';
		this.generalTaxes = [];
		this.paymentsMethods = [];
		this.pricesList = [];
		this.quotationId = 0;
		this.saleDiscount = 0;
		this.salTypeDocumentId = 0;
		this.totalAmountCoupon = 0;
		this.typeDocuments = [];
		this.typeDocumentsSelected = '';
		this.units = [];
		this.user = {};
	}

	static plastic(product) {
		const { product: prodProduct, quantity } = product;
		if (prodProduct && prodProduct.taxes) {
			const plasticTaxes = prodProduct.taxes.find((t) => t.code === '07');
			if (lib.isEmpty(plasticTaxes)) {
				return false;
			}
		}
		const plasticLocalTaxes = JSON.parse(
			localStorage.getItem(`${process.env.STORAGE_USER_KEY}::tax-icb`)
		);
		const plasticLocalTaxAmount = getDeeper('taxIcbper', 'amount')(plasticLocalTaxes);
		const totalPlasticTax = twoDecimals(plasticLocalTaxAmount * quantity);
		return {
			...product,
			plasticTax: totalPlasticTax || plasticLocalTaxAmount,
		};
	}

	getAmounts(products, isPeru, totalAMountCoupon = 0) {
		if (products.length > 0) {
			const amounts = products.reduce(
				(acum, currentProduct) => {
					const isPlastic = Sale.plastic(currentProduct);
					const { discount, quantity, total } = currentProduct;
					const newAcum = acum;
					newAcum.icbper += isPlastic ? isPlastic.plasticTax : 0;
					newAcum.total += total;
					newAcum.totalOrigin = newAcum.total;
					newAcum.subtotal +=
						currentProduct.flagFree && isPeru
							? 0
							: Sale.getSubtotalWithoutTax(currentProduct);
					newAcum.totalDiscount += discount * quantity;
					newAcum.free += currentProduct.flagFree ? total : 0;
					return newAcum;
				},
				{ ...this.defaultAmounts }
			);
			amounts.total -= amounts.free;
			amounts.total -= totalAMountCoupon || 0;
			amounts.tax =
				amounts.coupons > 0 || totalAMountCoupon > 0
					? twoDecimals(
						amounts.total +
						(amounts.coupons || totalAMountCoupon) -
						(amounts.subtotal - amounts.totalDiscount)
					)
					: twoDecimals(amounts.total - (amounts.subtotal - amounts.totalDiscount));
			amounts.totalDiscount = twoDecimals(amounts.totalDiscount);
			amounts.total += amounts.icbper;
			return amounts;
		}
		return this.defaultAmounts;
	}

	getAmountsNoteCredit(products, isPeru, totalAMountCoupon = 0) {
		if (products.length > 0) {
			const amounts = products.reduce(
				(acum, currentProduct) => {
					const isPlastic = Sale.plastic(currentProduct);
					const { discount, quantity, total } = currentProduct;
					const newAcum = acum;
					newAcum.icbper += isPlastic && !currentProduct.flagFree ? isPlastic.plasticTax : 0;
					newAcum.total += total;
					newAcum.totalOrigin = newAcum.total;
					newAcum.subtotal +=
						currentProduct.flagFree && isPeru
							? 0
							: Sale.getSubtotalWithoutTax(currentProduct);
					newAcum.totalDiscount += discount * quantity;
					newAcum.free += currentProduct.flagFree ? total : 0;
					return newAcum;
				},
				{ ...this.defaultAmounts }
			);
			amounts.total -= amounts.free;
			amounts.total -= totalAMountCoupon || 0;
			amounts.tax =
				amounts.coupons > 0
					? fourDecimals(
						amounts.total + amounts.coupons - (amounts.subtotal - amounts.totalDiscount)
					)
					: fourDecimals(amounts.total - (amounts.subtotal - amounts.totalDiscount));
			amounts.totalDiscount = fourDecimals(amounts.totalDiscount);
			amounts.total += amounts.icbper;
			return amounts;
		}
		return this.defaultAmounts;
	}

	getAmountsQuoation(products, isPeru, totalAMountCoupon = 0) {
		if (products.length > 0) {
			const amounts = products.reduce(
				(acum, currentProduct) => {
					const isPlastic = Sale.plastic(currentProduct);
					const { discount, quantity, total } = currentProduct;
					const newAcum = acum;
					newAcum.icbper += isPlastic ? isPlastic.plasticTax : 0;
					newAcum.total += total;
					newAcum.totalOrigin = newAcum.total;
					newAcum.subtotal +=
						currentProduct.flagFree && isPeru
							? 0
							: Sale.getSubtotalWithoutTax(currentProduct);
					newAcum.totalDiscount += discount * quantity;
					newAcum.free += currentProduct.flagFree ? total : 0;
					return newAcum;
				},
				{ ...this.defaultAmounts }
			);
			amounts.total -= amounts.free;
			amounts.total -= totalAMountCoupon || 0;
			amounts.tax = twoDecimals(
				amounts.total - (amounts.subtotal - amounts.totalDiscount)
			);
			amounts.totalDiscount = twoDecimals(amounts.totalDiscount);
			amounts.total += amounts.icbper;
			return amounts;
		}
		return this.defaultAmounts;
	}

	static roundGreater(cashAmount, change) {
		const amount = twoDecimals(cashAmount - change);
		return Math.round((amount % 1) * 100) % 10 >= 6
			? Math.ceil(amount * 20) / 20
			: amount;
	}

	getTransaction() {
		const transaction = {
			currency: this.currency || this.user.company.currency,
			paymentDate: formatPaymentDate(this.entryDate) || formatPaymentDate(),
		};
		const transactions = [];
		this.cardsUsedToPay.forEach((p) => {
			const flag = p.flagForm;
			if (Number(flag) === typePaymentForm.Cash) {
				const newTransaction = { ...transaction };
				newTransaction.amount = Sale.roundGreater(this.cashAmount, this.change);
				newTransaction.paymentAmount = Sale.roundGreater(this.cashAmount, this.change);
				newTransaction.typePaymentId = p.id;
				transactions.push(newTransaction);
			} else if (Number(flag) === typePaymentForm.Card) {
				const newTransaction = { ...transaction };
				newTransaction.amount = p.paid + p.amountPercentage;
				newTransaction.paymentAmount = p.paid + p.amountPercentage;
				newTransaction.typePaymentId = p.id;
				newTransaction.bankAccountId = p.card.bankAccountId
					? p.card.bankAccountId.id || p.card.bankAccountId
					: null;
				newTransaction.documentNumber = p.card.documentNumber;
				transactions.push(newTransaction);
			} else if (Number(flag) === typePaymentForm.Deposit) {
				const newTransaction = { ...transaction };
				newTransaction.additionalInformation = {
					dateReference: formatPaymentDate(p.deposit.additionalInformation.dateReference),
				};
				newTransaction.reference = p.deposit.reference;
				newTransaction.paymentDate = formatPaymentDate(
					p.deposit.additionalInformation.dateReference
				);
				newTransaction.amount = p.paid;
				newTransaction.paymentAmount = p.paid;
				newTransaction.typePaymentId = p.id;
				newTransaction.bankAccountId = p.deposit.bankAccountId
					? p.deposit.bankAccountId.id || p.deposit.bankAccountId
					: null;
				newTransaction.documentNumber = p.deposit.documentNumber;
				newTransaction.urlImage = p.deposit.urlImage;
				transactions.push(newTransaction);
			} else if (Number(flag) === typePaymentForm.Note) {
				const newTransaction = { ...transaction };
				newTransaction.amount = p.creditNote.amount;
				newTransaction.paymentAmount = p.creditNote.amount;
				newTransaction.typePaymentId = p.id;
				newTransaction.ntcDocumentId = p.creditNote.id;
				newTransaction.documentNumber = p.documentNumber;
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
				newTransaction.bankAccountId = p.check.bankAccountId;
				newTransaction.documentNumber = p.check.documentNumber;
				newTransaction.reference = p.check.reference;
				transactions.push(newTransaction);
			}
		});
		const newTransactionIds = Array(transactions.length);
		for (let index = 0; index < newTransactionIds.length; index += 1) {
			newTransactionIds[index] = index + 1;
		}
		this.transactionId = newTransactionIds;
		return transactions;
	}

	quotes() {
		const newQuotes = [];
		this.fees.forEach((f) => {
			const newF = { ...f };
			if (newF.amount !== 0) {
				delete newF.menu;
				newQuotes.push(newF);
			}
		});
		return newQuotes;
	}

	data(obj) {
		const {
			basePrice,
			change,
			commentary,
			considerations,
			customer,
			dateOnline,
			dayImportTerm,
			// defaultCurrency,
			downPaymentDocumentsIds,
			exchangeRate,
			flagAdvance,
			flagFree,
			isPeru,
			products,
			quotationId,
			// saleId,
			showImportFields,
			state,
			urlImages,
			workToDo,
			tip,
			totalAmountCoupon,
			show10,
		} = obj;
		this.totalAdvance = obj.totalAdvance;
		this.cashAmount = obj.amountCash;
		this.cardAmount = obj.amountCredit;
		this.creditNoteData = obj.creditNoteData;
		this.cardsUsedToPay = obj.cardsUsedToPay;
		this.change = twoDecimals(change || 0);
		this.fees = obj.fees;
		this.typeSale = obj.typeSale || 'sales';
		this.paymentMethodId = obj.paymentMethodId;
		this.typeDocuments = obj.salTypePayment;
		this.typeDocumentsSelected = obj.typeDocumentsSelected || '';
		this.paymentsMethods = obj.paymentsMethods;
		this.salTypeDocumentId = obj.salTypeDocumentId;
		this.quotationId = obj.quotationId;
		this.entryDate = obj.entryDate;
		this.currency = obj.currency;
		this.totalAmountCoupon = obj.totalAmountCoupon;
		const amounts = this.getAmounts.call(this, products, isPeru, totalAmountCoupon);
		// const amountQuoation = this.getAmountsQuoation.call(
		// 	this, products, isPeru, totalAmountCoupon);
		const sale = {
			amount: twoDecimals(amounts.total),
			change: this.change,
			currency: this.currency,
			customerId: customer.id,
			dateOnline,
			details: this.productDetails(
				products,
				quotationId,
				showImportFields,
				flagFree,
				obj.notPoint,
				basePrice,
				isPeru,
				show10
			),
			discount: twoDecimals(obj.discount || amounts.totalDiscount || 0),
			commentary: commentary || '',
			exchangeRate,
			subtotal: fourDecimals(amounts.subtotal - amounts.totalDiscount),
			taxes: amounts.tax,
			totalTaxesAmount: this.getEcuadorTaxesAmounts(amounts, products),
			taxesAmount: this.getPeruTaxesAmounts(amounts, products),
			tip: tip || obj.costShipping,
			warehouseName: this.user.warehouse.name,
		};
		// const { totalTaxesAmount, taxesAmount } = sale;
		if (dayImportTerm && showImportFields) {
			sale.dayImportTerm = dayImportTerm;
		}
		if (this.typeSale === 'sales') {
			sale.amountCash = twoDecimals(this.cashAmount);
			sale.amountCredit = twoDecimals(this.cardAmount);
			sale.paymentMethodId = this.paymentMethodId;
			sale.detailsPayments =
				this.paymentMethodId === this.paymentsMethods.find((p) => p.code === 'CONTADO').id
					? []
					: this.quotes();
			sale.transactions = this.getTransaction();
			sale.transactionId = this.transactionId;
			const typeDocumentsSelected = this.typeDocumentsSelected;
			const saleDocument = this.typeDocuments.find(
				(t) => t.documentType.code === typeDocumentsSelected
			);
			sale.salDocumentsId = saleDocument.documentType.id;
			sale.urlImages = urlImages;
			if (typeof this.flagTransfer !== 'undefined') {
				sale.flagTransfer = this.flagTransfer;
			}
			if (typeof flagAdvance === 'boolean') {
				sale.flagAdvance = flagAdvance;
			}
			if (!lib.isEmpty(downPaymentDocumentsIds) && !flagAdvance) {
				sale.downPaymentDocumentsIds = downPaymentDocumentsIds;
			}
		} else {
			if (this.quotationId) {
				sale.salTypeDocumentId = this.salTypeDocumentId;
				sale.salStatesId = state;
			} else if (!this.quotationId) sale.transactions = [];
			sale.considerations = considerations;
			sale.workToDo = workToDo;
		}
		this.saleDiscount = 0;
		return sale;
	}

	getPeruTaxesAmounts(amounts, products) {
		const taxes = this.getTotalTaxesAmounts(amounts, products);
		return {
			discountAdvance: this.totalAdvance || undefined,
			recorded: taxes['01'],
			exonerated: taxes['02'] || 0,
			inactive: taxes['03'] || 0,
			export: taxes['04'] || 0,
			free: amounts.free, // 05
			icbper: taxes['07'] || 0,
		};
	}

	getEcuadorTaxesAmounts(amounts, products) {
		const taxes = this.getTotalTaxesAmounts(amounts, products);
		return {
			discountAdvance: this.totalAdvance || undefined,
			subtotal: taxes[2],
			subtotalIva: taxes[0],
			subtotalNoObjIva: taxes[6],
			subtotalExtIva: taxes[7],
			discount: taxes.totalDiscount,
			subtotalWithoutTax: taxes.subtotalWithoutTax,
			iva: taxes.iva,
			ice: 0,
			irbpnr: 0,
			tip: 0,
			total: taxes.total,
		};
	}

	static getAmountByTaxes(products, generalTaxes) {
		const productWithMatchingTaxes = map(
			setNewPropertyByFunction(
				'taxesValues',
				Sale.getMatchingTaxesValue(generalTaxes, 'value'),
				false
			),
			products
		);
		const optSub = {};
		const factorTaxIcb = helper.getLocalData('tax-icb')
			? helper.getLocalData('tax-icb').taxIcbper.amount
			: null;
		if (productWithMatchingTaxes.length > 0) {
			productWithMatchingTaxes.forEach((product) => {
				const { quantity, discount, flagFree } = product;
				const totalDiscount = discount * quantity;
				const subtotal = Sale.getSubtotalWithoutTax(product) - totalDiscount;

				// Si el producto se vende como gratuito (flagFree true)
				if (flagFree) {
					// Sumar solo a '05' (FREE)
					const hasFreeTax = product.taxesValues.some((tax) => tax.code === '05');
					if (hasFreeTax) {
						if (!optSub['05']) optSub['05'] = 0;
						optSub['05'] += subtotal;
					}

					// Aún debemos sumar ICBPER si aplica
					const icbperTax = product.taxesValues.find((tax) => tax.code === '07');
					if (icbperTax && factorTaxIcb) {
						if (!optSub['07']) optSub['07'] = 0;
						optSub['07'] += factorTaxIcb * quantity;
					}

					// IMPORTANTE: No sumar ningún impuesto principal
				} else {
					// Producto no es gratuito: procesar normalmente
					product.taxesValues.forEach((tax) => {
						const taxCode = tax.code;
						if (!optSub[taxCode]) optSub[taxCode] = 0;

						if (taxCode === '07') {
							// ICBPER
							optSub[taxCode] += factorTaxIcb * quantity;
						} else {
							// Principal o no-gratuito impuesto
							optSub[taxCode] += subtotal;
						}
					});
				}
			});
		}

		// const freeTax = Number(optSub['05']);
		// if (freeTax) {
		// 	optSub['01'] -= freeTax; // recorderd
		// 	optSub['02'] -= freeTax; // exonerated
		// }

		Object.keys(optSub).forEach((k) => {
			if (isNaN(optSub[k])) {
				optSub[k] = twoDecimals(optSub[k]);
			} else {
				optSub[k] = optSub[k];
			}
		});

		const percentageValue =
			(find(equality('code', '2'), generalTaxes) || {}).percentage || 0;
		optSub.iva = twoDecimals((optSub[2] || optSub['01']) * (percentageValue / 100)) || 0;
		optSub.subtotalWithoutTax = Object.keys(optSub).reduce((acc, tax) => {
			let newAccum = acc;
			if (tax !== '05') {
				newAccum = acc + optSub[tax];
			}
			return newAccum;
		}, 0);
		return optSub;
	}

	static getAmountTaxesList(products, generalTaxes) {
		const productWithMatchingTaxes = map(
			setNewPropertyByFunction(
				'taxesValues',
				Sale.getMatchingTaxesValue(generalTaxes, 'value'),
				false
			),
			products
		);
		const optSub = {};
		if (productWithMatchingTaxes.length > 0) {
			productWithMatchingTaxes.forEach((product) => {
				product.taxesValues.forEach((tax) => {
					const { discount, total, quantity } = product;
					const totalDiscount = discount * quantity;
					if (product.flagFree) {
						if (tax.code === '05') {
							if (!optSub[tax.code]) {
								optSub[tax.code] = 0;
							}
							optSub[tax.code] +=
								total - (Sale.getSubtotalWithoutTax(product) - totalDiscount);
						}
					} else if (optSub[tax.code]) {
						optSub[tax.code] +=
							total - (Sale.getSubtotalWithoutTax(product) - totalDiscount);
					} else {
						optSub[tax.code] = 0;
						optSub[tax.code] +=
							total - (Sale.getSubtotalWithoutTax(product) - totalDiscount);
					}
				});
			});
		}
		Object.keys(optSub).forEach((k) => {
			optSub[k] = twoDecimals(optSub[k]);
		});
		return optSub;
	}

	static getMatchingTaxesValue(generalTaxes, prop) {
		return function inner(item) {
			return matchBetweenArrays(
				[item.product.taxes, 'codePercentage'],
				[generalTaxes, prop]
			);
		};
	}

	getTotalTaxesAmounts(amounts, products) {
		const { totalDiscount, total, free } = amounts;
		const newGeneralTaxesAndPlasticCode = [
			...this.generalTaxes,
			{ code: '07', value: '07' },
		];
		const result = Sale.getAmountByTaxes(products, newGeneralTaxesAndPlasticCode);
		result.discount = totalDiscount;
		result.ice = 0;
		result.irbpnr = 0;
		result.tip = 0;
		result.free = free;
		result.total = total;
		return result;
	}

	getTaxeslist(amounts, products) {
		const { totalDiscount, total } = amounts;
		const result = Sale.getAmountTaxesList(products, this.generalTaxes);
		result.discount = totalDiscount;
		result.ice = 0;
		result.irbpnr = 0;
		result.tip = 0;
		result.total = total;
		return result;
	}

	pricesLists(pL) {
		this.pricesList = pL;
		this.defaultPriceList = pL.find((el) => el.flagDefault === 1);
	}

	async formattedProductsQuatation(
		products,
		pricesList,
		generalTaxes,
		importFields
		// saleId = false,
	) {
		if (pricesList) {
			this.pricesLists(pricesList);
		}
		if (generalTaxes) {
			this.generalTaxes = [...generalTaxes];
			this.generalTaxes = this.generalTaxes.map((p) => {
				const newRow = { ...p };
				newRow.idCodeReference = `${p.code}${p.percentage}`;
				newRow.show = true;
				return newRow;
			});
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
		let newProducts = [];
		if (products && products.length > 0) {
			newProducts = products.map((el, index) => {
				const newEl = { ...el };
				const quantity = el.quantity || 1;
				newEl.quantity = quantity;
				newEl.order = index + 1;
				newEl.priceList =
					typeof this.flagTransfer !== 'undefined' ? el.priceList : el.priceList;
				newEl.quantityNegative = false;
				if (this.defaultPriceList) {
					const priceListId = el.aditionalInformation
						? el.aditionalInformation.salPriceListId
						: 0;
					newEl.selectedPriceListId =
						priceListId || el.selectedPriceListId || this.defaultPriceList.id;
				} else if (pricesList) {
					newEl.selectedPriceListId = el.selectedPriceListId || pricesList[0].id;
				}

				newEl.salePrice = el.salePrice || el.price || 0;
				newEl.price = el.price || 0;
				newEl.discountPercentage = el.discountPercentage || 0;
				newEl.taxes = Sale.getTaxesByProductIdReference(this.generalTaxes, newEl);
				const priceObject = Sale.isPricesWithTaxes(
					this.isEditing,
					newEl,
					this.user.company.flagIgv
				);
				const unitPrice = priceObject.priceUnitary;
				newEl.priceUnitary = fourDecimals(unitPrice);
				newEl.discount = Sale.getDiscountAmount(newEl);
				newEl.pricePerSale = priceObject.pricePerSale;
				newEl.meterage = el.meterage || 0;
				newEl.parts = el.parts || 0;
				newEl.priceEdited = true;
				newEl.priceNegative = false;
				newEl.priceSaleMax = el.priceSaleMax || 0;
				newEl.subtotalWithoutTax = Sale.getSubtotalWithoutTax(newEl);
				newEl.total = Sale.getTotal(newEl);
				newEl.totalOld = Sale.getTotal(newEl);
				newEl.isSelected = el.flagUse === 0 || true;

				// Seccion - Producto Compuesto
				// guardar los productos compuestos en la variable groups
				newEl.isComposed = newEl.product.type === TypeProduct.Composed;
				if (newEl.isComposed) {
					this.groups = this.groups.concat(newEl);
				}
				// Seccion - Producto Compuesto

				if (importFields && el.quantityImport >= 0 && el.quantityAvailable >= 0) {
					newEl.quantityImport = el.quantityImport;
					newEl.quantityAvailable = el.quantityAvailable;
				}
				return newEl;
			});

			// verificar si existen productos compuestos para determinar stock de hijos
			if (this.groups.length > 0) {
				const composedIds = this.groups.map((g) => g.product.id);
				const warehouseId = this.groups[0].warWarehousesId || this.groups[0].warehouseId;
				const composedProducts = await Sale.getComposedProducts(composedIds, warehouseId);
				// console.log(newProducts, composedProducts);
				this.groups.forEach((pc) => {
					const { groups } = composedProducts.find((c) => c.id === pc.product.id);
					const stockOfChildren = Sale.checkStockOfChildren(pc.quantity, groups);
					if (!stockOfChildren) {
						console.log('No hay stock de los productos hijos');
						return;
					}
					const { isSalable, groups: children } = stockOfChildren;
					// console.log({ index, newProducts, groups: this.groups });
					const index = newProducts.findIndex((np) => np.id === pc.id);
					const currentComposedProduct = newProducts[index];
					if (currentComposedProduct) {
						currentComposedProduct.isSalable = isSalable;
						currentComposedProduct.groups = children;
						newProducts.splice(index, 1, currentComposedProduct);
					}
				});
			}
		}
		return newProducts;
	}

	async formattedProducts(
		products,
		pricesList,
		generalTaxes,
		// saleId = false,
		// isSelected = false,
		importFields
	) {
		if (pricesList) {
			this.pricesLists(pricesList);
		}
		if (generalTaxes) {
			this.generalTaxes = [...generalTaxes];
			this.generalTaxes = this.generalTaxes.map((p) => {
				const newRow = { ...p };
				newRow.idCodeReference = `${p.code}${p.percentage}`;
				newRow.show = true;
				return newRow;
			});
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
		let newProducts = [];
		if (products && products.length > 0) {
			newProducts = products.map((el, index) => {
				const newEl = { ...el };
				const quantity = el.quantity || 1;
				newEl.quantity = quantity;
				newEl.flagFree = Boolean(el.flagFree);
				newEl.flagControlSerie = el.flagControlSerie || 0;
				newEl.order = index + 1;
				newEl.priceList =
					typeof this.flagTransfer !== 'undefined' ? el.priceList : el.priceList;
				newEl.quantityNegative = false;
				if (this.defaultPriceList) {
					const priceListId = el.aditionalInformation
						? el.aditionalInformation.salPriceListId
						: 0;
					newEl.selectedPriceListId =
						priceListId || el.selectedPriceListId || this.defaultPriceList.id;
				} else if (pricesList) {
					newEl.selectedPriceListId = el.selectedPriceListId || pricesList[0].id;
				}
				newEl.salePrice = el.salePrice || el.price || Sale.getProductPrice(newEl);
				newEl.price = el.price || Sale.getProductPrice(newEl);
				newEl.discountPercentage = el.discountPercentage || 0;
				newEl.typeDocumentSelected = el.typeDocumentSelected;
				if (this.typeDocumentsSelected === 'NTV') {
					newEl.taxes = 0;
				} else {
					newEl.taxes = Sale.getTaxesByProductIdReference(this.generalTaxes, newEl);
				}
				const priceObject = Sale.isPricesWithTaxes(
					this.isEditing,
					newEl,
					this.user.company.flagIgv
				);
				newEl.unitId = el.unitId;
				const unitPrice = priceObject.priceUnitary;
				newEl.priceUnitary = fourDecimals(unitPrice);
				const discount = Sale.getDiscountAmount(newEl);
				newEl.discount = fourDecimals(discount);
				newEl.parts = el.parts || 0;
				newEl.pricePerSale = fourDecimals(priceObject.pricePerSale);
				newEl.location = el.aditionalInformation ? el.aditionalInformation.location : '';
				newEl.priceEdited = true;
				newEl.priceNegative = false;
				newEl.priceSaleMax = el.priceSaleMax || 0;
				newEl.subtotalWithoutTax = Sale.getSubtotalWithoutTax(newEl);
				newEl.total = Sale.getTotal(newEl);
				newEl.totalOld = Sale.getTotal(newEl);
				newEl.isSelected = el.flagUse !== 1;
				newEl.quantitySend = el.quantity - el.quantityDispatch;
				newEl.quantityOrigin = el.quantity;

				// Seccion - Producto Compuesto
				// guardar los productos compuestos en la variable groups
				newEl.isComposed = newEl.product.type === TypeProduct.Composed;
				if (newEl.isComposed) {
					this.groups = this.groups.concat(newEl);
				}
				// Seccion - Producto Compuesto

				if (importFields && el.quantityImport >= 0 && el.quantityAvailable >= 0) {
					newEl.quantityImport = el.quantityImport;
					newEl.quantityAvailable = el.quantityAvailable;
				}
				return newEl;
			});

			// verificar si existen productos compuestos para determinar stock de hijos
			if (this.groups.length > 0) {
				const composedIds = this.groups.map((g) => g.product.id);
				const warehouseId = this.groups[0].warWarehousesId || this.groups[0].warehouseId;
				const composedProducts = await Sale.getComposedProducts(composedIds, warehouseId);
				this.groups.forEach((pc) => {
					const { groups } = composedProducts.find((c) => c.id === pc.product.id);
					const { isSalable, groups: children } = Sale.checkStockOfChildren(
						pc.quantity,
						groups
					);

					const index = newProducts.findIndex((np) => np.id === pc.id);
					const currentComposedProduct = newProducts[index];
					currentComposedProduct.isSalable = isSalable;
					currentComposedProduct.groups = children;

					newProducts.splice(index, 1, currentComposedProduct);
				});
			}
		}
		return newProducts;
	}

	static async getComposedProducts(productsIds, warehouseId) {
		const ids = Array.isArray(productsIds) ? productsIds : [productsIds];

		const { data: composedArr } = await productsInstance.post('products/composed-stock', {
			productsComposed: ids,
			warehouseId,
		});

		return composedArr;
	}

	static getTaxesByProduct(generalTaxes, product) {
		const { codePercentage } = product.product
			? find(equality('flagSales', 1), product.product.taxes) || {}
			: find(equality('flagSales', 1), product.taxes) || {};
		const { percentage } = find(equality('code', codePercentage), generalTaxes) || {};
		return percentage || 0;
	}

	static getTaxesByProductIdReference(generalTaxes, product) {
		const { idCodeReference } = product.product
			? find(equality('flagSales', 1), product.product.taxes) || {}
			: find(equality('flagSales', 1), product.taxes) || {};
		const { percentage } =
			find(equality('idCodeReference', idCodeReference), generalTaxes) || {};
		return percentage || 0;
	}

	static getTotal(product) {
		const {
			discount,
			priceBaseToCalculate,
			pricePerSale,
			priceUnitary,
			quantity,
			taxes,
		} = product;
		const price =
			priceBaseToCalculate === BasePrice.PU
				? (priceUnitary - discount) * (1 + taxes / 100)
				: pricePerSale;
		return fourDecimals(price * quantity);
	}

	static updateBasePriceToCalculateTotal(priceBaseToCalculate, products) {
		return products.map(
			compose(
				setNewProperty('subtotalWithoutTax', Sale.getSubtotalWithoutTax),
				setNewProperty('total', Sale.getTotal),
				setNewProperty('priceBaseToCalculate', priceBaseToCalculate)
			)
		);
	}

	static getSubtotalWithoutTax(product) {
		const {
			discount,
			priceBaseToCalculate,
			priceUnitary,
			pricePerSale,
			// priceUnitaryReal,
			quantity,
			total,
			subTotal,
			taxes,
		} = product;
		if (priceBaseToCalculate === BasePrice.PU) {
			const subtotalByUnitPrice = priceUnitary * quantity;
			return subtotalByUnitPrice;
		}
		const finalTotal = total || subTotal || pricePerSale * quantity || 0;
		const totalDiscount = (discount || 0) * quantity;
		const subtotalByPricePerSale =
			lib.calculateSubtotalFromTotal(finalTotal, taxes) + totalDiscount;
		return fourDecimals(subtotalByPricePerSale);
	}

	static isPricesWithTaxesSale(isEditing, product, flagTaxes) {
		const {
			discountPercentage,
			flagAdvanceInvoice,
			price,
			priceList,
			salePrice,
			selectedPriceListId,
			taxes,
		} = product;
		const priceObj = {};
		let pricePerSale = isEditing
			? salePrice
			: salePrice || price || Sale.setTransferPrice(selectedPriceListId, priceList);
		pricePerSale *= flagAdvanceInvoice ? -1 : 1;
		const discountPercentageAmount = 1 - discountPercentage / 100 || 0;
		const plusTaxes = 1 + taxes / 100;
		const getPricesWithTaxes = () => {
			const priceWithOutTaxes = pricePerSale ? pricePerSale / plusTaxes : 0;
			// priceObj.priceUnitaryReal = priceWithOutTaxes;
			priceObj.priceUnitary = fourDecimals(priceWithOutTaxes);
			const pricePerSaleReal = priceWithOutTaxes * discountPercentageAmount * plusTaxes;
			priceObj.pricePerSale = fourDecimals(pricePerSaleReal);
		};
		if (flagTaxes) {
			getPricesWithTaxes();
		} else if ((!flagTaxes && !isEditing) || !salePrice) {
			priceObj.priceUnitary = fourDecimals(pricePerSale);
			priceObj.priceUnitaryReal = pricePerSale;
			const pricePerSaleReal = pricePerSale * plusTaxes * discountPercentageAmount;
			priceObj.pricePerSale = fourDecimals(pricePerSaleReal);
		} else if (!flagTaxes) {
			const priceUnitary = fourDecimals(pricePerSale / plusTaxes);
			priceObj.priceUnitary = fourDecimals(priceUnitary);
			priceObj.priceUnitaryReal = fourDecimals(priceUnitary);
			priceObj.pricePerSale = fourDecimals(
				priceUnitary * discountPercentageAmount * plusTaxes
			);
		} else {
			getPricesWithTaxes();
		}
		return priceObj;
	}

	static calculatediscount(priceListSelected, quantity, unitId) {
		let discountPercentage = priceListSelected.discount;
		const globalRange = priceListSelected.ranges[0];
		if (globalRange && quantity >= globalRange.from && quantity <= globalRange.to)
			discountPercentage = 0;
		const unitRange =
			priceListSelected.units &&
			priceListSelected.units[unitId] &&
			priceListSelected.units[unitId].ranges[0];
		if (unitRange && quantity >= unitRange.from && quantity <= unitRange.to)
			discountPercentage = 0;

		return discountPercentage;
	}

	static isPricesWithTaxes(isEditing, product, flagTaxes) {
		const {
			discountPercentage,
			flagAdvanceInvoice,
			price,
			priceList,
			salePrice,
			selectedPriceListId,
			taxes,
		} = product;
		const priceObj = {};
		let pricePerSale = isEditing
			? // el price se recalcula, cuando se cambia de conversion, etc
			// pero el pricePerSaleOrigin no, esto afecta al recalculo de P.Unitario al Editar Cotizacion
			salePrice || price
			: salePrice || price || Sale.setTransferPrice(selectedPriceListId, priceList);
		pricePerSale *= flagAdvanceInvoice ? -1 : 1;
		const discountPercentageAmount = 1 - discountPercentage / 100 || 0;
		const plusTaxes = 1 + taxes / 100;
		const getPricesWithTaxes = () => {
			const priceWithOutTaxes = pricePerSale ? pricePerSale / plusTaxes : 0;
			priceObj.priceUnitary = fourDecimals(priceWithOutTaxes);
			const pricePerSaleReal = priceWithOutTaxes * discountPercentageAmount * plusTaxes;
			priceObj.pricePerSale = fourDecimals(pricePerSaleReal);
		};
		if (flagTaxes) {
			getPricesWithTaxes();
		} else if ((!flagTaxes && !isEditing) || !salePrice) {
			priceObj.priceUnitary = fourDecimals(pricePerSale);
			priceObj.priceUnitaryReal = pricePerSale;
			const pricePerSaleReal = pricePerSale * plusTaxes * discountPercentageAmount;
			priceObj.pricePerSale = fourDecimals(pricePerSaleReal);
		} else if (!flagTaxes) {
			const priceUnitary = fourDecimals(pricePerSale / plusTaxes);
			priceObj.priceUnitary = fourDecimals(priceUnitary);
			priceObj.priceUnitaryReal = fourDecimals(priceUnitary);
			priceObj.pricePerSale =
				pricePerSale > 0
					? pricePerSale
					: fourDecimals(priceUnitary * discountPercentageAmount * plusTaxes);
		} else {
			getPricesWithTaxes();
		}
		return priceObj;
	}

	static setTransferPrice(selectedPriceListId, priceList) {
		const newPriceList =
			typeof priceList === 'string' ? JSON.parse(priceList) : priceList;
		const { price } = newPriceList[selectedPriceListId] || {};
		return price || 0;
	}

	static getPricePerSale(
		product,
		flagValidated = false,
		isOrder = false,
		isFormat = true
	) {
		const {
			discount,
			// flagFree,
			price,
			priceBaseToCalculate,
			pricePerSaleOrigin,
			priceUnitary,
			salePrice,
			taxes,
			pricePerSale,
		} = product;
		if (priceBaseToCalculate === BasePrice.PV) {
			let priceB = flagValidated
				? pricePerSaleOrigin
				: pricePerSale || price || salePrice;

			if (discount > 0) {
				const newPriceUnitary = priceUnitary - discount;
				const newPriceSale = fourDecimals((newPriceUnitary * (taxes + 100)) / 100);
				const priceSaleNtv = pricePerSaleOrigin - discount;

				if (isOrder) {
					priceB = priceSaleNtv;
				} else {
					priceB = taxes > 0 ? newPriceSale : priceSaleNtv;
				}
			}

			return fourDecimals(priceB);
		}
		const pricePerSaleByPriceUnitary = (priceUnitary - discount) * (1 + taxes / 100);
		return isFormat
			? fourDecimals(pricePerSaleByPriceUnitary)
			: pricePerSaleByPriceUnitary;
	}

	pricesListByProduct(product) {
		const pricesListInThisProduct = [];
		this.pricesList.forEach((p) => {
			const exist = product.priceList[p.id];
			if (exist) {
				exist.name = p.name;
				exist.id = p.id;
				exist.comCustomersId = p.comCustomersId;
				exist.comEmployeeId = p.comEmployeeId;
				exist.warWarehousesId = p.warWarehousesId;
				pricesListInThisProduct.push(exist);
			}
		});
		return pricesListInThisProduct;
	}

	static checkStockOfChildren(composedQuantity, groups) {
		const acc = [];
		const g = [];

		groups.forEach((child) => {
			const { stockWarehouse, quantity: q } = child;

			// la cantidad requerida debe ser menor o igual que el stock
			// para que sea vendible
			const quantityNeeded = composedQuantity * q;
			const isEnabled = quantityNeeded <= stockWarehouse;

			acc.push(isEnabled);

			// Agregar los productos al arreglo groups con `flagNotSalable`
			// de acuerdo al valor de isEnabled
			g.push(setNewProperty('flagChildSalable', isEnabled)(child));
		});

		// si los productos hijos tienen suficiente stock entonces es vendible
		const isSalable = acc.length >= 1 && acc.every((a) => a === true);

		return {
			groups: g,
			isSalable,
		};
	}

	static async addProductsSale(
		product,
		generalTaxes,
		user,
		flagImport,
		quotation,
		isEditing = false,
		customer,
		isPeru,
		typeDocumentsSelected,
		defaultCurrency,
		salesCurrency,
		exchangeRate
	) {
		const isNTV = typeDocumentsSelected === 'NTV';
		const newProduct = { ...(product.product || product) };
		const { flagFree, priceList } = newProduct;
		const {
			alternateCode,
			categoryId,
			conversions,
			features,
			flagControlSerie,
			model,
			cost,
			brandSpId,
			totalCost,
			taxCostPercentage,
			subCategory,
			// priceList,
		} = newProduct.product;
		const { quantity, selectedPriceListId, showNegative } = product;
		const { id: subCategoryId, name: subCategoryName } = subCategory || {};
		// obtener descuento del producto
		const priceListSelected = priceList[selectedPriceListId];
		let discountPercentage = Sale.calculatediscount(
			priceListSelected,
			quantity,
			newProduct.unitId
		);
		// si el producto es gratuito entonces el descuento es de 100%
		const validDiscount = discountPercentage > 0 ? fourDecimals(discountPercentage) : 0;
		discountPercentage = flagFree && !isPeru ? 100 : validDiscount;
		newProduct.brandId = getDeeper('brand', 'id')(newProduct);
		newProduct.brandName = product.showBrand
			? newProduct.brandName
			: getDeeper('brand', 'name')(newProduct);
		newProduct.attributeList = newProduct.attributeList || null;
		newProduct.priceSaleMax = newProduct.product.priceSaleMax;
		newProduct.priceSaleMin = newProduct.product.priceSaleMin || 0;
		newProduct.groupsProduct = newProduct.groupsProduct;
		newProduct.disabledExchange = false;
		newProduct.point = customer ? customer.point : null;
		newProduct.productPoint = null;
		newProduct.addProduct = true;
		newProduct.alternateCode = alternateCode || undefined;
		newProduct.totalCost = totalCost || 0;
		newProduct.taxCostPercentage = taxCostPercentage || 0;
		newProduct.cost = cost || 0;
		newProduct.priceList = priceList || product.product.priceList;
		newProduct.categoryId = categoryId;
		newProduct.subCategoryId = subCategoryId;
		newProduct.subCategoryName = subCategoryName;
		newProduct.brandSpId = brandSpId || undefined;
		newProduct.productCode = newProduct.code;
		newProduct.quantity = Math.abs(quantity);
		newProduct.selectedPriceListId = selectedPriceListId;
		newProduct.warProductsId = newProduct.productId;
		newProduct.isSelected = false;
		newProduct.discountPercentage = discountPercentage || 0;
		// newProduct.priceEdited = discountPercentage ? true :
		// 	Sale.setPriceEdited(this.isEditing, newProduct);
		newProduct.priceEdited = false;
		newProduct.unitQuantity = Sale.getUnitQuantity({
			...product.product,
			quantity,
		});
		if (isNTV) {
			newProduct.taxes = 0;
		} else {
			const taxes = Sale.getTaxesByProductIdReference(generalTaxes, newProduct);
			newProduct.taxes = taxes;
		}
		newProduct.price =
			Sale.getProductPrice(newProduct, defaultCurrency, salesCurrency, exchangeRate) || 0;
		const priceObject = Sale.isPricesWithTaxesSale(
			false,
			newProduct,
			user.company.flagIgv
		);
		newProduct.pricePerSaleOrigin =
			priceListSelected && priceListSelected.discount
				? priceListSelected.price
				: priceObject.pricePerSale;
		newProduct.priceUnitary = priceObject.priceUnitary;
		newProduct.priceUnitaryOrigin = priceObject.priceUnitary;
		newProduct.priceUnitaryReal = priceObject.priceUnitaryReal;
		newProduct.pricePerSale = priceObject.pricePerSale;
		newProduct.discount = Sale.getDiscountAmount(newProduct);
		// newProduct.pricePerSaleOrigin = priceObject.pricePerSale;
		newProduct.subtotalWithoutTax = Sale.getSubtotalWithoutTax(newProduct);
		newProduct.total = Sale.getTotal(newProduct);
		newProduct.totalOrigin = Sale.getTotal(newProduct);
		newProduct.id = isEditing ? null : newProduct.id;
		newProduct.conversions = conversions;
		newProduct.features = features;
		newProduct.flagControlSerie = flagControlSerie;
		newProduct.model = model;
		newProduct.isQuotation = quotation;
		if (quotation && flagImport) {
			if (newProduct.stock <= 0) {
				newProduct.quantityAvailable = 0;
				newProduct.quantityImport = quantity;
			} else if (newProduct.stock > 0 && newProduct.stock <= quantity) {
				newProduct.quantityAvailable = newProduct.stock;
				newProduct.quantityImport = quantity - newProduct.stock;
			} else {
				newProduct.quantityAvailable = quantity;
				newProduct.quantityImport = 0;
			}
		}
		newProduct.flagSales = newProduct.product.flagSales;

		// Seccion - Producto Compuesto
		newProduct.isComposed = newProduct.product.type === TypeProduct.Composed;
		if (newProduct.isComposed) {
			const { isSalable, groups } = await Sale.getChildrenProducts(
				newProduct.product.id,
				newProduct.warehouseId,
				newProduct.quantity
			);
			newProduct.isSalable = isSalable;
			newProduct.notStockComposed = showNegative === false && !isSalable;
			newProduct.groups = groups;
		}
		newProduct.priceEdited = true;
		// Seccion - Producto Compuesto

		return newProduct;
	}

	static getUnitQuantity(product) {
		const { quantity } = product;
		if (product.unitConversion) {
			return product.unitConversion * quantity;
		}
		return quantity;
	}

	static async addProducts(
		product,
		generalTaxes,
		user,
		flagImport,
		quotation,
		isEditing = false,
		customer,
		isPeru,
		defaultCurrency,
		salesCurrency,
		exchangeRate
	) {
		const newProduct = { ...product.product };
		newProduct.location = (product.product && product.product.location) || product.location || null;
		const { flagFree, priceList, isOrder } = newProduct;
		const {
			alternateCode,
			categoryId,
			conversions,
			features,
			flagControlSerie,
			model,
			subCategory,
			// priceList,
		} = newProduct.product;

		const { quantity, selectedPriceListId } = product;
		const { id: subCategoryId, name: subCategoryName } = subCategory || {};

		// obtener descuento del producto
		const priceListSelected = priceList[selectedPriceListId];
		let discountPercentage = priceListSelected ? priceListSelected.discount : 0;
		// si el producto es gratuito entonces el descuento es de 100%
		discountPercentage = flagFree && !isPeru ? 100 : discountPercentage;
		newProduct.priceSaleMax = newProduct.product.priceSaleMax;
		newProduct.priceSaleMin = newProduct.product.priceSaleMin;
		newProduct.quantityOld = Math.abs(quantity);
		newProduct.disabledExchange = false;
		newProduct.point = customer ? customer.point : null;
		newProduct.productPoint = null;
		newProduct.alternateCode = alternateCode || undefined;
		newProduct.priceList = priceList || product.product.priceList;
		newProduct.brandId = getDeeper('brand', 'id')(newProduct);
		newProduct.brandName = product.showBrand
			? newProduct.brandName
			: getDeeper('brand', 'name')(newProduct);
		newProduct.brandSpId = newProduct.brandSimpleId;
		newProduct.categoryId = categoryId;
		newProduct.subCategoryId = subCategoryId;
		newProduct.subCategoryName = subCategoryName;
		newProduct.productCode = newProduct.code;
		newProduct.quantity = Math.abs(quantity);
		newProduct.addProduct = true;
		newProduct.id = isEditing ? null : newProduct.id;
		newProduct.selectedPriceListId = selectedPriceListId;
		newProduct.warProductsId = newProduct.productId;
		newProduct.isSelected = true;
		newProduct.discountPercentage = discountPercentage;
		newProduct.priceEdited = false;
		newProduct.unitQuantity = Math.abs(quantity);
		newProduct.taxes = isOrder
			? Sale.getTaxesByProductIdReference(generalTaxes, newProduct)
			: Sale.getTaxesByProduct(generalTaxes, newProduct);
		newProduct.price =
			Sale.getProductPrice(newProduct, defaultCurrency, salesCurrency, exchangeRate) || 0;
		const priceObject = Sale.isPricesWithTaxes(false, newProduct, user.company.flagIgv);
		newProduct.priceUnitary = fourDecimals(priceObject.priceUnitary);
		// newProduct.priceUnitaryReal = priceObject.priceUnitaryReal.toFixed(4);
		newProduct.discount = Sale.getDiscountAmount(newProduct);
		newProduct.pricePerSale = priceObject.pricePerSale;
		newProduct.pricePerSaleOrigin = priceObject.pricePerSale;
		newProduct.subtotalWithoutTax = Sale.getSubtotalWithoutTax(newProduct);
		newProduct.total = Sale.getTotal(newProduct);
		newProduct.conversions = conversions;
		newProduct.features = features;
		newProduct.flagControlSerie = flagControlSerie;
		newProduct.model = model;
		newProduct.isQuotation = quotation;
		if (quotation) {
			newProduct.flagFree = product.flagFree;

			if (flagImport) {
				if (newProduct.stock <= 0) {
					newProduct.quantityAvailable = 0;
					newProduct.quantityImport = quantity;
				} else if (newProduct.stock > 0 && newProduct.stock <= quantity) {
					newProduct.quantityAvailable = newProduct.stock;
					newProduct.quantityImport = quantity - newProduct.stock;
				} else {
					newProduct.quantityAvailable = quantity;
					newProduct.quantityImport = 0;
				}
			}
		}
		newProduct.flagSales = newProduct.product.flagSales;

		// Seccion - Producto Compuesto
		newProduct.isComposed = newProduct.product.type === TypeProduct.Composed;
		if (newProduct.isComposed) {
			const { isSalable, groups } = await Sale.getChildrenProducts(
				newProduct.product.id,
				newProduct.warehouseId,
				newProduct.quantity
			);

			newProduct.isSalable = isSalable;
			newProduct.groups = groups;
		}
		// Seccion - Producto Compuesto
		newProduct.priceEdited = true;
		return newProduct;
	}

	/**
	 * @param {array} productsIds - arreglo de ids de productos a buscar
	 * @param {number} warehouseId - id del almacen
	 * @param {number} quantity - cantidad del producto compuesto
	 */
	static async getChildrenProducts(productsIds, warehouseId, quantity) {
		const ids = Array.isArray(productsIds) ? productsIds : [productsIds];

		const { data: composedArr } = await productsInstance.post('products/composed-stock', {
			productsComposed: ids,
			warehouseId,
		});

		const { isSalable, groups } = Sale.checkStockOfChildren(
			quantity,
			composedArr[0].groups
		);

		return {
			isSalable,
			groups,
		};
	}

	static round2Decimal(price) {
		const decimal = 2;
		return Math.round(price * 10 ** decimal) / 10 ** decimal;
	}

	static getProductPrice(
		product,
		defaultCurrency,
		salesCurrency,
		exchangeRate,
		saleId,
		flag = true
	) {
		const {
			priceList,
			selectedPriceListId,
			unitId,
			quantity,
			priceEdited,
			pricePerSale,
		} = product;
		if (priceEdited) {
			return pricePerSale;
		}
		const priceListSelected = priceList[selectedPriceListId] || {};
		const unitSelected = priceListSelected.units ? priceListSelected.units[unitId] : null;
		const listPrice = saleId ? product.price : priceListSelected.price || 0;
		const listRanges = priceListSelected.ranges || [];
		const listRangeApply = listRanges.find(
			(lr) => quantity >= lr.from && quantity <= lr.to
		);
		const unitPrice = unitSelected ? unitSelected.price || listPrice : 0;
		const unitRanges = unitSelected ? unitSelected.ranges : [];
		const rangeApply = unitRanges.find((ur) => quantity >= ur.from && quantity <= ur.to);
		const conversionUnitPrice = rangeApply ? rangeApply.price : unitPrice;
		const conversionListPrice = listRangeApply ? listRangeApply.price : listPrice;
		let newPrice = unitSelected ? conversionUnitPrice : conversionListPrice;
		if (flag) {
			newPrice *= this.getConversion(defaultCurrency, salesCurrency, exchangeRate);
		}
		newPrice = fourDecimals(newPrice);
		return newPrice;
	}

	static getConversion(defaultCurrency, currency, exchangeRate) {
		if (defaultCurrency !== currency) {
			return defaultCurrency === 'PEN' ? 1 / exchangeRate : exchangeRate;
		}
		return 1;
	}

	static buildTaxes(product, basePrice) {
		const taxes =
			product.product.taxes.length === 1
				? product.product.taxes
				: product.product.taxes.filter((t) => t.flagSales || t.code === '07');
		const taxesProduct = taxes.map((tax) => {
			if (tax.code === '07') {
				const plasticLocalTaxes = JSON.parse(
					localStorage.getItem(`${process.env.STORAGE_USER_KEY}::tax-icb`)
				);
				const plasticLocalTaxAmount = getDeeper('taxIcbper', 'amount')(plasticLocalTaxes);
				const subtotalPlastic = twoDecimals(plasticLocalTaxAmount * product.quantity);
				return {
					amount: subtotalPlastic,
					code: tax.code,
					codePercentage: tax.codePercentage,
					percentage: 0,
					subtotal: subtotalPlastic,
					taxSchemeName: tax.name,
				};
			}
			let taxe = product.taxes;
			const generalTaxes = helper.getCompanyTaxesFlat();
			const isTaxFree = tax.code === '05';

			const newGeneralTaxes = generalTaxes.map((p) => {
				const newRow = { ...p };
				newRow.idCodeReference = `${p.code}${p.percentage}`;
				newRow.show = true;
				return newRow;
			});
			const index = newGeneralTaxes.findIndex(
				(g) => g.idCodeReference === tax.idCodeReference
			);
			if (index > -1) {
				taxe = generalTaxes[index].percentage;
			}
			let subtotal = (product.priceUnitary - product.discount) * product.quantity;
			if (basePrice) {
				if (basePrice === BasePrice.PV) {
					subtotal = lib.calculateSubtotalFromTotal(product.pricePerSale, taxe) * product.quantity;
				}
			}
			const amount = isTaxFree ? 0 : subtotal * (taxe / 100);
			return {
				amount: fourDecimals(amount),
				code: tax.code,
				codePercentage: tax.codePercentage,
				percentage: isTaxFree ? 0 : taxe,
				subtotal: isTaxFree ? product.total : twoDecimals(subtotal),
				taxSchemeName: tax.name || tax.taxSchemeName,
			};
		});
		if (!product.flagFree) {
			return taxesProduct.filter((t) => t.code !== '05');
		}
		return taxesProduct;
	}

	productDetails(
		products,
		quotationId,
		sendImportFields,
		flagFree,
		notPoint,
		basePrice,
		isPeru
	) {
		return products.map((p) => {
			const isNTV = this.typeDocumentsSelected === 'NTV';
			const tax = Sale.getTaxesByProductIdReference(this.generalTaxes, p);
			const buildTaxes = Sale.buildTaxes(p, basePrice);
			const salePrice = fourDecimals(Sale.getTotal(p) / p.quantity);
			const priceListId = p.selectedPriceListId
				? p.selectedPriceListId
				: p.additionalInformation && p.additionalInformation.salPriceListId;
			const grossSubtotalWithoutTax = Sale.getSubtotalWithoutTax(p);
			const newP = {
				alternateCode: p.alternateCode,
				// autoBarcode: p.product ? p.product.autoBarcode : null,
				brandId: p.brandId || (p.brands && p.brands.length > 0 ? p.brands[0].id : null),
				brandName: p.brandName,
				categoryId: p.categoryId,
				categoryName: p.categoryName,
				subCategoryId: p.subCategoryId,
				subCategoryName: p.subCategoryName,
				commentary: p.commentary,
				description: p.name,
				discount: fourDecimals(p.discount * p.quantity) || 0,
				discountPercentage: p.discountPercentage,
				price: isPeru && p.flagFree ? 0 : salePrice,
				priceCost: fourDecimals(
					p.product && p.product.cost >= 0 ? p.product.cost : p.cost
				),
				productCode: p.code,
				productType: p.product.type,
				productPoint: Number(p.productPoint),
				productCubsoCode: p.product.productCubsoCode || null,
				quantity: p.quantity,
				salePrice,
				stockQuantity: p.stock || 0,
				subtotalWithoutTax: grossSubtotalWithoutTax - p.discount * p.quantity,
				tax: isNTV ? 0 : tax,
				points: p.points,
				totalCost: p.totalCost || undefined,
				taxCostPercentage: p.taxCostPercentage || 0,
				taxAmount:
					isNTV ? 0 : fourDecimals(buildTaxes[0].amount),
				taxes: buildTaxes,
				priceSaleMin: p.priceSaleMin,
				unitCode: p.unitCode,
				unitConversion: p.unitConversion || 1,
				unitId: p.unitId,
				unitName: p.unitName,
				unitQuantity: Sale.getUnitQuantity(p),
				warProductsId: p.product.id || p.productId,
				brandSpId: p.brandSpId || (p.product && p.product.brandSpId) || undefined,
				warWarehousesId: p.warehouseId || p.warWarehousesId || undefined,
				warehouseName: p.warehouseName,
				flagControlSerie: p.flagControlSerie,
				groupType: p.groupType,
			};
			newP.unitPrice = isNTV
				? salePrice
				: p.quantity
					? lib.round(10)(grossSubtotalWithoutTax / p.quantity)
					: Sale.getPriceUnitary(p);
			// const priceListSelected = p.priceList[priceListId] || {};
			const pricelistProduct = p.product.priceList || p.priceList;
			const priceListSelected = pricelistProduct[priceListId] || {};
			const isTraceability =
				p.aditionalInformation && p.aditionalInformation.traceability;
			let comissions = lib.isEmpty(priceListSelected.comissions)
				? undefined
				: priceListSelected.comissions;
			if (p.unitId && priceListSelected.units && priceListSelected.units[p.unitId]) {
				const unitComissions = priceListSelected.units[p.unitId].comissions;
				if (!lib.isEmpty(unitComissions) && Object.keys(unitComissions).length > 0) {
					comissions = unitComissions;
				}
			}
			newP.aditionalInformation = {
				dynamicFields: {
					parts: p.parts || undefined,
					meterage: p.meterage || undefined,
				},
				groups: p.groupsProduct || [],
				autoBarcode: p.product ? p.product.autoBarcode : null,
				attributes: p.attributesString || undefined,
				descriptionProducts: p.product.description || p.name || undefined,
				location: (p.productLots ? p.productLots.location : p.location) || null,
				salPriceListId: priceListId,
				weight: p.weightProduct || p.product.weigth * p.unitConversion || undefined,
				productLotId: p.productLots ? p.productLots.productLotId || undefined : null,
				lot: (p.productLots ? p.productLots.lot : p.lot) || undefined,
				comissions: this.user.company.settings.flagSettlement ? comissions : undefined,
				traceability: p.traceability || isTraceability || undefined,
				// codeEan: p.productLots.codeEan || undefined,
				// date: p.productLots.date || undefined,
				expirationDate:
					(p.productLots ? p.productLots.expirationDate : p.expirationDate) || null,
				referenceDetailId:
					p.aditionalInformation?.referenceDetailId ||
					p.id ||
					null,
				unitBaseCode: p?.product?.unit?.code,
				unitBaseId: p?.product?.unit?.id,
				unitBaseName: p?.product?.unit?.name
			};
			if (p.isQuotation) {
				newP.additionalInformation = p.additionalInformation || undefined;
			}
			if (flagFree) {
				newP.flagFree = Boolean(p.flagFree) || false;
			}
			if (sendImportFields && p.quantityImport >= 0 && p.quantityAvailable >= 0) {
				newP.quantityImport = p.quantityImport;
				newP.quantityAvailable = p.quantityAvailable;
			}
			if (quotationId) {
				newP.id = p.id;
			}
			if (p.type === 2) {
				delete newP.warWarehousesId;
			}
			if (p.series) {
				newP.series = p.series;
			}
			if (notPoint) {
				delete newP.productPoint;
			}
			if (p.flagFree) {
				newP.freeAmount = twoDecimals(p.price);
				const index = p.product.taxes.findIndex((t) => t.code !== '05');
				if (index > -1) {
					newP.codeTaxes = p.product.taxes[index].codePercentage;
				}
			} else {
				newP.codeTaxes = (getDeeper('product', 'taxes')(p)[0] || {}).codePercentage;
			}
			return newP;
		});
	}

	static getDefaultPrice({ priceList, selectedPriceListId }) {
		const { price } = priceList[selectedPriceListId];
		return price;
	}

	unitsByProduct(product) {
		if (product.conversions) {
			const keys = Object.keys(product.conversions);
			const newUnits = this.units.reduce((acum, unt) => {
				const index = keys.findIndex((k) => Number(k) === unt.id);
				if (index > -1) {
					return acum.concat(unt);
				}
				return acum;
			}, []);
			if (product.unit) {
				newUnits.push(product.unit);
			} else {
				const unit = {
					id: product.unitId,
					code: product.unitCode,
					name: product.unitName,
				};
				newUnits.push(unit);
			}
			return newUnits;
		}
		return [];
	}

	static getConversionQuantity(product, value, conversion, unitBaseFlag) {
		if (!unitBaseFlag) {
			return (
				(conversion && conversion.quantity) ||
				getDeeper('conversions', value.id, 'quantity')(product) ||
				1
			);
		}
		return 1;
	}

	updateByUnitChange(
		model,
		value,
		row,
		flagUnitChanged,
		exchangeRate,
		salesCurrency = ''
	) {
		const { priceList, selectedPriceListId, product, quantity, conversions, salePrice } =
			row;
		const { conversions: conversionProduct } = row.product;
		const validConversions = conversions || conversionProduct;
		const isUnitBase = validConversions ? !validConversions[value.id] : true;
		const conversionsValue = conversions && conversions[value.id];
		const priceListSelected = priceList[selectedPriceListId];
		const unitSelected = priceListSelected.units
			? priceListSelected.units[value.id]
			: null;
		const listPrice =
			value.flagDefault || isUnitBase
				? priceListSelected.price
				: salePrice || priceListSelected.price || 0;
		const listRanges = priceListSelected.ranges;
		const listRangeApply = listRanges.find(
			(lr) => quantity >= lr.from && quantity <= lr.to
		);
		const unitPrice = unitSelected ? unitSelected.price : 0;
		const unitRanges = unitSelected ? unitSelected.ranges : [];
		const rangeApply = unitRanges.find((ur) => quantity >= ur.from && quantity <= ur.to);
		const conversionUnitPrice = rangeApply ? rangeApply.price : unitPrice;
		const conversionListPrice = listRangeApply ? listRangeApply.price : listPrice;
		const newPrice = unitSelected ? conversionUnitPrice : conversionListPrice;
		const conversionQuantity = Sale.getConversionQuantity(
			product,
			value,
			conversionsValue,
			isUnitBase
		);
		const unitQuantityValue = Sale.getUnitQuantity({
			...row,
			unitConversion: conversionQuantity,
		});
		// const unitQuantity = quantity * conversionQuantity;
		let newRow = compose(
			setNewProperty(model, value.id),
			setNewProperty('unitConversion', conversionQuantity),
			setNewProperty('unitName', value.name),
			setNewProperty('unitQuantity', unitQuantityValue),
			setNewProperty('unitCode', value.code)
		)(row);
		if (row.priceEdited || flagUnitChanged) {
			const priceListDisc = unitSelected || priceListSelected;
			const discountPerceng = Sale.calculatediscount(priceListDisc, quantity, null);
			const exchange = Sale.getExchange(exchangeRate);
			const price =
				salesCurrency === 'USD' ? Sale.getExchange(newPrice / exchange) : newPrice;
			newRow = compose(
				setNewProperty('salePrice', price),
				setNewProperty('price', price),
				setNewProperty('pricePerSale', (price * (100 - discountPerceng)) / 100),
				setNewProperty('pricePerSaleOrigin', newPrice),
				setNewProperty('discountPercentage', discountPerceng),
				setNewProperty('priceEdited', true)
			)(newRow);
			const { priceUnitary, pricePerSale } = Sale.isPricesWithTaxes(
				this.isEditing,
				newRow,
				this.user.company.flagIgv
			);
			newRow = setNewProperty('salePrice', pricePerSale)(newRow);
			newRow = setNewProperty('priceUnitary', priceUnitary)(newRow);
		} else if (row.priceEdited && !flagUnitChanged) {
			// const { pricePerSale, priceUnitary } = Sale.isPricesWithTaxes(
			// 	this.isEditing,
			// 	newRow,
			// 	this.user.company.flagIgv,
			// );
			newRow = compose(
				setNewProperty('price', row.pricePerSale),
				setNewProperty('priceUnitary', row.priceUnitary)
			)(newRow);
		} else if (row.parts || row.meterage) {
			setNewProperty('salePrice', row.price);
			setNewProperty('price', row.price);
			setNewProperty('pricePerSale', row.price);
			setNewProperty('priceEdited', false);
		} else if (!row.priceEdited) {
			const priceListEdit = unitSelected || priceListSelected;
			const discountPerceng = Sale.getPriceForQuantity(priceListEdit, quantity)
				? 0
				: priceListEdit.discount || 0;
			newRow = compose(
				setNewProperty('priceUnitaryReal', ({ taxes }) => newPrice / `1.${taxes}`),
				setNewProperty('price', newPrice),
				setNewProperty('salePrice', newPrice),
				setNewProperty('discountPercentage', discountPerceng),
				setNewProperty('priceEdited', true)
			)(newRow);
			const { pricePerSale, priceUnitary } = Sale.isPricesWithTaxes(
				this.isEditing,
				newRow,
				this.user.company.flagIgv
			);
			newRow = compose(
				setNewProperty('priceUnitary', priceUnitary),
				setNewProperty('pricePerSale', pricePerSale)
			)(newRow);
		}
		const discount = newRow.priceUnitary * (Number(newRow.discountPercentage) / 100);
		newRow = setNewProperty('discount', discount)(newRow);
		newRow = setNewProperty('total', Sale.getTotal)(newRow);
		newRow = setNewProperty('totalOrigin', Sale.getTotal)(newRow);
		newRow = setNewProperty('subtotalWithoutTax', Sale.getSubtotalWithoutTax)(newRow);
		return newRow;
	}

	updateByUnitChangeQuotation(model, value, row, flagUnitChanged) {
		const { priceList, selectedPriceListId, product, quantity, conversions } = row;

		const { conversions: conversionProduct } = row.product;
		const validConversions = conversions || conversionProduct;
		const isUnitBase = validConversions ? !validConversions[value.id] : true;
		const conversionsValue = conversions && conversions[value.id];
		const priceListSelected = priceList[selectedPriceListId];
		const unitSelected = priceListSelected.units
			? priceListSelected.units[value.id]
			: null;
		const listPrice = priceListSelected.price || 0;
		const listRanges = priceListSelected.ranges;
		const listRangeApply = listRanges.find(
			(lr) => quantity >= lr.from && quantity <= lr.to
		);
		const unitPrice = unitSelected ? unitSelected.price : 0;
		const unitRanges = unitSelected ? unitSelected.ranges : [];
		const rangeApply = unitRanges.find((ur) => quantity >= ur.from && quantity <= ur.to);
		const conversionUnitPrice = rangeApply ? rangeApply.price : unitPrice;
		const conversionListPrice = listRangeApply ? listRangeApply.price : listPrice;
		const newPrice = unitSelected ? conversionUnitPrice : conversionListPrice;
		const conversionQuantity = Sale.getConversionQuantity(
			product,
			value,
			conversionsValue,
			isUnitBase
		);
		const unitQuantity = quantity * conversionQuantity;

		let newRow = compose(
			setNewProperty(model, value.id),
			setNewProperty('unitConversion', conversionQuantity),
			setNewProperty('unitName', value.name),
			setNewProperty('unitQuantity', unitQuantity),
			setNewProperty('unitCode', value.code)
		)(row);
		const discountPerceng = unitSelected
			? unitSelected.discount
			: priceListSelected.discount;
		if (flagUnitChanged) {
			newRow = compose(
				setNewProperty('pricePerSaleOrigin', newPrice),
				setNewProperty('salePrice', newPrice),
				setNewProperty('price', newPrice),
				setNewProperty('pricePerSale', (newPrice * (100 - discountPerceng)) / 100),
				setNewProperty('discountPercentage', discountPerceng),
				setNewProperty('priceEdited', true)
			)(newRow);
			const { priceUnitary, pricePerSale } = Sale.isPricesWithTaxes(
				this.isEditing,
				newRow,
				this.user.company.flagIgv
			);
			newRow = setNewProperty('salePrice', pricePerSale)(newRow);
			newRow = setNewProperty('priceUnitary', priceUnitary)(newRow);
		} else if (row.priceEdited && flagUnitChanged) {
			newRow = compose(
				setNewProperty('priceEdited', false),
				setNewProperty('price', newPrice)
			)(newRow);
			const { priceUnitary, pricePerSale } = Sale.isPricesWithTaxes(
				this.isEditing,
				newRow,
				this.user.company.flagIgv
			);
			newRow = setNewProperty('priceUnitary', priceUnitary)(newRow);
			newRow = setNewProperty('salePrice', pricePerSale)(newRow);
		} else if (!row.priceEdited) {
			newRow = compose(
				setNewProperty('priceUnitaryReal', ({ taxes }) => newPrice / `1.${taxes}`),
				setNewProperty('price', newPrice),
				setNewProperty('salePrice', newPrice)
			)(newRow);
			const { pricePerSale, priceUnitary } = Sale.isPricesWithTaxes(
				this.isEditing,
				newRow,
				this.user.company.flagIgv
			);
			newRow = compose(
				setNewProperty('priceUnitary', priceUnitary),
				setNewProperty('pricePerSale', pricePerSale)
			)(newRow);
		}
		const discount = newRow.priceUnitary * (Number(newRow.discountPercentage) / 100);
		newRow = setNewProperty('discount', discount)(newRow);
		newRow = setNewProperty('total', Sale.getTotal)(newRow);
		newRow = setNewProperty('subtotalWithoutTax', Sale.getSubtotalWithoutTax)(newRow);
		return newRow;
	}

	quantityValidation(product, quantity, products, exchangeRate, salesCurrency) {
		return products.map((p) => {
			let newP = { ...p };
			const prop = p.idProductUnit ? 'idProductUnit' : 'id';
			if (p[prop] === product[prop] && !p.flagFree && p.idProductUnit) {
				const qtyAvailable = p.stock >= quantity ? quantity : p.stock;
				const newValue =
					Number(quantity) > Number(p.stock) ? Number(quantity) - Number(p.stock) : 0;
				newP.quantityAvailable = qtyAvailable;
				newP.quantityImport = newValue;
				newP.quantity = Number(quantity) > 0 ? Number(quantity) : 0;
				newP.quantityNegative = Number(quantity) < 0;
				newP.priceEdited = false;
				const model = 'unitId';
				const value = {
					id: newP.unitId,
					name: newP.unitName,
					code: newP.unitCode,
				};
				if (newP && newP.isComposed) {
					const { isSalable, groups } = Sale.checkStockOfChildren(quantity, newP.groups);
					newP.isSalable = isSalable;
					newP.groups = groups;
				}
				newP = this.updateByUnitChange.call(
					this,
					model,
					value,
					newP,
					false,
					exchangeRate,
					salesCurrency
				);
			}
			return newP;
		});
	}

	quantityValidationQuatation(updatedProduct, quantity, products, indexProduct, isFree) {
		return products.map((p, idxMap) => {
			let newP = { ...p };
			const isSameRow = indexProduct === idxMap;
			// Este tipo de validacion idProductUnit = `${index}${product.id}`; falla cuando el indice no se actualiza correctamente
			// const haveSameReference = p.idProductUnit === updatedProduct.idProductUnit;

			if (isSameRow && (!p.flagFree || isFree)) {
				const qtyAvailable = p.stock >= quantity ? quantity : p.stock;
				const newValue =
					Number(quantity) > Number(p.stock) ? Number(quantity) - Number(p.stock) : 0;
				newP.quantityAvailable = qtyAvailable;
				newP.quantityImport = newValue;
				newP.quantity = Number(quantity) > 0 ? Number(quantity) : 0;
				newP.quantityNegative = Number(quantity) < 0;
				const value = {
					id: newP.unitId,
					name: newP.unitName,
					code: newP.unitCode,
				};

				if (newP && newP.isComposed) {
					const { isSalable, groups } = Sale.checkStockOfChildren(quantity, newP.groups);

					newP.isSalable = isSalable;
					newP.groups = groups;
				}
				newP = this.updateByUnitChangeQuotation.call(this, 'unitId', value, newP);
			}
			return newP;
		});
	}

	static editPriceUnitary(product, value, products, index) {
		return products.map((p, ind) => {
			const newP = { ...p };
			if (index === ind) {
				const unitPrice = Number(value);
				const discount = unitPrice * (Number(p.discountPercentage) / 100);
				newP.priceEdited = true;
				newP.priceNegative = unitPrice < 0;
				newP.discount = discount;
				newP.priceUnitary = unitPrice;
				newP.priceUnitaryReal = unitPrice;
				newP.pricePerSale = Sale.calculatePriceSale(newP);
				newP.pricePerSale = Sale.getPricePerSale(newP);
				newP.total = Sale.getTotal(newP);
				newP.subtotalWithoutTax = Sale.getSubtotalWithoutTax(newP);
			}
			return newP;
		});
	}

	static calculatePriceSale({ priceUnitary, taxes }) {
		return fourDecimals(priceUnitary * (1 + taxes / 100));
	}

	static editPricePerSale(product, value, products, index, isPeru) {
		return products.map((p, ind) => {
			const newP = { ...p };
			if (index === ind) {
				newP.priceEdited = true;
				newP.priceNegative = Number(value) < 0;
				newP.pricePerSaleUnit = Number(value);
				newP.pricePerSaleOrigin = Number(value);
				newP.pricePerSale = Number(value);
				newP.discountPercentage = newP.flagFree && !isPeru ? 100 : 0;
				newP.discount = 0;
				newP.priceUnitary = Sale.getPriceUnitaryEditPrice(newP);
				// newP.priceUnitaryReal = Sale.getPriceUnitary(newP);
				newP.total = Sale.getTotal(newP);
				newP.totalOrigin = Sale.getTotal(newP);
				newP.subtotalWithoutTax = Sale.getSubtotalWithoutTax(newP);
			}
			return newP;
		});
	}
	static getPriceUnitaryEditPrice({ pricePerSale, taxes }) {
		return fourDecimals(pricePerSale / (1 + taxes / 100));
	}

	static getPriceUnitary({ pricePerSale, priceUnitary, taxes }) {
		if (pricePerSale === priceUnitary) {
			return fourDecimals(pricePerSale / (1 + taxes / 100));
		}
		return priceUnitary;
	}

	static editDiscount(
		product,
		value,
		products,
		index,
		isOrder,
		salesCurrency,
		exchangeRate
	) {
		return products.map((p, ind) => {
			const newP = { ...p };
			if (index === ind) {
				newP.discountPercentage = value ? fourDecimals(Number(value)) : 0;
				newP.priceEdited = true;
				if (newP.priceEdited) {
					newP.discount = Sale.getDiscountAmount(
						newP,
						true,
						isOrder,
						salesCurrency,
						exchangeRate
					);
					newP.pricePerSale = Sale.getPricePerSale(
						newP,
						true,
						isOrder,
						salesCurrency,
						exchangeRate
					);
					newP.subtotalWithoutTax = Sale.getSubtotalWithoutTax(newP);
					newP.total = Sale.getTotal(newP, true);
				}
			}
			return newP;
		});
	}

	priceAmounts(products) {
		// const isEditing = this.isEditing;
		return products.map((p) => {
			const newP = { ...p };
			// newP.priceEdited = !!p.validClone;
			if (!p.priceEdited) {
				const value = this.user.company.flagIgv === 0 && p.validClone;
				newP.salePrice = p.pricePerSale ? p.pricePerSale : p.price;
				const priceObject = Sale.isPricesWithTaxes(
					value,
					newP,
					this.user.company.flagIgv
				);
				newP.priceUnitary = fourDecimals(priceObject.priceUnitary);
				newP.priceUnitaryReal = priceObject.priceUnitaryReal;
				newP.discount = Sale.getDiscountAmount(newP);
				newP.pricePerSale = Sale.getPricePerSale(newP);
				newP.total = Sale.getTotal(newP);
			}
			return newP;
		});
	}

	priceAmountsQuatation(products) {
		return products.map((p) => {
			const newP = { ...p };

			if (!p.priceEdited) {
				newP.salePrice = p.pricePerSale ? p.pricePerSale : p.price;
				const priceObject = Sale.isPricesWithTaxes(
					this.isEditing,
					newP,
					this.user.company.flagIgv
				);
				newP.priceUnitary = fourDecimals(priceObject.priceUnitary);
				newP.priceUnitaryReal = priceObject.priceUnitaryReal;
				newP.discount = Sale.getDiscountAmount(newP);
				newP.pricePerSale = Sale.getPricePerSale(newP);
				newP.total = Sale.getTotal(newP);
			}
			return newP;
		});
	}

	static getDiscountAmount(product, flagValidated = false, isOrder = false) {
		const {
			priceBaseToCalculate,
			priceUnitary,
			discountPercentage,
			// pricePerSale,
			salePrice,
			pricePerSaleOrigin,
			taxes,
		} = product;

		const newDicountPercentage = Number(discountPercentage) || 0;
		if (priceBaseToCalculate === BasePrice.PV && newDicountPercentage > 0) {
			const priceValidated = flagValidated
				? pricePerSaleOrigin
				: salePrice || pricePerSaleOrigin;
			if (isOrder) {
				return priceValidated * (newDicountPercentage / 100);
			}
			const priceTax = priceValidated / (1 + Number(`${taxes / 100}`)); // Esto es lo mismo que el precioUnitario
			return priceTax * (newDicountPercentage / 100);
		}
		return priceUnitary * (newDicountPercentage / 100);
	}

	static getExchange(exchangeRate) {
		return Math.floor(exchangeRate * 100) / 100;
	}

	static applyDiscountToAllItems(val, products) {
		return map(
			compose(
				setNewPropertyByFunction('total', Sale.getTotal),
				setNewPropertyByFunction('discount', Sale.getDiscountAmount),
				setNewProperty('discountPercentage', val)
			),
			products
		);
	}

	static getPriceWithOutDiscount({ salePrice, discountPercentage }) {
		const discount = 1 - discountPercentage / 100;
		return salePrice / discount;
	}

	static setPriceEdited(isEditing, product) {
		if (!isEditing) {
			return false;
		}
		const { selectedPriceListId, priceList } = product;

		if (priceList && priceList[selectedPriceListId]) {
			const { ranges } = priceList[selectedPriceListId];
			if (ranges.length === 0) {
				return true;
			} else if (ranges.length === 1) {
				return !ranges[0].price;
			}
		}
		return false;
	}

	static getPriceForQuantity(priceList, quantity) {
		return priceList.ranges.find((pr) => quantity >= pr.from && quantity <= pr.to);
	}
}

export default Sale;
