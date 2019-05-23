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

import React from 'react';
import { render } from 'react-testing-library';
import NoSpacesTextInput from './NoSpacesTextInput';

// TODO: all tests
const props = {
  id: 'resource-name-text-input',
  labelText: 'label'
};

// Default
it('PatternTextInput renders', () => {
  const { queryByText, queryByDisplayValue } = render(
    <NoSpacesTextInput {...props} value="text" />
  );
  expect(queryByDisplayValue(/text/i)).toBeTruthy();
  expect(queryByText(/label/i)).toBeTruthy();
});

// Don't invalidate on the empty case
