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
import PatternTextInput from '../PatternTextInput/PatternTextInput';

// TODO: URL regex
const defaultPattern = '.*';
const defaultInvalidText = 'Must be a valid URL';

const UrlTextInput = ({ pattern, invalidText, ...props }) => {
  return (
    <PatternTextInput
      {...props}
      pattern={pattern || defaultPattern}
      invalidText={invalidText || defaultInvalidText}
    />
  );
};

export default UrlTextInput;
