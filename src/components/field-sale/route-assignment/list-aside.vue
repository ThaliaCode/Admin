<template>
	<fixed-slider
		:cancel-text="cancelText"
		:disabled="disabledForm"
		:height-var="heightVar"
		:loading="loading"
		:success-text="successText"
		padding-success="px-4"
		@cancel="$emit('cancel-action')"
		@success-action="$emit('success-action')"
	>
		<v-flex xs12 id="scroll-target-calendar" v-if="showCalendar">
			<v-layout row wrap pb-2>
				<v-flex xs6 pr-2>
					<app-date-select
						label="Fecha de inicio"
						model="startDateModel"
						:date-formatted="startDateModel"
						@input="setData({ model: 'startDate', value: $event })"
					/>
				</v-flex>
				<v-flex xs6 pr-2>
					<app-date-select
						label="Fecha Final"
						:date-formatted="endDateModel"
						model="endDateModel"
						@input="setData({ model: 'endDate', value: $event })"
					/>
				</v-flex>
			</v-layout>
			<v-layout wrap>
				<v-flex xs12 mb-3 mt-1 class="text-md-center">
					<h3 class="caption">Días selecionados para la ruta</h3>
				</v-flex>
			</v-layout>
			<v-layout
				wrap
				class="calendar-route-container"
				align-content-start
				v-scroll:#scroll-target-calendar
			>
				<custom-calendar
					:days="days"
					:months="months"
					:disabled="daysDisabled"
					@select-day="$emit('select-day', $event)"
					@select-date="$emit('select-date', $event)"
				></custom-calendar>
			</v-layout>
		</v-flex>
		<v-flex xs12 v-else>
			<v-layout wrap>
				<v-flex xs6 mt-3 pr-3>
					<searcher-input
						:search="search"
						:readonly="searchReadonly"
						@search-value="$emit('search-value', $event)"
					></searcher-input>
				</v-flex>
				<v-flex xs6>
					<app-select
						multiple
						chips
						:item="groupIds"
						item-text="name"
						item-value="id"
						:items="groups"
						model="groupIds"
						:return-object="false"
						:label="'Selecciona el grupo'"
						@input="emitData($event)"
					/>
				</v-flex>
				<v-flex x12 mt-2 v-show="!search">
					<span>Total seleccionados: {{ totalDelected }}</span>
				</v-flex>
				<v-flex class="xs12 align-center pl-2 mt-2">
					<v-switch
						class="card-checkbox mr-3 mb-3"
						v-model="params.flagCustomerNotAssigned"
						@change="emitData($event)"
					></v-switch>
					<span>Mostrar clientes no asociados</span>
				</v-flex>
				<v-flex class="xs6 align-center pl-2 mt-2 mb-3">
					<v-checkbox
						:disabled="checkedDisabled"
						hide-details
						v-model="isCheckedAll"
						class="card-checkbox pa-0 ma-0"
						@change="selectedAll($event)"
					></v-checkbox>
					<span>Seleccionar todos los clientes</span>
				</v-flex>
				<v-flex class="xs6 align-center pl-2 mt-2 mb-3">
					<v-checkbox
						hide-details
						v-model="generateOptimalRoute"
						class="card-checkbox pa-0 ma-0"
						@change="$emit('change-selected', $event, 'generateOptimalRoute')"
					></v-checkbox>
					<span>Ordenar por ruta optima</span>
				</v-flex>
				<v-flex xs12 id="scroll-target-route">
					<v-layout
						wrap
						class="vendors-route-container"
						align-content-start
						v-scroll:#scroll-target-route
					>
						<v-flex v-for="customer in customerToShow" :key="customer.id" py-1 xs12>
							<customer-card
								:active="customer.isSelected"
								card-body
								:customer="customer"
								:checked-disabled="checkedDisabled"
								:information="cardInfo"
								main-customer
								selectable
								@card-action="$emit('card-action', $event)"
								@click-icon="$emit('click-icon', $event)"
								@on-checked="$emit('on-checked', $event)"
							></customer-card>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex x12 v-show="customers.length >= 10">
					<div>
						<app-tooltip-button
							:disabled="currentPage === 1"
							icon="chevron_left"
							text="Anterior"
							@click-icon="changePage(-1)"
						/>
						<span
							>Página <b>{{ currentPage }}</b> de {{ totalPages }}</span
						>
						<app-tooltip-button
							:disabled="currentPage === totalPages"
							icon="navigate_next"
							text="Siguiente"
							@click-icon="changePage(+1)"
						/>
					</div>
				</v-flex>
			</v-layout>
		</v-flex>
		<div class="py-4">.</div>
	</fixed-slider>
