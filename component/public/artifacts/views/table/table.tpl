<template id="dashboard-table">
	<div>
		<n-form class="layout2" v-if="edit">
			<n-form-section class="operation">
				<n-form-combo :value="operation" :filter="getOperations"
					@input="updateOperation"
					:formatter="function(x) { return x.id }"/>
				<button @click="configureParameters">Configure</button>
			</n-form-section>
			<!-- TODO: add event management (with actions) -->
		</n-form>
		<table class="classic" cellspacing="0" cellpadding="0">
			
		</table>
		<n-paging :value="paging.current" :total="paging.total" :load="load" :initialize="false"/>
	</div>
</template>