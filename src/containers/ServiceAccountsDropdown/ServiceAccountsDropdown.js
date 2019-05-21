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
import { Dropdown, DropdownSkeleton } from 'carbon-components-react';

import {
  getServiceAccounts,
  isFetchingServiceAccounts,
  getSelectedNamespace
} from '../../reducers';
import { fetchServiceAccounts } from '../../actions/serviceAccounts';

const itemToElement = ({ text }) => {
  return (
    <div key={text} title={text}>
      {text}
    </div>
  );
};

const itemToString = ({ text }) => text;

const itemStringToObject = text => ({ text });

class ServiceAccountsDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItem: ''
    };

    this.onChange = this.onChange.bind(this);
    this.resetSelectedItem = this.resetSelectedItem.bind(this);
  }

  componentDidMount() {
    this.props.fetchServiceAccounts();
  }

  componentDidUpdate(prevProps) {
    const { namespace } = this.props;
    if (namespace !== prevProps.namespace) {
      this.props.fetchServiceAccounts();
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
    const { items, loading, ...dropdownProps } = this.props;
    if (loading) {
      return <DropdownSkeleton {...dropdownProps} />;
    }
    const options = items.map(itemStringToObject);
    return (
      <Dropdown
        {...dropdownProps}
        itemToElement={itemToElement}
        items={options}
        itemToString={itemToString}
        selectedItem={this.state.selectedItem}
        onChange={this.onChange}
      />
    );
  }
}

ServiceAccountsDropdown.defaultProps = {
  items: [],
  loading: true,
  label: 'Select ServiceAccount'
};

function mapStateToProps(state) {
  return {
    items: getServiceAccounts(state).map(sa => sa.metadata.name),
    loading: isFetchingServiceAccounts(state),
    namespace: getSelectedNamespace(state)
  };
}

const mapDispatchToProps = {
  fetchServiceAccounts
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServiceAccountsDropdown);
