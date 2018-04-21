window.addEventListener("load", function() {
	application.bootstrap(function($services) {
		
		$services.router.register({
			alias: "dashboard-table",
			query: ["test"],
			enter: function(parameters) {
				return new nabu.views.dashboard.Table({propsData:parameters});
			}
		});
	
		return $services.$register({
			dashboard: nabu.services.Dashboard
		});	
	});
});