window.addEventListener("load", function() {
	application.bootstrap(function($services) {
		
		$services.router.register({
			alias: "dashboard-table",
			enter: function(parameters) {
				return new nabu.views.dashboard.Table({propsData:parameters});
			}
		});
		
		$services.router.register({
			alias: "dashboard-form",
			enter: function(parameters) {
				return new nabu.views.dashboard.Form({propsData:parameters});
			}
		});
		
		$services.router.register({
			alias: "dashboard-donut",
			enter: function(parameters) {
				return new nabu.views.dashboard.Donut({propsData:parameters});
			}
		});
		
		$services.router.register({
			alias: "dashboard-bar",
			enter: function(parameters) {
				return new nabu.views.dashboard.Bar({propsData:parameters});
			}
		});
	
		return $services.$register({
			dashboard: nabu.services.Dashboard
		});	
	});
});