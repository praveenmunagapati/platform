# In this document
* Daily TODOs
* Commit guidelines
* General workflow
* Merge / PR guidelines
* Releasing guidelines
* Continuos Integration process and testing

## Daily TODOs
This is a set of guidelines every developer should follow before starting their
"work day". To start with, the following two:

* Rebase your work against latest develop `git rebase`, see #2524
* Go through any open PRs assigned to you and clear them off your desk

## Commit guidelines

* No force push to `develop`, `release`, `master`.
* Check incoming before pushing an outgoing commit (e.g. use `git pull --rebase`).
* Try to have nuclear commits and at the same time, all connected items should
be a part of the same commit. The idea is that any commit that has been pushed
to the upstream, should be independent and yet a complete changeset and should
be easy to `git bisect` or `git revert` in case of regression.
* Verbose and informative messages, as a thumb rule, please go through the
following points from https://chris.beams.io/posts/git-commit/
    * Separate subject from the body with a blank line
    * Limit the subject line to 50 characters
    * Capitalize the subject line
    * Do not end the subject line with a period
    * Wrap the body at 72 characters
    * Use the body to explain _what_ and _why_ vs _how_
    * Use an imperative mood in the subject line
* A good resource to see ideal commit message examples would be the `git log` for
the linux kernel project.
* No merge commits in any _feature branch_ or _bugfix branch_ or _hotfix branch_.
The sole purpose of the __merge commits__ are to merge the _feature_, _bugfix_ or
_hotfix_ to the relevant branches they are intended for. __Get in habit of using
`git rebase`__.
* Using keywords in commits (self explanatory):
    * NEW
    * FIXES
    * IMPROVES

## General workflow

* `develop` is our staging area and `master` is our stable codebase.
* All __features__ are developed in __feature__ branches. Naming convention should
be either _`feature/<name or github id> OR feature-<name or github id>`_.
* All __bugfixes__ are done in __bugfix__ branches. Naming convention is 
_`bugfix-github-id`_ or _`bugfix/github-id`_.
* All __hotfixes__ are done in __hotfix__ branches. Naming convention is 
_`hotfix-relese-version-github-id`_ or _`hotfix/release-version-github-id`_.
* All _features_ and _bugfixes_ will land to their destined branch, `develop` only
after the following have passed:
    * __Gate 1__
    * Peer review
    * Features: Automated Test cases (positive and negative scenarios)
    * Bugfixes: Automated test case for the buggy scenario
* All _hotfixes_ will land to their destined release branches only after the
following have passed:
    * __Gate 1__
    * __Gate 2__
    * __Gate 3__
    * Peer review
    * Automated test case for the scenario

### Bugfix vs Hotfix
A _bugfix_ means fixing a broken piece of code or functionality in the current release
candidate while a _hotfix_ means patching any existing release for a broken
functionality or a vulnerability fix.

### Definition of the Gates

#### Gate 1
Runs on every commit that will eventually be a part of `develop`. Items that are a
part of this gate are:
* Unit tests
* Localization tokens check
* Coding style check using `eslint`
* Sandbox setup and testing of following scenarios (BASIC INTEGRATION TESTS):
    * Add, view API
    * Add, show API catalog
    * Add, show Organiation
    * Add, show User
    * User login
    * Proxy setup and make at least 1 call using this proxy

Expeected time to complete this test set should not be 5-7 minutes. __Automation
coverage: 100%.__

After completion of this step, the code under review (through PR) will be merged
to `develop`.

#### Gate 2
Runs every night on the latest code from `develop`. Items that are a part of this
gate are:
* Sandbox setup
* Tests from _Gate 1_
* Regression test suite
* Broad variety and complexity of E2E test suite

__Automation coverage: 100%__

After completion of this step:
* The code will be deployed to: `nightly.apinf.io`.
* TBD: A `beta-release-tarball` is created
* TBD: Commit is marked as `beta-tested`

### Gate 3 : Release gate (or Pre-release tests)

Runs before every release is done to the client or otherwise. All the deliveries
of any kind should pass this gate. This step is triggered manually by the release
manager or Product owner (See release process). Items in this gate include:
* Tests from _Gate 1_
* Tests from _Gate 2_
* Integration test suite
* Manual testing

__Automation coverage: 60%__ (excludes Manual testing, selected tests in
Integration test suite)

After completion of this step:
* Tested code is deployed to: `apinf.io` 
* Release is finalized (See release process)

## Merge / PR guidelines
* Developer's code must be `rebased` against latest `develop`
* 


## Releasing guidelines
Who takes decision about the release: _Release manager_ and/or _Product owner_.

## Continuos Integration process and testing
Until more infrastructure is available, we will use Selective CI. This means
that, our staging area (`develop`) will be tested for every commit that lands
into the branch. It is developers responsibility to run the __Gate 1__ tests
before creating a PR. For more details, please check __Merge / PR guidelines__.

Tools used:
* For Continuous Integration and delivery: __Jenkins__
* Test case writing:
    * Unit / Functional tests: Chimp.js
    * E2E tests (UI tests): Robot + Selenium

