<template id="data-card">
	<div class="data-cell data-cards">
		<data-common-header :page="page" :parameters="parameters" :cell="cell" :edit="edit"
				:records="records"
				@updatedEvents="$emit('updatedEvents')"
				:configuring="configuring"
				@close="$emit('close'); configuring=false"
				:updatable="true"
				:filters="filters"
				:paging="paging">
			<n-form-checkbox v-model="cell.state.showLabels" label="Show Labels" slot="main-settings"/>
		</data-common-header>
				
		<div class="data-card-list" :class="dataClass" v-if="edit || records.length">
			<dl class="data-card" v-for="record in records" :class="$services.page.getDynamicClasses(cell.state.styles, {record:record}, $self)">
				<page-field :field="field" :data="record" :should-style="false" 
					class="data-card-field" :class="$services.page.getDynamicClasses(field.styles, {record:record}, $self)" v-for="field in cell.state.fields"
					v-if="!isFieldHidden(field, record)"
					:label="cell.state.showLabels"
					@updated="update(record)"
					:page="page"
					:cell="cell"/>
				<div class="data-card-actions" v-if="actions.length" @mouseover="actionHovering = true" @mouseout="actionHovering = false">
					<button v-if="!action.condition || isCondition(action.condition, {record:record}, $self)" 
						v-for="action in actions" 
						@click="trigger(action, record)"
						:class="[action.class, {'has-icon': action.icon}]"><span v-if="action.icon" class="fa" :class="action.icon"></span><label v-if="action.label">{{action.label}}</label></button>
				</div>
			</dl>
		</div>
		<n-paging :value="paging.current" :total="paging.total" :load="load" :initialize="false"/>
		
		<data-common-footer :page="page" :parameters="parameters" :cell="cell" 
			:edit="edit"
			:records="records"
			:selected="selected"
			:inactive="inactive"
			:global-actions="globalActions"
			@updatedEvents="$emit('updatedEvents')"
			@close="$emit('close'); configuring=false"
			:multiselect="true"
			:updatable="true"/>
	</div>
</template>