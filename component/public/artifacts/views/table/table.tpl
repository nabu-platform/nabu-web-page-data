<template id="data-table">
	<div class="data-cell data-table">
		<data-common :page="page" :parameters="parameters" :cell="cell" :edit="edit" ref="data"
				:records="records"
				v-model="loaded"
				@updatedEvents="$emit('updatedEvents')"
				@close="$emit('close')"
				:multiselect="true"
				:updatable="true">
			<table class="classic data" cellspacing="0" cellpadding="0" :class="$refs.data.dataClass" v-if="loaded && (edit || records.length)">
				<thead>
					<tr>
						<th @click="$refs.data.sort($refs.data.getSortKey(field))"
								v-for="field in cell.state.fields"><span>{{ field.label }}</span>
							<span class="fa fa-sort-up" v-if="cell.state.orderBy.indexOf($refs.data.getSortKey(field)) >= 0"></span>
							<span class="fa fa-sort-down" v-if="cell.state.orderBy.indexOf($refs.data.getSortKey(field) + ' desc') >= 0"></span>
						</th>
						<th v-if="$refs.data.actions.length"></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="record in records" @click="$refs.data.select(record)" :class="$refs.data.getRecordStyles(record)" :custom-style="cell.state.styles.length > 0">
						<td :class="$services.page.getDynamicClasses(field.styles, {record:record})" v-for="field in cell.state.fields">
							<page-field :field="field" :data="record" 
								:should-style="false" 
								:label="false"
								@updated="$refs.data.update(record)"
								:page="page"
								:cell="cell"/>
						</td>
						<td class="actions" v-if="$refs.data.actions.length" @mouseover="$refs.data.actionHovering = true" @mouseout="$refs.data.actionHovering = false">
							<button v-if="!action.condition || $services.page.isCondition(action.condition, {record:record})" 
								v-for="action in $refs.data.actions" 
								@click="$refs.data.trigger(action, record)"
								:class="[action.class, {'has-icon': action.icon}, {'inline': !action.class }]"><span class="fa" v-if="action.icon" :class="action.icon"></span><label v-if="action.label">{{action.label}}</label></button>
						</td>
					</tr>
				</tbody>
			</table>
			<n-paging :value="$refs.data.paging.current" :total="$refs.data.paging.total" :load="$refs.data.load" :initialize="false" v-if="loaded"/>
			<div v-if="loaded && !records.length" class="no-data">%{No data available}</div>
		</data-common>
	</div>
</template>