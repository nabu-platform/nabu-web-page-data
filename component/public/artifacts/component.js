window.addEventListener("load", function() {
	application.bootstrap(function($services) {
		
		$services.router.register({
			alias: "data-table",
			enter: function(parameters) {
				return new nabu.page.views.data.Table({propsData:parameters});
			}
		});
		
		$services.router.register({
			alias: "data-donut",
			enter: function(parameters) {
				return new nabu.page.views.data.Donut({propsData:parameters});
			}
		});
		
		$services.router.register({
			alias: "data-bar",
			enter: function(parameters) {
				return new nabu.page.views.data.Bar({propsData:parameters});
			}
		});
		
		$services.router.register({
			alias: "data-line",
			enter: function(parameters) {
				return new nabu.page.views.data.Line({propsData:parameters});
			}
		});
	
		return $services.$register({
			dataUtils: nabu.services.DataUtils
		});	
	});
	
	// register data filter provider
	nabu.page.provide("data-filter", { component: "data-filter-default", name: "Default Filter" });
});