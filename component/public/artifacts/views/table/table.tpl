<template id="dashboard-table">
	<div class="dashboard-cell dashboard-table">
		<n-dashboard-data :page="page" :parameters="parameters" :cell="cell" :edit="edit" ref="data"
				:records="records"
				v-model="loaded">
		</n-dashboard-data>
		<table class="classic dashboard" cellspacing="0" cellpadding="0" :class="$refs.data.dataClass" v-if="loaded">
			<thead>
				<tr>
					<td @click="$refs.data.sort(key)" 
							v-for="key in $refs.data.keys" v-if="!$refs.data.isHidden(key)"><span>{{ cell.state.result[key].label ? cell.state.result[key].label : key }}</span>
						<span class="n-icon n-icon-sort-asc" v-if="cell.state.orderBy.indexOf(key) >= 0"></span>
						<span class="n-icon n-icon-sort-desc" v-if="cell.state.orderBy.indexOf(key + ' desc') >= 0"></span>
					</td>
					<td v-if="$refs.data.actions.length"></td>
				</tr>
			</thead>
			<tbody>
				<tr v-for="record in records" @click="$refs.data.trigger(null, record)" :class="{'selected': $refs.data.lastTriggered == record}">
					<td :class="$refs.data.getDynamicClasses(key, record)" v-for="key in $refs.data.keys" v-if="!$refs.data.isHidden(key)" v-html="$refs.data.interpret(key, record[key])"></td>
					<td class="actions" v-if="$refs.data.actions.length" @mouseover="$refs.data.actionHovering = true" @mouseout="$refs.data.actionHovering = false">
						<button v-if="!action.condition || $refs.data.isCondition(action.condition, record)" v-for="action in $refs.data.actions" @click="$refs.data.trigger(action, record)"><span class="n-icon" :class="'n-icon-' + action.icon"></span></button>
					</td>
				</tr>
			</tbody>
		</table>
		<n-paging :value="$refs.data.paging.current" :total="$refs.data.paging.total" :load="$refs.data.load" :initialize="false" v-if="loaded"/>
	</div>
</template>