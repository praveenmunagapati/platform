// Meteor contributed packages imports
import { Migrations } from 'meteor/percolate:migrations';

// Collection imports
import Apis from '/apis/collection';

Migrations.add({
  version: 6,
  name: 'Adds the slug field for APIs document if it has not been created yet',
  up () {
    Apis.find({ slug: { $exists: false } }).forEach((api) => {
      Apis.update(api._id);
    });
  },
});
