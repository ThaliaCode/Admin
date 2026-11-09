<template>
	<div>
		<v-layout wrap>
			<v-flex
				xs12
				my-4
				v-if="
					document.typeBilling === 1 &&
					(document.code !== 'FAC' || document.flagSendBilling === 0)
				"
			>
				<v-radio-group
					row
					v-model="document.flagSendBilling"
					class="sale-radio pt-0"
				>
					<v-radio label="Envío Auto." :value="1" color="success"> </v-radio>
					<v-radio label="Envío Manual" :value="0" color="success"> </v-radio>
				</v-radio-group>
			</v-flex>
			<v-flex xs3 v-if="isEcuador" pr-2>
				<app-input-text
					label="Punto de Emisión"
					:limit-to-filter="8"
					model="codeTaxes"
					counter="3"
					maxlength="3"
					tooltip="Punto de Emisión"
					:text="document.codeTaxes"
					@input="setDetail($event, document)"
				/>
				<span
					class="form-group__message"
					v-if="document.codeTaxes.length !== document.codeTaxesLength"
				>
					3 dígitos
				</span>
			</v-flex>
			<v-flex xs3 pr-2>
				<app-input-text
					label="Serie"
					model="serie"
					:readonly="isEcuador"
					:text="document.serie"
					@input="setDetail($event, document)"
				/>
				<span
					class="form-group__message"
					v-if="validateSerie(document.serie)"
				>
					{{ formatCountry.serieMessage }}
				</span>
			</v-flex>
			<v-flex xs3>
				<app-input-text
					label="Número"
					model="number"
					:text="document.number"
					@input="setDetail($event, document)"
				/>
				<span class="form-group__message" v-if="!document.number">
					{{ formatCountry.numeroMessage }}
				</span>
			</v-flex>
			<v-flex xs3 pl-2>
				<app-select
					:item="document.companyTemplateId"
					item-text="name"
					item-value="id"
					:items="document.templates"
					label="Template"
					model="companyTemplateId"
					:return-object="false"
					@input="setDetail($event, document)"
				/>
			</v-flex>
			<v-flex xs12>
				<app-input-text
					label="Descripción"
					model="description"
					:text="document.description"
					@input="setDetail($event, document)"
				/>
			</v-flex>
		</v-layout>
		<v-layout wrap v-if="document.details && document.details.length > 0">
			<v-flex
				xs12
				v-for="detail in document.details"
				:key="detail.salTypeDocumentsId"
			>
				<v-layout wrap>
					<v-flex xs12>
						<v-subheader class="px-0">
							{{ detail.name }}
						</v-subheader>
					</v-flex>
				</v-layout>
				<v-layout wrap>
					<v-flex xs3 v-if="isEcuador" pr-2>
						<app-input-text
							label="Punto de Emisión"
							:limit-to-filter="8"
							model="codeTaxes"
							counter="3"
							maxlength="3"
							tooltip="Punto de Emisión"
							:text="detail.codeTaxes"
							@input="setDetail($event, document, detail)"
						/>
						<span
							class="form-group__message"
							v-if="detail.codeTaxes.length !== detail.codeTaxesLength"
						>
							3 dígitos
						</span>
					</v-flex>
					<v-flex xs3 pr-2>
						<app-input-text
							label="Serie"
							model="serie"
							:readonly="isEcuador"
							:text="detail.serie"
							@input="setDetail($event, document, detail)"
						/>
						<span
							class="form-group__message"
							v-if="validateSerie(detail.serie)"
						>
							{{ formatCountry.serieMessage }}
						</span>
					</v-flex>
					<v-flex xs3>
						<app-input-text
							label="Número"
							model="number"
							:text="detail.number"
							@input="setDetail($event, document, detail)"
						/>
						<span class="form-group__message" v-if="!detail.number">
							{{ formatCountry.numeroMessage }}
						</span>
					</v-flex>
					<v-flex xs3 pl-2>
						<app-select
							:item="detail.companyTemplateId"
							item-text="name"
							item-value="id"
							:items="detail.templates"
							label="Template"
							model="companyTemplateId"
							:return-object="false"
							@input="setDetail($event, document, detail)"
						/>
					</v-flex>
				</v-layout>
				<v-layout wrap>
					<v-flex xs12>
						<app-input-text
							label="Descripción"
							model="description"
							:text="detail.description"
							@input="setDetail($event, document, detail)"
						/>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
	</div>
</template>
<script>
function isDetails({ details }) {
	return details.length > 0;
}

function setDetail({ model, value }, doc, detail) {
	this.$emit('set-detail', { model, value, doc, detail });
	if (model === 'typeBilling') {
		let newValue = 1;
		if (value === 2) {
			newValue = null;
		}
		const newModel = 'flagSendBilling';
		this.$emit('set-detail', { model: newModel, value: newValue, doc, detail });
	}
}

export default {
	name: 'group-point',
	methods: {
		isDetails,
		setDetail,
		validateSerie(serie) {
			const serieRgx = new RegExp(this.formatCountry.serieRegex);
			return !serieRgx.test(serie);
		},
	},
	props: {
		document: {
			default: () => {},
			type: Object,
		},
		formatCountry: {
			default: () => {},
			type: Object,
		},
	},
};
</script>
