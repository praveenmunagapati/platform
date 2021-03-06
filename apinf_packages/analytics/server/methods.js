/* Copyright 2017 Apinf Oy
 This file is covered by the EUPL license.
 You may obtain a copy of the licence at
 https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Meteor packages imports
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

// Collections imports
import AnalyticsData from '/apinf_packages/analytics/collection';

// Npm packages imports
import _ from 'lodash';

// APInf imports
import { calculateTrend } from '/apinf_packages/dashboard/lib/trend_helpers';

Meteor.methods({
  timelineChartData (filter) {
    check(filter, Object);

    const requestPathsData = {};

    // Get list of all requested path of particular Proxy Backend
    const allPathsMatrix = AnalyticsData.find(
      { proxyBackendId: filter.proxyBackendId,
        date: { $gte: filter.fromDate, $lt: filter.toDate },
      }).map(data => {
        return data.allRequestPaths;
      });

    // Transform Array of Arrays to List
    // 1. Get not empty array
    // 2. Join all array into one String with "," as separator
    // 3. Convert string to Array using "," as separator
    const allPathsList = allPathsMatrix.filter(paths => {
      return paths.length > 0;
    }).join().split(',');

    // Keep only unique paths
    const uniquePathsList = [...new Set(allPathsList)];

    AnalyticsData.aggregate(
      [
        {
          $match: {
            date: { $gte: filter.fromDate, $lt: filter.toDate },
            proxyBackendId: filter.proxyBackendId,
          },
        },
        {
          $sort: {
            date: 1,
          },
        },
        {
          $group: {
            // Group by paths
            _id: { paths: uniquePathsList },
            success: { $push: { date: '$date', value: '$requestPathsData.successCallsCount' } },
            redirect: { $push: { date: '$date', value: '$requestPathsData.redirectCallsCount' } },
            fail: { $push: { date: '$date', value: '$requestPathsData.failCallsCount' } },
            error: { $push: { date: '$date', value: '$requestPathsData.errorCallsCount' } },
            medianTime: { $push: { date: '$date', value: '$requestPathsData.medianResponseTime' } },
            percentiles95Time: { $push: {
              date: '$date',
              value: '$requestPathsData.percentile95ResponseTime',
            } },
          },
        },
      ]
    ).forEach(dataset => {
      /* eslint-disable arrow-body-style */
      dataset._id.paths.forEach((path, index) => {
        // Fill data for each request path
        requestPathsData[path] = {
          dates: dataset.success.map(x => x.date),
          success: dataset.success.map(x => x.value[index] || 0),
          redirect: dataset.redirect.map(x => x.value[index] || 0),
          fail: dataset.fail.map(x => x.value[index] || 0),
          error: dataset.error.map(x => x.value[index] || 0),
          median: dataset.medianTime.map(x => x.value[index] || 0),
          percentiles95: dataset.percentiles95Time.map(x => x.value[index] || 0),
        };
      });
      /* eslint-enable arrow-body-style */
    });

    return { allRequestPaths: uniquePathsList, requestPathsData };
  },
  errorsStatisticsData (filter) {
    check(filter, Object);

    let errors = [];

    // Fetch all data for Errors table
    AnalyticsData.find(
      { date: { $gte: filter.fromDate, $lt: filter.toDate },
        proxyBackendId: filter.proxyBackendId,
        errors: { $ne: [] } },
      { sort: { date: -1 } }
    ).forEach(data => {
      // Convert
      errors = errors.concat(data.errors);
    });

    return errors;
  },
  summaryStatisticNumber (filter) {
    check(filter, Object);

    // Create query to $match
    const matchQuery = {
      date: { $gte: filter.fromDate, $lt: filter.toDate },
    };

    if (filter.proxyId) {
      // Fetch data for particular Proxy (and several Proxy Backends)
      matchQuery.proxyId = filter.proxyId;
    } else {
      // Fetch data for particular Proxy Backend
      matchQuery.proxyBackendId = filter.proxyBackendId;
    }

    const requestPathsData = {};

    AnalyticsData.aggregate(
      [
        {
          $match: matchQuery,
        },
        {
          $sort: {
            date: 1,
          },
        },
        {
          $group: {
            _id: '$prefix',
            requestNumber: { $sum: '$requestNumber' },
            sumMedianTime: { $sum: '$medianResponseTime' },
            sumUniqueUsers: { $sum: '$uniqueUsers' },
            successCallsCount: { $sum: '$successCallsCount' },
            redirectCallsCount: { $sum: '$redirectCallsCount' },
            failCallsCount: { $sum: '$failCallsCount' },
            errorCallsCount: { $sum: '$errorCallsCount' },
          },
        },
      ]
    ).forEach(dataset => {
      // Create query
      const query = { prefix: dataset._id, date: matchQuery.date, requestNumber: { $ne: 0 } };

      if (filter.proxyId) {
        query.proxyId = filter.proxyId;
      } else {
        query.proxyBackendId = filter.proxyBackendId;
      }

      // Get the number of date when requests were
      const existedValuesCount = AnalyticsData.find(query).count();

      // Calculate average (mean) value of Response time and Uniques users during period
      requestPathsData[dataset._id] = {
        medianResponseTime: parseInt(dataset.sumMedianTime / existedValuesCount, 10) || 0,
        avgUniqueUsers: parseInt(dataset.sumUniqueUsers / existedValuesCount, 10) || 0,
      };

      Object.assign(requestPathsData[dataset._id], dataset);
    });

    return requestPathsData;
  },
  summaryStatisticTrend (filter, currentPeriodResponse) {
    check(filter, Object);
    check(currentPeriodResponse, Object);

    // Get summary statistic data about previous period
    const previousPeriodResponse = Meteor.call('summaryStatisticNumber', filter);

    const comparisonData = {};

    // Compare the current and previous periods data
    _.mapKeys(currentPeriodResponse, (dataset, path) => {
      const previousPeriodData = previousPeriodResponse[path] || {};

      comparisonData[path] = {
        compareRequests: calculateTrend(previousPeriodData.requestNumber, dataset.requestNumber),
        compareResponse:
          calculateTrend(previousPeriodData.medianResponseTime, dataset.medianResponseTime),
        compareUsers: calculateTrend(previousPeriodData.avgUniqueUsers, dataset.avgUniqueUsers),
      };
    });

    return comparisonData;
  },
  statusCodesData (filter) {
    check(filter, Object);

    // Create query to $match
    const matchQuery = {
      date: { $gte: filter.fromDate, $lt: filter.toDate },
    };

    if (filter.proxyId) {
      // Fetch data for particular Proxy (and several Proxy Backends)
      matchQuery.proxyId = filter.proxyId;
    } else {
      // Fetch data for particular Proxy Backend
      matchQuery.proxyBackendId = filter.proxyBackendId;
    }

    const requestPathsData = {};

    AnalyticsData.aggregate(
      [
        {
          $match: matchQuery,
        },
        {
          $sort: {
            date: 1,
          },
        },
        {
          $group: {
            _id: '$prefix',
            successCallsCount: { $sum: '$successCallsCount' },
            redirectCallsCount: { $sum: '$redirectCallsCount' },
            failCallsCount: { $sum: '$failCallsCount' },
            errorCallsCount: { $sum: '$errorCallsCount' },
          },
        },
      ]
    ).forEach(dataset => {
      requestPathsData[dataset._id] = dataset;
    });

    return requestPathsData;
  },
  overviewChartsData (filter) {
    // Return aggregated data for overview charts
    check(filter, Object);

    const matchQuery = {
      date: { $gte: filter.fromDate, $lt: filter.toDate },
    };

    if (filter.proxyId) {
      // Fetch data for particular Proxy (and several Proxy Backends)
      matchQuery.proxyId = filter.proxyId;
    } else {
      // Fetch data for particular Proxy Backend
      matchQuery.proxyBackendId = filter.proxyBackendId;
    }

    const requestPathsData = {};

    AnalyticsData.aggregate(
      [
        {
          $match: matchQuery,
        },
        {
          $sort: {
            date: 1,
          },
        },
        {
          $group: {
            _id: '$prefix',
            requestNumber: { $push: { date: '$date', value: '$requestNumber' } },
            medianTime: { $push: { date: '$date', value: '$medianResponseTime' } },
            uniqueUsers: { $push: { date: '$date', value: '$uniqueUsers' } },
          },
        },
      ]
    ).forEach(dataset => {
      requestPathsData[dataset._id] = dataset;
    });

    return requestPathsData;
  },
});
