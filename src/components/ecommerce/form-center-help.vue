<template>
	<div>
		<div class="form-center">
			<p class="new-center-help">Nuevo</p>
			<v-layout wrap pt-4>
				<v-flex xs12 md4 pr-2>
					<v-text-field
						class="filter-select"
						placeholder="Orden"
						type="number"
						v-model.number="helpCenter.orderNumber"
					></v-text-field>
					<small v-if="!validOrder" class="error-message">El orden es requerido</small>
				</v-flex>
				<v-flex xs12 md8 pl-2>
					<v-select
						:items="sections"
						v-model="helpCenter.typeHelperCenter"
						class="filter-select"
						label="Sección"
						item-text="name"
						item-value="id"
					></v-select>
					<small v-if="!helpCenter.typeHelperCenter" class="error-message">La sección es requerida</small>
				</v-flex>
				<v-flex xs12 mt-3>
					<v-text-field
						class="filter-select"
						placeholder="Nombre"
						v-model="helpCenter.name"
					></v-text-field>
					<small v-if="!helpCenter.name" class="error-message">El nombre es requerido</small>
				</v-flex>
				<v-flex xs12 mt-3>
					<v-text-field
						class="filter-select"
						placeholder="Subtítulo"
						v-model="helpCenter.subTitle"
					></v-text-field>
					<small v-if="!helpCenter.subTitle" class="error-message">El sub titulo es requerido</small>
				</v-flex>
				<v-flex xs12 mt-3>
					<div class="d-flex align-center">
						<label class="description-label">Descripción</label>
						<div class="formating-btns">
							<button @click="formatingText('strong')" type="button"><strong>B</strong></button>
							<button @click="formatingText('i')" type="button"><i>I</i></button>
							<button @click="formatingText('p')" type="button">Párrafo</button>
							<button @click="formatingText('h1')" type="button">Título</button>
							<button @click="formatingText('br')" type="button">¶</button>
						</div>
					</div>
					<app-input-text
						ref="sectionDescription"
						:text="helpCenter.description"
						model="description"
						@blur="getCursorPosition"
						textarea
						@input="setDescription"
					/>
					<small v-if="!helpCenter.description" class="error-message">La descripción es requerida</small>
				</v-flex>
				<v-flex xs12 mt-2>
					<label ref="lbl-form" for="img-form" class="w-100">
						<vue-six-four
							id="img-form"
							hidden
							@vue-six-four="getFileCenter('urlImage', $event)"
						/>
						<v-layout wrap xs10>
							<v-flex xs11 mt-1 pr-2>
								<app-input-text
									placeholder="Imagen"
									readonly
									:text="helpCenter.urlImage"
								/>
							</v-flex>
							<v-flex flex text-xs-left xs1 pt-1>
								<v-btn
									@click="showDialog('lbl-form')"
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
			</v-layout>
			<v-layout wrap mt-5 justify-center>
				<v-btn
					type="button"
					class="btn-action clean-btn mx-3"
					@click="cleanForm"
				>
					Limpiar
				</v-btn>
				<v-btn
					class="btn-action ml-3 add-btn mx-3"
					type="button"
					:disabled="addBtnDisabled"
					@click="addHelpSection"
				>
					<template v-if="helpCenter.id">
						Actualizar
					</template>
					<template v-else>
						Agregar
					</template>
				</v-btn>
			</v-layout>
		</div>
	</div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import VueSixFour from 'vue-six-four';
import l from '@/shared/lib';
import Cursor from '@/components/ecommerce/class/cursorPosition';

const { isEmpty, allAreTrue } = l;

function created() {
	this.setHelperCenter();
}

function setHelperCenter() {
	this.helpCenter = isEmpty(this.helpSection) ? this.helpCenter : { ...this.helpSection };
}

async function getFileCenter(name, fileInfo) {
	const newFile = {
		name: fileInfo.name.replace(/\s/g, '-'),
		base64data: fileInfo.sixFour,
	};
	try {
		const words = newFile.name.split('.');
		const lastItem = words.length;
		const extension = words[lastItem - 1];
		if (this.allowedFiles.indexOf(extension) > -1) {
			const { data: file } = await this.$httpProduction.post('upload-files', newFile);
			this.helpCenter[name] = file.Location;
		} else {
			this.showNotification(`Archivo no válido, solo se permite ${this.allowedFiles.join(',')}`, 'warning');
		}
	} catch (error) {
		this.showGenericError();
	}
}