</template>

<script>
import { differenceInCalendarDays, format } from 'date-fns';
import appDateSelect from '@/components/shared/app-date-select';
import barInformation from '@/components/field-sale/shared/bar-information';
import customCalendar from '@/components/field-sale/shared/calendar/custom-calendar';
import customerCard from '@/components/field-sale/shared/customer-card';
import fixedSlider from '@/components/field-sale/shared/fixed-slider';
import helper from '@/shared/helper';
import RouteStatus from '@/shared/route-status';
import searcherInput from '@/components/field-sale/shared/searcher-input';

const { exactDate } = helper;

function created() {
	this.startDateModel = format(this.$today(), 'YYYY-MM-DD');
	this.startDate = format(this.$today(), 'YYYY-MM-DD');
}

function allSelected(value) {
	this.checkedAll = value;
}

function daysDisabled() {
	return (
		this.disabledEndDate || !this.endDate || this.invalidStartDate || this.invalidEndDate
	);
}

function disabledAction() {
	return this.disabled || this.invalidEndDate || this.invalidStartDate;
}

function disabledEditStartDate() {
	return Number(this.routeStatus) === RouteStatus.Started;
}

function disabledEndDate() {
	return !this.startDate;
}

function setData({ model, value }) {
	const validateSetData = Boolean(value.value && value.value.length === 10);
	if (value) {
		if (value.model === 'startDateModel') {
			this[value.model] = format(value.value, 'YYYY-MM-DD');
		} else {
			this[value.model] = format(value.value, 'YYYY-MM-DD');
		}
		this[model] = format(value.value, 'YYYY-MM-DD');
		if (model === 'startDate' && validateSetData) {
			this.validateStartDate();
		} else if (model === 'endDate' && validateSetData) {
			this.validateEndDate();
		}
	}
}

function validateStartDate() {
	if (!this.routeId || (this.routeId && this.routeStatus === RouteStatus.Pending)) {
		this.invalidStartDate = differenceInCalendarDays(this.startDate, this.$today()) < 0;
		if (this.invalidStartDate) {
			this.showNotification(
				'La fecha inicial no debe ser menor a la fecha actual',
				'warning'
			);
		} else {
			this.$emit('set-date', { model: 'dateStart', value: this.startDate });
		}
	} else {
		this.$emit('set-date', { model: 'dateStart', value: this.startDate });
		if (this.routeStatus === RouteStatus.Started) {
			this.showNotification('La ruta ha sido iniciada', 'warning');
		} else if (this.routeStatus === RouteStatus.Finished) {
			this.showNotification('La ruta ha sido finalizada', 'warning');
		}
	}
}

function validateEndDate() {
	this.invalidEndDate =
		this.startDate && differenceInCalendarDays(this.endDate, this.startDate) < 0;
	if (this.invalidEndDate) {
		this.showNotification(
			'La fecha final no debe ser menor a la fecha inicial',
			'warning'
		);
	} else {
		this.$emit('set-date', { model: 'dateEnd', value: this.endDate });
	}
}

function endDateValue(value) {
	if (value) {
		this.endDateModel = exactDate(value, 'YYYY/MM/DD');
		this.setData({
			model: 'endDate',
			value: {
				model: 'endDateModel',
				value: exactDate(value, 'MM/DD/YYYY'),
			},
		});
	}
}

function startDateValue(value) {
	if (value) {
		this.startDateModel = exactDate(value, 'YYYY/MM/DD');
		this.setData({ model: 'startDate', value: exactDate(value, 'YYYY-MM-DD') });
	}
}

