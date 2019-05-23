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
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import PatternTextInput from './PatternTextInput';

const props = {
  id: 'pattern-text-input',
  labelText: 'PatternTextInput allows everything by default',
  onChange: action('onChange'),
  onClick: action('onClick')
};

storiesOf('PatternTextInput', module)
  .add('default', () => <PatternTextInput {...props} />)
  .add('pattern: ^\\S*$', () => (
    <PatternTextInput
      {...props}
      pattern="^\S*$"
      invalidText="pattern: ^\S*$"
      labelText="No spaces allowed"
    />
  ))
  .add('pattern: /[A-Z]/', () => {
    const pattern = /[A-Z]/;
    return (
      <PatternTextInput
        {...props}
        pattern={pattern}
        invalidText={`pattern: ${pattern}`}
        labelText="At least one Uppercase letter"
      />
    );
  })
  .add('control invalid', () => (
    <PatternTextInput
      {...props}
      pattern="^\S*$"
      invalidText="pattern: ^\S*$"
      labelText="No spaces allowed"
      helperText="This is overwritten to always be valid"
      invalid={false}
    />
  ))
  .add('hiya', () => {
    const testProps = {
      ...props,
      pattern: '^[A-Z]+$',
      invalidText: 'failed to match pattern'
    };
    return <PatternTextInput {...testProps} value="TEXT" />;
  });
