<template>
	<div class="accordion">
		<button
			@click="toggleAccordion()"
			class="flex items-center space-x-3"
			:aria-expanded="isOpen"
			:aria-controls="`collapse`"
		>
			<!-- <slot name="title" style="border: 1px solid red;"></slot> -->
			<span><b>{{title}}</b></span>
			<svg
				class="w-3 transition-all duration-200 transform"
				:class="{
					'rotate-180': isOpen,
					'rotate-0': !isOpen,
				}"
				fill="none"
				stroke="currentColor"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 10"
				aria-hidden="true"
			>
				<path
					d="M15 1.2l-7 7-7-7"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>

		<transition name="slide-fade">
			<div v-if="isOpen" :id="`collapse`">
				<slot/>
			</div>
		</transition>
	</div>
</template>

<script>

export default {
	name: 'accordion',
	props: {
		title: String,
	},
	data() {
		return {
			isOpen: false,
		};
	},
	methods: {
		toggleAccordion() {
			this.isOpen = !this.isOpen;
		},
	},
};
</script>

<style scoped>
/* CSS para el acordeón */

.accordion{
	padding: 4px;
}
button.flex {
	display: flex;
	align-items: center;
	width: 100%;
	padding: 10px 4px;
	justify-content: space-between;
	border-bottom: 1px grey solid;
	color:rgb(97, 97, 97);
}

button.flex .space-x-3 > * + * {
	margin-left: 0.75rem; /* 3/4 rem para representar space-x-3 */
}

svg.w-3 {
	width: 0.75rem; /* w-3 en Tailwind es 0.75rem */
}

.transition-all {
	transition-property: all;
}

.duration-200 {
	transition-duration: 200ms;
}

.transform.rotate-0 {
	transform: rotate(0deg);
}

.transform.rotate-180 {
	transform: rotate(180deg);
}

/* Estilos para la animación */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: opacity 0.5s, height 0.5s ease;
}
.slide-fade-enter, .slide-fade-leave-to /* .slide-fade-leave-active en <2.1.8 */ {
  opacity: 0;
  height: 0;
  overflow: hidden;  /* Ocultar el contenido mientras se anima */
}

</style>
