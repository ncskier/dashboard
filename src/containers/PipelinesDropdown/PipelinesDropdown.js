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

import {
  getPipelines,
  isFetchingPipelines,
  getSelectedNamespace
} from '../../reducers';
import { fetchPipelines } from '../../actions/pipelines';
import TooltipDropdown from '../../components/TooltipDropdown';

class PipelinesDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItem: props.selectedItem || ''
    };

    this.onChange = this.onChange.bind(this);
    this.resetSelectedItem = this.resetSelectedItem.bind(this);
  }

  componentDidMount() {
    this.props.fetchPipelines();
  }

  componentDidUpdate(prevProps) {
    const { namespace } = this.props;
    if (namespace !== prevProps.namespace) {
      this.props.fetchPipelines();
      this.resetSelectedItem();
    }
  }

  onChange({ selectedItem }) {
    this.setState({
      selectedItem
    });
    if (this.props.onChange) {
      this.props.onChange({ selectedItem });
    }
  }

  resetSelectedItem() {
    const prevSelectedItem = this.state.selectedItem;
    this.setState({
      selectedItem: ''
    });
    if (prevSelectedItem !== '' && this.props.onChange) {
      this.props.onChange({ selectedItem: '' });
    }
  }

  render() {
    return (
      <TooltipDropdown
        {...this.props}
        selectedItem={this.state.selectedItem}
        onChange={this.onChange}
      />
    );
  }
}

PipelinesDropdown.defaultProps = {
  items: [],
  loading: true,
  label: 'Select Pipeline',
  titleText: 'Pipeline'
};

function mapStateToProps(state) {
  return {
    items: getPipelines(state).map(sa => sa.metadata.name),
    loading: isFetchingPipelines(state),
    namespace: getSelectedNamespace(state)
  };
}

const mapDispatchToProps = {
  fetchPipelines
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PipelinesDropdown);
