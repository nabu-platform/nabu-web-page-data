<template id="data-card">
	<div class="data-cell">
		<data-common :page="page" :parameters="parameters" :cell="cell" :edit="edit" ref="data"
				:records="records"
				v-model="loaded"
				@updatedEvents="$emit('updatedEvents')"
				:updatable="true">
			<div class="data-card-list">
				<div class="data-card" v-for="record in records">
					<dl class="data-card" :class="$services.page.getDynamicClasses(field.styles, record)" v-for="field in cell.state.fields">
						<page-field :field="field" :data="record" :style="false" 
							:label="false"
							@updated="$refs.data.update(record)"
							:page="page"
							:cell="cell"/>
						<div class="data-card-actions" v-if="$refs.data.actions.length" @mouseover="$refs.data.actionHovering = true" @mouseout="$refs.data.actionHovering = false">
							<button v-if="!action.condition || $refs.data.isCondition(action.condition, record)" 
								v-for="action in $refs.data.actions" 
								@click="$refs.data.trigger(action, record)"
								class="inline"
								:class="[action.class, {'has-icon': action.icon}]"><span v-if="action.icon" class="fa" :class="action.icon"></span><label v-if="action.label">{{action.label}}</label></button>
						</div>
					</dl>
				</div>
			</div>
			<n-paging :value="$refs.data.paging.current" :total="$refs.data.paging.total" :load="$refs.data.load" :initialize="false" v-if="loaded"/>
		</data-common>
	</div>
</template>