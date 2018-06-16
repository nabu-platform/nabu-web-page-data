<template id="data-table-list">
	<div class="data-cell data-table-list">
		<data-common :page="page" :parameters="parameters" :cell="cell" 
				:edit="edit"
				ref="data"
				:records="records"
				:selected="selected"
				:inactive="inactive"
				v-model="loaded"
				@updatedEvents="$emit('updatedEvents')"
				@close="$emit('close')"
				:multiselect="true"
				:updatable="true">
			<n-collapsible slot="settings" title="Field widths">
				<n-form-text :label="'Width for: ' + (field.label ? field.label : field.key)" :value="field.width" v-for="field in cell.state.fields" @input="function(newValue) { $window.Vue.set(field, 'width', newValue) }"/>
			</n-collapsible>
			<ul class="table-list classic data" cellspacing="0" cellpadding="0" :class="$refs.data.dataClass" v-if="loaded && (edit || showEmpty || records.length)">
				<li class="row title">
					<span @click="$refs.data.sort($refs.data.getSortKey(field))" v-for="field in cell.state.fields" :style="{'flex-grow': field.width != null ? field.width : 1}">
						<span>{{ field.label }}</span>
						<span class="fa fa-sort-up" v-if="$refs.data.orderBy.indexOf($refs.data.getSortKey(field)) >= 0"></span>
						<span class="fa fa-sort-down" v-if="$refs.data.orderBy.indexOf($refs.data.getSortKey(field) + ' desc') >= 0"></span>
					</span>
					<span v-if="$refs.data.actions.length" class="actions"></span>
				</li>
				<li class="row" v-for="record in records" @click="$refs.data.select(record)" :class="$refs.data.getRecordStyles(record)" :custom-style="cell.state.styles.length > 0">
					<page-field :field="field" :data="record" 
						:should-style="false" 
						:label="false"
						:style="{'flex-grow': field.width != null ? field.width : 1}"
						@updated="$refs.data.update(record)"
						:page="page"
						:class="$services.page.getDynamicClasses(field.styles, {record:record})" 
						v-for="field in cell.state.fields"
						:cell="cell"/>
					<div class="actions" v-if="$refs.data.actions.length" @mouseover="$refs.data.actionHovering = true" @mouseout="$refs.data.actionHovering = false">
						<button v-if="!action.condition || $services.page.isCondition(action.condition, {record:record})" 
							v-for="action in $refs.data.actions" 
							@click="$refs.data.trigger(action, record)"
							:class="[action.class, {'has-icon': action.icon}, {'inline': !action.class }]"><span class="fa" v-if="action.icon" :class="action.icon"></span><label v-if="action.label">{{action.label}}</label></button>
					</div>
				</li>
			</ul>
			<n-paging :value="$refs.data.paging.current" :total="$refs.data.paging.total" :load="$refs.data.load" :initialize="false" v-if="loaded"/>
			<div v-if="loaded && !records.length && !showEmpty" class="no-data">%{No data available}</div>
		</data-common>
	</div>
</template>

