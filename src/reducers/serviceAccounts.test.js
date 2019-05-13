/*
Copyright 2019 The Tekton Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import serviceAccountsReducer, * as selectors from './serviceAccounts';

it('handles init or unknown actions', () => {
  expect(serviceAccountsReducer(undefined, { type: 'does_not_exist' })).toEqual({
    byName: {
      default: {}
    },
    errorMessage: null,
    isFetching: false,
    selected: 'default'
  });
});

it('SERVICE_ACCOUNTS_FETCH_REQUEST', () => {
  const action = { type: 'SERVICE_ACCOUNTS_FETCH_REQUEST' };
  const state = serviceAccountsReducer({}, action);
  expect(selectors.isFetchingServiceAccounts(state)).toBe(true);
});

it('SERVICE_ACCOUNTS_FETCH_SUCCESS', () => {
  const name = 'default';
  const uid = 'some-uid';
  const serviceAccount = {
    metadata: {
      name,
      uid
    },
    other: 'content'
  };
  const action = {
    type: 'SERVICE_ACCOUNTS_FETCH_SUCCESS',
    data: [serviceAccount]
  };

  const state = serviceAccountsReducer({}, action);
  expect(selectors.getServiceAccounts(state)).toEqual([name]);
  expect(selectors.isFetchingServiceAccounts(state)).toBe(false);
});

it('SERVICE_ACCOUNTS_FETCH_FAILURE', () => {
  const message = 'fake error message';
  const error = { message };
  const action = {
    type: 'SERVICE_ACCOUNTS_FETCH_FAILURE',
    error
  };

  const state = serviceAccountsReducer({}, action);
  expect(selectors.getServiceAccountsErrorMessage(state)).toEqual(message);
});

it('SERVICE_ACCOUNT_SELECT', () => {
  const serviceAccount = 'some-serviceAccount';
  const action = {
    type: 'SERVICE_ACCOUNT_SELECT',
    serviceAccount
  };

  const state = serviceAccountsReducer({}, action);
  expect(selectors.getSelectedServiceAccount(state)).toEqual(serviceAccount);
});
