<template id="dashboard-donut">
	<div class="dashboard-donut">
		<n-sidebar @close="configuring = false" v-if="configuring" class="settings">
			<n-form class="layout2">
				<n-collapsible title="Table Settings">
					<n-form-combo label="Operation" :value="operation" :filter="$services.dashboard.getDataOperations"
						@input="updateOperation"
						:formatter="function(x) { return x.id }"/>
					<n-form-text v-model="cell.state.title" label="Title"/>
					<n-form-text v-model="cell.state.width" label="Width" :timeout="600" />
					<n-form-text v-model="cell.state.height" label="Height" :timeout="600" />
				</n-collapsible>
			</n-form>
		</n-sidebar>
		<svg :width="cell.state.width ? cell.state.width : 960" :height="cell.state.height ? cell.state.height : 500" ref="svg"></svg>
	</div>
</template>