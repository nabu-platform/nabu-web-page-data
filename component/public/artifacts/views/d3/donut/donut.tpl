<template id="data-donut">
	<div class="data-cell data-donut">
		<data-common :page="page" :parameters="parameters" :cell="cell" :edit="edit" ref="data"
				:records="records"
				@updatedEvents="$emit('updatedEvents')"
				v-model="loaded">
			<n-form-section slot="main-settings">
				<n-form-text v-model="cell.state.unit" label="Unit" :timeout="600" @input="draw" />
				<n-form-text v-model="cell.state.fromColor" type="color" label="From Color" :timeout="600" @input="draw" />
				<n-form-text v-model="cell.state.toColor" type="color" label="To Color" :timeout="600" @input="draw" />
				<n-form-text v-model="cell.state.arcWidth" type="range" :minimum="10" :maximum="90" label="Arc Width" :timeout="600" @input="draw"/>
				<n-form-combo v-model="cell.state.value" @input="draw" :required="true" label="Value Field" :filter="function() { return $refs.data.keys }"/>
				<n-form-combo v-model="cell.state.label" @input="draw" label="Label Field" :filter="function() { return $refs.data.keys }"/>
				<n-form-combo v-model="cell.state.detail" :items="['inline', 'popup']" label="Label Style" @input="draw"/>
			</n-form-section>
			<svg ref="svg"></svg>
		</data-common>
	</div>
</template>