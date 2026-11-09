<template>
	<div class="component-type-notification">
		<v-layout row wrap>
			<v-flex xs6 text-xs-left>
				<v-checkbox
					class="check-active"
					color="success"
					:true-value="1"
					:false-value="0"
					v-model="active"
					@change="
						$emit('selected-card', { row: typeNotification, value: $event })
					"
				></v-checkbox>
			</v-flex>
			<v-flex xs6 text-xs-right>
				<document-state
					:color="colorState"
					icon="radio_button_checked"
					:tooltip="tooltipState"
				></document-state>
			</v-flex>
		</v-layout>
		<v-layout row wrap>
			<v-flex xs12 text-xs-center>
				<template v-if="typeNotification.code === codeValid">
					<v-tooltip top>
						<v-btn
							slot="activator"
							class="btn-auto ma-0 btn-type-notification"
							flat
							depressed
							@click="$emit('whatsapp-conection')"
						>
							<img
								:src="typeNotification.urlImage"
								:alt="typeNotification.name"
							/>
							<p class="title-notification">{{ typeNotification.name }}</p>
						</v-btn>
						<span>Ver estado de conexión</span>
					</v-tooltip>
				</template>
				<template v-else>
					<img :src="typeNotification.urlImage" :alt="typeNotification.name" />
					<p class="title-notification">{{ typeNotification.name }}</p>
				</template>
			</v-flex>
		</v-layout>
		<v-layout justify-center row class="section-information">
			<v-flex text-xs-center>{{ typeNotification.label }} enviados</v-flex>
			<v-flex class="bor-left" pl-2>{{
				typeNotification.totalNotifications
			}}</v-flex>
		</v-layout>
	</div>
</template>

<script>
import documentState from '@/components/shared/document-state';

function mounted() {
	this.active = Number(this.activeValue);
}

function activeValue(value) {
	this.active = Number(value);
}

function colorState() {
	return this.typeNotification.flagActive ? 'success' : 'error';
}

function tooltipState() {
	return this.typeNotification.flagActive ? 'Activado' : 'Desactivado';
}

function data() {
	return {
		active: 0,
	};
}

export default {
	name: 'component-type-notification',
	components: {
		documentState,
	},
	computed: {
		colorState,
		tooltipState,
	},
	data,
	mounted,
	props: {
		activeValue: {
			default: 0,
			type: [Number, String, Boolean],
		},
		codeValid: {
			default: 'WMAKI',
			type: String,
		},
		typeNotification: {
			default: () => {},
			type: Object,
		},
	},
	watch: {
		activeValue,
	},
};
</script>

<style lang="scss" scoped>
.component-type-notification {
	background-color: white;
	border-radius: 7px;
	box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.05);
	margin: 0 auto;
	padding: 10px 13px 18px 13px;
	width: 202px;
}

.title-notification {
	border-bottom: 1px solid #fbfbfb;
	color: map-get($colors, background-sidebar);
	font-family: map-get($fonts, open-bold);
	font-size: map-get($sizes, medium);
	margin-bottom: 10px;
	padding: 10px 0 11px 0;
	text-transform: uppercase;
}

.section-information {
	border: 1px solid color(primary);
	border-radius: 5px;
	color: color(primary);
	font-family: map-get($fonts, open-bold);
	font-size: 11px;
	padding: 4px 0;
}

.bor-left {
	border-left: 1px solid color(primary);
}
</style>