function cancelForm() {
	this.$emit('cancel-modal');
}

function showDialog(name) {
	this.$refs[name].click();
}

function cleanForm() {
	this.helpCenter = {
		description: null,
		id: null,
		urlImage: null,
		name: null,
		orderNumber: null,
		typeHelperCenter: null,
		subTitle: null,
	};
}

function handlerHelpSection() {
	this.setHelperCenter();
}

function addHelpSection() {
	const section = this.sections.find(s => this.helpCenter.typeHelperCenter === s.id);
	this.helpCenter.sectionName = section.name;
	this.$emit('add-section', { ...this.helpCenter });
	this.cleanForm();
}

function addBtnDisabled() {
	const { typeHelperCenter, description, name, subTitle } = this.helpCenter;
	return !allAreTrue(this.validOrder, typeHelperCenter, description, name, subTitle);
}

function validOrder() {
	const { orderNumber } = this.helpCenter;
	return typeof orderNumber === 'number' && orderNumber >= 0;
}

function formatingText(tag) {
	Cursor.setElement(this.$refs.sectionDescription.$children[0].$refs.input);
	Cursor.addText(`<${tag}></${tag}>`);
	this.helpCenter.description = Cursor.getText();
}

function getCursorPosition(val) {
	Cursor.setLastPosition(val.currentTarget.selectionStart);
}

function setDescription({ value }) {
	this.helpCenter.description = value;
}

function data() {
	return {
		allowedFiles: [
			'jpg',
			'jpeg',
			'png',
			'doc',
			'docx',
			'xls',
			'pdf',
			'xlsx',
			'txt',
			'svg',
		],
		helpCenter: {
			typeHelperCenter: null,
			subTitle: null,
			orderNumber: null,
			name: null,
			id: null,
			description: null,
			urlImage: null,
		},
	};
}

export default {
	name: 'form-center-help',
	data,
	created,
	components: {
		modalSidebarButton,
		VueSixFour,
	},
	computed: {
		addBtnDisabled,
		validOrder,
	},
	methods: {
		addHelpSection,
		cleanForm,
		cancelForm,
		formatingText,
		getCursorPosition,
		getFileCenter,
		handlerHelpSection,
		setDescription,
		setHelperCenter,
		showDialog,
	},
	props: {
		id: [Number, String],
		helpSection: {
			default: () => {},
			type: Object,
		},
		loading: {
			default: false,
			type: Boolean,
		},
		sections: {
			default: () => [],
			type: Array,
		},
	},
	watch: {
		helpSection: {
			deep: true,
			handler: handlerHelpSection,
		},
	},
};
</script>

<style lang="scss" scoped>
.new-center-help {
	border-bottom: 1px solid map-get($colors, blue-grey);
	color: map-get($colors, paginationText);
	font-family: map-get($fonts, open-semibold);
	font-size: map-get($sizes, small13);
}

.add-section {
	border-bottom: 1px solid map-get($colors, blue-grey);
	padding-bottom: 9px;
}

.btn-add {
	font-size: map-get($sizes, medium18);
	height: 25px !important;
}

.content-sections {
	border-bottom: 1px solid map-get($colors, blue-grey);
	padding: 13px 5px;
}

.btn-cancel {
	background-color: color(white);
	border: 1px solid map-get($colors, orange-btn);
	border-radius: 5px;
	color: map-get($colors, orange-btn);
	font-size: map-get($sizes, small10);
	height: 23px;
}

.btn-save {
	background-color: map-get($colors, white);
	border: 1px solid map-get($colors, primary);
	border-radius: 5px;
	color: map-get($colors, primary);
	font-size: map-get($sizes, small10);
	height: 23px;
}

.form-center {
	background-color: map-get($colors, background-center);
	border-left: 1px solid map-get($colors, blue-grey);
	height: calc(100vh - 90px);
	overflow-y: scroll;
	padding: 35px 76px 0 76px;
}

.add-btn {
	background-color: transparent !important;
	border: 1px solid color(primary);
	color: color(primary) !important;
}

.clean-btn {
	background-color: transparent !important;
	border: 1px solid color(error);
	color: color(error) !important;
}

.error-message {
	color: color(error);
}

.description-label {
	font-size: size(small);
}

.formating-btns {
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
</style>