function disabledForm() {
	return (
		this.disabled ||
		(this.showCalendar &&
			(!this.startDateModel || !this.endDateModel || Boolean(!this.dates.length)))
	);
}

function setDate({ model, value }) {
	this[model] = format(value, 'YYYY/MM/DD');
}

function data() {
	return {
		checkedAll: false,
		endDate: null,
		endDateModel: null,
		invalidEndDate: true,
		invalidStartDate: false,
		startDate: null,
		startDateModel: null,
		currentPage: 1,
		isCheckedAll: false,
	};
}

export default {
	name: 'list-aside',
	created,
	components: {
		appDateSelect,
		barInformation,
		customCalendar,
		customerCard,
		fixedSlider,
		searcherInput,
	},
	computed: {
		daysDisabled,
		disabledAction,
		disabledEditStartDate,
		disabledEndDate,
		disabledForm,
		totalDelected() {
			if (this.customers && this.customers.length) {
				return this.customers.filter((c) => c.isChecked).length;
			}
			return 0;
		},
		totalPages() {
			return Math.ceil(this.customers.length / 10);
		},
		customerToShow() {
			const offset = (this.currentPage - 1) * 10;
			const limit = 10;

			// Asegurarse de que no exceda la cantidad total de clientes
			return this.customers.slice(offset, offset + limit);
		},
	},
	data,
	methods: {
		setDate,
		setData,
		validateEndDate,
		validateStartDate,
		changePage(value) {
			this.currentPage = this.currentPage + value;
		},
		emitData(value) {
			this.isCheckedAll = false;
			this.$emit('emit-data', value);
		},
		selectedAll(value) {
			this.isCheckedAll = value;
			this.$emit('on-all-selected', value);
		},
	},
	props: {
		allSelected: {
			default: false,
			type: Boolean,
		},
		params: {
			type: Object,
		},
		cancelText: String,
		cardInfo: {
			default: () => [],
			type: Array,
		},
		checkedDisabled: {
			default: false,
			type: Boolean,
		},
		customers: {
			default: () => [],
			type: Array,
		},
		days: {
			default: () => [],
			type: Array,
		},
		disabled: {
			default: false,
			type: Boolean,
		},
		endDateValue: [Date, String, Number],
		heightVar: {
			default: 132,
			type: [Number, String],
		},
		loading: {
			default: false,
			type: Boolean,
		},
		groups: {
			default: () => [],
			type: Array,
		},
		groupIds: {
			default: () => [],
			type: Array,
		},
		months: {
			default: () => [],
			type: Array,
		},
		orderBy: {
			default: () => [],
			type: Array,
		},
		paginated: {
			default: false,
			type: Boolean,
		},
		orderId: [Number, String],
		routeId: [Number, String],
		routeStatus: [Number, String],
		startDateValue: [Date, String, Number],
		search: String,
		searchReadonly: {
			default: false,
			type: Boolean,
		},
		showCalendar: {
			default: false,
			type: Boolean,
		},
		successText: String,
		dates: {
			default: () => [],
			type: Array,
		},
		vendorId: [Number, String],
		vendors: {
			default: () => [],
			type: Array,
		},
		year: [String, Number],
		generateOptimalRoute: {
			default: false,
			type: Boolean,
		},
	},
	watch: {
		allSelected,
		endDateValue,
		startDateValue,
		search() {
			this.currentPage = 1;
		},
	},
};
</script>

<style lang="scss" scoped>
.name-title {
	border-bottom: 2px solid color(blue-card);
	color: color(blue-card);
	font-family: font(lato-regular);
	font-size: size(medium);
	margin-bottom: 0px;
	padding-bottom: 6px;
}

.card-checkbox {
	display: inline-flex;
	height: 15px;
	vertical-align: middle;
	width: 0px;
}

.background-success {
	button {
		background-color: color(primary) !important;
	}
}

#scroll-target-route {
	height: calc(100% - 219px);
	overflow: auto;

	.vendors-route-container {
		height: 100%;
	}
}

#scroll-target-calendar {
	height: calc(100% - 122px);
	overflow: auto;

	.calendar-route-container {
		height: 100%;
	}
}
</style>
