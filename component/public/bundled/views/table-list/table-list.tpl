<template id="data-table-list">
	<div class="data-cell data-table-list">
		<data-common-header :page="page" :parameters="parameters" :cell="cell"
				:edit="edit"
				:records="records"
				:selected="selected"
				:inactive="inactive"
				@updatedEvents="$emit('updatedEvents')"
				@close="$emit('close'); configuring=false"
				:multiselect="true"
				:configuring="configuring"
				:updatable="true"
				:paging="paging"
				:filters="filters"
				@refresh="refresh">
			<n-collapsible slot="settings" title="Field widths">
				<n-form-text :label="'Width for: ' + (field.label ? field.label : field.key)" :value="field.width" v-for="field in cell.state.fields" @input="function(newValue) { $window.Vue.set(field, 'width', newValue) }"/>
			</n-collapsible>
		</data-common-header>
		<ul class="table-list classic data" cellspacing="0" cellpadding="0" :class="dataClass" v-if="edit || showEmpty || records.length">
			<li class="row title">
				<span @click="sort(getSortKey(field))" v-for="field in cell.state.fields" :style="{'flex-grow': (field.width != null ? field.width : '1')}"
						v-if="!isAllFieldHidden(field)">
					<span>{{ field.label }}</span>
					<span class="fa fa-sort-up" v-if="orderBy.indexOf(getSortKey(field)) >= 0"></span>
					<span class="fa fa-sort-down" v-if="orderBy.indexOf(getSortKey(field) + ' desc') >= 0"></span>
				</span>
				<span v-if="actions.length" class="actions"></span>
			</li>
			<li v-visible="lazyLoad.bind($self, record)" class="row" v-for="record in records" @click="select(record)" :class="getRecordStyles(record)" :custom-style="cell.state.styles.length > 0" :key="record.id ? record.id : records.indexOf(record)">
				<page-field :field="field" :data="record" 
					v-if="!isFieldHidden(field, record)"
					:should-style="false" 
					:label="false"
					:style="{'flex-grow': (field.width != null ? field.width : '1')}"
					@updated="update(record)"
					:page="page"
					:class="$services.page.getDynamicClasses(field.styles, {record:record}, $self)" 
					v-for="field in cell.state.fields"
					:cell="cell"/>
				<div class="actions" v-if="actions.length" @mouseover="actionHovering = true" @mouseout="actionHovering = false">
					<button v-if="!action.condition || $services.page.isCondition(action.condition, {record:record}, $self)" 
						v-for="action in actions" 
						@click="trigger(action, record)"
						:class="[action.class, {'has-icon': action.icon}, {'inline': !action.class }]"><span class="fa" v-if="action.icon" :class="action.icon"></span><label v-if="action.label">{{action.label}}</label></button>
				</div>
			</li>
		</ul>
		<n-paging :value="paging.current" :total="paging.total" :load="load" :initialize="false" v-if="!cell.state.loadLazy && !cell.state.loadMore"/>
		<div class="load-more" v-else-if="cell.state.loadMore && paging.current != null && paging.total != null && paging.current < paging.total - 1">
			<button class="load-more-button" @click="load(paging.current + 1, true)">%{Load More}</button>
		</div>
		<div v-if="!records.length && !showEmpty" class="no-data">%{No data available}</div>
		
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

