<template>
	<div class="step-process-accounted">
		<v-layout row wrap>
			<v-flex xs12 v-if="dialog && dialog.open">
				<v-layout row wrap class="loading-body">
					<v-flex xs5 px-4 py-2 class="loading-map-container">
						<p class="loading-map-text mb-0">
							Aún no ha sido configurada ninguna empresa.
							Puedes ir a <router-link :to="{ name: dialog.route }">esta ruta</router-link> para realizar una configuración.
						</p>
					</v-flex>
				</v-layout>
			</v-flex>
			<v-flex xs6 v-else>
				<v-layout
					justify-space-between
					v-for="(item, index) in listProcess" :key="index"
					align-center
					class="table-row"
					pl-3
				>
					<v-flex xs10>
						<v-layout>
							<v-flex xs1>
								<v-checkbox
									class="accountant-switch"
									color="success"
									hide-details
									v-model="item.flagActive"
								></v-checkbox>
							</v-flex>
							<v-flex>
								<label class="label-process secondary--text ml-4">{{ item.name }}</label>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-flex xs2 v-if="item.flagActive">
						<v-layout column>
							<v-flex>
								<v-switch
									class="accountant-switch"
									color="success"
									hide-details
									v-model="item.accountingAutomatic"
								></v-switch>
							</v-flex>
							<v-flex>
								<label class="step-process-label">
									{{ item.accountingAutomatic ? 'Automatico' : 'Manual' }}
								</label>
							</v-flex>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-flex>
			<section v-if="actions" class="modal-filter-footer">
				<v-flex text-xs-center>
					<v-btn
						class="btn-auto btn-back ma-0"
						color="primary"
						:disabled="loading"
						outline
						type="button"
						@click="$emit('back-step')"
					>
						Atrás
					</v-btn>
					<v-btn
						class="btn-auto btn-back ml-3 my-0"
						color="success"
						:disabled="loading"
						type="button"
						@click="$emit('save-configuration', null)"
					>
						<span class="primary--text">Guardar</span>
					</v-btn>
				</v-flex>
			</section>
		</v-layout>
	</div>
</template>

<script>
	export default {
		name: 'step-process-accounted',
		props: {
			actions: {
				default: true,
				type: Boolean,
			},
			dialog: {
				default: () => {},
				type: Object,
			},
			listProcess: {
				type: Array,
				default: () => [],
			},
			labelSwitch: {
				type: String,
				default: '',
			},
			loading: {
				default: false,
				type: Boolean,
			},
		},
	};
</script>

<style lang="scss" scoped>
.step-process-accounted {
	padding: 62px 78px;
}

.label-process {
	font-family: font(open-bold);
	font-size: size(regular);
}

.table-row {
	height: 56px;

	&:nth-child(odd) {
		background-color: color(group);
	}
}

.ml-switch {
	margin-left: 165px;
}

.modal-filter-footer {
	border-top: 1px solid #e0e0e0;
}

.btn-back {
	border-radius: 5px !important;
	font-family: font(open-bold);
	font-size: size(medium);
	height: 40px !important;
	width: 129px !important;
}

.loading-body {
	align-items: center;
	height: 300px;
	justify-content: center;
}

.loading-map {
	&-container {
		background-color: color(white);
		border: 2px solid color(background-sidebar);
		border-radius: 6px;
	}

	&-text {
		color: color(paginationText);
		font-family: font(open-semibold);
		font-size: size(small13);
	}
}
</style>