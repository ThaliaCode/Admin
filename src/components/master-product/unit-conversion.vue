<template>
	<div>
		<div class="wraper-container-conversion">
			<app-input-text
				label="Cant."
				model="quantity"
				type="number"
				class="conversion-quantity"
				:text="localConversion.quantity"
				@input="setData"
			/>
			<app-input-text
				readonly
				label="Unidad"
				model="unityCode"
				class="conversion-selected ml-1"
				:text="selectedUnit.name"
			/>
			<small class="eq">Equivale a</small>
			<v-flex mr-2 pt-2>
				<v-layout column>
					<v-flex class="caption title-caption">Cantidad</v-flex>
					<v-flex class="caption">{{ localConversion.quantityTo }}</v-flex>
				</v-layout>
			</v-flex>
			<app-select
				item-text="name"
				item-value="id"
				label="Unidades"
				model="id"
				class="conversion-id"
				:item="localConversion.id"
				:items="units"
				@input="setData"
			/>
			<app-input-text
				label="Cod. Conv."
				tooltip="Código Conversión"
				placeholder="*Opcional"
				class="code-conversion ml-1"
				model="barcode"
				:text="localConversion.barcode"
				@input="setCode"
			/>
		</div>
		<v-flex xs12 class="subtitle-section">
			<v-layout row wrap align-center>
				<v-flex xs10>
					<label>Configuración de precio mínimo y máximo</label>
				</v-flex>
				<v-flex xs2>
					<label
						class="product-checkbox-label justify-end"
						:for="`conversion-show-max-min${conversion.id}`"
					>
						<span class="product-checkbox product-checkbox-subtitle">
							<img
								v-if="conversion.showMaxMin"
								src="/static/img/checked.svg"
								height="13"
							/>
							<input
								hidden
								:id="`conversion-show-max-min${conversion.id}`"
								:name="`conversion-show-max-min${conversion.id}`"
								type="checkbox"
								:value="conversion.showMaxMin"
								:checked="conversion.showMaxMin"
								@change="setShowMaxMin($event.target.checked)"
							/>
						</span>
					</label>
				</v-flex>
			</v-layout>
		</v-flex>
		<div style="text-align: left !important; display: flex; justify-content: space-between; gap: 10px;" v-if="conversion.showMaxMin">
			<app-input-text
				label="Precio mínimo"
				model="priceSaleMin"
				type="number"
				class="conversion-quantity"
				:text="conversion.priceSaleMin"
				@input="setData"
			/>
			<app-input-text
				label="Precio máximo"
				model="priceSaleMax"
				type="number"
				class="conversion-quantity"
				:text="conversion.priceSaleMax"
				@input="setData"
			/>
		</div>
	</div>
</template>
<script>
function setCode({ model, value }) {
	this.localConversion[model] = value;
	this.$emit('set-conversion', this.localConversion);
}

function setData({ model, value }) {
	const newValue = model === 'id' ? value.id : Number(value);
	this.localConversion[model] = newValue;
	this.$emit('set-conversion', this.localConversion);
}

function conversionHandler(newConversion) {
	this.localConversion = newConversion;
}

function setShowMaxMin(value) {
	this.$emit('change-show-max-min', value);
}

function data() {
	return {
		localConversion: { ...this.conversion },
	};
}

export default {
	name: 'unit-conversion',
	data,
	methods: {
		conversionHandler,
		setCode,
		setData,
		setShowMaxMin
	},
	props: {
		conversion: {
			default: () => {},
			type: Object,
		},
		selectedUnit: {
			default: () => {},
			type: Object,
		},
		units: {
			default: () => [],
			type: Array,
		},
	},
	watch: {
		conversion: {
			deep: true,
			handler: conversionHandler,
		},
	},
};
</script>
<style lang="scss" scoped>
.wraper-container-conversion {
	align-items: center;
	display: flex;
	justify-content: space-between;
}

.conversion-quantity {
	flex: 1 1 12%;
	text-align: left;
}

.conversion-selected {
	flex: 1 1 12%;
	text-align: left;
}

.code-conversion {
	flex: 1 1 17%;
	text-align: left;
}

.conversion-quantityTo {
	flex: 1 1 16%;
	text-align: left;
}

.eq {
	flex: 1 1 14%;
	margin-top: 18px;
	margin-right: 5px;
}

.conversion-id {
	flex: 23%;
	text-align: left;
}

.title-caption {
	color: color(sidebar);
	font-weight: bold;
}

.subtitle-section {
	border-bottom: 1px solid color(border-green-light);
	color: color(background-sidebar);
	font-family: font(open-bold);
	font-size: 12px;
	letter-spacing: normal;
	margin-block: 12px;
	padding-bottom: 8px;
	text-transform: uppercase;
	text-align: left;

	& label{
		font-size: 10px;
	}

	&-caption {
		font-family: font(open-regular);
		font-size: 8px;
		text-transform: none;
		color: red;
	}
}

.product-checkbox {
	align-items: center;
	border-style: solid;
	border-width: 1px;
	border-radius: 2px;
	display: flex;
	justify-content: center;

	&-label {
		align-items: center;
		color: color(paginationText);
		display: flex;
		font-family: font(lato-regular);
		font-size: size(medium);

		& > span:not(.product-checkbox) {
			padding-left: 13px;
		}
	}

	&.product-checkbox-subtitle {
		height: 15px;
		width: 15px;
	}
}

</style>
