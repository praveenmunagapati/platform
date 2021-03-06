/* Copyright 2017 Apinf Oy
This file is covered by the EUPL license.
You may obtain a copy of the licence at
https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Meteor packages imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Meteor contributed packages imports
import { DocHead } from 'meteor/kadira:dochead';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Roles } from 'meteor/alanning:roles';
import { TAPi18n } from 'meteor/tap:i18n';

// Collection imports
import Apis from '/apinf_packages/apis/collection';
import ApiBookmarks from '/apinf_packages/bookmarks/collection';
import ApiDocs from '/apinf_packages/api_docs/collection';
import Branding from '/apinf_packages/branding/collection';

import 'locale-compare-polyfill';

// Npm packages imports
import _ from 'lodash';

Template.apiCatalog.onCreated(function () {
  // Get reference to template instance
  const instance = this;

  instance.autorun(() => {
    // Get Branding collection content
    const branding = Branding.findOne();
    // Check if Branding collection and siteTitle are available
    if (branding && branding.siteTitle) {
      // Set the page title
      const pageTitle = TAPi18n.__('apiCatalogPage_title_apiCatalog');
      DocHead.setTitle(`${branding.siteTitle} - ${pageTitle}`);
    }
  });
  // Get user id
  const userId = Meteor.userId();

  // Default sort
  const defaultSort = { name: 1 };

  // Set filters
  // On default: Show all public apis for anonymous users
  let filters = { isPublic: true };

  if (userId) {
    // Show all available apis for registered users
    filters = {
      $or: [
        { isPublic: true },
        { managerIds: userId },
        { authorizedUserIds: userId },
      ],
    };
  }

  if (Roles.userIsInRole(userId, ['admin'])) {
    // Show all apis for administrators
    filters = {};
  }

  // Set initial settings of pagination
  instance.pagination = new Meteor.Pagination(Apis, {
    // Count of cards in catalog
    perPage: 24,
    // Set sort by name on default
    sort: defaultSort,
    filters,
  });

  // Subscribe to apiDocs that contains either 'fileId' or 'remoteFileUrl'
  instance.subscribe('apisDocuments');

  // Subscribe to bookmarks of current user
  instance.subscribe('userApiBookmarks');

  // Subscribe to organization apis
  instance.subscribe('organizationApis');

  // Subscribe to organizations basic details
  instance.subscribe('allOrganizationBasicDetails');

  // Watch for changes in the sort settings
  instance.autorun(() => {
    let sortByParameter = FlowRouter.getQueryParam('sortBy');

    // Check URL parameter for sort direction and convert to integer
    let sortDirectionParameter = -1;

    // Check URL parameter for sorting
    switch (sortByParameter) {
      case 'name-asc':
        sortByParameter = 'name';
        sortDirectionParameter = 1;
        break;
      case 'name-desc':
        sortByParameter = 'name';
        sortDirectionParameter = -1;
        break;
      default:
        break;
    }
    // Create a object for storage sorting parameters
    let sort = {};
    // Check of existing parameters
    if (sortByParameter && sortDirectionParameter) {
      // Get field and direction of sorting
      sort[sortByParameter] = sortDirectionParameter;
    } else {
      // Otherwise get it like default value
      sort = defaultSort;
    }

    // Change sorting
    instance.pagination.sort(sort);

    let currentFilters = filters;

    // Check URL parameter for filtering
    const filterByParameter = FlowRouter.getQueryParam('filterBy');

    // Filtering available for registered users
    if (userId) {
      switch (filterByParameter) {
        case 'all': {
          // Delete filter for managed apis & bookmarks
          delete currentFilters.managerIds;
          delete currentFilters._id;
          break;
        }
        case 'my-apis': {
          // Delete filter for bookmarks
          delete currentFilters._id;
          // Set filter for managed apis
          currentFilters.managerIds = userId;
          break;
        }
        case 'my-bookmarks': {
          // Delete filter for managed apis
          delete currentFilters.managerIds;
          // Get user bookmarks
          const userBookmarks = ApiBookmarks.findOne() || '';
          // Set filter for bookmarks
          currentFilters._id = { $in: userBookmarks.apiIds };
          break;
        }
        default: {
          // Otherwise get it like default value
          currentFilters = { isPublic: true };
          break;
        }
      }
    } else {
      // Otherwise get it like default value
      currentFilters = { isPublic: true };
    }

    // Check URL parameter for filtering by lifecycle status
    const lifecycleStatusParameter = FlowRouter.getQueryParam('lifecycle');

    // Checking of filter bu lifecycle status was set
    if (lifecycleStatusParameter) {
      // Set filter
      currentFilters.lifecycleStatus = lifecycleStatusParameter;
    } else {
      // Can be case when filter was set and user clicks on Clear button.
      // Query parameter doesn't exists but database query has field.

      // Delete field from object.
      delete currentFilters.lifecycleStatus;
    }

    // Check URL parameter for apisWithDocumentation filter
    const apisWithDocumentation = FlowRouter.getQueryParam('apisWithDocumentation');

    // Checking if 'APIs with Documentation' filter is checked or not
    if (apisWithDocumentation === 'true') {
      // Fetching published ApiDocs
      const apiDocs = ApiDocs.find().fetch();
      // Creating array of ApiIds
      let apiIds = _.map(apiDocs, 'apiId');

      // checking if 'My Bookmarks' filter is checked or not
      if (filterByParameter === 'my-bookmarks') {
        // fetch bookmarked ApiIds
        const bookmarkedApiIds = currentFilters._id.$in;
        // find ApiIds that are bookmarked and that contains Api Documentation
        apiIds = _.intersection(bookmarkedApiIds, apiIds);
      }

      // Set filter for filtering out apiIds that dont contain Api Documentation
      currentFilters._id = { $in: apiIds };
    }

    instance.pagination.filters(currentFilters);
  });
});

// eslint-disable-next-line prefer-arrow-callback
Template.apiCatalog.onRendered(function () {
  // Activate tooltips on all relevant items
  $('[data-toggle="tooltip"]').tooltip();
});

Template.apiCatalog.helpers({
  apis () {
    // Get apis collection via Pagination
    const apis = Template.instance().pagination.getPage();
    // Get the language
    const language = TAPi18n.getLanguage();
    // Get the sort via Pagination
    const sort = Template.instance().pagination.sort();
    // When sorted by name
    if (sort.name) {
      // use custom sort function with i18n support
      apis.sort((a, b) => {
        return a.name.localeCompare(b.name, language) * sort.name;
      });
    }
    return apis;
  },
  templatePagination () {
    // Get reference of pagination
    return Template.instance().pagination;
  },
  gridViewMode () {
    // Get view mode from template
    const viewMode = FlowRouter.getQueryParam('viewMode');

    return (viewMode === 'grid');
  },
  tableViewMode () {
    // Get view mode from template
    const viewMode = FlowRouter.getQueryParam('viewMode');

    return (viewMode === 'table');
  },
  apisCount () {
    return Template.instance().pagination.totalItems();
  },
});

Template.apiCatalog.events({
  'click [data-lifecycle]': (event) => {
    // Get value of data-lifecycle
    const selectedTag = event.currentTarget.dataset.lifecycle;
    // Set value in query parameter
    FlowRouter.setQueryParams({ lifecycle: selectedTag });
  },
});
