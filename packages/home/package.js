Package.describe({
  name: "apinf:home",
  version: "0.0.1",
  // git: "https://github.com/TelescopeJS/telescope-invites.git"
});

Npm.depends({
  // NPM package dependencies
});

Package.onUse(function (api) {

  api.versionsFrom("METEOR@1.0");

  // --------------------------- 1. Meteor packages dependencies ---------------------------

  
  // client

  api.use([
    'kadira:dochead',
    'templating',
    'kadira:blaze-layout',
    'kadira:flow-router',
    'aldeed:autoform',
    'tap:i18n',
    'juliancwirko:s-alert',
  ], ['client']);

  // server

  api.use([
    'aldeed:simple-schema',
    'email',
    'check'
  ], ['server']);

  // both client and server

  api.use([
    'tmeasday:publish-counts'
  ],['client','server'])

  // ---------------------------------- 2. Files to include ----------------------------------

  // Schema

  api.addFiles([
    'contactFormSchema.js'
  ], ['client', 'server']);

  // both

  // api.addFiles([
  //   'lib/invites.js'
  // ], ['client', 'server']);

  // client


  api.addAssets([
    'client/body/homeBody.less'
  ], ['client']);

  api.addFiles([
    'client/body/homeBody.html',
    'client/body/homeBody.js',
    

    'client/contact/autoform.js',
    'client/contact/contact.html',
    'client/contact/contact.html',

    'client/lib/router.js',

    'client/home.html',
    'client/home.js'
  ], ['client']);

  // server

  // api.addAssets([
  //   'lib/server/templates/emailInvite.handlebars'
  // ], ['server']);

  api.addFiles([
    'server/methods.js'
  ], ['server']);

  // i18n languages (must come last)

  // api.addFiles(languagesPaths, ["client", "server"]);

  // -------------------------------- 3. Variables to export --------------------------------

  api.export("ContactFormSchema");

});
