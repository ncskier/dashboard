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
import { render, fireEvent } from 'react-testing-library';
import PatternTextInput from './PatternTextInput';

const props = {
  id: 'pattern-text-input',
  labelText: 'label'
};

// Default
it('PatternTextInput renders', () => {
  const { queryByText, queryByDisplayValue } = render(
    <PatternTextInput {...props} value="text" />
  );
  expect(queryByDisplayValue(/text/i)).toBeTruthy();
  expect(queryByText(/label/i)).toBeTruthy();
});

// Invalid state
it('PatternTextInput renders invalid pattern match', () => {
  const { queryByText, queryByDisplayValue } = render(
    <PatternTextInput
      {...props}
      pattern="^[A-Z]+$"
      invalidText="failed to match pattern"
      value="text"
    />
  );
  expect(queryByDisplayValue(/text/i)).toBeTruthy();
  expect(queryByText(/failed to match pattern/i)).toBeTruthy();
});

// Valid state
it('PatternTextInput renders valid pattern match', () => {
  const { queryByText, queryByDisplayValue } = render(
    <PatternTextInput
      {...props}
      pattern="^[A-Z]+$"
      invalidText="failed to match pattern"
      value="TEXT"
    />
  );
  expect(queryByDisplayValue(/TEXT/i)).toBeTruthy();
  expect(queryByText(/failed to match pattern/i)).toBeFalsy();
});

// onClick action called
it('PatternTextInput registers onClick events', () => {
  const onClick = jest.fn();
  const testProps = {
    ...props,
    pattern: '^[A-Z]+$',
    invalidText: 'failed to match pattern',
    onClick
  };
  const { getByDisplayValue } = render(
    <PatternTextInput {...testProps} value="text" />
  );
  fireEvent.click(getByDisplayValue(/text/i));
  expect(onClick).toHaveBeenCalledTimes(1);
});

// TODO: debug onChange tests (render does not seem to be working)

// // onChange action called
// it('PatternTextInput registers onChange events', () => {
//   const onChange = jest.fn();
//   const testProps = {
//     ...props,
//     pattern: '^[A-Z]+$',
//     invalidText: 'failed to match pattern',
//     onChange
//   };
//   const { container, queryByDisplayValue } = render(
//     <PatternTextInput {...testProps} value="init text" />
//   );
//   expect(queryByDisplayValue(/init text/i)).toBeTruthy();

//   render(<PatternTextInput {...testProps} value="new text" />, { container });
//   expect(queryByDisplayValue(/new text/i)).toBeTruthy();
//   expect(onChange).toHaveBeenCalledTimes(1);
// });

// it('PatternTextInput registers onChange events', () => {
//   const onChange = jest.fn();
//   const testProps = {
//     ...props,
//     pattern: '^[A-Z]+$',
//     invalidText: 'failed to match pattern',
//     onChange
//   };
//   const { container, queryByText, queryByDisplayValue, getByText } = render(
//     <PatternTextInput {...testProps} />
//   );

//   render(<PatternTextInput {...testProps} value="text" />, { container });
//   expect(queryByDisplayValue(/text/i)).toBeTruthy();
//   expect(queryByText(/failed to match pattern/i)).toBeTruthy();
//   expect(onChange).toHaveBeenCalledTimes(1);

//   render(<PatternTextInput {...testProps} value="TEXT" />, { container });
//   expect(queryByDisplayValue(/TEXT/i)).toBeTruthy();
//   fireEvent.click(getByText(/yolo/i));
//   expect(queryByText(/failed to match pattern/i)).toBeFalsy();
//   expect(onChange).toHaveBeenCalledTimes(2);
// });

// Don't invalidate on the empty case
it('PatternTextInput renders valid pattern match by default', () => {
  const { queryByText } = render(
    <PatternTextInput {...props} invalidText="failed to match pattern" />
  );
  expect(queryByText(/failed to match pattern/i)).toBeFalsy();
});
