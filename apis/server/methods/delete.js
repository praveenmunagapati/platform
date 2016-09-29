// Meteor imports
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

// Collection imports
import { Apis } from '/apis/collection';
import { ApiBacklogItems } from '/backlog/collection';
import { ApiMetadata } from '/metadata/collection';
import { DocumentationFiles } from '/documentation/collection/collection';
import { Feedback } from '/feedback/collection';

Meteor.methods({
  // Remove API backend and related items
  removeApiBackend (apiBackendId) {
    // Remove API doc
    Meteor.call('removeApiDoc', apiBackendId);

    // Remove backlog items
    ApiBacklogItems.remove({ apiBackendId });

    // Remove feedbacks
    Feedback.remove({ apiBackendId });

    // Remove metadata
    ApiMetadata.remove({ apiBackendId });

    // Finally remove the API
    Apis.remove(apiBackendId);
  },
  // Remove API documentation file
  removeApiDoc (apiBackendId) {
    // Get API object
    const api = Apis.findOne(apiBackendId);
    // Get documentationFileId
    const documentationFileId = api.documentationFileId;
    // Convert to Mongo ObjectID
    const objectId = new Mongo.Collection.ObjectID(documentationFileId);
    // Remove documentation object
    DocumentationFiles.remove(objectId);
  },
});
