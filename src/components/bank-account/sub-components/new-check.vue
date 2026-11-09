<template>
	<v-container>
		<section class="new-check-wrapper">
			<v-layout row wrap>
				<v-flex xs12>
					<span class="bank-title">Banco: </span>
					<span class="bank-title-data">{{bank.name}}</span>
				</v-flex>
				<v-flex xs12>
					<span class="bank-title">Nro de cuenta: </span>
					<span class="bank-title-data">{{bank.accountNumber}}</span>
				</v-flex>
				<v-flex xs12>
					<span class="bank-title">Serie:</span>	
					<span class="bank-title-data">{{checkBookSerie}}</span>	
				</v-flex>
			</v-layout>
			<v-layout row wrap>
				<v-flex xs12 mb-3>
					<div class="check-number-generator">
						<span>{{serieStartNumber}} - </span>
						<div>
							<input type="text" v-model="newCheck.number" placeholder="Número de cheque">
						</div>
					</div>
					<transition name="fade" mode="out-in">
						<small v-if="!$v.newCheck.number.required" class="err">El número es requerido</small>
						<small v-if="!$v.newCheck.number.isNumber" class="err">Solo se permiten números</small>
					</transition>
				</v-flex>
				<v-flex xs12 mb-3>
					<v-select
						bottom
						hide-details
						single-line
						class="filter-select shadow-inset"
						:items="documentsType"
						label="Tipo de Documento"
						item-text="name"
						item-value="id"
						v-model="newCheck.personType"
					></v-select>
				</v-flex>
				<v-flex xs12 mb-3>
					<v-text-field
						hide-details
						label="Nombre o Razón Social"
						class="filter-select shadow-inset"
						v-model="newCheck.personName"
					></v-text-field>
					<transition name="fade" mode="out-in">
						<small v-if="!$v.newCheck.personName.required" class="err">El nombre o razón social es requerido</small>
					</transition>
				</v-flex>
				<v-flex xs12 mb-3>
					<v-text-field
						hide-details
						label="Documento"
						class="filter-select shadow-inset"
						v-model="newCheck.personDocument"
					></v-text-field>
					<transition name="fade" mode="out-in">
						<small v-if="!$v.newCheck.personDocument.required" class="err">El documento es requerido</small>
					</transition>
				</v-flex>
				<v-flex xs12 mb-3>
					<v-text-field
						hide-details
						label="Doc. de Referencia"
						class="filter-select shadow-inset"
						v-model="newCheck.reference"
					></v-text-field>
				</v-flex>
				<v-flex xs12 mb-3>
					<v-flex xs12 d-flex align-center>
						<v-text-field
							readonly
							disabled
							class="filter-select shadow-inset"
							name="new-product-model"
							label="Subir imagen"
							v-model="newCheck.urlImage"
						></v-text-field>
						<v-flex xs12 d-flex align-center ml-3>
							<label ref="up" for="upload-image">
								<vue-six-four id="upload-image" hidden @vue-six-four="getFile" />
							</label>
							<v-btn
								@click="actionUploadImage"
								type="button"
								class="btn-action pl-add-container image-button text-xs-center mr-0">
								<img src="/static/img/view-image.svg" alt="" class="view-image">
							</v-btn>
						</v-flex>
					</v-flex>
				</v-flex>
				<v-flex xs12 mb-3>
					<v-text-field
						hide-details
						type="number"
						label="Monto"
						class="filter-select shadow-inset"
						v-model.number="newCheck.amount"
					></v-text-field>
					<transition name="fade" mode="out-in">
						<small v-if="!$v.newCheck.amount.required" class="err">La cantidad es requerida</small>
					</transition>
				</v-flex>
				<v-flex xs12 mb-3>
					<v-select
						bottom
						hide-details
						single-line
						class="filter-select shadow-inset"
						label="Estado"
						item-text="name"
						item-value="id"
						:items="states"
						v-model="newCheck.statusId"
					></v-select>
					<transition name="fade" mode="out-in">
						<small v-if="!$v.newCheck.statusId.required" class="err">El estado del cheque es requerido</small>
					</transition>
				</v-flex>
				<v-layout row mb-3>
					<v-flex xs6 px-1 mt-0 class="align-col">
						<v-menu
							lazy
							v-model="menuStart"
							transition="scale-transition"
							offset-y
							full-width
							:nudge-right="50"
						>
							<v-text-field
								slot="activator"
								label="Fecha de Emisión"
								v-model="newCheck.checkDate"
								single-line
								append-icon="event"
								class="filter-select shadow-inset shadow-inset-calendar shadow-inset-calendar-start"
								readonly
							></v-text-field>
							<v-date-picker
								v-model="newCheck.checkDate"
								no-title
								scrollable
								locale="es"
							></v-date-picker>
						</v-menu>
					</v-flex>
					<v-flex xs6 px-1 mt-0 class="align-col">
						<v-menu
							lazy
							v-model="menuEnd"
							transition="scale-transition"
							offset-y
							full-width
							:nudge-right="50"
						>
							<v-text-field
								slot="activator"
								label="Fecha de Cobro"
								v-model="newCheck.issueDate"
								single-line
								append-icon="event"
								class="filter-select shadow-inset shadow-inset-calendar shadow-inset-calendar-end"
								readonly
							></v-text-field>
							<v-date-picker
								v-model="newCheck.issueDate"
								no-title
								scrollable
								locale="es"
							></v-date-picker>
						</v-menu>
					</v-flex>
				</v-layout>
				<v-flex xs12 mb-3>
					<v-text-field
						hide-details
						type="number"
						label="Monto por penalidad"
						class="filter-select shadow-inset"
						v-model.number="newCheck.penalty"
					></v-text-field>
				</v-flex>
				<v-flex xs12 mb-3>
					<v-text-field
						multi-line
						hide-details
						label="Descripción"
						class="textarea-content filter-select shadow-inset"
						v-model="newCheck.description"
					></v-text-field>
				</v-flex>
			</v-layout>
		</section>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				success-text="Aceptar"
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="saveNewCheck"
			/>
		</section>
	</v-container>
