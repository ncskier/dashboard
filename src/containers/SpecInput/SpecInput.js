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
import { connect } from 'react-redux';

import { FormGroup, InlineLoading } from 'carbon-components-react';
import { getPipeline } from '../../reducers';
import { PipelineResourcesDropdown } from '..';
import TextInput from '../../components/TextInput';

class SpecInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { values: { resources: {}, params: {} } };

    this.onResourceChange = this.onResourceChange.bind(this);
    this.onParamChange = this.onParamChange.bind(this);
  }

  onResourceChange(key, value) {
    console.log(key);
    console.log(value);
    this.setState(state => ({
      values: {
        ...state.values.params,
        resources: { ...state.values.resources, [key]: value }
      }
    }));
    if (this.props.onChange) {
      this.props.onChange(this.state.values);
    }
  }

  onParamChange(key, value) {
    console.log(key);
    console.log(value);
    this.setState(state => ({
      values: {
        ...state.values.resources,
        params: { ...state.values.params, [key]: value }
      }
    }));
    if (this.props.onChange) {
      this.props.onChange(this.state.values);
    }
  }

  render() {
    const { params, resources, loading, pipelineName, namespace } = this.props;
    if (loading) {
      return (
        <InlineLoading description={`loading pipeline '${pipelineName}'`} />
      );
    }
    return (
      <>
        {resources && (
          <FormGroup legendText="Resources">
            {resources.map(resource => {
              return (
                <PipelineResourcesDropdown
                  titleText={resource.name}
                  helperText={resource.type}
                  namespace={namespace}
                  showType
                  onChange={({ selectedItem }) =>
                    this.onResourceChange(resource.name, selectedItem.text)
                  }
                />
              );
            })}
          </FormGroup>
        )}
        {params && (
          <FormGroup legendText="Params">
            {params.map(param => {
              return (
                <TextInput
                  labelText={param.name}
                  helperText={param.description}
                  placeholder={param.default}
                  defaultValue={param.default}
                  onChange={payload =>
                    this.onParamChange(param.name, payload.target.value)
                  }
                />
              );
            })}
          </FormGroup>
        )}
      </>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { pipelineName, namespace } = ownProps;
  const pipeline = getPipeline(state, { name: pipelineName, namespace });
  let params;
  let resources;
  if (pipeline) {
    ({ params, resources } = pipeline.spec);
  }
  // TODO: fix loading for when fetching Pipelines
  return {
    params,
    resources,
    loading: false
  };
};

export default connect(mapStateToProps)(SpecInput);
