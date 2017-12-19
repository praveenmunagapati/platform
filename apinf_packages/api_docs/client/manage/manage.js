/* Copyright 2017 Apinf Oy
This file is covered by the EUPL license.
You may obtain a copy of the licence at
https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Meteor packages imports
import { Mongo } from 'meteor/mongo';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

// Meteor contributed packages imports
import { Modal } from 'meteor/peppelg:bootstrap-3-modal';
import { TAPi18n } from 'meteor/tap:i18n';
import { sAlert } from 'meteor/juliancwirko:s-alert';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// Collection imports
import ApiDocs from '/apinf_packages/api_docs/collection';
import DocumentationFiles from '/apinf_packages/api_docs/files/collection';
import Settings from '/apinf_packages/settings/collection';

Template.manageApiDocumentationModal.onCreated(function () {
  const instance = this;

  // Turn off spinner if it was on
  Session.set('fileUploading', false);

  // Subscribe to documentation editor settings
  instance.subscribe('singleSetting', 'apiDocumentationEditor');

  instance.removeDocumentationFile = (fileId) => {
    // Convert to Mongo ObjectID
    const objectId = new Mongo.Collection.ObjectID(fileId);

    // Remove documentation object
    DocumentationFiles.remove(objectId);

    // Remove value from Session variable
    Session.set('fileId', undefined);
  };
});

Template.manageApiDocumentationModal.onDestroyed(() => {
  // Unset sessions
  Session.set('fileUploading', undefined);
});

Template.manageApiDocumentationModal.onRendered(() => {
  // Fetch other Url
  const apiDocs = ApiDocs.findOne();
  if (apiDocs && apiDocs.otherUrl) {
    // Set Other Url in Session variable
    Session.set('links', apiDocs);
  } else {
    Session.set('links', []);
  }
});

Template.manageApiDocumentationModal.helpers({
  documentationFile () {
    // Get fileId value
    const fileId = Session.get('fileId');

    if (fileId) {
      // Convert to Mongo ObjectID
      const objectId = new Mongo.Collection.ObjectID(fileId);

      // Get documentation file Object
      return DocumentationFiles.findOne(objectId);
    }
    // Otherwise return false
    return false;
  },
  apiDocumentationEditorIsEnabled () {
    // Get settings
    const settings = Settings.findOne();

    // Check settings exists, editor is enabled and host setting exists
    if (
      settings &&
      settings.apiDocumentationEditor &&
      settings.apiDocumentationEditor.enabled &&
      settings.apiDocumentationEditor.host) {
      // Editor is enabled and has host setting, return true
      return true;
    }
    // Otherwise return false
    return false;
  },
  apiDocsCollection () {
    // Return a reference to ApiDocs collection, for AutoForm
    return ApiDocs;
  },
  formType () {
    const instance = Template.instance();
    if (instance.data.apiDoc) {
      return 'update';
    }
    return 'insert';
  },
  // Return list of all try-out methods, which is used in Swagger Options
  supportedSubmitMethods () {
    return [
      { label: 'GET', value: 'get' },
      { label: 'POST', value: 'post' },
      { label: 'DELETE', value: 'delete' },
      { label: 'PATCH', value: 'patch' },
      { label: 'PUT', value: 'put' },
    ];
  },
  fileUploding () {
    // Return spinner status
    return Session.get('fileUploading');
  },
  otherUrls () {
    // Return Session
    if (Session.get('links') && Session.get('links').otherUrl) {
      return Session.get('links').otherUrl;
    }
    return Session.get('links');
  },
});

Template.manageApiDocumentationModal.events({
  'click .delete-documentation': function (event, templateInstance) {
    // Get confirmation message translation
    const message = TAPi18n.__('manageApiDocumentationModal_DeletedFile_ConfirmationMessage');

    // Show confirmation dialog to user
    // eslint-disable-next-line no-alert
    const confirmation = confirm(message);

    // Check if user clicked "OK"
    if (confirmation === true) {
      // Get fileId value
      const documentationFileId = Session.get('fileId');

      // Remove file from DocumentationFile collection
      templateInstance.removeDocumentationFile(documentationFileId);

      // Remove fileId
      ApiDocs.update(templateInstance.data.apiDoc._id, {
        $unset: { fileId: '' },
      });

      // Get deletion success message translation
      const successfulMessage = TAPi18n.__('manageApiDocumentationModal_DeletedFile_Message');

      // Alert user of successful deletion
      sAlert.success(successfulMessage);
    }
  },
  'click #save-documentation-link': function () {
    // Hide modal
    Modal.hide('manageApiDocumentationModal');
  },
  'click #open-api-editor': function () {
    // Hide modal
    Modal.hide('manageApiDocumentationModal');
  },
  'click #cancel-button': function (event, templateInstance) {
    // Get fileId value
    const fileId = Session.get('fileId');

    // If file is uploaded and a user clicks on "Cancel" button
    if (fileId) {
      // Remove uploaded file from collection
      templateInstance.removeDocumentationFile(fileId);
    }
  },
  'click #addLinks': function () {
    // Get Value from textbox
    const link = $('#linksField').val().trim();
    // Regex for https protocol
    const regex = SimpleSchema.RegEx.Url;
    const regexUrl = regex.test(link);
    // If value is https(s)
    if (regexUrl) {
      // make error message invisible
      $('#errorMessage').addClass('invisible');
      const linksData = Session.get('links');
      // If data is available in Session
      if (linksData) {
        // If links get otherUrl field in database
        if (linksData.otherUrl) {
          // set textbox value in Session array
          linksData.otherUrl.push(link);
          Session.set('links', linksData);
        } else {
          linksData.push(link);
          Session.set('links', linksData);
        }
      } else {
        // if session array is empty
        Session.set('links', [link]);
      }
      // clear the text box
      $('#linksField').val('');
    } else {
        // Hide error message
      $('#errorMessage').removeClass('invisible');
    }
  },

  'click .cursor': function (event) {
    // get links from session
    const otherUrlLinks = Session.get('links');
    // get cross id
    const deleteLinkId = event.currentTarget.id;
    if (otherUrlLinks && otherUrlLinks.otherUrl) {
    // Remove elemtn from Session
      otherUrlLinks.otherUrl.splice(deleteLinkId, 1);
      Session.set('links', otherUrlLinks);
    } else {
      otherUrlLinks.splice(deleteLinkId, 1);
      Session.set('links', otherUrlLinks);
    }
  },
});
