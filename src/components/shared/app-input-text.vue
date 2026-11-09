<template>
	<label class="app-input-text-container">
		<v-text-field
			ref="inputRef"
			:autocomplete="autocomplete"
			hide-details
			v-bind="$attrs"
			class="filter-select"
			:class="{
				'show-error': errorClass,
				'textarea-custom': textareaClass,
				'new-error': error,
			}"
			:style="`max-width: ${maxWidth}px`"
			:placeholder="newPlaceholder"
			:value="text"
			:maxlength="maxLength"
			@input="sendValue"
			@keyup.enter="sendValueEnter"
			@keyup.exact="showError"
			@change="onChange"
			@blur="onBlur"
			@focus="onFocus"
		></v-text-field>
		<template v-if="tooltip">
			<div class="layout">
				<div>
					<v-tooltip top>
						<label class="label" :for="labelFor" slot="activator">
							{{ label | limitTo(limitToFilter) }}
						</label>
						<span>{{ label }}</span>
					</v-tooltip>
				</div>
				<div class="ml-3" v-if="information">
					<v-tooltip top>
						<img
							src="/static/img/informacion.svg"
							alt="signo de interrogación"
							slot="activator"
							class="pb-1"
							height="20"
						/>
						<p class="mb-0 m-w-170">{{ informationText }}</p>
					</v-tooltip>
				</div>
			</div>
		</template>
		<template v-else>
			<label class="label" :for="labelFor">
				{{ label }}
				<v-tooltip top v-if="information">
					<img
						src="/static/img/informacion.svg"
						alt="signo de interrogación"
						slot="activator"
						class="ml-3 pb-1"
						height="20"
					/>
					<p class="mb-0 m-w-170">{{ informationText }}</p>
				</v-tooltip>
			</label>
		</template>
	</label>
</template>

<script>
function newPlaceholder() {
	return this.placeholder || this.label;
}

function onChange(value) {
	this.$emit('change', value);
}

function onBlur(value) {
	this.$emit('blur', value);
}

function onFocus(value) {
	this.$emit('focus', value);
}

function sendValue(value) {
	const onSearch = this.searcher && this.model === 'search';
	const body = { value, model: this.model, onSearch };
	this.$emit('input', body);
}

function sendValueEnter(event) {
	this.$emit('input-enter', event);
}

function showError(value) {
	this.$emit('show-error', value);
}

export default {
	name: 'app-input-text',
	computed: {
		newPlaceholder,
	},
	inheritAttrs: false,
	methods: {
		onBlur,
		onFocus,
		onChange,
		sendValue,
		sendValueEnter,
		showError,
		focus() {
			if (this.$refs.inputRef && typeof this.$refs.inputRef.focus === 'function') {
				this.$refs.inputRef.focus();
			}
		},
	},
	props: {
		autocomplete: {
			default: 'off',
			type: String,
		},
		error: {
			default: false,
			type: Boolean,
		},
		errorClass: {
			default: false,
			type: Boolean,
		},
		label: String,
		labelFor: String,
		limitToFilter: [Number, String],
		maxWidth: Number,
		model: String,
		placeholder: String,
		searcher: {
			default: false,
			type: Boolean,
		},
		maxLength: [Number, String],
		text: [Number, String],
		textareaClass: {
			type: Boolean,
			default: false,
		},
		tooltip: [String, Number],
		information: {
			type: Boolean,
			default: false,
		},
		informationText: [String, Number],
	},
};
</script>

<style lang="scss" scoped>
.app-input-text-container {
	display: flex;
	flex-direction: column-reverse;
	flex-wrap: wrap;
}

.label {
	color: color(brown-grey) !important;
	font-family: font(open-regular);
	font-size: size(small13);
	margin-bottom: 1px;
}

.text-field {
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 3px;
	padding: 0 16px;
}

.m-w-170 {
	max-width: 170px;
}
</style>
