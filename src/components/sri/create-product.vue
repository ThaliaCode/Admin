<template>
	<div>
		<v-layout wrap px-2 py-3>
			<v-flex xs12 px-2>
				<app-select
					:item="model.type"
					item-text="name"
					item-value="id"
					:items="types"
					label="Tipo"
					model="type"
					:return-object="false"
					@input="$emit('set-data', $event)"
				></app-select>
			</v-flex>
			<v-flex xs6 pa-2>
				<slug-input
					input-label="Código"
					:loading="validateLoading"
					:slug="model.code"
					:validated="codeValidated"
					@on-input="$emit('set-data', $event)"
				></slug-input>
				<span class="error--text caption" v-if="!model.code">
					El código es requerido.
				</span>
			</v-flex>
			<v-flex xs6 pa-2>
				<app-input-text
					label="Nombre"
					model="name"
					:text="model.name"
					@input="$emit('set-data', $event)"
				></app-input-text>
				<span class="error--text caption" v-if="!model.name">
					El nombre es requerido.
				</span>
			</v-flex>
			<v-flex xs12 pa-2>
				<app-input-text
					label="Descripción"
					model="description"
					ref="sectionDescription"
					:text="model.description"
					textarea
					@input="$emit('set-data', $event)"
				/>
			</v-flex>
			<v-flex xs6 pa-2>
				<app-select
					autocomplete
					:item="model.categoryId"
					item-text="name"
					item-value="id"
					:items="categories"
					label="Categoría"
					model="categoryId"
					:return-object="false"
					@input="$emit('set-data', $event)"
				></app-select>
			</v-flex>
			<v-flex xs6 pa-2>
				<app-select
					autocomplete
					:item="model.unitId"
					item-text="name"
					item-value="id"
					:items="units"
					label="Unidad"
					model="unitId"
					:return-object="false"
					@input="$emit('set-data', $event)"
				></app-select>
			</v-flex>
			<v-flex xs12 pa-2>
				<app-select
					:item="model.taxUnitId"
					item-text="description"
					item-value="idCodeReference"
					:items="arrayTaxesGeneral"
					label="Impuesto General"
					model="taxUnitId"
					:return-object="false"
					@input="setTaxSelected"
				></app-select>
			</v-flex>
			<v-flex xs6 pa-2>
				<app-input-text
					label="Precio de Costo"
					model="cost"
					:text="model.cost"
					type="number"
					@input="$emit('set-data', $event)"
				></app-input-text>
			</v-flex>
			<v-flex xs6 pa-2>
				<v-checkbox
					class="mt-4"
					color="success"
					hide-details
					label="Incluir IGV"
					:input-value="model.flagTaxCost"
					@change="$emit('set-data', { model: 'flagTaxCost', value: !!$event })"
				></v-checkbox>
			</v-flex>
			<v-flex xs6 pa-2>
				<app-input-text
					label="Precio de Venta"
					model="price"
					:text="model.price"
					type="number"
					@input="$emit('set-data', $event)"
				></app-input-text>
			</v-flex>
			<v-flex xs6 pa-2>
				<label class="caption">Código alternativo</label>
				<v-select
					chips
					tags
					clearable
					single-line
					label="Código alternativo"
					class="filter-select select-input-tag"
					:value="model.alternateCode"
					@input="$emit('set-data', { model: 'alternateCode', value: $event })"
				>
					<template slot="selection" slot-scope="data">
						<v-chip close @input="$emit('remove-alternate-code', data.item)">
							<strong>{{ data.item }}</strong
							>&nbsp;
						</v-chip>
					</template>
				</v-select>
			</v-flex>
			<v-flex xs6 pa-2>
				<app-select
					autocomplete
					:item="model.warehouseId"
					item-text="name"
					item-value="id"
					:items="warehouses"
					label="Almacén"
					model="warehouseId"
					:return-object="false"
					@input="$emit('set-data', $event)"
				></app-select>
				<span class="error--text caption" v-if="!model.warehouseId">
					El almacén es requerido.
				</span>
			</v-flex>
			<v-flex xs6 pa-2>
				<v-switch
					class="body-1 mt-4 ml-2"
					color="success"
					hide-details
					:label="`${labelSwitch} para la venta`"
					v-model="flagSales"
					@change="$emit('change-flag-sales', $event)"
				></v-switch>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="disabled || disabledProd"
				@cancel-button-clicked="$emit('cancel-modal')"
				@accept-button-clicked="save"
			/>
		</section>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import slugInput from '@/components/ecommerce/slug-input';
import helper from '@/shared/helper';

function created() {
	this.flagSales = this.model.flagSales;
	this.warehouses = helper.getLocalData('warehouses');
	this.loadResources();
}

function disabled() {
	return !this.model.code || !this.model.name || !this.model.warehouseId;
}

