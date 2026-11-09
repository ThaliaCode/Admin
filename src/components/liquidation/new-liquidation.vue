<template>
	<div>
		<v-layout wrap pa-4 mt-1>
			<!-- EMPRESA -->
			<v-flex xs12 mb-3>
				<label class="caption">Empresa</label>
				<app-select
					:items="subsidiaries"
					item-text="rzSocial"
					item-value="id"
					:item="newLiquidation.subsidiaryId"
					:return-object="false"
					model="subsidiaryId"
					@input="setData"
				></app-select>
			</v-flex>
			<!-- NOMBRE -->
			<v-flex xs12 mb-3>
				<label class="caption">Nombre</label>
				<v-text-field
					hide-details
					class="filter-select shadow-inset"
					v-model="newLiquidation.name"
				></v-text-field>
			</v-flex>
			<!-- FECHA INICIAL -->
			<v-flex xs12 mb-3>
				<label class="caption">Fecha Inicial</label>
				<date-component
					:date="newLiquidation.startDate"
					icon="/static/img/calendar.svg"
					@on-input="setData({ model: 'startDate', value: $event })"
				></date-component>
			</v-flex>
			<!-- FECHA FINAL -->
			<v-flex xs12 mb-3>
				<label class="caption">Fecha Final</label>
				<date-component
					:date="newLiquidation.endDate"
					icon="/static/img/calendar.svg"
					@on-input="setData({ model: 'endDate', value: $event })"
				></date-component>
			</v-flex>
		</v-layout>
		<v-flex xs12 px-4>
			<p class="title-list">Metas y sueldos base</p>
			<p class="currency">Moneda por defecto: S/.</p>
			<button class="product-add-btn mt-1" type="button" @click="addSalaries">
				<span>Agregar</span>
				<v-icon class="product-add-btn-icon" color="primary" size="17">
					add_circle
				</v-icon>
			</button>
		</v-flex>
		<transition name="fade" mode="out-in">
			<v-layout
				row
				wrap
				v-if="newLiquidation.salaries.length > 0"
				ml-5
				mt-3
				mb-3
			>
				<v-flex
					v-for="(salaries, indexSalaries) in newLiquidation.salaries"
					xs10
					:key="indexSalaries"
				>
					<v-layout row wrap class="price-list-major-item">
						<v-flex xs3 mb-3 mr-3>
							<label class="caption sub-salary">Desde</label>
							<v-text-field
								hide-details
								type="number"
								class="filter-select shadow-inset"
								v-model="salaries.fromAmount"
							></v-text-field>
						</v-flex>
						<v-flex xs3 mb-3 mr-3>
							<label class="caption sub-salary">Hasta</label>
							<v-text-field
								hide-details
								type="number"
								class="filter-select shadow-inset"
								v-model="salaries.toAmount"
							></v-text-field>
						</v-flex>
						<v-flex xs4 mb-3>
							<v-layout row align-center>
								<v-flex mr-3>
									<label class="caption sub-salary">Sueldo base</label>
									<v-text-field
										hide-details
										type="number"
										class="filter-select shadow-inset"
										v-model="salaries.baseSalary"
									></v-text-field>
								</v-flex>
								<v-flex xs3>
									<v-btn
										class="btn-auto ma-0"
										depressed
										flat
										icon
										type="button"
										@click="removeSalaries(indexSalaries)"
									>
										<v-icon color="primary">remove_circle</v-icon>
									</v-btn>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</transition>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				:is-loading="$v.$invalid || Boolean(validateSalaries)"
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="registerLiquidation"
			/>
		</section>
	</div>
</template>
<script>
import { differenceInDays } from 'date-fns';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import dateComponent from '@/components/shared/date-component';
import { required } from 'vuelidate/lib/validators';

function validations() {
	return {
		newLiquidation: {
			name: { required },
			subsidiaryId: { required },
			startDate: { required },
			endDate: { required },
			salaries: {
				$each: {
					fromAmount: { required },
					toAmount: { required },
					baseSalary: { required },
				},
			},
		},
	};
}

function data() {
	return {
		newLiquidation: {
			name: null,
			subsidiaryId: null,
			startDate: null,
			endDate: null,
			salaries: [],
		},
	};
}

