<template>
	<div class="pb-5">
		<v-layout wrap row pa-3>
			<v-flex xs6>
				<v-select
					bottom
					hide-details
					placeholder="RUC"
					class="filter-select"
					:items="subsidiaries"
					v-model="subsidiary"
					item-text="rucName"
					item-value="id"
					content-class="filter-select-content"
					@input="changeSubsidary"
				></v-select>
			</v-flex>
			<v-flex xs6 pl-2>
				<v-select
					bottom
					hide-details
					placeholder="Tipo de Factura"
					class="filter-select"
					:items="typeBill"
					v-model="bill"
					item-text="name"
					item-value="type"
					content-class="filter-select-content"
					@input="loadTerminals"
				></v-select>
			</v-flex>
		</v-layout>
		<span v-if="points.length === 0" class="caption red--text ml-3">
			No se encontraron terminales de la sucursal seleccionada
		</span>
		<span v-else-if="!noSelectedPoint" class="caption red--text ml-3"
			>Seleccione una terminal</span
		>
		<div class="selling-points mt-2">
			<div v-for="(point, indexPoint) in points" :key="indexPoint">
				<div class="wrapper-header-point">
					<v-layout align-center>
						<input
							class="radio-selling-point"
							:disabled="!!point.flagTerminalDevice"
							:id="point.name"
							name="contact"
							type="radio"
							:value="point.id"
							v-model="selectPoint"
							@input="collapse(point)"
						/>
						<label :for="point.name" class="ml-1 text-blue"
							>{{ point.name }} -
							{{ point.cash ? point.cash.name : null }}</label
						>
					</v-layout>
					<div class="collapse-icon">
						<button @click="collapse(point)">
							<v-icon v-bind:class="{ 'rotate-icon': point.open }">
								keyboard_arrow_down
							</v-icon>
						</button>
					</div>
				</div>
				<div v-if="point.open">
					<v-layout v-if="point.flagTerminalDevice" wrap>
						<v-flex xs12 px-5 py-3 caption error--text>
							No se puede seleccionar este punto de venta porque está siendo
							usado desde un dispositivo móvil.
						</v-flex>
					</v-layout>
					<v-layout v-else class="wrapper-text-point">
						<v-flex xs5>
							<v-text-field
								name="serie"
								label="Serie"
								disabled
								:value="point.serie.serie"
							></v-text-field>
						</v-flex>
						<v-flex xs2>-</v-flex>
						<v-flex xs5>
							<v-text-field
								name="number"
								label="Número"
								:disabled="!disabledNumber(point)"
								:value="point.serie.number"
								@input="setValue($event, indexPoint)"
							></v-text-field>
						</v-flex>
					</v-layout>
				</div>
			</div>
			<section class="modal-filter-footer">
				<modal-sidebar-button
					:is-loading="!selectPoint || isLoading || !noSelectedPoint"
					@cancel-button-clicked="$emit('close')"
					@accept-button-clicked="savePoint"
				/>
			</section>
		</div>
	</div>
</template>
<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import typeOfBill from '@/shared/type-of-bill';

function created() {
	if (Object.keys(this.serie).length) {
		this.subsidiary = this.serie.comSubsidiariesId;
		this.changeSubsidary(this.serie.comSubsidiariesId, this.serie.typeBilling);
	}
}

function collapse({ flagTerminalDevice, id }) {
	this.points = this.points.map((p) => {
		const newPoint = { ...p };
		newPoint.open = id === p.id ? !p.open : false;
		return newPoint;
	});
	this.isLoading = !!flagTerminalDevice;
}

function disabledNumber(item) {
	return this.bill === typeOfBill.Physical && item.id === this.selectPoint;
}

function savePoint() {
	const pointSelect = this.points.find((p) => p.id === this.selectPoint);
	if (pointSelect && pointSelect.cash && pointSelect.serie) {
		this.$emit('save-point', pointSelect);
	} else {
		this.showGenericError('No es posible seleccionar este punto de venta');
	}
}

function setValue(value, indexPoint) {
	this.points[indexPoint].serie.number = value;
}

