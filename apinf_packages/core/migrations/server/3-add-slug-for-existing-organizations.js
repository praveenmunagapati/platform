/* Copyright 2017 Apinf Oy
This file is covered by the EUPL license.
You may obtain a copy of the licence at
https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Meteor packages imports
import { Meteor } from 'meteor/meteor';

import { Migrations } from 'meteor/percolate:migrations';

import Organizations from '/apinf_packages/organizations/collection';

Migrations.add({
  version: 13,
  name: 'Adds the slug field for Organizations document if it has not been created yet',
  up () {
    Organizations.find({ slug: { $exists: false } }).forEach((org) => {
      if (org.name) {
        Meteor.call('updateOrgSlug', null, org.name, (error) => {
          if (error) {
            //  Show error messag
          }
        });
      }
    });
  },
});
