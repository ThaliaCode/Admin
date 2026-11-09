<template>
	<div class="price-list-item">
		<v-layout row wrap>
			<v-flex xs12>
				<button
					class="price-list-heading"
					:class="{ open: open }"
					type="button"
					@click="$emit('toogle-open')"
				>
					<v-layout row wrap align-center>
						<v-flex xs11>
							{{ localPriceList.name }}
						</v-flex>
						<v-flex xs1 text-xs-right>
							<v-icon color="primary" size="26">
								<template v-if="open"> arrow_drop_up </template>
								<template v-else> arrow_drop_down </template>
							</v-icon>
						</v-flex>
					</v-layout>
				</button>
			</v-flex>
		</v-layout>
		<template v-if="open">
			<v-layout row wrap align-center pt-3>
				<v-flex px-2>
					<v-layout row wrap align-center px-2>
						<v-flex xs2 px-1 text-xs-center>
							<app-input-text
								v-if="basePriceComputed.PV === basePriceUsed"
								label="P. Vent."
								model="salePrice"
								tooltip="Precio de Venta"
								type="number"
								class="sale-price"
								:text="priceList.salePrice"
								@input="setPriceListData"
							></app-input-text>
							<div v-else class="price-no-input">
								<v-tooltip top>
									<label class="label-tax" slot="activator">P. Vent.</label>
									<span>Precio de Venta</span>
								</v-tooltip>
								<span class="value-tax">{{ priceList.salePrice }}</span>
							</div>
						</v-flex>
						<v-flex xs1 mx-2 text-xs-center>
							<app-input-text
								v-if="basePriceComputed.PU === basePriceUsed"
								label="P. Unit."
								model="unitPrice"
								tooltip="Precio Unitario"
								type="number"
								class="unit-price"
								:text="localPriceList.unitPrice"
								@input="setPriceListData"
							></app-input-text>
							<span v-else class="price-no-input">
								<v-tooltip top>
									<label class="label-tax" slot="activator">P. Unit.</label>
									<span>Precio de Unitario</span>
								</v-tooltip>
								<span class="value-tax">{{ priceList.unitPrice }}</span>
							</span>
						</v-flex>
						<v-flex xs1 mx-2 text-xs-center>
							<label class="label-tax">{{ labelsByCountry.taxName }}</label>
							<span class="value-tax">{{ priceList.tax }}</span>
						</v-flex>
						<v-flex xs2 px-1>
							<app-input-text
								label="Dscto.(%)"
								model="discount"
								tooltip="Descuento"
								type="number"
								class="discount"
								:text="priceList.discount"
								@input="setPriceListData"
							></app-input-text>
						</v-flex>
						<app-tooltip-button
							v-if="
								$userInfo.company.settings.flagCalculateEarnings && product.type !== 6
							"
							class="mx-2 mt-2"
							color="primary"
							icon="savings"
							text="Configurar Ganancia"
							:size="18"
							@click-icon="onConfigEarnings"
						/>
						<v-flex xs4 px-3>
							<button class="product-add-btn mt-1" type="button" @click="addRange">
								<span>Precio x mayor</span>
								<v-icon class="product-add-btn-icon" color="primary" size="17">
									add_circle
								</v-icon>
							</button>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<v-layout v-if="priceList.discount < 0 || priceList.discount > 100" ml-4 mt-2 mb-1>
				<span class="alert-discount">
					El descuento no puede
					{{ priceList.discount > 100 ? 'superar el 100%' : 'ser negativo' }}
				</span>
			</v-layout>
			<v-divider v-if="localPriceList.ranges.length" class="mt-2 mb-2"></v-divider>
			<v-flex class="sections" ml-4 mt-2 mb-3>
				<v-flex v-if="!isObjEmpty(priceList.earnings)">
					<v-layout row wrap mt-3 align-center>
						<!-- TIPO -->
						<p class="sub-label-input mr-3">Tipo de Ganancia</p>
						<v-flex xs2>
							<app-select
								:item="priceList.earnings.type"
								:items="typeEarnings"
								item-text="name"
								item-value="code"
								:return-object="false"
								@input="setListFlows($event, 'earnings')"
								model="type"
							></app-select>
						</v-flex>
						<!-- VALOR -->
						<p class="sub-label-input ml-4 mr-3">Valor de Ganancia</p>
						<v-flex xs2>
							<app-input-text
								:readonly="!priceList.earnings.type"
								model="amount"
								type="number"
								@input="setListFlows($event, 'earnings')"
								:text="priceList.earnings.amount"
							></app-input-text>
						</v-flex>
					</v-layout>
					<v-layout
						v-if="priceList.earnings.amount < 0 || priceList.earnings.amount > 100"
						mt-2
						mb-1
					>
						<span class="alert-discount">
							El valor de ganancia no puede
							{{ priceList.earnings.amount > 100 ? 'superar el 100%' : 'ser negativo' }}
						</span>
					</v-layout>
				</v-flex>
			</v-flex>
			<transition name="fade" mode="out-in">
				<v-layout
					row
					wrap
					v-if="localPriceList.ranges.length > 0"
					:class="localPriceList.units.length > 0 ? 'pb-price' : ''"
				>
					<v-flex
						v-for="(range, indexRange) in localPriceList.ranges"
						xs12
						:key="indexRange"
					>
						<v-layout row wrap class="price-list-major-item">
							<v-flex xs8>
								<v-layout align-center>
									<v-flex xs3 text-xs-center pl-3 class="price-list-major-item-title">
										Precio x mayor
									</v-flex>

									<v-flex xs2 pl-1>
										<app-input-text
											model="price"
											type="number"
											class="major-price"
											:text="range.price"
											@input="setRangeData($event, indexRange)"
										></app-input-text>
									</v-flex>
									<v-flex xs1 text-xs-center> de </v-flex>
									<v-flex xs2>
										<app-input-text
											model="from"
											type="number"
											class="major-price"
											:text="range.from"
											@input="setRangeData($event, indexRange)"
										></app-input-text>
									</v-flex>
									<v-flex xs1 text-xs-center> a </v-flex>
									<v-flex xs2 pr-2>
										<app-input-text
											model="to"
											type="number"
											class="major-price"
											:text="range.to"
											@input="setRangeData($event, indexRange)"
										></app-input-text>
									</v-flex>
									<v-flex xs1 text-xs-center pr-3> UND </v-flex>
								</v-layout>
							</v-flex>

							<v-flex xs4>
								<v-layout align-center>
									<v-flex
										xs5
										pr-2
										v-if="
											$userInfo.company.settings.flagCalculateEarnings &&
											product.type !== 6
										"
									>
										<app-select
											:item="range.type"
											:items="typeEarnings"
											item-text="name"
											item-value="code"
											:return-object="false"
											@input="setRangeData($event, indexRange)"
											model="type"
										></app-select>
									</v-flex>
									<v-flex
										xs3
										pr-2
										v-if="
											$userInfo.company.settings.flagCalculateEarnings &&
											product.type !== 6
										"
									>
										<app-input-text
											:readonly="!range.type"
											model="amount"
											type="number"
											class="major-price"
											:text="range.amount"
											@input="setRangeData($event, indexRange)"
										></app-input-text>
									</v-flex>
									<v-flex
										xs1
										:class="
											$userInfo.company.settings.flagCalculateEarnings &&
											product.type !== 6
												? ''
												: 'mt-2'
										"
									>
										<v-btn
											class="btn-auto ma-0"
											depressed
											flat
											icon
											type="button"
											@click="removeRange(indexRange)"
										>
											<v-icon color="error">remove_circle</v-icon>
										</v-btn>
									</v-flex>
								</v-layout>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</transition>
			<v-flex class="sections" ml-4 mt-2 mb-3>
				<v-layout row wrap align-center>
					<p class="sub-title">Configurar comisiones</p>
					<input
						type="checkbox"
						v-model="isCommissionsView"
						color="primary"
						class="ml-1"
						@change="changeCommissionsView"
					/>
				</v-layout>
				<v-flex v-if="isCommissionsView">
					<v-layout row wrap mt-3 align-center>
						<!-- TIPO DE COMISION -->
						<p class="sub-label-input mr-3">Tipo de comisión</p>
						<v-flex xs2>
							<app-select
								:item="priceList.comissions.type"
								:items="typeCommissions"
								item-text="name"
								item-value="code"
								:return-object="false"
								@input="setListFlows($event, 'comissions')"
								model="type"
							></app-select>
						</v-flex>
						<!-- VALOR DE COMISION -->
						<p class="sub-label-input ml-4 mr-3">Valor de Comisión</p>
						<v-flex xs2>
							<app-input-text
								model="amount"
								type="number"
								@input="setListFlows($event, 'comissions')"
								:text="priceList.comissions.amount"
							></app-input-text>
						</v-flex>
					</v-layout>
					<v-layout row wrap mt-3>
						<p class="sub-label-input mr-4 pt-1">La comisión aplica sobre</p>
						<!-- PRECIO DE UNITARIO -->
						<p class="sub-label-input mr-2 pt-1">Precio Unitario</p>
						<!-- SWITCH -->
						<v-flex xs1 mx-2>
							<v-switch
								color="primary"
								hide-details
								v-model="priceList.comissions.appliedTo"
							></v-switch>
						</v-flex>
						<!-- PRECIO DE VENTA -->
						<p class="sub-label-input mr-2 pt-1">Precio Venta</p>
					</v-layout>
				</v-flex>
			</v-flex>
			<transition name="fade" mode="out-in">
				<div v-if="priceList.units.length > 0" class="units-container">
					<div
						v-for="(unit, indexUnit) in localPriceList.units"
						:key="indexUnit"
						class="mb-3"
					>
						<v-layout row wrap align-center>
							<v-flex xs12 px-4>
								<h6 class="price-list-name pl-1">Precio por {{ unit.name }}</h6>
							</v-flex>
							<v-flex xs7 pl-3>
								<v-layout row wrap align-center px-2>
									<v-flex xs3 px-1 text-xs-center>
										<app-input-text
											v-if="basePriceComputed.PV === basePriceUsed"
											label="P. Vent."
											model="salePrice"
											tooltip="Precio de Venta"
											type="number"
											class="sale-price mr-1"
											:text="unit.salePrice"
											@input="setUnitData($event, indexUnit)"
										></app-input-text>
										<div v-else class="price-no-input">
											<v-tooltip top>
												<label slot="activator">P. Vent.</label>
												<span>Precio de Venta</span>
											</v-tooltip>
											<span>{{ unit.salePrice }}</span>
										</div>
									</v-flex>
									<v-flex xs3 px-1 text-xs-center>
										<app-input-text
											v-if="basePriceComputed.PU === basePriceUsed"
											label="P. Unit."
											model="unitPrice"
											tooltip="Precio Unitario"
											type="number"
											class="unit-price"
											:text="unit.unitPrice"
											@input="setUnitData($event, indexUnit)"
										></app-input-text>
										<span v-else class="price-no-input">
											<v-tooltip top>
												<label slot="activator">P. Unit.</label>
												<span>Precio de Unitario</span>
											</v-tooltip>
											<span class="ft-14">{{ unit.unitPrice }}</span>
										</span>
									</v-flex>
									<v-flex xs3 px-1 text-xs-center>
										<label class="label-tax">{{ labelsByCountry.taxName }}</label>
										<span class="value-tax">{{ unit.tax }}</span>
									</v-flex>
									<v-flex xs3 px-1>
										<app-input-text
											label="Dscto."
											model="discount"
											tooltip="Descuento"
											type="number"
											class="discount"
											:text="unit.discount"
											@input="setUnitData($event, indexUnit)"
										></app-input-text>
									</v-flex>
								</v-layout>
								<p v-if="unitErrors[indexUnit]" class="form-group__message">
									{{ unitErrors[indexUnit] }}
								</p>
							</v-flex>
							<app-tooltip-button
								v-if="
									$userInfo.company.settings.flagCalculateEarnings && product.type !== 6
								"
								class="mt-2"
								color="primary"
								icon="savings"
								text="Configurar Ganancia"
								:size="18"
								@click-icon="onConfigEarnings(indexUnit)"
							/>
							<v-flex xs4 px-3>
								<button
									class="product-add-btn mt-1"
									type="button"
									@click="addUnitRange(indexUnit)"
								>
									<span>Precio x mayor</span>
									<v-icon class="product-add-btn-icon" color="primary" size="17">
										add_circle
									</v-icon>
								</button>
							</v-flex>
						</v-layout>
						<v-layout v-if="unit.discount < 0 || unit.discount > 100" ml-4 mt-2 mb-1>
							<span class="alert-discount">
								El descuento no puede
								{{ unit.discount > 100 ? 'superar el 100%' : 'ser negativo' }}
							</span>
						</v-layout>
						<v-flex ml-4 pl-3 v-if="unit.earnings && !isObjEmpty(unit.earnings)">
							<v-layout row wrap mt-3 align-center>
								<!-- TIPO -->
								<p class="sub-label-input mr-3">Tipo de Ganancia</p>
								<v-flex xs2>
									<app-select
										:item="unit.earnings.type"
										:items="typeEarnings"
										item-text="name"
										item-value="code"
										:return-object="false"
										@input="setUnitListFlows($event, 'earnings', indexUnit)"
										model="type"
									></app-select>
								</v-flex>
								<!-- VALOR -->
								<p class="sub-label-input ml-4 mr-3">Valor de Ganancia</p>
								<v-flex xs2>
									<app-input-text
										:readonly="!unit.earnings.type"
										model="amount"
										type="number"
										@input="setUnitListFlows($event, 'earnings', indexUnit)"
										:text="unit.earnings.amount"
									></app-input-text>
								</v-flex>
							</v-layout>
							<v-layout
								v-if="unit.earnings.amount < 0 || unit.earnings.amount > 100"
								mt-2
								mb-1
							>
								<span class="alert-discount">
									El valor de ganancia no puede
									{{ unit.earnings.amount > 100 ? 'superar el 100%' : 'ser negativo' }}
								</span>
							</v-layout>
						</v-flex>
						<v-flex class="sections" ml-4 mt-2 mb-3>
							<v-layout row wrap align-center>
								<p class="sub-title">Configurar comisiones</p>
								<input
									type="checkbox"
									v-model="unitCommissionsView[indexUnit]"
									color="primary"
									class="ml-1"
									@change="changeUnitCommissionsView(indexUnit)"
								/>
							</v-layout>
							<v-flex v-if="unitCommissionsView[indexUnit]">
								<v-layout row wrap mt-3 align-center>
									<!-- TIPO DE COMISION -->
									<p class="sub-label-input mr-3">Tipo de comisión</p>
									<v-flex xs2>
										<app-select
											:item="unit.comissions ? unit.comissions.type : ''"
											:items="typeCommissions"
											item-text="name"
											item-value="code"
											:return-object="false"
											@input="setUnitListFlows($event, 'comissions', indexUnit)"
											model="type"
										></app-select>
									</v-flex>
									<!-- VALOR DE COMISION -->
									<p class="sub-label-input ml-4 mr-3">Valor de Comisión</p>
									<v-flex xs2>
										<app-input-text
											model="amount"
											type="number"
											@input="setUnitListFlows($event, 'comissions', indexUnit)"
											:text="unit.comissions ? unit.comissions.amount : 0"
										></app-input-text>
									</v-flex>
								</v-layout>
								<v-layout row wrap mt-3>
									<p class="sub-label-input mr-4 pt-1">La comisión aplica sobre</p>
									<!-- PRECIO DE UNITARIO -->
									<p class="sub-label-input mr-2 pt-1">Precio Unitario</p>
									<!-- SWITCH -->
									<v-flex xs1 mx-2>
										<v-switch
											color="primary"
											hide-details
											v-model="localPriceList.units[indexUnit].comissions.appliedTo"
										></v-switch>
									</v-flex>
									<!-- PRECIO DE VENTA -->
									<p class="sub-label-input mr-2 pt-1">Precio Venta</p>
								</v-layout>
							</v-flex>
						</v-flex>
						<v-divider v-if="localPriceList.ranges.length" class="mt-2 mb-2"></v-divider>
						<transition name="fade" mode="out-in">
							<v-layout
								row
								wrap
								v-if="unit.ranges.length > 0"
								:class="
									localPriceList.units.length > 1 &&
									indexUnit + 1 < localPriceList.units.length
										? 'pb-price'
										: ''
								"
							>
								<v-flex
									v-for="(unitRange, indexUnitRange) in unit.ranges"
									xs12
									:key="indexUnitRange"
								>
									<v-layout row wrap class="price-list-major-item">
										<v-flex xs8>
											<v-layout row wrap align-center>
												<v-flex
													xs3
													text-xs-center
													pl-3
													class="price-list-major-item-title"
												>
													Precio x mayor
												</v-flex>

												<v-flex xs2 pl-1>
													<app-input-text
														model="price"
														type="number"
														class="major-price"
														:text="unitRange.price"
														@input="setUnitRangeData($event, indexUnit, indexUnitRange)"
													></app-input-text>
												</v-flex>
												<v-flex xs1 text-xs-center> de </v-flex>
												<v-flex xs2>
													<app-input-text
														model="from"
														type="number"
														class="major-price"
														:text="unitRange.from"
														@input="setUnitRangeData($event, indexUnit, indexUnitRange)"
													></app-input-text>
												</v-flex>
												<v-flex xs1 text-xs-center> a </v-flex>
												<v-flex xs2 pr-2>
													<app-input-text
														model="to"
														type="number"
														class="major-price"
														:text="unitRange.to"
														@input="setUnitRangeData($event, indexUnit, indexUnitRange)"
													></app-input-text>
												</v-flex>
												<v-flex xs1 text-xs-center pr-3> UND </v-flex>
											</v-layout>
										</v-flex>
										<v-flex xs4>
											<v-layout align-center>
												<v-flex
													xs5
													pr-2
													v-if="
														$userInfo.company.settings.flagCalculateEarnings &&
														product.type !== 6
													"
												>
													<app-select
														:item="unitRange.type"
														:items="typeEarnings"
														item-text="name"
														item-value="code"
														:return-object="false"
														@input="setUnitRangeData($event, indexUnit, indexUnitRange)"
														model="type"
													></app-select>
												</v-flex>
												<v-flex
													xs3
													pr-2
													v-if="
														$userInfo.company.settings.flagCalculateEarnings &&
														product.type !== 6
													"
												>
													<app-input-text
														:readonly="!unitRange.type"
														model="amount"
														type="number"
														class="major-price"
														:text="unitRange.amount"
														@input="setUnitRangeData($event, indexUnit, indexUnitRange)"
													></app-input-text>
												</v-flex>
												<v-flex
													xs1
													:class="
														$userInfo.company.settings.flagCalculateEarnings &&
														product.type !== 6
															? ''
															: 'mt-2'
													"
												>
													<v-btn
														class="btn-auto ma-0"
														depressed
														flat
														icon
														type="button"
														@click="removeUnitRange(indexUnit, indexUnitRange)"
													>
														<v-icon color="error">remove_circle</v-icon>
													</v-btn>
												</v-flex>
											</v-layout>
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
						</transition>
					</div>
				</div>
			</transition>
		</template>
	</div>
