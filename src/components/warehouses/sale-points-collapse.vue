<template>
	<div class="pb-2">
		<v-layout
			wrap
			align-center
			justify-space-between
			body-2
			pl-4
			class="sale-point"
		>
			<v-flex xs12 sm9>
				<v-layout wrap align-center>
					<v-flex xs5 v-if="edit">
						<app-input-text
							model="name"
							:text="name"
							@input="setValue"
							@keyup.enter.native="editName"
							@keyup.esc.native="cancelEdit"
						/>
					</v-flex>
					<span v-else class="info--text uppercase--text">
						<v-tooltip top>
							<span slot="activator">
								{{ salePoint.name | limitTo(20) }}
							</span>
							<span>
								{{ salePoint.name }}
							</span>
						</v-tooltip>
					</span>
					<v-flex xs7>
						<router-link
							class="ml-2"
							:to="{
								name: 'configuration',
								params: { id: salePoint.commerceId },
								query: { origin: 'commerce' },
							}"
							v-if="salePoint.flagEcommerce === 1"
						>
							( Tienda Online )
						</router-link>
						<v-btn class="mr-0" v-if="edit" icon @click="editName">
							<v-icon color="success">check_box</v-icon>
						</v-btn>
						<v-btn class="ml-0" v-if="edit" icon @click="cancelEdit">
							<v-icon color="error">close</v-icon>
						</v-btn>
						<v-btn v-else icon @click="showEdit">
							<v-icon color="success">edit</v-icon>
						</v-btn>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs12 sm3>
				<v-layout wrap align-center justify-end>
					<v-flex xs4>
						<label
							class="small-caption"
							:class="[salePoint.flagActive ? 'success--text' : 'error--text']"
						>
							{{ statusName }}
						</label>
						<v-switch
							class="switch-status"
							color="success"
							hide-details
							v-model="salePoint.flagActive"
							@change="$emit('change-flag-point', $event, salePoint)"
						></v-switch>
					</v-flex>
					<v-flex xs6 text-xs-center>
						<v-btn icon @click="showDetail">
							<template v-if="open">
								<v-icon color="blue">arrow_drop_up</v-icon>
							</template>
							<template v-else>
								<v-icon color="blue">arrow_drop_down</v-icon>
							</template>
						</v-btn>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-layout wrap align-center v-if="open">
			<v-flex xs5 px-4 mb-3>
				<app-select
					:item="salePoint.typeDevice"
					item-text="name"
					item-value="id"
					:items="typeDevices"
					label="Tipo de dispositivo"
					model="typeDevice"
					@input="setDevice"
				/>
			</v-flex>
			<v-flex xs5 px-4 mb-3 mt-3>
				<app-select
					item-text="name"
					item-value="id"
					label="Caja"
					:item="salePoint.cashId"
					:items="cashs"
					@input="setCash"
				/>
				<span
					class="form-group__message"
					v-if="salePoint.flagActive && !salePoint.cashId"
				>
					Es requerido
				</span>
			</v-flex>
			<v-flex xs12 px-4>
				<label>Usuarios</label>
				<v-select
					chips
					clearable
					solo
					multiple
					autocomplete
					hide-details
					color="success"
					item-text="name"
					item-value="id"
					label="Usuarios"
					:items="customers"
					v-model="salePoint.employeesId"
					@input="setUsers"
				>
					<template slot="selection" slot-scope="data">
						<v-chip
							color="info"
							outline
							:selected="data.selected"
							close
							@input="remove(data.item)"
						>
							<strong>{{ data.item.name }}</strong
							>&nbsp;
						</v-chip>
					</template>
				</v-select>
			</v-flex>
			<v-flex
				xs12
				px-4
				pt-3
				v-for="(document, documentIndex) in salePoint.documents"
				:key="documentIndex"
			>
				<v-layout wrap v-if="document.billing">
					<v-flex xs12 class="border-title">
						<v-layout wrap>
							<v-flex xs4>
								<v-checkbox
									class="mt-2"
									hide-details
									:label="document.billing[0].name"
									v-model="document.isSelected"
								></v-checkbox>
							</v-flex>
							<v-flex xs8>
								<v-tabs v-model="document.tab" color="transparent" right>
									<v-tab
										v-for="(bill, index) in document.billing"
										:key="index"
										>{{ nameBill(bill.typeBilling) }}</v-tab
									>
								</v-tabs>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs4 mt-5 v-if="document.isSelected">
						<span>{{ document.billing[0].name }}</span>
					</v-flex>
					<v-flex xs8 v-if="document.isSelected">
						<v-tabs-items v-model="document.tab">
							<v-tab-item
								v-for="(bill, index) in document.billing"
								:key="index"
							>
								<group-point
									:format-country="formatCountry"
									:document="bill"
									@set-detail="setDetail"
								/>
							</v-tab-item>
						</v-tabs-items>
					</v-flex>
				</v-layout>
				<v-layout wrap v-else>
					<v-flex xs12 class="border-title">
						<v-checkbox
							class="mt-2"
							hide-details
							:label="document.name"
							v-model="document.isSelected"
						></v-checkbox>
					</v-flex>
					<v-flex xs3 mt-5 v-if="document.isSelected">
						<span>{{ document.name }}</span>
					</v-flex>
					<v-flex xs8 mt-2 v-if="document.isSelected">
						<group-point
							:format-country="formatCountry"
							:document="document"
							@set-detail="setDetail"
						/>
					</v-flex>
				</v-layout>
				<v-flex xs12 mt-4 v-if="document.isSelected">
					<v-divider></v-divider>
				</v-flex>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
