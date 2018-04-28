<template id="dashboard-bar">
	<div class="dashboard-bar">
		<n-dashboard-data :page="page" :parameters="parameters" :cell="cell" :edit="edit" ref="data"
				:records="records"
				v-model="loaded">
			<n-form-section slot="main-settings">
				<n-form-text v-model="cell.state.unit" label="Unit" :timeout="600" @input="draw" />
				<n-form-text v-model="cell.state.fromColor" type="color" :label="cell.state.z ? 'From Color' : 'Color'" :timeout="600" @input="draw" />
				<n-form-text v-model="cell.state.toColor" v-if="cell.state.z" type="color" label="To Color" :timeout="600" @input="draw" />
				<n-form-combo v-model="cell.state.x" @input="draw" :required="true" label="X Field" :filter="function() { return $refs.data.keys }"/>
				<n-form-combo v-model="cell.state.y" @input="draw" label="Y Field" :filter="function() { return $refs.data.keys }"/>
				<n-form-combo v-model="cell.state.z" @input="draw" label="Z Field" :filter="function() { return $refs.data.keys }"/>
			</n-form-section>
		</n-dashboard-data>
		<svg ref="svg" v-if="loaded"></svg>
	</div>
</template>