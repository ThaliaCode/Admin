<template>
	<div class="sale-points-form">
		<v-layout wrap align-center px-4 py-3 v-if="showAlert">
			<v-alert type="error" :value="showAlert">
				La tienda no cuenta con código de establecimiento configurado.
			</v-alert>
		</v-layout>
		<v-layout wrap align-center py-3 v-else>
			<v-flex xs12 px-4 body-1 pb-3 v-if="isEcuador">
				Código de Establecimiento: {{ warCodeTaxes }}
			</v-flex>
			<v-flex xs12 pa-3 body-1 class="section-tab-alert">
				<img
					src="/static/icon/alert.svg"
					alt="alerta"
					height="24px"
					class="mr-3"
				/>
				<label> Las cajas no se pueden repetir en los puntos de venta. </label>
			</v-flex>
			<v-flex
				xs12
				v-for="(point, pointIndex) in newSalePoints"
				:key="pointIndex"
			>
				<sale-points-collapse
					:index="pointIndex"
					:is-ecuador="isEcuador"
					:format-country="currentRegex"
					:is-peru="isPeru"
					:sale-point="point"
					:subsidiary-id="warSubsidiaryId"
					:cashs="cashs"
					:customers="customers"
					@name-updated="nameUpdated"
					@set-detail="setDetail"
					@users-selected="setUsers(pointIndex, $event)"
					@cash-selected="setCash(pointIndex, $event)"
					@device-updated="deviceUpdated"
					@change-flag-point="changeFlagPoint"
				/>
			</v-flex>
		</v-layout>
		<v-layout
			v-if="$route.name !== 'commerce'"
			wrap
			align-center
			px-4
			py-4
			class="background-container"
		>
			<v-flex xs12 sm10 caption> Agregar nuevo punto de venta </v-flex>
			<v-flex xs12 sm2 text-xs-right>
				<v-btn color="info" class="btn-auto" small @click="addSalePoint">
					<v-icon color="white">add</v-icon>
				</v-btn>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabled"
				@cancel-button-clicked="$emit('cancel')"
				@accept-button-clicked="$emit('save', newSalePoints)"
			/>
		</section>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import salePointsCollapse from '@/components/warehouses/sale-points-collapse';
import jsonCountries from '@/i18n/constants/format-country.json';

function created() {
	this.newSalePoints = [];
	this.loadData();
}

async function loadData() {
	const requests = [
		this.globalEmployees(),
		this.$httpSales.get('cash', {
			params: {
				flagActive: 1,
				subsidiaryId: this.subsidiaryIdSale,
				warWarehousesId: this.warWarehousesId,
			},
		}),
	];
	[{ data: this.customers }, { data: this.cashs }] = await Promise.all(
		requests
	);
}

function addSalePoint() {
	const index = this.newSalePoints.length + 1;
	const newSalePoint = {
		comSubsidiariesId: this.warSubsidiaryId,
		typeDevice: null,
		documents: this.setTypeDocuments(this, this.typeDocuments),
		name: `Punto de venta ${index}`,
		flagActive: true,
		warWarehousesId: this.warWarehousesId,
	};
	this.newSalePoints.push({ ...newSalePoint });
}

function disabled() {
	return this.isLoading || !this.validate;
}

function nameUpdated({ index, name }) {
	this.$set(this.newSalePoints[index], 'name', name);
}

function salePoints(points) {
	this.showAlert = this.isEcuador && !this.warCodeTaxes;
	if (points.length > 0) {
		this.newSalePoints = points.map((sp) => {
			const newSp = { ...sp };
			newSp.typeDevice = sp.typeDevice || null;
			newSp.flagActive = !!sp.flagActive;
			newSp.documents = this.setTypeDocuments(
				this,
				this.typeDocuments,
				sp.series
			);
			return newSp;
		});
		const idsCashAss = points.map((s) => s.cashId);
		this.cashs = this.cashs.map((p) => {
			const row = { ...p };
			row.disabled = idsCashAss.includes(p.id);
			return row;
		});
		this.cashs.unshift({
			name: 'Ninguna caja',
			id: null,
		});
	}
}

