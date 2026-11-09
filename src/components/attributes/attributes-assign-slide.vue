<template>
	<div>
		<v-layout row wrap pt-3 pb-5 mb-5>
			<v-flex xs12 mb-2 v-if="rows.length">
				<v-layout
					row wrap align-center
					v-for="attribute in rows"
					:key="attribute.id"
					class="position-relative"
				>
					<v-flex xs12 class="attribute-collapse">
						<v-layout row wrap>
							<v-flex xs10>
								{{ attribute.name }}
							</v-flex>
							<v-flex xs2 text-xs-center>
								<button class="button-arrow" @click="openAttribute(attribute)">
									<v-icon color="white">
										<template v-if="attribute.open">arrow_drop_up</template>
										<template v-else>arrow_drop_down</template>
									</v-icon>
								</button>
							</v-flex>
						</v-layout>
					</v-flex>
					<v-checkbox
						class="check-all"
						color="white"
						hide-details
						v-model="attribute.checkAll"
						@change="onSelectedAll(attribute, $event)"
					></v-checkbox>
					<template v-if="attribute.open">
						<v-flex xs6 pl-2 pt-2 pb-3>
							<app-input-text
								append-icon="search"
								model="search"
								placeholder="Buscar"
								:text="attribute.search"
								@input="onSearch(attribute, $event)"
							></app-input-text>
						</v-flex>
						<v-flex xs12>
							<v-layout row wrap white>
								<v-flex xs4 px-2
									v-for="detail in attribute.attributeDetail"
									:key="detail.code"
								>
									<v-checkbox
										class="check-attribute"
										color="primary"
										hide-details
										:label="detail.name"
										v-model="detail.isSelected"
										@change="rowIsSelected(attribute, detail, $event)"
									></v-checkbox>
								</v-flex>
							</v-layout>
						</v-flex>
					</template>
				</v-layout>
			</v-flex>
			<v-flex v-else-if="rows.length === 0 && !isLoading" pa-4>
				<p class="primary--text text-xs-center">No cuenta con atributos</p>
			</v-flex>
		</v-layout>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@accept-button-clicked="$emit('assign-attributes', rowsSelected)"
				@cancel-button-clicked="$emit('cancel-action')"
			/>
		</section>
	</div>
</template>

