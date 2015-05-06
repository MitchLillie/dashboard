define([
    "hr/hr",
    "core/api",
    "collections/visualizations"
], function(hr, api, Visualizations) {
    var Report = hr.Model.extend({
        defaults: {
            id: null,
            title: null,
            visualizations: []
        },

        initialize: function() {
            Report.__super__.initialize.apply(this, arguments);

            this.visualizations = new Visualizations({
                report: this
            });
            this.visualizations.reset(this.get("visualizations"));
            this.listenTo(this.visualizations, "add remove change reset", function() {
                this.del("visualizations", { silent: true });
                this.set("visualizations", this.visualizations.toJSON(), { silent: true });
            });
            this.listenTo(this, "change:visualizations", function() {
                this.visualizations.reset(this.get("visualizations"));
            });
        },

        // Update a report
        edit: function(data) {
            var that = this;
            data = data || this.toJSON();

            return api.execute("put:report/"+this.get("id"), data)
            .then(function(_data) {
                that.set(_data);
                return that;
            });
        },

        // Delete this report
        remove: function() {
            var that = this;
            return api.execute("delete:report/"+this.get("id"));
        }
    });

    return Report;
});