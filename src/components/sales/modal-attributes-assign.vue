<template>
  <div>
		<div v-for="(item, indexSection) in listSections" :key="indexSection">
			<div class="attribute-collapse">
				{{ item.name }}
			</div>
			<v-layout
			column wrap pt-3 pb-1 mb-2>
				<div>
					<v-flex
						row wrap align-center
						v-for="(attribute, indexHeader) in item.arrayAtributes"
						:key="indexHeader"
						mb-2
						class="position-relative">
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
								v-if="attribute.type === 1 && !showAtributte"
								class="check-all"
								color="white"
								hide-details
								v-model="listSections[indexSection].arrayAtributes[indexHeader].checkAll"
								@change="onSelectedAll(attribute, $event)"
							></v-checkbox>
							<template v-if="attribute.open">
								<v-flex xs12>
									<v-layout row wrap white>
										<v-flex xs6 px-2
											v-for="(detail, index) in attribute.attributeDetail"
											:key="index"
										>
											<v-checkbox
												v-if="attribute.type === 1"
												class="check-attribute"
												color="primary"
												hide-details
												:label="detail.name"
												v-model="detail.isSelected"
												@change="rowIsSelected(attribute, detail, $event, indexSection)"
											></v-checkbox>
											<v-flex xs12 pl-2 v-else-if="attribute.type === 3">
												<label class="caption">
													{{ detail.name }}
												</label>
											</v-flex>
											<v-flex v-else>
												<v-radio-group
												row
												name="radio-attribute"
												@change="rowIsSelectedRadio(attribute, detail, $event, indexSection)"
												v-model="attribute.code">
													<v-radio
														hide-details
														color="primary"
														class="mb-3"
														:ripple="false"
														:label="detail.name"
														:value="detail.code"
													></v-radio>
												</v-radio-group>
											</v-flex>
										</v-flex>
									</v-layout>
								</v-flex>
							</template>
					</v-flex>
					</div>
			</v-layout>
		</div>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="$emit('close-modal')"
				@accept-button-clicked="saveModal" />
		</section>
  </div>
</template>

<script>
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';

function openAttribute(attribute) {
	this.$set(attribute, 'open', !attribute.open);
}

function rowIsSelected(attr, detail, selectedValue, index) {
	const { id, name, idSection, nameSection, uId } = attr;
	const newDetail = { ...detail };
	const indexId = this.rowsSelected.findIndex(rs => rs.uId === uId);
	if (newDetail) {
		newDetail.isSelected = true;
	}
	if (selectedValue) {
		if (indexId > -1) {
			this.rowsSelected[indexId].attributeDetail.push({ ...newDetail });
		} else {
			this.rowsSelected.push({
				id,
				uId,
				name,
				idSection,
				nameSection,
				attributeDetail: [{ ...newDetail }],
			});
		}
	}	else if (indexId > -1) {
		const indexAtrribute = this.rowsSelected[indexId].attributeDetail.findIndex(ad =>
			ad.code === detail.code);
		if (indexAtrribute > -1) {
			this.rowsSelected[indexId].attributeDetail.splice(index, 1);
		}
		if (this.rowsSelected[indexId].attributeDetail.length === 0) {
			this.rowsSelected.splice(indexId, 1);
		}
	}
	const checkAll = attr.attributeDetail.every(ad => ad.isSelected);
	this.$set(attr, 'checkAll', checkAll);
}

function rowIsSelectedRadio(attr, detail, selectedValue) {
	const { id, name, idSection, nameSection, uId } = attr;
	const newDetail = { ...detail };
	const indexId = this.rowsSelected.findIndex(rs => rs.uId === uId);
	if (newDetail) {
		newDetail.isSelected = true;
		newDetail.code = detail.code;
		newDetail.valueRadio = selectedValue;
	}
	if (selectedValue) {
		if (indexId > -1) {
			this.rowsSelected[indexId].attributeDetail.splice(0, 1);
			this.rowsSelected[indexId].attributeDetail.push({ ...newDetail });
		} else {
			this.rowsSelected.push({
				id,
				uId,
				name,
				idSection,
				nameSection,
				attributeDetail: [{ ...newDetail }],
			});
		}
	}
}

function saveModal() {
	this.$emit('save-modal', this.rowsSelected);
}

function onSelectedAll(attr, selectedVal) {
	this.$set(attr, 'checkAll', selectedVal);
	const idxSelected = this.rowsSelected.findIndex(rs => rs.uId === attr.uId);
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
			this.rowsSelected.push({
				id: attr.id,
				uId: attr.uId,
				name: attr.name,
				number: attr.numberIndex,
				attributeDetail: [...newSelected],
			});
		}
	} else if (idxSelected > -1) {
		this.rowsSelected.splice(idxSelected, 1);
	}
}

function data() {
	return {
		rowsSelected: [],
		valueRadio: null,
	};
}

export default {
	name: 'modal-attributes-assign',
	data,
	props: {
		listSections: {
			default: () => [],
			type: Array,
		},
		quantityProduct: {
			type: Number,
			default: 0,
		},
		nameProduct: [String],
		showAtributte: {
			type: Boolean,
			default: false,
		},
	},
	methods: {
		rowIsSelected,
		rowIsSelectedRadio,
		saveModal,
		openAttribute,
		onSelectedAll,
	},
	components: {
		modalSidebarButton,
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

	.label-product {
		color: #575757;
		font-size: 15px;
		font-weight: bold;
	}
</style>