function salePointsValues(values) {
	const self = this;
	if (values.length > 0) {
		const salePointsActives = self.newSalePoints.filter((sp) => sp.flagActive);
		const toValidate = salePointsActives.reduce((acum, ssp) => {
			const docs = ssp.documents.filter((d) => d.isSelected);
			if (docs.length > 0) {
				const details = docs.reduce((acumDoc, doc) => {
					let newAcum = acumDoc;
					if (doc.billing) {
						const newRow = doc.billing.reduce((ac, b) => {
							let newAc = ac;
							if (b.details && b.details.length > 0 && b.serie && b.number) {
								newAc = newAc.concat(b.details);
							}
							return newAc;
						}, []);
						if (newRow.length) {
							newAcum = acumDoc.concat(newRow);
						}
					} else if (doc.details && doc.details.length > 0) {
						newAcum = acumDoc.concat(doc.details);
					}
					return newAcum;
				}, []);
				const serieValid = new RegExp(this.currentRegex.serieRegex);
				const numberValid = new RegExp(this.currentRegex.numberRegex);
				const validDocs = self.isEcuador
					? docs.every((d) => {
							if (d.billing) {
								return (
									(d.billing[0].codeTaxes &&
										d.billing[0].codeTaxes.length ===
											d.billing[0].codeTaxesLength &&
										d.billing[0].number) ||
									(d.billing[1].codeTaxes &&
										d.billing[1].codeTaxes.length ===
											d.billing[1].codeTaxesLength &&
										d.billing[1].number)
								);
							}
							return (
								d.codeTaxes &&
								d.codeTaxes.length === d.codeTaxesLength &&
								d.number
							);
					  })
					: docs.every((d) => {
							if (d.billing && d.billing.length > 1) {
								const serieZero = d.billing[0].serie;
								const numberZero = d.billing[0].number;
								const serieOne = d.billing[1].serie;
								const numberOne = d.billing[1].number;
								return (
									(serieValid.test(serieZero) &&
										numberValid.test(numberZero)) ||
									(serieValid.test(serieOne) && numberValid.test(numberOne))
								);
							} else if (d.billing && d.billing.length === 1) {
								return (
									serieValid.test(d.billing[0].serie) &&
									numberValid.test(d.billing[0].number)
								);
							}
							return serieValid.test(d.serie) && numberValid.test(d.number);
					  });
				if (details.length > 0) {
					const validDetails = this.isEcuador
						? details.every(
								(d) =>
									d.codeTaxes &&
									d.codeTaxes.length === d.codeTaxesLength &&
									d.number
						  )
						: details.every(
								(d) => serieValid.test(d.serie) && numberValid.test(d.number)
						  );
					const validAll = validDocs && validDetails;
					acum.push(validAll);
				} else {
					acum.push(validDocs);
				}
			} else {
				acum.push(false);
			}
			return acum;
		}, []);
		self.validate = toValidate.every((tv) => tv);
	}
}

function setUsers(index, users) {
	this.$set(this.newSalePoints[index], 'employeesId', users);
}

function setCash(index, cashId) {
	const cashIdOld = this.newSalePoints[index].cashId;
	this.$set(this.newSalePoints[index], 'cashId', cashId);
	const indexCash = this.cashs.findIndex((c) => c.id === cashId);
	const indexCashOld = this.cashs.findIndex((c) => c.id === cashIdOld);
	if (indexCash > -1) {
		if (this.cashs[indexCash].id) {
			this.cashs[indexCash].disabled = true;
		}
	}
	if (indexCashOld > -1 && cashIdOld !== cashId) {
		this.cashs[indexCashOld].disabled = false;
	}
}

function setDetail({ model, value, doc, detail }) {
	if (detail) {
		const indexDetail = doc.details.findIndex(
			(d) => d.salTypeDocumentsId === detail.salTypeDocumentsId
		);
		this.$set(doc.details[indexDetail], model, value);
		if (this.isEcuador && model === 'codeTaxes') {
			const newVal = `${this.warCodeTaxes}${value}`;
			this.$set(doc.details[indexDetail], 'serie', newVal);
		}
	} else {
		this.$set(doc, model, value);
		if (this.isEcuador && model === 'codeTaxes') {
			const newVal = `${this.warCodeTaxes}${value}`;
			this.$set(doc, 'serie', newVal);
		}
	}
}

function setTypeDocuments(context, documents, salePointSeries, bill) {
	return documents.map((doc) => {
		const salePointsFiltered = salePointSeries
			? salePointSeries.filter((serie) => serie.salTypeDocumentsId === doc.id)
			: null;
		let newDoc = {};
		if (salePointsFiltered && salePointsFiltered.length && doc.details) {
			newDoc.isSelected = !!salePointsFiltered.length;
			newDoc.tab = null;
			newDoc.billing = salePointsFiltered.map((spf) => {
				const newSpf = context.setBill(context, doc, spf);
				newSpf.details =
					doc.details.length > 0
						? setTypeDocuments(context, doc.details, spf.details)
						: doc.details;
				return newSpf;
			});
			if (doc.flagFee && salePointsFiltered.length === 1) {
				const newBill = newDoc.billing[0].typeBilling === 1 ? 2 : 1;
				newDoc.billing = newDoc.billing.concat(
					setTypeDocuments(context, [doc], null, newBill)
				);
			}
		} else if (salePointsFiltered && salePointsFiltered.length) {
			newDoc = context.setBill(context, doc, salePointsFiltered[0]);
		} else if (doc.details && doc.flagFee && bill) {
			newDoc = context.setBill(context, doc, null, bill);
			newDoc.details =
				doc.details.length > 0
					? setTypeDocuments(context, doc.details, null, bill)
					: doc.details;
		} else if (doc.flagFee && doc.details) {
			newDoc.isSelected = false;
			newDoc.tab = null;
			newDoc.billing = context.billings.map((b) => {
				const newB = context.setBill(context, doc, null, b.code);
				newB.details =
					doc.details.length > 0
						? setTypeDocuments(context, doc.details, null, b.code)
						: doc.details;
				return newB;
			});
		} else if (doc.details) {
			newDoc = context.setBill(context, doc, null, bill);
			newDoc.details =
				doc.details.length > 0
					? setTypeDocuments(context, doc.details)
					: doc.details;
		} else {
			newDoc = context.setBill(context, doc, null, bill);
		}
		return newDoc;
	});
}

