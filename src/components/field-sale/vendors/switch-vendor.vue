<template>
	<div>
		<v-switch
			:class="classValue"
			hide-details
			v-bind="$attrs"
			v-model="value"
			@change="$emit('on-switch-change', { model: model, value: $event })"
		></v-switch>
	</div>
</template>

<script>
	function created() {
		this.value = this.modelValue;
	}

	function classValue() {
		if (this.prices) {
			return 'switch-vendor switch-prices';
		} else if (this.integration) {
			return 'switch-vendor switch-integration';
		}
		return this.reseller ? 'switch-reseller' : 'switch-vendor';
	}

	function data() {
		return {
			value: null,
		};
	}

	export default {
		name: 'switch-vendor',
		computed: {
			classValue,
		},
		created,
		data,
		inheritAttrs: false,
		props: {
			integration: {
				default: false,
				type: Boolean,
			},
			model: String,
			modelValue: [String, Number],
			prices: {
				default: false,
				type: Boolean,
			},
			reseller: {
				default: false,
				type: Boolean,
			},
		},
		watch: {
			modelValue(newVal) {
				this.value = newVal;
			},
		},
	};
</script>