<script>
	import appTable from '@/components/shared/table/app-table';
	import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

	function created() {
		this.showCommerce = this.$route.params.commerceId;
		this.loadAttributesBySubsidiary();
	}

	async function loadAttributesBySubsidiary(page = 1) {
		this.isLoading = true;
		this.currentPage = page;
		this.params.page = this.currentPage;
		const params = {
			...this.params,
			subsidiaryId: this.subsidiaryId,
			mode: this.showCommerce ? 1 : 2,
		};
		const { data: rows, headers } = await this.$httpProducts.get('attribute', { params });
		this.rows = this.setSelectedProp(rows, false);
		this.isLoading = false;
		this.lastPage = Number(headers['x-last-page']);
	}

	function onSearch(attribute, { model, value }) {
		const search = value ? value.trim() : null;
		this.$set(attribute, model, search);
		if (search) {
			const detailsFiltered = attribute.detailsComplete.filter(dc =>
				dc.name.toLowerCase().includes(search.toLowerCase()));
			this.$set(attribute, 'attributeDetail', detailsFiltered);
		} else {
			this.$set(attribute, 'attributeDetail', attribute.detailsComplete);
		}
	}

	function onSelectedAll(attr, selectedVal) {
		this.$set(attr, 'checkAll', selectedVal);
		const idxSelected = this.rowsSelected.findIndex(rs => rs.id === attr.id);
		const detailsSelected = attr.detailsComplete.map((dc) => {
			const newDc = { ...dc };
			newDc.isSelected = selectedVal;
			return newDc;
		});
		this.$set(attr, 'attributeDetail', detailsSelected);
		this.$set(attr, 'detailsComplete', detailsSelected);
		if (selectedVal) {
			const newSelected = detailsSelected.map(ds => ({ code: ds.code, name: ds.name }));
			if (idxSelected > -1) {
				this.rowsSelected[idxSelected].attributeDetail = [...newSelected];
			} else {
				this.rowsSelected.push({ id: attr.id, attributeDetail: [...newSelected] });
			}
		} else if (idxSelected > -1) {
			this.rowsSelected.splice(idxSelected, 1);
		}
	}

	function openAttribute(attribute) {
		this.$set(attribute, 'open', !attribute.open);
	}

	function rowIsSelected(attr, detail, selectedValue) {
		const { id } = attr;
		const newDetail = { ...detail };
		const indexId = this.rowsSelected.findIndex(rs => rs.id === id);
		if (selectedValue) {
			delete newDetail.isSelected;
			if (indexId > -1) {
				this.rowsSelected[indexId].attributeDetail.push({ ...newDetail });
			} else {
				this.rowsSelected.push({ id, attributeDetail: [{ ...newDetail }] });
			}
		} else if (indexId > -1) {
			const index = this.rowsSelected[indexId].attributeDetail.findIndex(ad =>
				ad.code === detail.code);
			if (index > -1) {
				this.rowsSelected[indexId].attributeDetail.splice(index, 1);
			}
			if (this.rowsSelected[indexId].attributeDetail.length === 0) {
				this.rowsSelected.splice(indexId, 1);
			}
		}
		const checkAll = attr.attributeDetail.every(ad => ad.isSelected);
		this.$set(attr, 'checkAll', checkAll);
	}

	function setSelectedProp(registers, selected) {
		return registers.map((r) => {
			const newRegister = { ...r };
			newRegister.checkAll = false;
			newRegister.attributeDetail = r.attributeDetail.map((ad) => {
				const newAd = { ...ad };
				if (this.productsSelected.length === 1) {
					const { additionalInformation } = this.productsSelected[0];
					let findRegister = {};
					if (additionalInformation && additionalInformation.attributes) {
						findRegister =
							additionalInformation.attributes.find(p => p.id === r.id);
					}
					const validSelected = findRegister && findRegister.attributeDetail &&
						findRegister.attributeDetail.find(s => s.code === ad.code);
					newAd.isSelected = !!validSelected;
				} else {
					newAd.isSelected = false;
				}
				return newAd;
			});
			newRegister.detailsComplete = [...newRegister.attributeDetail];
			newRegister.isSelected = selected;
			newRegister.open = true;
			newRegister.search = '';
			return newRegister;
		});
	}

	function data() {
		return {
			checkAll: false,
			columns: [
				{
					id: 1,
					name: 'Código',
					value: 'code',
					checked: true,
					visible: true,
				},
				{
					id: 2,
					name: 'Nombre',
					value: 'name',
					checked: true,
					visible: true,
				},
				{
					id: 3,
					name: 'Tipo',
					value: 'type',
					checked: true,
					visible: true,
				},
			],
			currentPage: 1,
			lastPage: 0,
			params: {
				limit: 20,
				page: 1,
				search: null,
			},
			rows: [],
			rowsSelected: [],
			showCommerce: null,
			isLoading: true,
		};
	}

	export default {
		name: 'attributes-assign-slide',
		components: {
			appTable,
			modalSidebarButton,
		},
		created,
		data,
		methods: {
			loadAttributesBySubsidiary,
			onSearch,
			onSelectedAll,
			openAttribute,
			rowIsSelected,
			setSelectedProp,
		},
		props: {
			subsidiaryId: [Number, String],
			productsSelected: {
				type: Array,
				default: () => [],
			},
		},
	};
</script>

<style lang="scss" scoped>
	.attribute-collapse {
		background-color: color(primary);
		color: color(white);
		cursor: pointer;
		font-family: font(open-semibold);
		font-size: size(small13);
		height: 30px;
		line-height: 30px;
		padding-left: 37px;
	}

	.position-relative {
		position: relative;
	}

	.check-all {
		left: 8px;
		position: absolute;
		top: 0px;
		z-index: 1;
	}

	.button-arrow {
		position: relative;
		z-index: 55;
	}
</style>