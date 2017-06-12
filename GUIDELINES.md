# In this document
* Daily TODOs
* Commit guidelines
* General workflow
* Merege / PR guidelines
* Releasing guidelines
* Testing and automation guidelines

## Daily TODOs
This is a set of guidelines every developer should follow before starting their
"work day". To start with, the following two:

* Rebase your work against latest develop `git rebase`, see #2524
* Go through any open PRs assigned to you and clear them off your desk

## Commit guidelines

* Try to have nuclear commits and at the same time, all connected items should
be a part of the same commit. The idea is that any commit that has been pushed
to the upstream, should be independent and yet a complete changeset.
* Verbose and informative messages, as a thumb rule, please go through the
following points from https://chris.beams.io/posts/git-commit/
    * Separate subject from the body with a blank line
    * Limit the subject line to 50 characters
    * Capitalize the subject line
    * Do not end the subject line with a period
    * Wrap the body at 72 characters
    * Use the body to explain _what_ and _why_ vs _how_
    * Use an imperative mood in the subject line
* A good resource to see ideal commit examples would be the `git log` for the
linux kernel
* Check incoming before pushing an outgoing commit.
* No force push to `develop`, `release`, `master`.
* No merge commits in any _feature branch_ or _bugfix branch_ or _hotfix branch_.
The sole purpose of the __merge commits__ are to merge the _feature_, _bugfix_ or
_hotfix_ to the relevant branches they are intended for. __Get in habit of using
`git rebase`__.
* Using keywords in commits (self explanatory):
    * NEW
    * FIXES
    * IMPROVES

## General workflow

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
