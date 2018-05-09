<template id="data-line">
	<div class="data-line">
		<data-common :page="page" :parameters="parameters" :cell="cell" :edit="edit" ref="data"
				:records="records"
				v-model="loaded">
			<n-form-section slot="main-settings">
				<n-form-text v-model="cell.state.unit" label="Unit" :timeout="600" @input="draw" />
				<n-form-text v-model="cell.state.fromColor" type="color" :label="cell.state.z ? 'From Color' : 'Color'" :timeout="600" @input="draw" />
				<n-form-text v-model="cell.state.toColor" v-if="cell.state.z" type="color" label="To Color" :timeout="600" @input="draw" />
				<n-form-combo v-model="cell.state.x" @input="draw" label="X Field" :filter="function() { return $refs.data.keys }"/>
				<n-form-combo v-model="cell.state.y" @input="draw" :required="true" label="Y Field" :filter="function() { return $refs.data.keys }"/>
				<n-form-combo v-model="cell.state.z" @input="draw" label="Z Field" :filter="function() { return $refs.data.keys }"/>
				<n-form-text type="range" v-model="cell.state.rotateX" :minimum="0" :maximum="90" label="Rotation X Label" :timeout="600" @input="draw"/>
				<n-form-text v-model="cell.state.yLabel" label="Y-Axis Label" :timeout="600" @input="draw" />
				<n-form-switch v-model="cell.state.legend" label="Legend" @input="draw"/>
				<n-form-combo v-model="cell.state.sortBy" @input="draw" label="Sort By" :items="['x', 'y']"/>
				<n-form-switch v-model="cell.state.reverseSortBy" v-if="cell.state.orderBy" label="Reverse Sort By" @input="draw"/>
				<n-form-text v-model="cell.state.pointRadius" type="range" :minimum="0" :maximum="10" label="Point Radius" @input="draw" :timeout="600"/>
				<n-form-combo v-model="cell.state.interpolation" label="Interpolation" @input="draw" 
					:filter="getInterpolation"/>
			</n-form-section>
			<svg ref="svg" v-if="loaded"></svg>
		</data-common>
	</div>
</template>