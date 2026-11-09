<template>
	<div>
		<header-page :title="$route.meta.title" />
		<div class="new-product">
			<v-layout row wrap px-5>
				<v-flex xs6 px-2 my-4 pt-2
					v-if="!isLoading">
					<v-text-field
						required
						class="filter-select shadow-inset"
						name="new-product-name"
						label="Nombre"
						single-line
						v-model="newExpense.name"
					></v-text-field>
					<span class="form-group__message" v-if="$v.newExpense.name.$invalid">
						El nombre del gasto es requerido
					</span>
					<v-select
						required
						class="filter-select shadow-inset mt-3"
						item-text="name"
						item-value="id"
						label="Tipo de Gasto"
						single-line
						v-model="newExpense.purTypeExpenseId"
						v-bind:items="data.expenseType"
					></v-select>
					<span class="form-group__message" v-if="$v.newExpense.purTypeExpenseId.$invalid">
						El tipo de gasto es requerido
					</span>
					<v-select
						required
						class="filter-select shadow-inset mt-3"
						item-text="name"
						item-value="flag"
						label="Modo de Gasto"
						single-line
						v-model="newExpense.flagEnum"
						v-bind:items="data.expenseMode"
					></v-select>
					<span class="form-group__message" v-if="$v.newExpense.flagEnum.$invalid">
						El modo de gasto es requerido
					</span>
					<v-text-field
						required
						no-resize
						multi-line
						single-line
						class="textarea-content filter-select shadow-inset mt-3"
						name="new-expense-description"
						label="Descripcción"
						v-model="newExpense.description"
					></v-text-field>
					<v-text-field
						required
						class="filter-select shadow-inset mt-3"
						name="new-expense-description"
						label="Monto"
						type="Number"
						single-line
						v-model.number="newExpense.amount"
					></v-text-field>
					<span class="form-group__message" v-if="$v.newExpense.amount.$invalid">
						El monto es requerido
					</span>
				</v-flex>
				<v-flex xs6 px-2 my-4 pt-2
					class="new-product-price-list"
					v-if="!isLoading"
				>
					<v-layout row>
						<v-flex xs12 md5 class="align-col">
							<v-menu
								lazy
								v-model="menuPicker"
								transition="scale-transition"
								offset-y
								full-width
								:nudge-right="50">
								<v-text-field
									slot="activator"
									label="Fecha de inicio"
									v-model="newExpense.expenseDate"
									single-line
									append-icon="event"
									class="filter-select shadow-inset shadow-inset-calendar shadow-inset-calendar-start"
									readonly
								></v-text-field>
								<v-date-picker
									v-model="newExpense.expenseDate"
									no-title
									scrollable
								></v-date-picker>
							</v-menu>
							<span class="form-group__message" v-if="$v.newExpense.expenseDate.$invalid">
								La fecha es requerida.
							</span>
						</v-flex>
					</v-layout>
					<v-layout row mt-3>
						<label ref="up" for="upload-image">
							<vue-six-four id="upload-image" hidden @vue-six-four="getFile" />
							<v-flex xs2 mx-2>
								<v-btn
									@click="actionUploadImage"
									color="primary"
									class="btn-action">Subir Imagen</v-btn>
							</v-flex>
						</label>
					</v-layout>
					<v-layout row justify-center mt-5>
						<v-flex xs12>
							<div class="new-expense-log-japi">
								<img
									:src="imageUpdated"
									alt="logo-admin">
							</div>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
			<v-layout row>
				<v-flex xs12 text-xs-center
					v-if="!isLoading">
					<v-btn
						type="button"
						color="pink"
						class="btn-action"
						:disabled="isLoading"
						@click.native="cancelProduct">
						Cancelar
						<img :src="`${$imageUrl}/icon-cancel.svg`" alt="cancelar">
					</v-btn>
					<v-btn
						type="button"
						color="success"
						class="btn-action"
						:disabled="$v.$invalid || isLoading || isLoadingImage"
						@click.native="registerExpense">
						Aceptar
						<img :src="`${$imageUrl}/icon-apply.svg`" alt="aceptar">
					</v-btn>
				</v-flex>
			</v-layout>
			<v-layout row justify-center mt-5>
				<v-flex xs10 text-xs-center
					v-if="isLoading">
					<div class="new-product-log-japi">
						<img
							:src="`${$imageUrl}/place-holder.svg`"
							alt="logo-admin">
					</div>
				</v-flex>
			</v-layout>
		</div>
	</div>
</template>

