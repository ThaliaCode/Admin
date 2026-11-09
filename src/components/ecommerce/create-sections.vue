<template>
	<div>
		<v-layout wrap px-4 py-3>
			<v-flex xs12 md12 pr2 mb-3>
				<v-text-field
					class="filter-select"
					label="Orden"
					type="number"
					v-model.number="model.order"
				></v-text-field>
			</v-flex>
			<v-flex xs12 md12 pr2 mb-3>
				<v-text-field
					class="filter-select"
					label="Código"
					v-model="model.code"
				></v-text-field>
				<span class="error--text caption" v-if="$v.model.code.$invalid">
					El código es requerido
				</span>
				<span
					class="text-not-code-blank"
					v-if="checkBlankCode(model.code)">
					No se permite espacios en blanco
				</span>
			</v-flex>
			<v-flex xs12 md12 pr2 mb-3>
				<v-text-field
					class="filter-select"
					label="Título"
					v-model="model.name"
				></v-text-field>
				<span class="error--text caption" v-if="$v.model.name.$invalid">
					El nombre es requerido
				</span>
			</v-flex>
			<v-flex xs12 md12 pr2 mb-3>
				<v-text-field
					multi-line
					class="textarea-content filter-select"
					label="Descripción"
					v-model="model.description"
				></v-text-field>
			</v-flex>
			<v-flex xs12 md12 pr2 mb-3>
				<label ref="label" for="upload-create-section" class="w-100">
					<vue-six-four 
						id="upload-create-section"
						hidden
						@vue-six-four="getFile"
					/>
					<v-layout wrap>
						<v-flex xs10 mt-1>
							<app-input-text
								label="Icono"
								readonly
								:text="model.urlImage"
							/>
						</v-flex>
						<v-flex xs2 mt-4 text-xs-center>
							<v-btn	
								@click="showDialog"
								class="ma-0 pl-0 btn-auto"
								small
								color="info">
								<v-icon color="white">image</v-icon>
							</v-btn>
						</v-flex>
					</v-layout>
				</label>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="disabled || checkBlankCode(model.code)"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="$emit('save', model)"
			/>
		</section>
	</div>
</template>
<script>
import VueSixFour from 'vue-six-four';
import { required } from 'vuelidate/lib/validators';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import upLoadImageMixin from '@/mixins/upLoadImage';

function created() {
	if (this.id) {
		this.loadData();
	}
}

function captureLocation(value) {
	this.model.urlImage = value;
}

function clearModal() {
	this.model = {
		code: '',
		description: '',
		name: '',
		order: null,
		urlImage: '',
	};
}

function closeModal() {
	this.$emit('close');
	this.clearModal();
}

function disabled() {
	return this.loading || this.$v.$invalid;
}

async function loadData() {
	try {
		({ data: this.model } = await this.$httpProducts.get(`sections/${this.id}`));
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function showDialog() {
	this.$refs.label.click();
}

function validations() {
	return {
		model: {
			code: { required },
			name: { required },
		},
	};
}

function data() {
	return {
		model: {
			code: '',
			description: '',
			name: '',
			order: null,
			urlImage: '',
		},
	};
}
export default {
	name: 'create-sections',
	data,
	components: {
		modalSidebarButton,
		VueSixFour,
	},
	computed: {
		disabled,
	},
	created,
	methods: {
		clearModal,
		closeModal,
		loadData,
		showDialog,
	},
	mixins: [upLoadImageMixin],
	props: {
		id: [Number, String],
		loading: {
			default: false,
			type: Boolean,
		},
	},
	validations,
	watch: {
		captureLocation,
	},
};
</script>
<style lang="scss" scoped>
	.wrapper-title {
		border-bottom: 1px solid map-get($colors, blue-grey);
	}
</style>