</template>
<script>
import BasePrice from '@/shared/basePrice';
import l from '@/shared/lib';
import autocompleteComponent from '@/components/shared/autocomplete/autocomplete-component';

const { getDeeper } = l;

function basePriceComputed() {
	return BasePrice;
}

function basePriceUsed() {
	return getDeeper('company', 'settings', 'flagBasePriceDefault')(this.$userInfo);
}

function addRange() {
	const defaultRange = { price: 0, from: 0, to: 0 };
	this.localPriceList.ranges = this.localPriceList.ranges.concat({
		...defaultRange,
	});
	this.$emit('set-price-list', this.localPriceList);
}

function removeRange(index) {
	this.localPriceList.ranges = this.localPriceList.ranges.filter(
		(lp, ind) => ind !== index
	);
	this.$emit('set-price-list', this.localPriceList);
}

function setPriceListData({ model, value }) {
	this.$set(this.localPriceList, model, Number(value));
	this.$emit('set-price-list', this.localPriceList);
}

function setRangeData({ model, value }, index) {
	const valueRangeData = model === 'type' ? value : Number(value);
	this.localPriceList.ranges[index][model] = valueRangeData;
	const amountExist = this.localPriceList.ranges[index].amount;
	if (model === 'amount' || (model === 'type' && amountExist)) {
		const price =
			this.localPriceList.ranges[index].type === 'fixed'
				? this.product.cost + amountExist
				: this.product.cost + (this.product.cost * amountExist) / 100;
		this.$set(this.localPriceList.ranges[index], 'price', Number(price.toFixed(5)));
	}
	this.$emit('set-price-list', this.localPriceList);
}

