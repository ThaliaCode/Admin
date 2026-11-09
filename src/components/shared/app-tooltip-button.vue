<template>
	<v-tooltip :top="top" :left="left">
		<v-btn
			flat
			icon
			slot="activator"
			small
			class="btn-auto ma-0"
			:class="{ 'icon-rotate': iconRotate }"
			:color="color"
			:disabled="disabled"
			:loading="loading"
			@click.prevent.stop="clickIcon"
		>
			<template v-if="img">
				<img :src="img" :alt="text" :height="height" />
			</template>
			<template v-else>
				<v-icon :style="isListAll" :size="height" v-bind="$attrs">
					{{ icon }}
				</v-icon>
			</template>
		</v-btn>
		<span v-if="showText">{{ text }} </span>
	</v-tooltip>
</template>

<script>
function clickIcon(mouseEvent) {
	if (this.getMouseEvent) {
		this.$emit('click-icon', mouseEvent);
	} else {
		this.$emit('click-icon');
	}
}

function isListAll() {
	// Ugly hack since vuetify or material icon has an specify bug with this icon
	// Feel free to remove it if you cannot reproduce it anymore
	return this.icon === 'list_all' ? 'height:24px;width:24px' : '';
}

export default {
	name: 'app-tooltip-button',
	computed: {
		isListAll,
	},
	inheritAttrs: false,
	props: {
		color: {
			type: String,
			default: 'green',
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		getMouseEvent: {
			default: false,
			type: Boolean,
		},
		height: [Number, String],
		icon: String,
		iconRotate: {
			default: false,
			type: Boolean,
		},
		img: String,
		left: {
			type: Boolean,
			default: false,
		},
		loading: {
			type: Boolean,
			default: false,
		},
		text: {
			type: String,
		},
		top: {
			type: Boolean,
			default: true,
		},
		showText: {
			type: Boolean,
			default: true,
		},
	},
	methods: {
		clickIcon,
	},
};
</script>
<style lang="scss" scoped>
.icon-rotate {
	transform: rotate(180deg);
}

.red-text {
	color: #d5331a;
}
</style>