function salePointSeriesReduce(documentSelected, registers) {
	return registers.reduce();
}

function setBill(context, doc, salePoint, bill = 1) {
	const isEcuador = context.isEcuador;
	const isPeru = context.isPeru;
	const warCodeTaxes = context.warCodeTaxes;
	const warSubsidiaryId = context.warSubsidiaryId;
	const newSerie = isEcuador ? warCodeTaxes : '';
	const newSpf = {
		templates: doc.companyTemplate ? [...doc.companyTemplate] : [],
		code: doc.code,
		comSubsidiariesId: salePoint
			? salePoint.comSubsidiariesId
			: warSubsidiaryId,
		description: salePoint ? salePoint.description : '',
		flagFee: doc.flagFee,
		isSelected: !!salePoint,
		name: doc.name,
		number: salePoint ? salePoint.number : '',
		salTypeDocumentsId: salePoint ? salePoint.salTypeDocumentsId : doc.id,
		serie: salePoint ? salePoint.serie : newSerie,
		typeBilling: salePoint ? salePoint.typeBilling || 1 : bill,
	};
	if (!newSpf.flagFee) {
		newSpf.typeBilling = null;
	}
	if (newSpf.templates.length > 0) {
		newSpf.companyTemplateId = salePoint ? salePoint.companyTemplateId : null;
	}
	if (salePoint) {
		newSpf.id = salePoint.id;
		if (salePoint.typeBilling !== null) {
			if (salePoint.typeBilling === 2) {
				newSpf.flagSendBilling = null;
			} else {
				newSpf.flagSendBilling =
					salePoint.flagSendBilling !== null ? salePoint.flagSendBilling : 1;
			}
		} else {
			newSpf.flagSendBilling =
				salePoint.flagSendBilling !== null ? salePoint.flagSendBilling : 1;
		}
	}
	if (
		newSpf.code === 'FAC' &&
		newSpf.typeBilling === 1 &&
		newSpf.flagSendBilling !== 0
	) {
		newSpf.flagSendBilling = 1;
	}
	if (isEcuador) {
		newSpf.codeTaxes = salePoint ? salePoint.codeTaxes || '' : '';
		newSpf.codeTaxesLength = 3;
	} else if (isPeru) {
		newSpf.serieLength = 2;
	}
	newSpf.tab = null;
	return newSpf;
}

function deviceUpdated({ index, id }) {
	this.$set(this.newSalePoints[index], 'typeDevice', id);
}

function changeFlagPoint(value, point) {
	if (!value) {
		const boxLast = point.cashId;
		const index = this.newSalePoints.findIndex((n) => n.id === point.id);
		const indexCash = this.cashs.findIndex((c) => c.id === boxLast);
		this.newSalePoints[index].cashId = null;
		this.cashs[indexCash].disabled = false;
	}
}

function data() {
	return {
		jsonCountries,
		billings: [
			{ name: 'electronico', code: 1 },
			{ name: 'fisico', code: 2 },
		],
		cashs: [],
		customers: [],
		newSalePoints: [],
		selectedCash: null,
		selectedCustomers: [],
		showAlert: false,
		validate: false,
	};
}

export default {
	name: 'sale-points-form',
	components: {
		modalSidebarButton,
		salePointsCollapse,
	},
	computed: {
		disabled,
		currentRegex() {
			return this.jsonCountries[this.$userInfo.company.country.countryCode];
		},
	},
	created,
	data,
	methods: {
		addSalePoint,
		loadData,
		nameUpdated,
		salePointSeriesReduce,
		setCash,
		setDetail,
		setTypeDocuments,
		setUsers,
		setBill,
		deviceUpdated,
		changeFlagPoint,
	},
	props: {
		isLoading: {
			default: false,
			type: Boolean,
		},
		salePoints: {
			default: () => [],
			type: Array,
		},
		typeDocuments: {
			default: () => [],
			type: Array,
		},
		warCodeTaxes: String,
		warSubsidiaryId: [Number, String],
		warWarehousesId: [Number, String],
		subsidiaryIdSale: [Number, String],
	},
	watch: {
		newSalePoints: {
			deep: true,
			handler: salePointsValues,
		},
		salePoints,
	},
};
</script>

<style lang="scss" scoped>
.background-container {
	background-color: map-get($colors, pointHeader);
}

.section-tab {
	&-alert {
		background: color(green-opacity);
		color: color(background-sidebar);
		font-family: font(open-bold);
		font-size: size(medium);
	}
}
</style>
