<template>
    <v-tabs
		class="data-fast-configuration-container"
		right
		slider-color="blue darken-1"
		v-model="active"
	>
		<v-tab class="caption white--text">
			General
		</v-tab>
		<v-tab class="caption white--text">
			Diferidos
		</v-tab>
		<v-tab class="caption white--text">
			Banco
		</v-tab>
		<v-tab-item>
			<form-configuration
				:code="code"
				:configuration-template="configurationTemplate"
				:form="form"
				:disabled="disabled"
				@accept-action="acceptAction"
				@close-modal="closeModal"
				@get-data="setData"
			/>
		</v-tab-item>
		<v-tab-item>
			<DataFastDeferred/>
		</v-tab-item>
		<v-tab-item>
			<DataFastCreditCardComponent
				:credit-cards="creditCards"
				@close-modal="closeModal"
			/>
		</v-tab-item>
	</v-tabs>
</template>
<script>
import formConfiguration from '@/components/integration/form-configuration';
import DataFastCreditCardComponent from '@/components/integration/datafast/datafast-creditcard-component';
import DataFastDeferred from '@/components/integration/datafast/datafast-deferred';

function acceptAction() {
	this.$emit('accept-action');
}

function closeModal() {
	this.$emit('close-modal');
}

function setData(val) {
	this.$emit('get-data', val);
}

function data() {
	return {
		active: 0,
		creditCards: [
			{ banksId: [], title: 'American Express', active: false },
			{ banksId: [], title: 'Visa', active: false },
			{ banksId: [], title: 'Mastercard', active: false },
			{ banksId: [], title: 'Dinners', active: false },
		],
	};
}

export default {
	name: 'DataFastConfigurationForm',
	components: {
		DataFastCreditCardComponent,
		DataFastDeferred,
		formConfiguration,
	},
	data,
	methods: {
		acceptAction,
		closeModal,
		setData,
	},
	props: {
		code: {
			required: true,
			type: String,
		},
		configurationTemplate: {
			default: () => {},
			type: Object,
		},
		disabled: {
			default: false,
			type: Boolean,
		},
		file: {
			default: () => {},
			type: Object,
		},
		form: {
			default: () => {},
			type: Object,
		},
	},
};
</script>
<style lang="scss">
.data-fast-configuration-container {
	.tabs__container {
		padding: 0;
		.caption {
			width: 100%;
			.tabs__item {
				color: color(brown-grey);
			}
			.tabs__item--active {
				background-color: color(primary) !important;
				color: white;
			}
		}
	}
}
</style>