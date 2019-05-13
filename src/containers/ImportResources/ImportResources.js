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

import React, { Component } from 'react';
import { TextInput, FormLabel, Button } from 'carbon-components-react';

import '../../components/Definitions/Definitions.scss';
import './ImportResources.scss';

import { createPipelineRun } from '../../api';
import ServiceAccountsDropdown from '../ServiceAccountsDropdown';

class ImportResources extends Component {
  constructor(props) {
    super(props);
    this.state = {
      repositoryURL: '',
      namespace: '',
      serviceAccount: ''
    };
  }

  handleNamespace(data) {
    this.setState({
      namespace: data.selectedItem
    });
  }

  handleServiceAccount(data) {
    this.setState({
      serviceAccount: data.selectedItem
    });
  }

  handleTextInput(event) {
    const identifier = event.target.name;
    const inputValue = event.target.value;
    this.setState({
      [identifier]: inputValue
    });
  }

  handleSubmit(event) {
    const pipelinename = 'pipeline0';
    const gitresourcename = 'git-source';
    const gitcommit = 'master';
    const repourl = this.state.repositoryURL;
    const namespaceToPass = this.state.namespace;
    const serviceaccount = this.state.serviceAccount;
    const payload = {
      pipelinename,
      serviceaccount,
      gitresourcename,
      gitcommit,
      repourl
    };
    createPipelineRun(payload, namespaceToPass);
    event.preventDefault();
  }

  render() {
    this.handleNamespace = this.handleNamespace.bind(this);
    this.handleServiceAccount = this.handleServiceAccount.bind(this);
    this.handleTextInput = this.handleTextInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    return (
      <div>
        <h1 className="ImportHeader">
          Import Tekton resources from repository
        </h1>
        <div className="row">
          <div className="firstColumn">
            <FormLabel> Repository URL </FormLabel>
          </div>
          <div className="column">
            <TextInput
              name="repositoryURL"
              value={this.state.repositoryURL}
              onChange={this.handleTextInput}
            />
          </div>
        </div>
        <div className="row">
          <div className="firstColumn">
            <FormLabel> Service account </FormLabel>
          </div>
          <div className="column">
            <ServiceAccountsDropdown />
          </div>
        </div>
        <div className="row">
          <div className="firstColumn"> </div>
          <div className="column">
            <Button kind="primary" onClick={this.handleSubmit}>
              Import and Apply
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ImportResources;