export default {
	name: 'new-liquidation',
	data,
	components: {
		modalSidebarButton,
		dateComponent,
	},
	created() {
		if (this.liquidationEdit) {
			const { name, subsidiaryId, startDate, endDate, salaries } =
				this.liquidationEdit;
			this.newLiquidation = {
				name,
				subsidiaryId,
				startDate,
				endDate,
				salaries,
			};
			if (!this.liquidationEdit.salaries) {
				this.newLiquidation.salaries = [];
			}
		}
	},
	methods: {
		async registerLiquidation() {
			const isEdit =
				this.liquidationEdit && this.liquidationEdit.action === 'edit';
			const method = isEdit ? 'put' : 'post';
			const url = isEdit
				? `/settlements/${this.liquidationEdit.id}`
				: '/settlements';
			if (isEdit) {
				delete this.newLiquidation.subsidiaryId;
			}
			try {
				await this.$httpSettlement[method](url, this.newLiquidation);
				this.showNotification('La liquidación a sido creada correctamente.');
				this.$emit('close-modal');
				this.$emit('load-data');
			} catch (error) {
				if (error.status === 400) {
					this.showGenericError(error.data.message);
				} else {
					this.showGenericError();
				}
			}
		},
		setData({ model, value }) {
			this.newLiquidation[model] = value;
			if (this.newLiquidation.startDate && this.newLiquidation.endDate) {
				const validDate =
					differenceInDays(
						this.newLiquidation.endDate,
						this.newLiquidation.startDate
					) < 0;
				if (validDate) {
					// const todayDate = new Date().toISOString().split('T')[0];
					this.newLiquidation.endDate = this.newLiquidation.startDate;
					this.showNotification(
						'La fecha final no puede ser menor a la inicial.',
						'error'
					);
				}
			}
		},
		addSalaries() {
			const defaultSalaries = {
				fromAmount: 0,
				toAmount: 0,
				baseSalary: 0,
			};
			this.newLiquidation.salaries = this.newLiquidation.salaries.concat({
				...defaultSalaries,
			});
			this.$forceUpdate();
		},
		removeSalaries(indexSalaries) {
			this.newLiquidation.salaries.splice(indexSalaries, 1);
		},
	},
	computed: {
		validateSalaries() {
			return this.newLiquidation.salaries.reduce(
				(error, current, index, arr) => {
					if (error) return error;
					if (parseFloat(current.toAmount) <= parseFloat(current.fromAmount)) {
						const message = `En el Metas y sueldos base número ${
							index + 1
						}, el campo "Desde"(${
							current.toAmount
						}) debe ser mayor al campo "Hasta"(${current.fromAmount}).`;
						this.showGenericError(message);
						return message;
					}
					if (
						index > 0 &&
						parseFloat(current.fromAmount) <=
							parseFloat(arr[index - 1].toAmount)
					) {
						const message = `En el campo "Desde" (${
							current.fromAmount
						}) del Metas y sueldos base número ${
							index + 1
						} debe ser mayor al campo "Hasta" (${
							arr[index - 1].toAmount
						}) del rango anterior.`;
						this.showGenericError(message);
						return message;
					}
					if (
						index > 0 &&
						parseFloat(current.baseSalary) <=
							parseFloat(arr[index - 1].baseSalary)
					) {
						const message = `El salario base (${
							current.baseSalary
						}) del Metas y sueldos base número ${
							index + 1
						} debe ser mayor que el salario base anterior (${
							arr[index - 1].baseSalary
						}).`;
						this.showGenericError(message);
						return message;
					}

					return null;
				},
				null
			);
		},
	},
	props: {
		subsidiaries: {
			type: Array,
		},
		liquidationEdit: {
			type: Object,
		},
	},
	validations,
};
</script>
<style lang="scss" scoped>
.title-list {
	font-family: font(open-bold);
	font-size: 20px;
	justify-content: flex-start;
	text-align: left;
	margin: 0;
}

.currency {
	font-size: 12px;
}

.product-add-btn {
	align-items: center;
	border-color: color(primary);
	border-style: solid;
	border-width: 1px;
	border-radius: 5px;
	color: color(primary);
	cursor: pointer;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	font-family: font(open-semibold);
	font-size: size(small);
	height: 27px;
	justify-content: space-between;
	padding: 0px 9px;
	width: 100%;

	span {
		text-align: start;
		margin-left: 10px;
		width: calc(90% - 23px);
	}

	&.product-add-btn-active {
		background-color: color(primary);
		color: color(white);
	}
}

.sub-salary {
	font-weight: bold;
	color: color(primary);
}
</style>