function setUnitData({ model, value }, index) {
	const unitId = this.localPriceList.units[index].id;
	const conversion = this.product.conversions.find((c) => c.id === unitId);

	if (conversion && conversion.priceSaleMax && conversion.priceSaleMin) {
		if (
			conversion.priceSaleMax < Number(value) ||
			conversion.priceSaleMin > Number(value)
		) {
			this.$set(
				this.unitErrors,
				index,
				'El precio debe estar dentro del rango permitido.'
			);
			return;
		}
	}
	this.$delete(this.unitErrors, index);

	this.$set(this.localPriceList.units[index], model, Number(value));
	this.$emit('set-price-list', this.localPriceList);
}

function priceListHandler(newPriceList) {
	this.localPriceList = { ...newPriceList };
}

function addUnitRange(index) {
	this.localPriceList.units[index].ranges = this.localPriceList.units[
		index
	].ranges.concat({ ...this.unitObjectDefault });
}

function removeUnitRange(indexUnit, indexRange) {
	this.localPriceList.units[indexUnit].ranges.splice(indexRange, 1);
	this.$emit('set-price-list', this.localPriceList);
}

function setUnitRangeData({ model, value }, indexUnit, indexRange) {
	const priceListUnit = this.localPriceList.units[indexUnit];
	const unit = this.product.conversions.find((p) => p.name === priceListUnit.name);
	const valueRangeData = model === 'type' ? value : Number(value);
	this.localPriceList.units[indexUnit].ranges[indexRange][model] = valueRangeData;
	const amountExist = this.localPriceList.units[indexUnit].ranges[indexRange].amount;
	if (model === 'amount' || (model === 'type' && amountExist)) {
		const price =
			priceListUnit.ranges[indexRange].type === 'fixed'
				? (this.product.cost + amountExist) * unit.quantity
				: (this.product.cost + (this.product.cost * amountExist) / 100) * unit.quantity;
		this.$set(
			this.localPriceList.units[indexUnit].ranges[indexRange],
			'price',
			Number(price.toFixed(5))
		);
	}
	this.$emit('set-price-list', this.localPriceList);
}

