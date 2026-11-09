<template>
	<div class="step-question">
		<v-flex>
			<v-layout align-center>
				<v-flex xs6 lg4 ml-3 text-xs-left class="title-question">
					<p class="ma-0" v-html="question"></p>
				</v-flex>
				<v-flex text-xs-right>
					<v-btn
						class="btn-auto btn-selected"
						:class="{'active' : showOne }"
						type="button"
						@click="open('showOne', 'showTwo')"
					>
						SÍ
					</v-btn>
					<v-btn
						class="btn-auto btn-selected"
						:class="{'active' : showTwo }"
						type="button"
						@click="open('showTwo', 'showOne')"
					>
						NO
					</v-btn>
				</v-flex>
			</v-layout>
			<v-layout mt-4 class="layout">
				<div
					class="triangle"
					:class="{ 'active-two' : showTwo }"
				></div>
				<v-flex xs12 class="message-box">
					<v-flex v-if="showOne">
						<v-layout row justify-space-between align-center>
							<v-flex>
								<v-layout column>
									<v-flex class="title-integration">
										<p class="ma-0" v-html="acceptTitle"></p>
									</v-flex>
									<v-flex class="description" mt-3>
										<p class="ma-0" v-html="acceptDescription"></p>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex>
								<v-flex class="video"></v-flex>
							</v-flex>
						</v-layout>
						<v-flex mt-3>
							<v-flex xs12 mb-3 class="title-warehouse">
								Seleccionar una empresa
							</v-flex>
							<v-flex xs4>
								<app-select
									append-icon="keyboard_arrow_down"
									class="border-select select-outline border-outline"
									content-class="content-outline"
									:item="subsidiaryId"
									:items="subsidiaries"
									item-text="rzSocial"
									item-value="id"
									model="subsidiaryId"
									place-holder="Empresas"
									@input="$emit('selected-subsidiary', $event)"
								></app-select>
							</v-flex>
						</v-flex>
					</v-flex>
					<v-flex v-if="showTwo">
						{{ negativeTitle }}
					</v-flex>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-dialog
			v-model="openDialog"
			persistent
			max-width="470"
		>
			<v-card class="dialog-contact">
				<v-btn
					class="btn-close btn-auto"
					depressed
					v-dialog
					small
					@click="$emit('close-dialog')"
				>
					<span class="error--text">x</span>
				</v-btn>
				<v-flex mt-3 text-xs-center class="title-question">
					Para integrarte con quipu debes ir a la configuración de
					<router-link :to="{ name: 'external-apis-integration', params: { subsidiaryId } }" target="_blank">
						integración de apis externas
					</router-link>
				</v-flex>
			</v-card>
		</v-dialog>
		<section class="modal-filter-footer">
			<v-flex text-xs-center>
				<v-btn
					class="color-btn"
					color="btnFollowing"
					:disabled="disabledQuestion"
					type="button"
					@click.native="$emit('following-question')"
				>
					Siguiente
				</v-btn>
			</v-flex>
		</section>
	</div>
</template>

<script>
function disabledQuestion() {
	return this.showTwo || (this.showOne && !this.subsidiaryId);
}

function open(propTrue, propFalse) {
	this[propTrue] = true;
	this[propFalse] = false;
}

function data() {
	return {
		showOne: true,
		showTwo: false,
	};
}

export default {
	name: 'step-question',
	computed: {
		disabledQuestion,
	},
	data,
	methods: {
		open,
	},
	props: {
		acceptDescription: {
			default: 'La contabilidad es una disciplina que se encarga de estudiar, medir y analizar el patrimonio y la situación económica financiera de una empresa u organización, con el fin de facilitar la toma de decisiones en el seno de la misma y el control externo, presentando la información, previamente registrada, de manera sistemática y útil para las distintas partes interesadas.',
			type: String,
		},
		acceptTitle: {
			default: 'INTEGRATE CON QUIPU',
			type: String,
		},
		negativeTitle: {
			default: 'YO LLEVO MI CONTABILIDAD',
			type: String,
		},
		openDialog: {
			default: false,
			type: Boolean,
		},
		question: {
			default: '¿DESEAS LLEVAR TU <br/>CONTABILIDAD FÁCILMENTE?',
			type: String,
		},
		subsidiaries: {
			default: () => [],
			type: Array,
		},
		subsidiaryId: [Number, String],
		validIntegration: {
			default: true,
			type: Boolean,
		},
	},
};
</script>

<style lang="scss" scoped>
	.step-question {
		padding: 10px 125px 80px;
	}

	.title-question {
		color: color(primary);
		font-family: font(open-bold);
		font-size: 16px;
	}

	.color-btn {
		color: color(primary) !important;
		font-family: font(open-bold) !important;
		font-size: 14px !important;
		height: 40px !important;
		width: 130px !important;
	}

	.btn-selected {
		border: 1px solid color(primary);
		border-radius: 100%;
		box-shadow: none !important;
		color: color(primary);
		font-family: font(open-semibold);
		font-size: 18px;
		height: 64px !important;
		width: 64px !important;

		&.active {
			background-color: color(primary) !important;
			box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.15) !important;
			color: color(white) !important;
			font-family: font(open-bold);
			letter-spacing: 0px;
		}
	}

	.message-box {
		background-color: color(white);
  		box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.07);
		border-radius: 20px;
		font-family: font(open-bold);
		position: relative;
    	width: 100%;
		padding: 30px 39px;
	}

	.triangle {
		border-bottom: 26px solid rgba(0, 0, 0, 0.05);
		border-left: 8px solid transparent;
		border-right: 8px solid transparent;
		position: absolute;
		right: 117px;
		top: -26px;
		z-index: 1;

		&:before {
			border-bottom: 25px solid color(white);
			border-left: 7px solid transparent;
			border-right: 7px solid transparent;
			bottom: -26px;
			content: '';
			left: -7px;
			position: absolute;
		}

		&.active-two {
			right: 32px;
		}
	}

	.layout {
		position: relative;
	}

	.title-integration {
		color: #494949;
		font-family: font(open-bold);
		font-size: 16px;
	}

	.description {
		color: #909090;
		font-family: font(open-regular);
		font-size: 12px;
		width: 390px;
	}

	.video {
		background-color: #f2f6f7;
		height: 172px;
	}

	.title-warehouse {
		border-bottom: 1px solid #d2d2d2;
		color: #494949;
		font-family: font(open-bold);
		font-size: 16px;
		padding-bottom: 9px;
	}

	.dialog-contact {
		border-radius: 11px;
		box-shadow: 0 2px 13px 0 rgba(0, 0, 0, 0.13);
		padding: 35px 55px 60px 55px; 
	}

	.btn-contact {
		background-color: #4caf50;
		border-radius: 5px;
		color: white;
		font-family: map-get($fonts, open-bold);
		font-size: 14px;
		padding: 9px;
	}

	.btn-close {
		background-color: transparent !important;
		position: absolute !important;
		right: 10px;
		top: 10px;
	}
</style>