import Branding from './';

Branding.after.insert((userId, doc) => {
  const analyticsSettings = doc.analyticsSettings;

  if (analyticsSettings) {
    Meteor.settigns.public.analyticsSettings = analyticsSettings;
  }
});

Branding.after.update((userId, doc) => {
  const analyticsSettings = doc.analyticsSettings;

  if (analyticsSettings) {
    Meteor.settings.public.analyticsSettings = analyticsSettings;
  }
});
