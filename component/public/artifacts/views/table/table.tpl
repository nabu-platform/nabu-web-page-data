<template id="data-table">
	<div class="data-cell data-table">
		<data-common-header :page="page" :parameters="parameters" :cell="cell" 
			:edit="edit"
			:records="records"
			:selected="selected"
			:inactive="inactive"
			@updatedEvents="$emit('updatedEvents')"
			@close="$emit('close'); configuring=false"
			:multiselect="true"
			:configuring="configuring"
			:updatable="true"/>
			
		<table class="classic data" cellspacing="0" cellpadding="0" :class="dataClass" v-if="edit || showEmpty || records.length">
			<thead>
				<tr>
					<th @click="sort(getSortKey(field))"
							v-for="field in cell.state.fields"><span>{{ field.label }}</span>
						<span class="fa fa-sort-up" v-if="orderBy.indexOf(getSortKey(field)) >= 0"></span>
						<span class="fa fa-sort-down" v-if="orderBy.indexOf(getSortKey(field) + ' desc') >= 0"></span>
					</th>
					<th v-if="actions.length"></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="record in records" @click="select(record)" :class="getRecordStyles(record)" :custom-style="cell.state.styles.length > 0">
					<td :class="$services.page.getDynamicClasses(field.styles, {record:record})" v-for="field in cell.state.fields">
						<page-field :field="field" :data="record" 
							v-if="!field.hidden || !$services.page.isCondition(field.hidden, {record:record})"
							:should-style="false" 
							:label="false"
							@updated="update(record)"
							:page="page"
							:cell="cell"/>
					</td>
					<td class="actions" v-if="actions.length" @mouseover="actionHovering = true" @mouseout="actionHovering = false">
						<button v-if="!action.condition || $services.page.isCondition(action.condition, {record:record})" 
							v-for="action in actions" 
							@click="trigger(action, record)"
							:class="[action.class, {'has-icon': action.icon}, {'inline': !action.class }]"><span class="fa" v-if="action.icon" :class="action.icon"></span><label v-if="action.label">{{action.label}}</label></button>
					</td>
				</tr>
			</tbody>
		</table>
		<n-paging :value="paging.current" :total="paging.total" :load="load" :initialize="false"/>
		<div v-if="!edit && !records.length && !showEmpty" class="no-data">%{No data available}</div>
		
		<data-common-footer :page="page" :parameters="parameters" :cell="cell" 
			:edit="edit"
			:records="records"
			:selected="selected"
			:inactive="inactive"
			:global-actions="globalActions"
			@updatedEvents="$emit('updatedEvents')"
			@close="$emit('close')"
			:multiselect="true"
			:updatable="true"/>
	</div>
</template>