<script>
import VueSixFour from 'vue-six-four';
import { required } from 'vuelidate/lib/validators';
import headerPage from './../shared/header-page';
import helper from './../../shared/helper';
import upLoadImageMixin from './../../mixins/upLoadImage';

function created() {
	this.loadData();
}

async function loadData() {
	this.isLoading = true;
	this.expenseId = this.$route.params.id;
	const requests = [
		this.typeExpensesList(),
	];
	try {
		if (this.expenseId) {
			requests.push(this.$httpSales.get(`expenses/${this.expenseId}`));
			[{ data: this.data.expenseType }, { data: this.newExpense }]
				= await Promise.all(requests);
			this.newExpense.expenseDate = helper.formatDate(this.newExpense.expenseDate, 'YYYY-MM-DD');
		} else {
			[{ data: this.data.expenseType }] = await Promise.all(requests);
		}
		this.isLoading = false;
	} catch (error) {
		this.showGenericError();
	}
}

async function registerExpense() {
	this.isLoading = true;
	const message = this.expenseId ? 'Actualización exitosa' : 'Registro exitoso';
	if (!this.newExpense.urlImage) {
		delete this.newExpense.urlImage;
	}
	if (this.expenseId) {
		delete this.newExpense.comEmployeesId;
		delete this.newExpense.companyId;
		delete this.newExpense.createdAt;
		delete this.newExpense.deletedAt;
		delete this.newExpense.flagActive;
		delete this.newExpense.projectId;
		delete this.newExpense.purDocumentId;
		delete this.newExpense.salCashDeskClosingId;
		delete this.newExpense.updatedAt;
		delete this.newExpense.id;
		delete this.newExpense.hashOffline;
	}
	try {
		const { host, method, url } = this.expenseService;
		await this[host][method](url, this.newExpense);
		this.showNotification(message);
		this.goTo('expenses', { query: { projectId: this.projectId } });
	} catch (error) {
		this.showGenericError();
	}
	this.isLoading = false;
}

function imageUpdated() {
	this.newExpense.urlImage = this.captureLocation;
	return this.newExpense.urlImage || `${this.$imageUrl}/place-holder.svg`;
}

function cancelProduct() {
	this.newExpense = Object.assign({}, this.defaultExpense);
	this.goTo('expenses');
}

function validations() {
	return {
		newExpense: {
			name: {
				required,
			},
			purTypeExpenseId: {
				required,
			},
			expenseDate: {
				required,
			},
			amount: {
				required,
			},
			flagEnum: {
				required,
			},
		},
	};
}

function data() {
	return {
		data: {
			expenseMode: [
				{ name: 'Gasto', flag: 0 },
				{ name: 'A cuenta', flag: 1 },
			],
		},
		defaultExpense: {
			amount: '',
			name: '',
			purTypeExpenseId: '',
			flagEnum: '',
			expenseDate: '',
			urlImage: '',
		},
		expenseId: 0,
		isLoading: false,
		menuPicker: false,
		newExpense: {
			amount: '',
			description: '',
			expenseDate: '',
			flagEnum: '',
			name: '',
			purTypeExpenseId: '',
			urlImage: '',
		},
	};
}

function projectId() {
	return this.$route.query.projectId;
}

function expenseService() {
	const service = {
		host: '$httpSales',
		method: 'post',
		url: this.id ? `expenses/${this.id}` : '/expenses',
	};
	if (this.$route.query.projectId && this.$route.name === 'new-expenses') {
		service.host = '$httpProduction';
		service.url = `expenses/${this.projectId}`;
	} else if (this.id) {
		service.host = '$httpSales';
		service.method = 'patch';
	}
	return service;
}

export default {
	name: 'new-expenses',
	components: {
		headerPage,
		VueSixFour,
	},
	computed: {
		expenseService,
		projectId,
		imageUpdated,
	},
	created,
	data,
	methods: {
		cancelProduct,
		loadData,
		registerExpense,
	},
	mixins: [upLoadImageMixin],
	props: ['id'],
	validations,
};
</script>

<style lang="scss" scoped>
.new-product {
		background: map-get($colors, background-even-modal);
		padding-bottom: 80px;

		&-log-japi {
			@include flex-center;
			background-color: white;
			border: 5px solid map-get($colors, primary);
			border-radius: 50%;
			height: 100px;
			margin: 20px auto;
			width: 100px;

			img {
				width: 65%;
			}
		}
	}
	.new-expense-log-japi {
		@include flex-center;
		margin: auto;
		img {
			width: 40%;
		}
	}
</style>
