/* Copyright 2017 Apinf Oy
 This file is covered by the EUPL license.
 You may obtain a copy of the licence at
 https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Meteor packages imports
import { Meteor } from 'meteor/meteor';

// Meteor contributed packages imports
import { Migrations } from 'meteor/percolate:migrations';
import { sAlert } from 'meteor/juliancwirko:s-alert';

// Collection imports
import ProxyBackends from '/proxy_backends/collection';

Migrations.add({
  version: 9,
  name: 'Add default headers for all API proxy backends where this field does not exist',
  up () {
    // Iterate through Proxy backend collection
    // Proxy type is API Umbrella & field "default_response_headers_string" doesn't exist yet
    // Also make sure API-Umbrella ID exists
    ProxyBackends.find({
      type: 'apiUmbrella',
      'apiUmbrella.settings.default_response_headers_string': { $exists: false },
      'apiUmbrella.id': { $exists: true },
    })
      .forEach((proxyBackend) => {
        ProxyBackends.update(
          proxyBackend._id,
          { $set: { 'apiUmbrella.settings.default_response_headers_string': '' } },
        );

        // Update
        Meteor.call('updateApiBackendOnApiUmbrella', (updateError, result) => {
          if (updateError) throw Meteor.Error(updateError)
console.log(result)
          // Publish the API Backend on API Umbrella
          // Meteor.call('publishApiBackendOnApiUmbrella',
          //   proxyBackend.apiUmbrella.id, proxyBackend.proxyId,
          //   (publishError) => {
          //     if (publishError) {
          //       throw Meteor.Error(publishError)
          //     }
          //
          //     // Create this field
          //
          //   }
          // );
        });

      });
  },
});
