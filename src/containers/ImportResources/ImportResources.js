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
import { connect } from 'react-redux';
import { createPipelineRun } from '../../api';
import { fetchNamespaces } from '../../actions/namespaces';
import {
  getNamespaces,
  getNamespacesErrorMessage,
  isFetchingNamespaces
} from '../../reducers';

let namespacesArray = [];

class ImportResources extends Component {
  /* constructor(props) {
    super(props);
    this.state = {
      repositoryURL: '',
      namespace: '',
      serviceAccount: ''
    };

    this.handleNamespace = this.handleNamespace.bind(this);
    this.handleServiceAccount = this.handleServiceAccount.bind(this);
    this.handleTextInput = this.handleTextInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  } */

  state = {
    repositoryURL: '',
    namespace: '',
    serviceAccount: ''
  };

  // handleNamespace = this.handleNamespace.bind(this);
  // handleServiceAccount = this.handleServiceAccount.bind(this);
  // handleTextInput = this.handleTextInput.bind(this);
  // handleSubmit = this.handleSubmit.bind(this);

  componentDidMount() {
    this.props.fetchNamespaces();
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
    window.alert(payload);
    createPipelineRun(payload, namespaceToPass);
    event.preventDefault();
  }

  render() {
    const { error, loading, namespaces } = this.props;
    const serviceAccounts = ['tekton-pipelines'];

    this.handleNamespace = this.handleNamespace.bind(this);
    this.handleServiceAccount = this.handleServiceAccount.bind(this);
    this.handleTextInput = this.handleTextInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    console.log(namespaces);

    if (error) {
      namespacesArray = ['error loading namespaces'];
    }

    if (loading && !namespaces.length) {
      namespacesArray = [''];
    }

    const namespacesIterator = namespaces.values();

    for (let i = 0; i < namespacesIterator.length; i += 1) {
      const mapNamespace = namespacesIterator.next().value;
      const namespaceName = mapNamespace.metadata.name;
      namespacesArray.push(namespaceName);
    }

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

ImportResources.defaultProps = {
  namespaces: []
};

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    error: getNamespacesErrorMessage(state),
    loading: isFetchingNamespaces(state),
    namespaces: getNamespaces(state)
  };
}

const mapDispatchToProps = {
  fetchNamespaces
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImportResources);