import appInputText from '@/components/shared/app-input-text';
import groupPoint from '@/components/warehouses/group-point';

function cancelEdit() {
	this.name = this.salePoint.name;
	this.edit = false;
}

function editName() {
	const body = {
		index: this.index,
		name: this.name,
	};
	this.$emit('name-updated', body);
	this.edit = false;
}

function isDetails({ details }) {
	return details.length > 0;
}

function setDetail(model) {
	this.$emit('set-detail', model);
}

function setValue({ model, value }) {
	this[model] = value;
}

function showDetail() {
	this.open = !this.open;
}

function showEdit() {
	this.name = this.salePoint.name;
	this.edit = true;
}

function statusName() {
	return this.salePoint.flagActive ? 'Activado' : 'Desactivado';
}

function nameBill(value) {
	return value === 1 ? 'Electrónica' : 'Física';
}

function setDevice(model) {
	const body = {
		index: this.index,
		id: model.value.id,
	};
	this.$emit('device-updated', body);
}

function setUsers(users) {
	this.$emit('users-selected', users);
}

function setCash({ value }) {
	this.$emit('cash-selected', value.id);
}

function data() {
	return {
		billingTypes: [
			{
				id: 1,
				name: 'Electrónica',
			},
			{
				id: 2,
				name: 'Física',
			},
		],
		edit: false,
		name: '',
		notes: [],
		open: false,
		tab: null,
		typeDevices: [
			{
				id: null,
				name: 'Ambos',
			},
			{
				id: 2,
				name: 'Offline',
			},
			{
				id: 1,
				name: 'Online',
			},
		],
		users: [],
	};
}

export default {
	name: 'sale-points-collapse',
	components: {
		appInputText,
		groupPoint,
	},
	computed: {
		statusName,
	},
	data,
	methods: {
		cancelEdit,
		editName,
		isDetails,
		setCash,
		setDetail,
		setUsers,
		setValue,
		showDetail,
		showEdit,
		nameBill,
		setDevice,
	},
	props: {
		cashs: {
			default: () => [],
			type: Array,
		},
		customers: {
			default: () => [],
			type: Array,
		},
		index: [Number, String],
		salePoint: {
			default: () => {},
			type: Object,
		},
		subsidiaryId: [Number, String],
		formatCountry: {
			default: () => {},
			type: Object,
		},
	},
};
</script>

<style lang="scss" scoped>
.sale-point {
	background-color: map-get($colors, pointHeader);

	.uppercase--text {
		text-transform: uppercase;
	}

	.small-caption {
		font-size: 8px;
	}
}

.border-title {
	border-bottom: 1px solid map-get($colors, subheader);
}
</style>
