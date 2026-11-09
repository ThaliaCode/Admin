<template>
	<v-layout
		align-end
		row wrap px-3
		pt-4 pb-5 mb-5
		>
		<v-flex xs11>
			<v-layout row wrap align-center>
				<v-flex xs6 px-2>
					<app-input-text
					label="Label"
					model="label"
					:text="additionalInformationModel.label"
					@input="setAdditionalData"
					@input-enter="addAdditionalData"
					></app-input-text>
				</v-flex>
				<v-flex xs6 px-2>
					<app-input-text
						label="Valor"
						model="value"
						:text="additionalInformationModel.value"
						@input="setAdditionalData"
						@input-enter="addAdditionalData"
					></app-input-text>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex xs1 pb-1>
			<app-tooltip-button
				color="success"
				:disabled="!additionalInformationModel.label || !additionalInformationModel.value"
				icon="add_circle"
				text="Agregar dato adicional"
				@click-icon="addAdditionalData"
				></app-tooltip-button>
		</v-flex>
		<v-flex xs12>
			<v-layout row wrap px-2 pt-3 v-if="additionalInformation.length > 0">
				Datos adicionales agregados:
			</v-layout>
			<v-layout
				row wrap align-end
				v-for="(additionalData, index) in additionalInformation"
				:key="index"
			>
				<v-flex xs11>
					<v-layout row wrap align-center>
						<v-flex xs6 px-2>
							<app-input-text
								disabled
								readonly
								label="Label"
								:text="additionalData.label"
							></app-input-text>
						</v-flex>
						<v-flex xs6 px-2>
							<app-input-text
								disabled
								readonly
								label="Valor"
								:text="additionalData.value"
							></app-input-text>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs1 pb-1>
					<app-tooltip-button
						color="error"
						icon="remove_circle"
						text="Eliminar Dato adicional"
						@click-icon="removeAdditionalData(additionalData)"
					></app-tooltip-button>
				</v-flex>
				</v-layout>
		</v-flex>
		</v-layout>
</template>

<script>

function created() {
	if (this.personalInformationFeature) {
		this.additionalInformation = this.personalInformationFeature;
	}
}

function addAdditionalData() {
	if (this.additionalInformationModel.label && this.additionalInformationModel.value) {
		this.additionalInformation.push(this.additionalInformationModel);
		this.additionalInformationModel = { label: '', value: '' };
		this.setAdditionalInformation();
	} else {
		this.showNotification('Es necesario agregar información en los campos', 'warning');
	}
}

function setAdditionalInformation() {
	const productAdditionalInformation = {
		model: 'features',
		value: this.additionalInformation,
	};
	this.$emit('set-additional-information', productAdditionalInformation);
}

function removeAdditionalData({ label, value }) {
	const index = this.additionalInformation.findIndex(ad =>
		ad.label === label && ad.value === value);
	if (index > -1) {
		this.additionalInformation.splice(index, 1);
	}
}

function setAdditionalData({ model, value }) {
	this.additionalInformationModel[model] = value;
}

function data() {
	return {
		additionalInformation: [],
		additionalInformationModel: {
			label: '',
			value: '',
		},
		disabled: false,
	};
}

export default {
	created,
	data,
	name: 'product-additional-information',
	methods: {
		addAdditionalData,
		setAdditionalData,
		setAdditionalInformation,
		removeAdditionalData,
	},
	props: ['personalInformationFeature'],
};

</script>

