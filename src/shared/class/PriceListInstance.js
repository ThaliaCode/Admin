import lib from '@/shared/lib';

const {
	compose,
	setNewProperty,
	round,
	calculateSubtotalFromTotal,
	calculateTaxAmountFromTotal,
	calculateTotalFromSubtotal,
} = lib;
const twoDecimals = round(2);

/**
 * @typedef {object} basePriceDefinition
 * @property {number} PV - Precio de Venta
 * @property {number} PU - Precio de Unitario
 */
/**
 * @param {object} priceList - objeto Lista de precios
 * @param {number} basePriceUsed - Precio base usado (PU or PV)
 * @param {basePriceDefinition} basePriceDefinition - Objeto con los tipos de precios (PU y PV)
 * @param {array} taxes - Impuestos configurados al producto
 */
class PriceListInstance {
	constructor(priceList, basePriceUsed, basePriceDefinition, taxes) {
		this.priceList = priceList;
		this.basePriceUsed = basePriceUsed;
		this.basePriceDefinition = basePriceDefinition;
		this.taxes = taxes;
	}
	get price() {
		if (this.basePriceUsed === this.basePriceDefinition.PV) {
			return this.priceList.salePrice;
		}
		const salePrice = calculateTotalFromSubtotal(
			this.priceList.unitPrice,
			this.taxPercentage
		);
		return twoDecimals(salePrice);
	}
	get unitPrice() {
		if (this.basePriceUsed === this.basePriceDefinition.PU) {
			return this.priceList.unitPrice;
		}
		const unitPrice = calculateSubtotalFromTotal(
			this.priceList.salePrice,
			this.taxPercentage
		);
		return twoDecimals(unitPrice);
	}
	get tax() {
		const tax = calculateTaxAmountFromTotal(this.price, this.taxPercentage);
		return twoDecimals(tax);
	}
	get units() {
		return this.priceList.units.map((u) => {
			const { salePrice, unitPrice } = u;
			return compose(
				setNewProperty('tax', PriceListInstance.unitTax),
				setNewProperty('unitPrice', this.unitUnitPrice.call(this, salePrice, unitPrice)),
				setNewProperty('salePrice', this.unitSalePrice.call(this, salePrice, unitPrice))
			)(u);
		});
	}
	static unitTax({ salePrice, unitPrice }) {
		return twoDecimals(salePrice - unitPrice);
	}
	unitSalePrice(salePrice, unitPrice) {
		if (this.basePriceUsed === this.basePriceDefinition.PV) {
			return salePrice;
		}
		const newSalePrice = calculateTotalFromSubtotal(unitPrice, this.taxPercentage);
		return twoDecimals(newSalePrice);
	}
	unitUnitPrice(salePrice, unitPrice) {
		if (this.basePriceUsed === this.basePriceDefinition.PU) {
			return unitPrice;
		}
		const newUnitPrice = calculateSubtotalFromTotal(salePrice, this.taxPercentage);
		return twoDecimals(newUnitPrice);
	}
	get taxPercentage() {
		if (Array.isArray(this.taxes)) {
			const currentTaxes = this.taxes.find((t) => t.flagSales);
			return currentTaxes ? currentTaxes.percentage : 0;
		}
		const { percentage = 0 } = this.taxes || {};
		return percentage;
	}
}

export default PriceListInstance;
