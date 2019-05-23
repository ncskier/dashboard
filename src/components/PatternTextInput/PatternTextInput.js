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
import { TextInput } from 'carbon-components-react';

const defaultPattern = '.*';
const defaultInvalidText = '';

class PatternTextInput extends React.Component {
  constructor(props) {
    super(props);
    const regexp = props.pattern
      ? new RegExp(props.pattern)
      : new RegExp(defaultPattern);
    this.state = {
      invalid:
        typeof props.invalid !== 'undefined'
          ? props.invalid
          : !regexp.test(this.props.value || ''),
      regexp
    };
    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    event.persist();
    this.setState((state, props) => {
      return {
        invalid:
          typeof props.invalid !== 'undefined'
            ? props.invalid
            : !state.regexp.test(event.target.value)
      };
    });
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  }

  render() {
    const { pattern, invalidText, ...props } = this.props;
    return (
      <TextInput
        {...props}
        pattern={this.state.regexp}
        invalidText={invalidText || defaultInvalidText}
        invalid={this.state.invalid}
        onChange={this.onChange}
      />
    );
  }
}

export default PatternTextInput;
