<template>
	<v-flex>
		<v-flex xs12>
			<v-alert :value="showInvalid" type="error">
				<span>
					El descuento global no debe ser mayor o igual al total de la venta.
				</span>
			</v-alert>
		</v-flex>
		<v-layout column px-3 pt-4>
			<v-flex xs12 mb-2>
				<app-input-text
					label="Código de compañía"
					model="extCompanyCode"
					:text="information.extCompanyCode"
					@input="$emit('set-input', $event)"
				/>
			</v-flex>
			<!-- <v-flex xs12>
				<v-checkbox
					color="primary"
					hide-details
					label="Aplicar Descuento Global"
					v-model="information.showDiscount"
				></v-checkbox>
			</v-flex> -->
			<v-flex xs4 mt-2 v-if="information.showDiscount">
				<app-input-text
					type="number"
					label="Descuento Global"
					model="discountGlobal"
					:text="information.discountGlobal"
					@input="$emit('set-input', $event)"
				/>
			</v-flex>
			<v-flex xs12 mt-2>
				<v-checkbox
					color="primary"
					hide-details
					label="Aplicar Orden de Compra"
					v-model="information.showOrder"
				></v-checkbox>
			</v-flex>
			<v-flex xs4 mt-2 v-if="information.showOrder">
				<app-input-text
					label="Número de orden de compra"
					model="amountOrder"
					:text="information.amountOrder"
					@input="$emit('set-input', $event)"
				/>
			</v-flex>
			<template v-if="showGuideOption">
				<v-flex xs12 mt-3>
					<v-layout row wrap align-center>
						<v-flex xs10>
							<span class="body-1">Guías de Remisión</span>
						</v-flex>
						<v-flex xs2 text-xs-right>
							<v-tooltip top>
								<v-btn icon color="primary" slot="activator" @click="addGuide">
									<v-icon color="white">add</v-icon>
								</v-btn>
								<span>Agregar guía</span>
							</v-tooltip>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-layout
					row
					wrap
					align-end
					mb-2
					v-for="(guide, indexGuide) in information.guides"
					:key="indexGuide"
				>
					<v-flex xs4 pr-2>
						<app-select
							label="Tipo de guía"
							item-text="name"
							item-value="value"
							:item="guide.type"
							:items="guideTypes"
							:return-object="false"
							@input="setGuideType(indexGuide, $event)"
						/>
					</v-flex>
					<v-flex xs3 pr-2>
						<app-input-text
							label="Serie"
							model="serie"
							:text="guide.serie"
							@input="setGuideSerie(indexGuide, $event)"
						/>
					</v-flex>
					<v-flex xs3 pr-2>
						<app-input-text
							label="Número"
							model="number"
							:text="guide.number"
							@input="setGuideNumber(indexGuide, $event)"
						/>
					</v-flex>
					<v-flex xs2 text-xs-right>
						<v-tooltip top>
							<v-btn
								icon
								color="error"
								slot="activator"
								@click="removeGuide(indexGuide)"
							>
								<v-icon color="white">delete</v-icon>
							</v-btn>
							<span>Eliminar</span>
						</v-tooltip>
					</v-flex>
				</v-layout>
			</template>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					:is-loading="showLoading"
					@cancel-button-clicked="$emit('cancel')"
					@accept-button-clicked="$emit('save-modal')"
				/>
			</section>
		</v-layout>
	</v-flex>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import appSelect from '@/components/shared/app-select';

function created() {
	this.information = this.informationData;
}
function data() {
	return {
		information: {},
		guideTypes: [
			{ value: '09', name: 'Guía de Remisión' },
			{ value: '31', name: 'Guía de Remisión Transportista' },
		],
	};
}
function addGuide() {
	if (!this.information.guides) {
		this.$set(this.information, 'guides', []);
	}
	this.information.guides.push({ type: '09', serie: '', number: '' });
}
function removeGuide(indexGuide) {
	this.information.guides.splice(indexGuide, 1);
}
function setGuideSerie(indexGuide, { value }) {
	this.information.guides[indexGuide].serie = value;
}
function setGuideNumber(indexGuide, { value }) {
	this.information.guides[indexGuide].number = value;
}
function setGuideType(indexGuide, { value }) {
	this.information.guides[indexGuide].type = value;
}
export default {
	name: 'app-information-additional',
	data,
	created,
	methods: {
		addGuide,
		removeGuide,
		setGuideSerie,
		setGuideNumber,
		setGuideType,
	},
	props: {
		informationData: {
			default: () => {},
			type: Object,
		},
		showLoading: {
			default: false,
			type: Boolean,
		},
		showInvalid: {
			default: false,
			type: Boolean,
		},
		amountSale: {
			type: Number,
		},
		showGuideOption: {
			default: false,
			type: Boolean,
		},
	},
	components: {
		modalSidebarButton,
		appSelect,
	},
};
</script>
