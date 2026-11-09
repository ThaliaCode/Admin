<template>
	<v-layout wrap px-3 pb-5>
		<v-layout v-if="isRelatedDocs">
			<v-flex xs3 mt-2 pr-2>
				<app-input-text label="Serie" model="serie" :text="serie" @input="setData" />
				<span class="form-group__message" v-show="serie && 4 !== serie.length">
					Solo se permite 4 digitos
				</span>
			</v-flex>
			<v-flex xs4 mt-2 pr-2>
				<app-input-text
					type="number"
					label="Numero"
					model="documentNumber"
					:text="documentNumber"
					@input="setData"
				/>
				<span
					class="form-group__message"
					v-show="documentNumber && 8 < documentNumber.length"
				>
					Solo se permite hasta 8 digitos
				</span>
			</v-flex>
			<v-flex xs4 mt-2 pr-2>
				<app-input-text
					type="number"
					:label="
						$route.name === 'reference-guide-carrier-detail' ? 'Ruc del remitente' : 'RUC'
					"
					model="ruc"
					:text="ruc"
					@input="setData"
				/>
				<span class="form-group__message" v-show="ruc && 11 < ruc.length && isPeru">
					Solo se permite hasta 11 digitos
				</span>
			</v-flex>
		</v-layout>
		<v-flex xs10 mt-2 pr-2 v-else>
			<app-input-text
				label="Datos Adicionales"
				model="info"
				:text="info"
				@input="$emit('set-data', $event)"
				@keypress.enter.native="$emit('add-data')"
			/>
		</v-flex>
		<v-flex xs1 pt-4>
			<v-btn
				class="btn-auto btn-total px-1 ma-0 white--text"
				color="blue"
				:disabled="disabled"
				@click="addData"
			>
				<v-icon>add</v-icon>
			</v-btn>
		</v-flex>
		<v-flex xs11 v-for="(additionalInfo, index) in dataAdded" :key="index">
			<additional-data-field
				:additional-data="additionalInfo"
				@remove-data="$emit('remove-data', index)"
			/>
		</v-flex>
	</v-layout>
</template>

<script>
import additionalDataField from './additional-data-field';

export default {
	name: 'additional-data',
	components: {
		additionalDataField,
	},
	data() {
		return {
			documentNumber: null,
			serie: null,
			ruc: null,
		};
	},
	methods: {
		setData({ model, value }) {
			this[model] = value;
			const infoGuide = `Guía de Remisión Remitente N° ${this.serie}-${this.documentNumber} - RUC ${this.ruc}`;
			this.$emit('set-data', { model: 'info', value: infoGuide });
		},
		addData() {
			this.documentNumber = null;
			this.ruc = null;
			this.serie = null;
			this.$emit('add-data');
		},
	},
	computed: {
		disabled() {
			if (this.isRelatedDocs) {
				return !(
					this.serie &&
					this.serie.length === 4 &&
					this.documentNumber &&
					this.documentNumber.length <= 8 &&
					this.ruc &&
					(!this.isPeru || this.ruc.length <= 11)
				);
			}
			return !this.info;
		},
	},
	props: {
		dataAdded: {
			default: () => [],
			type: Array,
		},
		info: String,
		isRelatedDocs: {
			default: false,
			type: Boolean,
		},
	},
};
</script>
