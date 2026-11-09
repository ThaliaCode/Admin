<template>
	<v-layout row wrap pa-4>
		<v-flex xs12 mb-2>
			<app-select
				:item="template.typeNotificationCode"
				item-text="name"
				item-value="code"
				:items="types"
				label="Tipo de template"
				model="typeNotificationCode"
				:return-object="false"
				@input="$emit('get-data', $event)"
			></app-select>
		</v-flex>
		<v-flex xs12 mb-2>
			<app-input-text
				:text="template.name"
				label="Nombre de template"
				model="name"
				@input="$emit('get-data', $event)"
			></app-input-text>
		</v-flex>
		<v-flex xs12 mb-2>
			<label ref="label-process-template" for="process-template">
				<vue-six-four id="process-template" hidden @vue-six-four="$emit('get-file', $event)" />
				<v-layout wrap>
					<v-flex xs10>
						<app-input-text
							label="Vista previa de template"
							readonly
							:text="template.urlImage"
						/>
					</v-flex>
					<v-flex xs2 mt-4 text-xs-left>
						<v-btn
							class="ma-0 pl-0 btn-auto pt-2 pb-1 btn-upload-image"
							color="success"
							@click="showDialog"
						>
							<img
								src="/static/img/upload-image.svg"
								alt="Subir Imagen"
								height="17"
								width="20"
							/>
						</v-btn>
					</v-flex>
				</v-layout>
			</label>
		</v-flex>
		<v-flex xs12 mb-2>
			<app-input-text
				:text="template.tramaHtml"
				textarea
				label="Código de HTML"
				model="tramaHtml"
				@input="$emit('get-data', $event)"
			></app-input-text>
		</v-flex>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabled"
				:img="false"
				success-color="primary"
				success-text="Guardar"
				@accept-button-clicked="$emit('create-template')"
				@cancel-button-clicked="$emit('close-slide')"
			/>
		</section>
	</v-layout>
</template>

<script>
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
	import VueSixFour from 'vue-six-four';

	function showDialog() {
		this.$refs['label-process-template'].click();
	}

	export default {
		name: 'process-template',
		components: {
			modalSidebarButton,
			VueSixFour,
		},
		methods: {
			showDialog,
		},
		props: {
			disabled: {
				default: false,
				type: Boolean,
			},
			template: {
				default: () => {},
				type: Object,
			},
			types: {
				default: () => [],
				type: Array,
			},
		},
	};
</script>

<style lang="scss" scoped>

</style>