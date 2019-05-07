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
import {
  Dropdown,
  TextInput,
  FormLabel,
  Button
} from 'carbon-components-react';

import '../../components/Definitions/Definitions.scss';
import './ImportResources.scss';
import { createPipelineRun } from '../../api';

class ImportResources extends Component {
  constructor(props) {
    super(props);
    this.state = {
      repositoryURL: '',
      directory: '',
      namespace: '',
      serviceAccount: ''
    };

    this.handleNamespace = this.handleNamespace.bind(this);
    this.handleServiceAccount = this.handleServiceAccount.bind(this);
    this.handleTextInput = this.handleTextInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleNamespace(data) {
    console.log(data);
    this.setState({
      namespace: data.selectedItem
    });
  }

  handleServiceAccount(data) {
    console.log(data);
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
    // const directoryToPass = this.state.directory;
    const namespaceToPass = this.state.namespace;
    const serviceaccount = this.state.serviceAccount;
    const payload = {
      pipelinename,
      serviceaccount,
      gitresourcename,
      gitcommit,
      repourl
    };
    console.log(payload);
    createPipelineRun(payload, namespaceToPass);
    event.preventDefault();
  }

  render() {
    const namespaces = ['default'];
    const serviceAccounts = ['tekton-pipelines'];

    return (
      <main>
        <h1 className="ImportHeader">
          Import Tekton resources from repository
        </h1>
        <FormLabel> Repository URL </FormLabel>
        <TextInput
          className="ImportRepoForm"
          name="repositoryURL"
          value={this.state.repositoryURL}
          onChange={this.handleTextInput}
        />
        <FormLabel> Directory </FormLabel>
        <TextInput
          className="ImportRepoForm"
          name="directory"
          value={this.state.directory}
          onChange={this.handleTextInput}
        />
        <FormLabel> Namespace </FormLabel>
        <Dropdown
          className="ImportRepoForm"
          items={namespaces}
          value={this.state.namespace}
          onChange={this.handleNamespace}
        />
        <FormLabel> Service account </FormLabel>
        <Dropdown
          className="ImportRepoForm"
          items={serviceAccounts}
          value={this.state.serviceAccount}
          onChange={this.handleServiceAccount}
        />
        <Button onClick={this.handleSubmit}>Import and Apply</Button>
      </main>
    );
  }
}

export default ImportResources;
