<template>
	<div class="page-sync-process">
		<header-page
			caption-navigation="Integración"
			:title="title"
		></header-page>
		<v-flex xs5 pa-4>
			<v-list 
			>
				<v-list-group
					class="table-row"
					v-for="(item, index) in modules"
					:key="index"
					no-action
				>
					<v-list-tile
						slot="activator"
						>
						<v-layout row align-center>
							<v-flex xs2>
									<v-checkbox
										color="primary"
										hide-details
										v-model="item.flagActive"
									></v-checkbox>
								</v-flex>
								<v-flex xs10 class="label-sync secondary--text">
									{{ item.name }}
								</v-flex>
						</v-layout>
					</v-list-tile>
					<v-layout>
						<v-list-tile
						class="sub-items"
						v-for="(subItem, index) in item.actions"
						:key="index"
						>
							<v-layout row align-center>
								<v-flex xs2>
									<v-checkbox
										color="primary"
										hide-details
										v-model="subItem.value"
									></v-checkbox>
								</v-flex>
								<v-flex xs10 class="label-sync secondary--text">
									<label class="label-sync secondary--text">{{ subItem.name }}</label>
								</v-flex>
							</v-layout>
						</v-list-tile>
					</v-layout>
				</v-list-group>
			</v-list>
		</v-flex>
		<section class="buttons-container">
			<v-layout wrap align-center justify-center>
				<v-flex xs1 mr-4>
					<v-btn
						class="btn-action ml-1"
						color="pink"
						:disabled="loading"
						small
						@click="goTo('list-of-process')"
					>
						Cancelar
					</v-btn>
				</v-flex>
				<v-flex xs1>
					<v-btn
						class="btn-action ml-4"
						color="primary"
						:disabled="disabled"
						small
						@click="saveAsync"
					>
						Guardar
					</v-btn>
				</v-flex>
			</v-layout>
		</section>
	</div>
</template>

<script>
	import headerPage from '@/components/shared/header-page';

	function created() {
		this.loadTypeSync();
	}

	async function loadTypeSync() {
		const params = {
			integrationTypeCode: 'TIE',
			subsidiaryId: this.$route.query.subsidiaryId,
		};
		try {
			({ data: this.modules } = await this.$httpSales.get(`process/${this.id}`, { params }));
		} catch (error) {
			this.showGenericError();
		}
	}

	function disabled() {
		return this.loading || this.modules.every(m => !m.flagActive);
	}

	function title() {
		const { name } = this.$route.query;
		return name ? `${name} > ${this.$route.meta.title}` : this.$route.meta.title;
	}

	async function saveAsync() {
		const { ambit, name, moduleId, subsidiaryId } = this.$route.query;
		const body = {
			ambit,
			name,
			moduleId: Number(moduleId),
			typeNot: this.modules.map(p => ({
				name: p.name,
				code: p.code,
				flagActive: p.flagActive,
				services: p.services,
				actions: p.actions,
				templateStructure: p.templateStructure,
				templates: p.templates,
			})),
		};
		const params = {
			subsidiaryId,
			integrationTypeCode: 'TIE',
		};
		try {
			await this.$httpSales.patch(`process/${this.id}`, body, { params });
			this.goTo('list-of-process');
			this.showNotification('El proceso fue sincronizado correctamente.');
		} catch (error) {
			this.showGenericError();
		}
	}

	function data() {
		return {
			loading: false,
			modules: [],
		};
	}

	export default {
		name: 'page-sync-process',
		components: {
			headerPage,
		},
		computed: {
			disabled,
			title,
		},
		created,
		data,
		methods: {
			loadTypeSync,
			saveAsync,
		},
		props: {
			id: [Number, String],
		},
	};
</script>

<style lang="scss" scoped>
	.label-sync {
		font-family: font(open-bold);
		font-size: size(regular);
	}

	.table-column {
		box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, .3);
	}

	.table-row {
		&:nth-child(even) {
			background-color: color(group);
		}
	}

	.buttons-container {
		background-color: white;
		border-top: 1px solid #e0e0e0;
		bottom: 0%;
		left: 0px;
		padding: 12px 0;
		position: fixed;
		right: 0px;
		width: 100%;
		z-index: 2;
	}

	.sub-items {
		border-bottom: 1.2px solid #fafafa;
		&:nth-child(odd) {
			background-color: color(group);
		}
		
		&:nth-child(even) {
			background-color: white;
		}
	}
</style>