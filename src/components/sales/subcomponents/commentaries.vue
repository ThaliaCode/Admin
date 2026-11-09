<template>
	<div>
		<v-container>
			<v-layout row wrap>
				<v-flex xs12>
					<app-input-text
						textarea
						no-resize
						label="Comentario"
						v-bind="$attrs"
						:text="product.commentary"
						@input="setComentary"
					/>
				</v-flex>
				<template v-if="!onlyCommentary">
					<!-- todo: mantener formato ano,fecha,hora -->
					<v-flex xs6 v-if="showAdditional" mt-2 pr-1>
						<app-date-select
							:date-formatted="expirationDate"
							label="Fecha de vencimiento"
							model="expirationDate"
							@input="setDate"
						/>
					</v-flex>
					<v-flex xs6 v-if="showAdditional" mt-2 pl-1>
						<app-input-text
							label="Lote"
							:text="lot"
							model="lot"
							@input="setData"
						/>
					</v-flex>
					<v-flex xs12 mt-2>
						<app-input-text
							textarea
							no-resize
							label="Ubicación"
							v-bind="$attrs"
							:text="product.location"
							@input="setLocation"
						/>
					</v-flex>
				</template>
			</v-layout>
		</v-container>
		<section class="modal-filter-footer">
			<modal-sidebar-button
				@cancel-button-clicked="closeModal"
				@accept-button-clicked="save"
			/>
		</section>
	</div>
</template>
<script>
import dateComponent from '@/components/shared/date-component';
import modalSidebarButton from '@/components/shared/utils/modal-sidebar-button';
import { format } from 'date-fns';

function created() {
	this.commentary = this.product.commentary || '';
	this.location = this.product.location || '';
	this.lot = this.product.lot || '';
	this.expirationDate = this.product.expirationDate || null;
}

function setComentary({ value }) {
	this.commentary = value;
}

function setLocation({ value }) {
	this.location = value;
}

function closeModal() {
	this.$emit('close-modal');
	this.commentary = '';
}

function save() {
	const adicional = {
		commentary: this.commentary,
		expirationDate: this.expirationDate,
		lot: this.lot,
		location: this.location,
	};
	this.$emit(
		'set-add',
		adicional
	);
	this.closeModal();
}

function setData({ model, value }) {
	this[model] = value;
}

function setDate({ model, value }) {
	this[model] =
		this.$route.name === 'new-sale'
			? format(value, 'DD/MM/YYYY')
			: format(value, 'YYYY-MM-DD');
}

function data() {
	return {
		commentary: '',
		location: '',
		expirationDate: null,
	};
}

export default {
	name: 'commentaries',
	components: {
		dateComponent,
		modalSidebarButton,
	},
	created,
	data,
	inheritAttrs: false,
	methods: {
		closeModal,
		save,
		setComentary,
		setLocation,
		setData,
		setDate,
	},
	props: {
		product: {
			default: () => {},
			type: Object,
		},
		showAdditional: {
			default: false,
			type: Boolean,
		},
		onlyCommentary: {
			default: false,
			type: Boolean,
		},
	},
};
</script>
