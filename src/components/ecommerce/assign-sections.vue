<template>
	<div class="pa-3">
		<v-layout wrap align-end pa-3 class="sections-container">
			<v-flex xs12>
				<app-select
					:item="model.sectionId"
					item-text="name"
					item-value="id"
					:items="sections"
					label="Secciones"
					model="name"
					@input="setData"
				/>
			</v-flex>
			<v-flex xs6 pr-2>
				<app-input-text
					label="Orden"
					type="number"
					:text="model.order"
					model="order"
					@input="setValue"
				/>
			</v-flex>
			<v-flex xs6 pl-2>
				<app-input-text
					label="Título"
					:text="model.title"
					model="title"
					@input="setValue"
				/>
			</v-flex>

			<quill-editor
				class="quill-style"
				ref="myQuillEditor"
				:options="editorOption"
				v-model="model.description"
			/>
			<v-flex xs10>
				<label ref="labelSection" for="upload-file-section">
					<vue-six-four
						id="upload-file-section"
						hidden
						@vue-six-four="getFile"
					/>
					<v-layout wrap>
						<v-flex xs10>
							<app-input-text readonly label="Imagen" :text="model.urlImage" />
						</v-flex>
						<v-flex xs2 mt-4 text-xs-left>
							<v-btn
								@click="showDialog"
								class="ma-0 pl-0 btn-auto"
								small
								color="info"
							>
								<v-icon color="white">image</v-icon>
							</v-btn>
						</v-flex>
					</v-layout>
				</label>
			</v-flex>
			<v-flex xs2>
				<v-btn
					:disabled="disabledAdd"
					color="success"
					class="btn-action btn-product"
					@click="addSection"
				>
					Agregar
				</v-btn>
			</v-flex>
			<v-flex xs12 mt-4>
				<assign-sections-list
					:rows="rows"
					@on-local-search="$emit('on-local-search', $event)"
					@click-icon="$emit('on-click-icon', $event)"
				/>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="disabled"
				@cancel-button-clicked="$emit('close')"
				@accept-button-clicked="$emit('save')"
			/>
		</section>
	</div>
</template>

<script>
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import { quillEditor } from 'vue-quill-editor';
import { required } from 'vuelidate/lib/validators';
import VueSixFour from 'vue-six-four';
import assignSectionsList from '@/components/ecommerce/assign-sections-list';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import upLoadImageMixin from '@/mixins/upLoadImage';

function addSection() {
	this.$emit('on-add-section', this.model);
	this.model = {
		description: '',
		name: '',
		order: null,
		sectionId: 0,
		sectionName: '',
		title: '',
		urlImage: null,
	};
}

function captureLocation(value) {
	this.model.urlImage = value;
}

function sectionSelected(value) {
	this.model = { ...value };
}

function setData({ model, value }) {
	this.model[model] = value.name;
	this.model.sectionName = value.name;
	this.model.sectionId = value.id;
}

function setValue({ model, value }) {
	this.model[model] = model === 'order' ? Number(value) : value;
}

function showDialog() {
	this.$refs.labelSection.click();
}

function validations() {
	return {
		model: {
			description: { required },
			name: { required },
			order: { required },
			title: { required },
			urlImage: { required },
		},
	};
}

function disabled() {
	return this.rows.length === 0;
}

function data() {
	return {
		/**
		 * opciones de quillEditor
		 * https://github.com/surmon-china/surmon-china.github.io/blob/source/projects/vue-quill-editor/examples/01-theme-snow.vue
		 */
		editorOption: {
			modules: {
				toolbar: [
					['bold', 'italic', 'underline'],
					['blockquote'],
					[{ header: 1 }, { header: 2 }],
					[{ list: 'ordered' }, { list: 'bullet' }],
					// [{ script: 'sub' }, { script: 'super' }],
					// [{ indent: '-1' }, { indent: '+1' }],
					[{ direction: 'rtl' }],
					[{ size: ['small', false, 'large', 'huge'] }],
					[{ header: [1, 2, 3, 4, 5, 6, false] }],
					[{ align: [] }],
					// ['clean'],
				],
			},
		},
		model: {
			description: '',
			name: '',
			order: null,
			sectionId: 0,
			sectionName: '',
			title: '',
			urlImage: null,
		},
		preview: false,
		selectedText: '',
	};
}

export default {
	name: 'assign-sections',
	components: {
		assignSectionsList,
		modalSidebarButton,
		VueSixFour,
		quillEditor,
	},
	computed: {
		disabled,
		disabledAdd() {
			return !this.model.sectionId || !this.model.order || !this.model.title;
		},
	},
	data,
	methods: {
		addSection,
		setData,
		setValue,
		showDialog,
	},
	mixins: [upLoadImageMixin],
	props: {
		rows: {
			default: () => [],
			type: Array,
		},
		sections: {
			default: () => [],
			type: Array,
		},
		sectionSelected: {
			default: () => {},
			type: Object,
		},
	},
	validations,
	watch: {
		captureLocation,
		sectionSelected,
	},
};
</script>

<style lang="scss" scoped>
.btn-product {
	min-width: auto !important;
	width: 100% !important;
}

.sections-container {
	border: 1px solid map-get($colors, border-tab);
	border-radius: 8px;
}

.formating-buttons {
	display: flex;
	justify-content: flex-end;

	button {
		margin: 0 3px;
		padding: 5px 8px;
	}
	button:hover {
		background-color: color(text-gray);
		border-radius: 2px;
	}
}

.descriptcion-label {
	font-size: size(small);
}

.preview-btn-container {
	display: flex;
	justify-content: flex-start;

	.preview-btn {
		border: 1px solid color(primary);
		color: color(primary);
		font-family: font(lato-bold);
		font-size: 10px;
		padding: 3px 7px;
		transition-duration: 300ms;
	}
	.active {
		background-color: color(primary);
		color: color(white);
	}
}

.preview-content-container {
	background-color: white;
	min-height: 74px;
}

.quill-style {
	margin-top: 1rem;
}
</style>
