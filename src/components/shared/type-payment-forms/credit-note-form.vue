<template>
	<div>
		<v-layout wrap px-2 align-end>
			<v-flex xs3 caption mb-2 pb-3>Nro. Documento</v-flex>
			<v-flex xs2 px-1 mb-2>
				<v-layout wrap align-end>
					<v-flex xs11 pr-1>
						<app-input-text
							label="Serie"
							model="serie"
							type="number"
							:text="model.serie"
							:readonly="loading"
							@input="setData"
						/>
					</v-flex>
					<v-flex xs1 pl-1 pb-2 text-xs-center> - </v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs3 px-1 mb-2 pl-1>
				<app-input-text
					type="number"
					label="Número"
					model="number"
					:readonly="loading"
					:text="model.number"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs1 mb-2 pb-2>
				<v-btn
					:color="validateColor"
					class="btn-action btn-auto px-1"
					:disabled="disabled"
					@click="$emit('valid-note', model)"
				>
					<template v-if="loading">
						<v-progress-circular indeterminate color="white"></v-progress-circular>
					</template>
					<template v-else-if="validate">
						<v-icon color="white">{{ icon }}</v-icon>
					</template>
					<template v-else> Validar </template>
				</v-btn>
			</v-flex>
			<v-flex xs3 pl-2 pr-1 mb-2>
				<app-date-mask
					label="Fecha"
					:picker="valueDate"
					readonly
					@format-date="onDate($event, 'date')"
				/>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
import { format } from 'date-fns';

function disabled() {
	return this.loading || !this.model.serie || !this.model.number;
}

function onDate(value, modelName) {
	this.model[modelName] = value;
}

function setData({ model, value }) {
	this.model[model] = value;
	this.$emit('set-data', { model, value });
}

function valueDate(value) {
	const newDate = format(value, 'YYYY-MM-DD');
	if (this.model.date !== newDate) {
		this.onDate(newDate, 'date');
	}
}

function data() {
	return {
		model: {
			date: null,
			serie: null,
			number: null,
		},
	};
}

export default {
	name: 'credit-note-form',
	computed: {
		disabled,
	},
	data,
	methods: {
		onDate,
		setData,
	},
	props: {
		icon: String,
		loading: {
			default: false,
			type: Boolean,
		},
		validate: {
			default: false,
			type: Boolean,
		},
		validateColor: {
			default: 'primary',
			type: String,
		},
		valueDate: [Date, String],
	},
	watch: {
		valueDate,
	},
};
</script>
