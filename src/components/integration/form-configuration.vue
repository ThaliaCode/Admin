<template>
	<v-layout wrap pa-4>
		<v-flex xs12 v-for="(tag, key) in getItems(configurationTemplate)" :key="key" mb-3>
			<template v-if="tag.type === 'boolean'">
				<switch-vendor
					class="mb-3"
					:disabled="readonly"
					integration
					:label="tag.labelName"
					:model="key"
					:false-value="0"
					:model-value="form[code][key]"
					:true-value="1"
					@on-switch-change="$emit('get-data', $event)"
				></switch-vendor>
				<v-layout row wrap>
					<v-flex xs12 v-for="(item, i) in getItems(tag[form[code][key]])" :key="i">
						<template v-if="readonly">
							<label class="caption">{{ item.labelName }}:</label>
							<template v-if="item.options">
								<p>
									<template v-for="(option, optionIndex) in form[code][i]">
										<span
											class="detail-info pr-2"
											:key="option.id"
											v-if="option.flagActive"
										>
											<span>{{ option.name }}</span>
											<span v-if="(form[code][i].length > 1) && (optionIndex < (form[code][i].length - 1))">,</span>
										</span>
									</template>
								</p>
							</template>
							<template v-else>
								<p class="detail-info mb-0" v-html="form[code][i]"></p>
							</template>
						</template>
						<template v-else>
							<component
								:autocomplete="false"
								:is="componentTag(item)"
								:item="form[code][i]"
								item-text="name"
								item-value="code"
								:items="item.options"
								:label="item.labelName"
								:file="file"
								:model="i"
								:text="form[code][i]"
								:type="item.type"
								:return-object="false"
								@input="$emit('get-data', $event)"
							></component>
						</template>
						<span
							class="caption error--text"
							v-if="!readonly && (item.type !== 'list' && item.required && !form[code][i])"
						>
							El campo es requerido
						</span>
						<span
							class="caption error--text"
							v-if="!readonly &&  (item.type === 'list' && item.required && item.options &&
								item.options.every(i => !i.flagActive))"
						>
							Es necesario seleccionar una o más opciones
						</span>
					</v-flex>
				</v-layout>
			</template>
			<template v-else>
				<template v-if="readonly">
					<label class="caption">{{ tag.labelName }}:</label>
					<template v-if="tag.options">
						<p>
							<template v-for="(option, optionIndex) in form[code][key]">
								<span
									class="detail-info pr-2"
									:key="option.id"
									v-if="option.flagActive"
								>
									<span>{{ option.name }}</span>
									<span v-if="(form[code][key].length > 1) && (optionIndex < (form[code][key].length - 1))">,</span>
								</span>
							</template>
						</p>
					</template>
					<template v-else>
						<p class="detail-info mb-0" v-html="form[code][key]"></p>
					</template>
				</template>
				<template v-else>
					<component
						:autocomplete="false"
						base-six-four
						:is="componentTag(tag)"
						:item="form[code][key]"
						item-text="name"
						item-value="code"
						:items="tag.options"
						:label="tag.labelName"
						:file="file"
						:model="key"
						:text="form[code][key]"
						:return-object="false"
						@input="$emit('get-data', $event)"
					></component>
				</template>
				<span
					class="caption error--text"
					v-if="!readonly && (tag.type !== 'list' && tag.required && !form[code][key])"
				>
					El campo es requerido
				</span>
				<span
					class="caption error--text"
					v-if="!readonly && (tag.type === 'list' && tag.required && tag.options &&
						tag.options.every(t => !t.flagActive))"
				>
					Es necesario seleccionar una o más opciones
				</span>
			</template>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabled"
				@accept-button-clicked="$emit('accept-action', readonly)"
				@cancel-button-clicked="$emit('close-modal')"
			/>
		</section>
	</v-layout>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import switchVendor from '@/components/field-sale/vendors/switch-vendor';
import CreditCardComponent from '@/components/integration/datafast/datafast-creditcard-component';

function componentTag(field) {
	if (this.readonly) {
		return 'p';
	} else if (field.upload) {
		return 'app-input-upload';
	} else if (field.type === 'check-list' || field.type === 'list') {
		return 'check-list';
	} else if (field.type === 'credit-cards') {
		return 'CreditCardComponent';
	}
	return field.options ? 'app-select' : 'app-input-text';
}

function getItems(items) {
	const keys = Object.keys(items);
	const configItems = keys.map(k => ({
		key: k,
		...items[k],
	}));
	const itemsOrder = configItems.sort((c, i) => c.order - i.order);
	return itemsOrder.reduce((a, io) => {
		const newA = { ...a };
		newA[io.key] = { ...io };
		delete newA.key;
		return newA;
	}, {});
}

function data() {
	return {
		types: [],
	};
}

export default {
	name: 'form-configuration',
	components: {
		CreditCardComponent,
		modalSidebarButton,
		switchVendor,
	},
	data,
	methods: {
		componentTag,
		getItems,
	},
	props: {
		code: String,
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
		readonly: {
			default: false,
			type: Boolean,
		},
	},
};
</script>
<style lang="scss" scoped>
.detail-info {
	color: color(paginationText);
	font-family: font(open-bold);
	font-size: size(medium);
}
</style>