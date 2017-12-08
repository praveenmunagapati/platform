/* Copyright 2017 Apinf Oy
This file is covered by the EUPL license.
You may obtain a copy of the licence at
https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Meteor contributed packages imports
import { AutoForm } from 'meteor/aldeed:autoform';
import { TAPi18n } from 'meteor/tap:i18n';
import { sAlert } from 'meteor/juliancwirko:s-alert';

AutoForm.hooks({
  organizationSettingsGeneral: {
    onSuccess () {
      // Getting name from this.udateDoc
      const orgName = this.updateDoc.$set.name;
      if (orgName) {
        Meteor.call('updateOrgSlug', null, orgName, (error, slug) => {
          if (error) {
            // Show message
            sAlert.success(error);
          } else if (slug && slug !== '') {
            // Get success message translation
            const message = TAPi18n.__('organizationSettingsGeneral_update_successMessage');

            // Alert success message to user
            sAlert.success(message);
            // Redirect to newly added organization
            FlowRouter.go('organizationProfile', { slug: slug });
          } else {
            // Otherwise Redirect to Organization Catalog
            FlowRouter.go('organizations');
          }
        });
      } else {
        // Otherwise Redirect to Organization Catalog
        FlowRouter.go('organizations');
      }
    },
    onError () {
      // Get failure message translation
      const message = TAPi18n.__('organizationSettingsGeneral_update_failedMessage');

      // Alert failure message to user
      sAlert.error(message);
    },
  },
});