async function changeSubsidary(id, name, typeBill = null) {
	this.bill = null;
	this.selectPoint = null;
	this.subsidiaryName = name;
	try {
		const { data: response } = await this.$httpSales.get(
			`type-billing?subsididaryId=${id}`
		);
		this.typeBill = response;
		if (!typeBill) {
			if (this.typeBill.length === 1) {
				this.bill = this.typeBill[0].type;
			} else {
				const indexElect = this.typeBill.findIndex(
					(t) => t.type === typeOfBill.Electronic
				);
				if (indexElect > -1) {
					this.bill = this.typeBill[indexElect].type;
				}
			}
		} else {
			this.bill = typeBill;
		}
		this.loadTerminals(this.bill);
	} catch (error) {
		this.showGenericError();
	}
}

async function loadTerminals(id) {
	if (id) {
		const params = {
			comSubsidiariesId: this.subsidiary,
			typeBilling: id,
			typeDocumentId: this.typeDocumentId,
		};
		try {
			const { data: response } = await this.$httpSales.get('terminals', {
				params,
			});
			this.points = response.reduce((acum, r) => {
				const newAcum = [...acum];
				if (r.series.length) {
					const newPoint = { ...r };
					newPoint.open = false;
					newPoint.serie = r.series[0];
					if (Object.keys(this.serie).length) {
						if (this.serie.terminal.id === r.id) {
							newPoint.serie.number = this.serie.number;
						}
					}
					newAcum.push(newPoint);
				}
				return newAcum;
			}, []);
			this.selectPoint = this.serie ? this.serie.salTerminalsId : null;
		} catch (error) {
			this.showGenericError();
		}
	}
}

function data() {
	return {
		isLoading: false,
		points: [],
		selectPoint: null,
		subsidiary: null,
		typeBill: [],
		bill: null,
	};
}

export default {
	data,
	name: 'selling-points',
	components: {
		modalSidebarButton,
	},
	created,
	methods: {
		changeSubsidary,
		collapse,
		disabledNumber,
		loadTerminals,
		savePoint,
		setValue,
	},
	computed: {
		noSelectedPoint() {
			return this.points.some((p) => p.id === this.selectPoint);
		},
	},
	props: {
		typeDocumentId: [Number, String],
		serie: {
			type: Object,
			default: () => {},
		},
		subsidiaries: {
			type: Array,
			default: () => [],
		},
	},
};
</script>
<style lang="scss" scoped>
.selling-points {
	.wrapper-header-point {
		align-items: center;
		background: color(pointHeader);
		display: flex;
		justify-content: space-between;
		height: 54px;
		padding: 0px 18px 0px 27px;
	}

	.text-blue {
		color: color(background-sidebar);
		font-family: font(open-bold);
	}

	.wrapper-radios-point {
		padding: 0 44% 0px 58px;
	}

	.wrapper-text-point {
		align-items: center;
		padding: 18px 45% 0px 82px;
	}

	.collapse-icon {
		height: 22px;
		margin: 0 10px;
		padding-left: 10px;
		width: 32px;

		.icon {
			transform: rotateZ(0deg);

			&.rotate-icon {
				transform: rotateZ(180deg);
			}
		}
	}

	input[disabled] {
		opacity: 0.5;

		&:after {
			opacity: 0.5;
		}
	}

	input[type='radio']:after {
		background-color: map-get($colors, white);
		border: 1px solid map-get($colors, grey-border);
		border-radius: 15px;
		content: '';
		display: inline-block;
		height: 16px;
		left: 0px;
		position: relative;
		width: 16px;
		top: -1px;
		visibility: visible;
	}

	input[type='radio']:checked:after {
		background-color: map-get($colors, success);
		border: 1px solid map-get($colors, blue-card);
		border-radius: 15px;
		content: '';
		display: inline-block;
		height: 16px;
		left: 0px;
		position: relative;
		top: -1px;
		visibility: visible;
		width: 16px;
	}

	.radio-selling-point {
		height: 16px;
		width: 16px;
	}
}
</style>