function data() {
	return {
		localPriceList: JSON.parse(JSON.stringify(this.priceList)),
		unitObjectDefault: { price: 0, from: 0, to: 0 },
		showRanges: false,
		showRangesByUnit: false,
		typeCommissions: [
			{ name: 'Porcentaje', code: 'percentage' },
			{ name: 'Dinero', code: 'fixed' },
		],
		isCommissionsView: false,
		unitCommissionsView: [],
		typeEarnings: [
			{ name: 'Porcentaje', code: 'percentage' },
			{ name: 'Monto', code: 'fixed' },
		],
		unitErrors: {},
	};
}

export default {
	name: 'price-list',
	components: {
		autocompleteComponent,
	},
	created() {
		const { comissions } = this.localPriceList;
		if (comissions && comissions.amount !== undefined && comissions.amount !== null) {
			this.isCommissionsView = true;
		}
		if (this.localPriceList.units && this.localPriceList.units.length > 0) {
			this.unitCommissionsView = this.localPriceList.units.map((unit) => {
				const c = unit.comissions;
				return !!(c && c.amount !== undefined && c.amount !== null);
			});
		}
	},
	computed: {
		basePriceComputed,
		basePriceUsed,
	},
	data,
	methods: {
		addRange,
		addUnitRange,
		priceListHandler,
		removeRange,
		removeUnitRange,
		setPriceListData,
		setRangeData,
		setUnitData,
		setUnitRangeData,
		changeCommissionsView() {
			const comissions = this.localPriceList.comissions;
			const isValid = comissions && 'type' in comissions && 'amount' in comissions;
			if (this.isCommissionsView) {
				this.$emit('valid-commissions', isValid);
			} else {
				this.localPriceList.comissions = {};
				this.$emit('valid-commissions', true);
				this.$emit('set-price-list', this.localPriceList);
			}
		},
		setListFlows({ model, value }, flow) {
			if (model === 'type') {
				this.$set(this.localPriceList[flow], model, value);
				this.$set(this.localPriceList[flow], 'amount', 0);
			} else if (model === 'amount') {
				this.$set(this.localPriceList[flow], model, Number(value));
			}
			if (flow === 'comissions') {
				this.changeCommissionsView();
			}
			if (flow === 'earnings') {
				const salePrice =
					this.localPriceList.earnings.type === 'fixed'
						? this.product.cost + this.localPriceList.earnings.amount
						: this.product.cost +
						  (this.product.cost * this.localPriceList.earnings.amount) / 100;
				this.$set(this.localPriceList, 'salePrice', Number(salePrice.toFixed(1)));
			}
			this.$emit('set-price-list', this.localPriceList);
		},
		setUnitListFlows({ model, value }, flow, index) {
			const priceListUnit = this.localPriceList.units[index];
			const unit = this.product.conversions.find((p) => p.name === priceListUnit.name);
			if (model === 'type') {
				this.$set(this.localPriceList.units[index][flow], model, value);
				this.$set(this.localPriceList.units[index][flow], 'amount', 0);
			} else if (model === 'amount') {
				this.$set(this.localPriceList.units[index][flow], model, Number(value));
			}
			if (flow === 'comissions') {
				this.changeUnitCommissionsView(index);
			}
			if (flow === 'earnings') {
				const salePrice =
					priceListUnit.earnings.type === 'fixed'
						? (this.product.cost + priceListUnit.earnings.amount) * unit.quantity
						: (this.product.cost +
								(this.product.cost * priceListUnit.earnings.amount) / 100) *
						  unit.quantity;
				this.$set(
					this.localPriceList.units[index],
					'salePrice',
					Number(salePrice.toFixed(5))
				);
				this.$set(
					this.localPriceList.units[index],
					'price',
					Number(salePrice.toFixed(5))
				);
			}
			this.$emit('set-price-list', this.localPriceList);
		},
		changeUnitCommissionsView(indexUnit) {
			const isChecked = this.unitCommissionsView[indexUnit];
			if (isChecked) {
				const comissions = this.localPriceList.units[indexUnit].comissions;
				if (!comissions || !('type' in comissions)) {
					this.$set(this.localPriceList.units[indexUnit], 'comissions', {
						type: '',
						amount: 0,
						appliedTo: false,
					});
				}
				const c = this.localPriceList.units[indexUnit].comissions;
				const isValid = c && 'type' in c && 'amount' in c;
				this.$emit('valid-commissions', isValid);
			} else {
				this.$set(this.localPriceList.units[indexUnit], 'comissions', {});
				this.$emit('valid-commissions', true);
				this.$emit('set-price-list', this.localPriceList);
			}
		},
		onConfigEarnings(index) {
			const earnings = {
				type: '',
				amount: 0,
			};

			// AGREGAR CAMPOS AL OBJ 'earnings' PARA PODER CONFIGURARLO
			if (typeof index === 'number') {
				const value = this.isObjEmpty(this.localPriceList.units[index].earnings)
					? earnings
					: {};
				this.$set(this.localPriceList.units[index], 'earnings', value);
			} else {
				const value = this.isObjEmpty(this.localPriceList.earnings) ? earnings : {};
				this.$set(this.localPriceList, 'earnings', value);
			}

			// SI NO SE CONFIGURA LA GANANCIA, VOLVER AL PRECIO QUE ESTABA ESTABLECIDO
			if (
				typeof index === 'number' &&
				this.isObjEmpty(this.localPriceList.units[index].earnings)
			) {
				this.$set(
					this.localPriceList.units[index],
					'salePrice',
					this.product.pricesLists[this.indexPriceList].units[index].salePrice
				);
				this.$set(
					this.localPriceList.units[index],
					'price',
					this.product.pricesLists[this.indexPriceList].units[index].salePrice
				);
			} else if (this.isObjEmpty(this.localPriceList.earnings)) {
				this.$set(
					this.localPriceList,
					'salePrice',
					this.product.pricesLists[this.indexPriceList].salePrice
				);
			}

			// SETEAR LA LISTA DE PRECIO
			this.$emit('set-price-list', this.localPriceList);
		},
		isObjEmpty(obj) {
			return obj && Object.keys(obj).length === 0;
		},
	},
	props: {
		open: {
			default: false,
			type: Boolean,
		},
		priceList: {
			default: () => {},
			type: Object,
		},
		product: {
			default: () => {},
			type: Object,
		},
		indexPriceList: {
			default: 0,
			type: Number,
		},
	},
	watch: {
		priceList: {
			deep: true,
			handler: priceListHandler,
		},
	},
};
</script>
<style lang="scss" scoped>
.price-list-name {
	color: color(paginationText);
	font-family: font(open-bold);
	font-size: size(small10);
	text-transform: uppercase;
}

