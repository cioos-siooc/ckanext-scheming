ckan.module('scheming-repeating-subfields', function($) {
  return {

    _toggleButtonDisplay: function(){
      var active_groups = this.el.find('.scheming-subfield-group').has('.panel-body.fields-removed-notice:hidden');
      var add_button = this.el.find('a[name="repeating-add"]');
      var remove_buttons = active_groups.find('.btn-repeating-remove');

      var active_groups_length = active_groups.length || 0;
      var ll = (add_button.data('minimumCount')) || 0;
      var ul = (add_button.data('maximumCount')) || 0;

      if(active_groups_length <= ll){
        remove_buttons.hide(100);
      } else if(active_groups_length > ll){
        remove_buttons.show(100);
      }

      if(active_groups_length >= ul){
        add_button.hide(100);
      } else if(active_groups_length < ul){
        add_button.show(100);
      }
    },

    initialize: function() {
      $.proxyAll(this, /_on/);

      var $template = this.el.children('div[name="repeating-template"]');
      this.template = $template.html();
      $template.remove();

      this.el.find('a[name="repeating-add"]').on("click", this._onCreateGroup);
      this.el.on('click', 'a[name="repeating-remove"]', this._onRemoveGroup);

      this._toggleButtonDisplay();
    },

    /**
     * Add new group to the fieldset.
     *
     * Fields inside every new group must be renamed in order to form correct
     * structure during validation:
     *
     *  ...
     *  (parent, INDEX-1, child-1),
     *  (parent, INDEX-1, child-2),
     *  ---
     *  (parent, INDEX-2, child-1),
     *  (parent, INDEX-2, child-2),
     *  ...
     */
    _onCreateGroup: function(e) {
        var $last = this.el.find('.scheming-subfield-group').last();
        var group = ($last.data('groupIndex') + 1) || 0;
        var $copy = $(
	         this.template.replace(/REPEATING-INDEX0/g, group)
           .replace(/REPEATING-INDEX1/g, group + 1));
        this.el.find('.scheming-repeating-subfields-group').append($copy);

        this.initializeModules($copy);
        $copy.hide().show(100);
        $copy.find('input').first().focus();
        // hook for late init when required for rendering polyfills
        this.el.trigger('scheming.subfield-group-init');

        this._toggleButtonDisplay();

        e.preventDefault();
    },

    /**
     * Remove existing group from the fieldset.
     */
    _onRemoveGroup: function(e) {
        var $curr = $(e.target).closest('.scheming-subfield-group');
        var $body = $curr.find('.panel-body.fields-content');
        var $button = $curr.find('.btn-repeating-remove');
        var $removed = $curr.find('.panel-body.fields-removed-notice');

        $button.hide();
        $removed.show(100);
        $body.hide(100, function() {
          $body.html('');
        });

        this._toggleButtonDisplay();

        e.preventDefault();
    },

    /**
     * Enable functionality of data-module attribute inside dynamically added
     * groups.
     */
    initializeModules: function(tpl) {
      $('[data-module]', tpl).each(function (index, element) {
        ckan.module.initializeElement(this);
      });
    }
  };
});
