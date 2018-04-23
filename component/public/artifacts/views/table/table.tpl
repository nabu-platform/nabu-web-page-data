<template id="dashboard-table">
	<div>
		<n-sidebar @close="configuring = false" v-if="configuring">
			<n-form-combo slot="header" :value="operation" :filter="getOperations"
				@input="updateOperation"
				:formatter="function(x) { return x.id }"/>
			<n-form class="layout2">
				<n-form-section class="misc">
					<n-form-text v-model="cell.state.limit" label="Limit" :timeout="600" @input="load()"/>
				</n-form-section>
				<n-form-section class="mapping" v-if="parameters.length">
					<h2>Input</h2>
					<n-page-mapper :to="parameters" :from="$services.page.instances[page.name].availableParameters" 
						v-model="cell.bindings"/>
				</n-form-section>
				<n-form-section class="actions">
					<h2>Actions</h2>
					<button @click="addAction">Add Action</button>
					<n-form-section class="action" v-for="action in cell.state.actions">
						<n-form-text v-model="action.name" label="Name" :required="true"/>
						<n-form-text v-model="action.icon" label="Icon"/>
						<button @click="removeAction(action)"><span class="n-icon n-icon-trash"></span></button>
					</n-form-section>
				</n-form-section>
				<n-form-section class="formatters">
					<h2>Formatting</h2>
					<n-form-section class="formatter" v-for="key in keys">
						<n-form-combo v-model="cell.state.result[key].format" :label="'Format ' + key + ' as'"
							:items="['hidden', 'link', 'date', 'dateTime', 'time']"/>
						<n-form-text v-model="cell.state.result[key].label" :label="'Label for ' + key" 
							v-if="cell.state.result[key].format != 'hidden'"/>
					</n-form-section>
				</n-form-section>
			</n-form>
		</n-sidebar>
		<table class="classic" cellspacing="0" cellpadding="0">
			<thead>
				<tr>
					<td @click="sort(key)" 
							v-for="key in keys" v-if="!isHidden(key)"><span>{{ cell.state.result[key].label ? cell.state.result[key].label : key }}</span>
						<span class="n-icon n-icon-sort-asc" v-if="cell.state.orderBy.indexOf(key) >= 0"></span>
						<span class="n-icon n-icon-sort-desc" v-if="cell.state.orderBy.indexOf(key + ' desc') >= 0"></span>
					</td>
				</tr>
			</thead>
			<tbody>
				<tr v-for="record in records">
					<td v-for="key in keys" v-if="!isHidden(key)" :title="record[key]" v-html="interpret(key, record[key])"></td>
				</tr>
			</tbody>
		</table>
		<n-paging :value="paging.current" :total="paging.total" :load="load" :initialize="false"/>
	</div>
</template>