/* Copyright 2017 Apinf Oy
This file is covered by the EUPL license.
You may obtain a copy of the licence at
https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Meteor packages imports
import { Meteor } from 'meteor/meteor';

// Meteor contributed packages imports
import { AutoForm } from 'meteor/aldeed:autoform';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Roles } from 'meteor/alanning:roles';
import { sAlert } from 'meteor/juliancwirko:s-alert';

AutoForm.hooks({
  addApiForm: {
    before: {
      insert (api) {
        // Get current user ID
        const userId = Meteor.userId();

        // Add current user as API manager
        api.managerIds = [userId];

        // Add current user as API created by
        api.created_by = userId;

        // Submit the form
        return api;
      },
    },
    onSuccess (formType, apiId) {
      if (apiId) {
        Meteor.call('updateApisSlug', { _id: apiId }, (error, result) => {
          if (error) {
            // Show message
            sAlert.error(error);
            FlowRouter.go('apiCatalog');
          } else if (result && result !== '') {
            // Redirect to newly added API
            FlowRouter.go('viewApi', { slug: result });
          } else {
            // Otherwise Redirect to API Catalog
            FlowRouter.go('apiCatalog');
          }
        });
      } else {
        // Otherwise Redirect to API Catalog
        FlowRouter.go('apiCatalog');
      }

      // Get current user ID
      const userId = Meteor.userId();

      // Give user manager role
      Roles.addUsersToRoles(userId, 'manager');
    },
  },
});
