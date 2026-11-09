<template>
	<v-layout row wrap class="section-tab">
		<v-flex xs12 pa-3 class="section-tab-alert" v-if="!!warningMessage">
			<img
				src="/static/icon/alert.svg"
				alt="alerta"
				height="24px"
				class="mr-3"
			/>
			<label>
				{{ warningMessage }}
			</label>
		</v-flex>
		<v-flex xs12 px-5 pb-5 pt-3 class="section-tab-container">
			<v-layout wrap justify-center>
				<v-flex xs12 text-xs-right pr-4 pb-4 mr-2>
					<v-btn
						class="btn-action btn-auto px-4 py-2 mr-1"
						color="error"
						:disabled="errorsQuantity === 0"
						@click="$emit('show-errors')"
					>
						Errores ({{ errorsQuantity }})
					</v-btn>
				</v-flex>
				<mail-btn
					v-for="integration in category.integrations"
					:key="integration.id"
					:integration="integration"
					@check-integration="$emit('check-integration', { category, integration })"
					@open-slide="$emit('open-slide', { category, integration, readonly: $event })"
					@check-additional-information="$emit('check-additional-information', { category, integration })"
				></mail-btn>
			</v-layout>
		</v-flex>
	</v-layout>
</template>

<script>
	import mailBtn from '@/components/integration/mail-btn';

	function categoryIs(code) {
		return this.category.code === code;
	}

	function componentTag(field) {
		return field.options ? 'app-select' : 'app-input-text';
	}

	export default {
		name: 'section-tab',
		components: {
			mailBtn,
		},
		methods: {
			categoryIs,
			componentTag,
		},
		props: {
			category: {
				default: () => {},
				type: Object,
			},
			configurationTemplate: {
				default: () => {},
				type: Object,
			},
			errorsQuantity: [Number, String],
			warningMessage: String,
		},
	};
</script>

<style lang="scss" scoped>
	.section-tab {
		&-alert {
			background: color(green-opacity);
			color: color(background-sidebar);
			font-family: font(open-bold);
			font-size: size(medium);
		}
	}

	.integration-name {
		font-family: font(open-bold);
		font-size: size(medium);
	}
</style>