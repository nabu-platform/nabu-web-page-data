nabu.services.VueService(Vue.extend({
	services: ["swagger"],
	methods: {
		getOperations: function(accept) {
			var result = [];
			var operations = this.$services.swagger.operations;
			Object.keys(operations).map(function(operationId) {
				if (accept(operations[operationId])) {
					result.push(operations[operationId]);
				}
			});
			result.sort(function(a, b) {
				return a.id.localeCompare(b.id);
			});
			return result;
		}
	}
}), { name: "nabu.services.Dashboard" });