</template>
<script>
import { required } from 'vuelidate/lib/validators';
import VueSixFour from 'vue-six-four';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import upLoadImageMixin from '@/mixins/upLoadImage';
import lib from '@/shared/lib';
import helper from '@/shared/helper';

function created() {
	this.loadData();
}

async function loadData() {
	const requests = [
		this.$httpSales.get('check-status'),
		this.$httpSales.get('type-person'),
	];
	([
		{ data: this.states },
		{ data: this.documentsType },
	] = await Promise.all(requests));
	if (!lib.isEmpty(this.editCheck)) {
		this.id = this.editCheck.id;
		this.newCheck = this.formatValues(this.editCheck);
	}
}

function formatValues(check) {
	return lib.compose(
		lib.setNewPropertyByFunction(
			'personType',
			({ personType }) => Number(personType),
		),
		lib.setNewPropertyByFunction(
			'issueDate',
			({ issueDate }) => helper.formatDate(issueDate, 'YYYY-MM-DD'),
		),
		lib.setNewPropertyByFunction(
			'checkDate',
			({ checkDate }) => helper.formatDate(checkDate, 'YYYY-MM-DD'),
		),
	)(check);
}

function closeModal() {
	this.clearNewCheckForm();
	this.$emit('close-modal');
}

function captureLocation(urlImg) {
	this.newCheck.urlImage = urlImg;
}

async function saveNewCheck() {
	const urlPost = 'check';
	const urlPatch = `check/${this.id}`;
	const url = this.id ? urlPatch : urlPost;
	const method = this.id ? 'patch' : 'post';
	const message = this.id ? 'actualizado' : 'creado';
	const body = this.buildBody(this.newCheck);
	try {
		await this.$httpSales[method](url, body);
		this.showNotification(`Cheque ${message} con éxito`);
		this.closeModal();
		this.$emit('re-load');
	} catch (error) {
		this.showNotification(error, 'error');
	}
}

function buildBody(newCheck) {
	const { checkBookId, bankAccountId } = this.$route.params;
	const {
		amount,
		description,
		personDocument,
		personType,
		issueDate,
		number,
		penalty,
		personName,
		statusId,
		checkDate,
		urlImage,
		reference,
	} = newCheck;
	return {
		amount,
		amountPenalty: penalty,
		bankAccountId,
		checkDate,
		checkSerieId: checkBookId,
		description,
		documentNumber: number,
		issueDate,
		number,
		personDocument,
		personName,
		personType,
		reference,
		statusId,
		urlImage,
	};
}

function clearNewCheckForm() {
	this.newCheck = {
		amount: null,
		description: '',
		documentType: null,
		personDocument: '',
		issueDate: '',
		urlImage: '',
		number: '',
		penalty: null,
		reference: '',
		personName: '',
		checkDate: '',
		statusId: null,
	};
}

function serieStartNumber() {
	const [startNumber] = this.checkBookSerie.split('-');
	return startNumber;
}

function validations() {
	return {
		newCheck: {
			amount: { required },
			number: {
				required,
				isNumber(value) {
					if (Number(value) === 0) return true;
					return !!Number(value);
				},
			},
			personDocument: { required },
			personName: { required },
			statusId: { required },
		},
	};
}

function data() {
	return {
		documentsType: [],
		id: 0,
		newCheck: {
			amount: null,
			description: '',
			personType: null,
			personDocument: '',
			issueDate: '',
			urlImage: '',
			number: '',
			penalty: null,
			reference: '',
			personName: '',
			checkDate: '',
			statusId: null,
		},
		menuEnd: false,
		menuStart: false,
		states: [],
	};
}

export default {
	name: 'new-check',
	components: {
		modalSidebarButton,
		VueSixFour,
	},
	computed: {
		serieStartNumber,
	},
	created,
	data,
	methods: {
		buildBody,
		clearNewCheckForm,
		closeModal,
		formatValues,
		loadData,
		saveNewCheck,
	},
	mixins: [upLoadImageMixin],
	props: {
		bank: {
			default: () => {},
			type: Object,
		},
		checkBookSerie: {
			default: '',
			type: String,
		},
		editCheck: {
			default: () => {},
			type: Object,
		},
	},
	validations,
	watch: {
		captureLocation,
	},
};
</script>
<style lang="scss" scoped>
	.bank-title,
	.bank-title-data {
		color: color(blue-check);
		font-family: font(open-semibold);
		font-size: size(small13);
	}

	.bank-title-data {
		font-family: font(open-bold);
	}

	.upload-btn {
		background-color: color(blue-check);
		height: 30px;
		width: 30px;
	}

	.text-field {
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 3px;
		padding-left: 16px;
		position: relative;
	}

	.err {
		color: color(error);
	}

	.check-number-generator {
		align-items: center;
		background-color: white;
		border: 1px solid color(inactive-text);
		border-radius: 3px;
		font-family: font(open-semibold);
		font-size: size(medium);
		display: flex;
		height: 30px;
		padding-left: 10px;
		margin-top: 10px;

		span {
			color: color(subheaderText);
		}

		div {
			flex: 1 1 90%;
			margin-left: 2px;
		}

		input {
			height: 100%;
			width: 100%;
		}

		input:focus {
			outline: none;
		}
	}

	.new-check-wrapper {
		padding-bottom: 30px;
	}
</style>
