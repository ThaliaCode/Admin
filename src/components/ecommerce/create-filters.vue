<template>
  <div class="create-filters">
		<v-layout wrap px-4 py-3>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					label="Orden"
					class="filter-select mt-3"
					v-model="model.order"
				></v-text-field>
			<span class="form-group__message" v-if="$v.model.order.$invalid">
				El campo orden recibe un número
			</span>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					label="Título"
					class="filter-select mt-3"
					v-model="model.title"
				></v-text-field>
				<span class="form-group__message" v-if="$v.model.title.$invalid">
					El campo título es requerido.
				</span>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
					class="textarea-content filter-select mt-3"
					label="Descripción"
					v-model="model.description"
				></v-text-field>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<label ref="up" for="upload-file">
					<vue-six-four id="upload-file" hidden @vue-six-four="getFile" />
					<v-layout wrap>
						<v-flex xs11>
							<app-input-text
								label="Icono"
								readonly
								:text="model.urlImage"
							/>
						</v-flex>
						<v-flex xs1 class="wrapper-buttons">
							<v-btn 
								@click="actionUploadImage"
								class="ma-0 pl-0 btn-auto"
								small
								:disabled="isLoadingImage"
								color="pink">
								<v-icon color="white">camera_alt</v-icon>
							</v-btn>
						</v-flex>
					</v-layout>
				</label>
			</v-flex>
			<v-flex xs12 md12 pr-2 mb-3>
				<v-text-field
				label="Link"
				class="filter-select mt-3"
				v-model="model.link"
				></v-text-field>
			</v-flex>
			<v-flex xs12 md12 mb-4>
				<v-layout row wrap class="border-bottom">
					<v-flex xs11 pt-2>
						<h5>ACTIVAR AUTOMÁTICAMENTE</h5>
					</v-flex>
					<v-flex xs1>
						<v-checkbox
							v-model="model.flagAutomatic"
							hide-details
						></v-checkbox>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs6 md6 pr-2 mb3 v-show="model.flagAutomatic">
				<app-date-mask
					id="date-initial"
					label="Fecha Inicio"
					v-model="startDate"
					@format-date="onDate($event, 'startDate')"
				/>
				<span class="form-group__message"
					v-if="$v.model.startDate.$invalid">
					La Fecha Inicio es requerido
				</span>
			</v-flex>
			<v-flex xs6 md6 pr-2 mb3 v-show="model.flagAutomatic">
				<app-date-mask 
					id="date-end"
					label="Fecha Fin"
					v-model="endDate"
					@format-date="onDate($event, 'endDate')"
				/>
				<span class="form-group__message"
					v-if="$v.model.startDate.$invalid">
					La Fecha Fin es requerido
				</span>
			</v-flex>
		</v-layout>
		<section class="fast-register-footer">
			<modal-sidebar-button
				:is-loading="$v.model.$invalid"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="send">
			</modal-sidebar-button>
		</section>
	</div>
</template>

<script>
import VueSixFour from 'vue-six-four';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import { required, requiredIf, numeric } from 'vuelidate/lib/validators';
import { differenceInDays } from 'date-fns';
import helper from '@/shared/helper';
import upLoadImageMixin from '@/mixins/upLoadImage';

function created() {
	if (this.filterId) {
		this.loadFilter();
	}
}

function closeModal() {
	this.$emit('close');
	this.clearModal();
}

function onDate(value, modelName) {
	this.model[modelName] = value;
}

function data() {
	return {
		model: {
			urlImage: '',
			flagAutomatic: false,
			startDate: null,
			endDate: null,
			title: '',
			description: '',
			order: null,
			id: '',
			link: null,
		},
		startDate: null,
		endDate: null,
	};
}

function clearModal() {
	this.model = {
		urlImage: '',
		flagAutomatic: false,
		startDate: null,
		endDate: null,
		title: '',
		description: '',
		order: null,
		id: '',
		link: null,
	};
	this.startDate = null;
	this.endDate = null;
}

function send() {
	const validDate = differenceInDays(this.model.endDate, this.model.startDate) < 0;
	if (validDate) {
		this.showNotification('La fecha final no puede ser menor a la inicial.', 'info');
	} else {
		this.$emit('send', this.model, !!this.filterId);
		this.clearModal();
	}
}

function captureLocation(value) {
	this.model.urlImage = value;
}

async function loadFilter() {
	try {
		const { data: response } = await this.$httpProducts.get(`filters/${this.filterId}`);
		this.endDate = response.endDate ? helper.exactDate(response.endDate, 'YYYY-MM-DD') : '';
		this.startDate = response.startDate ? helper.exactDate(response.startDate, 'YYYY-MM-DD') : '';
		this.model = {
			description: response.description,
			endDate: this.endDate ? helper.exactDate(response.endDate, 'YYYY-MM-DD') : '',
			flagAutomatic: response.flagAutomatic,
			id: response.id,
			order: response.order,
			startDate: this.startDate ? helper.exactDate(response.startDate, 'YYYY-MM-DD') : '',
			title: response.title,
			urlImage: response.urlImage,
			link: response.link,
		};
	} catch (err) {
		if (err.status === 500) {
			this.showGenericError();
		}
	}
}

function validations() {
	return {
		model: {
			title: {
				required,
			},
			startDate: {
				required: requiredIf(() => this.model.flagAutomatic),
			},
			endDate: {
				required: requiredIf(() => this.model.flagAutomatic),
			},
			order: {
				numeric,
			},
		},
	};
}


export default {
	name: 'create-filters',
	data,
	methods: {
		clearModal,
		closeModal,
		loadFilter,
		onDate,
		send,
	},
	components: {
		modalSidebarButton,
		VueSixFour,
	},
	created,
	validations,
	props: {
		filterId: [Number, String],
	},
	watch: {
		captureLocation,
	},
	mixins: [upLoadImageMixin],
};
</script>

<style lang="scss">
.create-filters {
	.border-bottom {
		border-bottom: 1px solid #d3dde6;
	}
	.filter-select {
		label {
			top: -1px !important;
		}
	}
	.wrapper-buttons {
		align-items: flex-end;
		display: flex;
	}
}
	
</style>