.wrapper-container-price-list {
	align-items: flex-start;
	display: flex;
	justify-content: space-between;
	padding: 0 5px;
}

label {
	font-size: size(small);
	margin-top: 5px;
	margin-bottom: 4px;
}

h3 {
	color: color(primary);
	text-transform: uppercase;
}

.wrapper-unit-price {
	flex: 1 1 27%;
	margin-right: 10px;
}

.price-no-input {
	display: flex;
	flex-direction: column;

	span {
		font-size: 12px;
	}
}

.unit-price,
.sale-price,
.discount {
	flex: 1 1 35%;
	margin-right: 10px;
}

.taxes {
	display: flex;
	flex: 1 1 20%;
	flex-direction: column;
	font-size: size(medium);
	margin-right: 10px;
}

.major-price-check {
	flex: 1 1 43%;
}

.ranges-prices {
	align-items: center;
	display: flex;
	justify-content: space-between;
}

.ranges-prices-title {
	flex: 1 1 30%;
	text-align: left;
}

.major-price {
	flex: 1 1 20%;
}

.separator {
	margin: 0 7px;
}

.sub-title {
	background-color: rgba(#f2f7f7, 0.45);
	border-radius: 5px;
	color: color(primary);
	font-family: font(open-bold);
	font-size: size(small13);
	justify-content: flex-start;
	text-align: left;
	margin: 0;
	text-transform: uppercase;
}

.sub-label-input {
	color: #95999c;
	font-family: font(open-bold);
	font-size: size(small13);
	justify-content: flex-start;
	text-align: left;
	margin: 0;
}

.btn-info {
	background-color: color(primary);
	font-size: 8px;
	width: 75px;
	height: 20px;
	font-family: font(open-bold);
	color: color(white);
	border-radius: 15px;
	margin: 0 5px;
}

.price-list-heading {
	background-color: rgba(#f2f7f7, 0.45);
	border-radius: 5px;
	color: color(primary);
	font-family: font(open-bold);
	font-size: size(small13);
	height: 38px;
	justify-content: flex-start;
	padding: 0px 21px 0px 27px;
	text-align: left;
	text-transform: uppercase;
	width: 100%;

	&.open {
		border-bottom: 1px solid color(item-select);
		border-radius: 0px;
	}
}

.price-list-item {
	background-color: rgba(#f2f7f7, 0.45);
	border: 1.6px solid color(item-select);
	border-radius: 5px;
	margin-bottom: 15px;
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

.pb-price {
	border-bottom: 1px solid color(border-green-light);
	margin: 7px 0px;
}

.price-list-major-item {
	color: color(paginationText);
	font-family: font(open-semibold);
	font-size: size(small10);

	&-title {
		font-family: font(open-regular);
	}
}

.label-tax {
	display: block;
	font-size: 12px;
	margin: 0px;
}

.value-tax {
	display: block;
	font-size: 11px;
}

.ft-14 {
	font-size: 14px;
}

.sections {
	margin-left: 10px;
}

.switch-price {
	margin: 0;
}

.alert-discount {
	color: red;
	font-size: 12px;
}
</style>