async function loadResources() {
	const requests = [
		this.categoriesList(),
		this.$httpProducts.get('brands'),
		this.$httpProducts.get('products-types'),
		this.listOfUnits(),
	];
	try {
		[
			{ data: this.categories },
			{ data: this.brands },
			{ data: this.types },
			{ data: this.units },
		] = await Promise.all(requests);

		try {
			this.arrayTaxesGeneral = helper.getLocalData('general-taxes') || [];
			if (this.arrayTaxesGeneral.length === 0) {
				const isPeru = this.$userInfo.company.country.countryCode === 'PE';
				const taxTable = isPeru ? 'TABLA16' : 'TABLA17';
				const { data: taxes } = await this.$httpSales.get(
					`catalog-sunat-details-list/${taxTable}`
				);
				this.arrayTaxesGeneral = taxes;
			}
			this.arrayTaxesGeneral = this.arrayTaxesGeneral
				.map((t) => ({
					...t,
					idCodeReference: `${t.code}${t.percentage || 0}`,
					description: t.description.includes('Porcentaje')
						? t.description
						: t.percentage
						? `${t.description} - Porcentaje: ${t.percentage}`
						: t.description,
					flagTypeTaxes: t.additionalInformation
						? t.additionalInformation.flagTypeTaxes
						: t.flagTypeTaxes || 1,
				}))
				.filter((p) => Number(p.flagTypeTaxes) === 1 || p.flagTaxes === 1);
		} catch (e) {
			console.error('Error loading taxes', e);
		}

		try {
			const { data: pricing } = await this.listPricingPromise();
			this.pricesLists = pricing;
		} catch (e) {
			console.error('Error loading pricing', e);
		}

		const categoryDefault = this.categories[0];
		const typeDefault = this.types.find((t) => t.code === 'productos-terminados');
		const unitDefault = this.units[0];

		const codeTaxDef = this.$userInfo.company.settings.codeTaxesDefault || '01';
		const taxDefault =
			this.arrayTaxesGeneral.find((t) => t.code === codeTaxDef) ||
			this.arrayTaxesGeneral[0];

		this.$emit('set-data', { model: 'categoryId', value: categoryDefault.id });
		this.$emit('set-data', { model: 'unitId', value: unitDefault.id });
		this.$emit('set-data', { model: 'type', value: typeDefault.id });

		if (taxDefault) {
			this.setTaxSelected(taxDefault.idCodeReference);
		}
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function save() {
	if (!this.model.brandId && this.brands.length > 0) {
		const brandDefault = this.brands.find((b) => b.flagDefault) || this.brands[0];
		this.$emit('set-data', { model: 'brandId', value: brandDefault.id });
	}

	// Prepare priceList structure (only the first one as requested)
	if (this.pricesLists && this.pricesLists.length > 0) {
		const firstPriceList = this.pricesLists[0];
		const priceListPayload = {};
		priceListPayload[firstPriceList.id] = {
			price: Number(this.model.price) || 0,
			unitPrice: Number(this.model.price) || 0,
			discount: 0,
			ranges: [],
			taxes: (this.model.taxUnit && this.model.taxUnit.percentage) || 0,
			units: {},
		};
		this.$emit('set-data', { model: 'priceList', value: priceListPayload });
	}

	this.$emit('save-product');
}

function setTaxSelected(idCodeReference) {
	const tax = this.arrayTaxesGeneral.find((t) => t.idCodeReference === idCodeReference);
	if (tax) {
		const isPeru = this.$userInfo.company.country.countryCode === 'PE';
		this.$emit('set-data', { model: 'taxUnitId', value: idCodeReference });
		this.$emit('set-data', { model: 'taxUnit', value: tax });
		this.$emit('set-data', {
			model: 'taxes',
			value: [
				{
					code: tax.code,
					codePercentage: tax.codePercentage || tax.code,
					codeTable: tax.codeTable || (isPeru ? 'TABLA16' : 'TABLA17'),
					name: tax.description,
					percentage: tax.percentage,
					flagSales: true,
					flagPurchases: true,
				},
			],
		});
	}
}

function data() {
	return {
		brands: [],
		categories: [],
		flagSales: false,
		types: [],
		units: [],
		arrayTaxesGeneral: [],
		pricesLists: [],
	};
}
export default {
	name: 'create-product',
	data,
	components: {
		modalSidebarButton,
		slugInput,
	},
	computed: {
		disabled,
	},
	created,
	methods: {
		loadResources,
		save,
		setTaxSelected,
	},
	props: {
		codeValidated: {
			default: false,
			type: Boolean,
		},
		labelSwitch: String,
		model: {
			default: () => {},
			type: Object,
		},
		validateLoading: {
			default: false,
			type: Boolean,
		},
		disabledProd: {
			default: false,
			type: Boolean,
		},
	},
};
</script>
