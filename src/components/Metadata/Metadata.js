import React from 'react';
import { connect } from 'react-redux';
import Md from 'markdown-it';

import { Flex, View, Content, ActionGroup, Item } from '@adobe/react-spectrum';

import { update } from '../../reducers/data';

import './Metadata.css';

const Metadata = ({ data, update }) => {
  const text = data.notes.map(({ children }) => children.map(({ text }) => text).join('\n')).join('\n');
  const md = new Md();
  const parsed = md.parse(text, {});

  return (
    <View flex UNSAFE_style={{ overflowY: 'scroll' }}>
      <Content margin="size-100">
        <code>{JSON.stringify(parsed, null, 2)}</code>
      </Content>
    </View>
  );
};

export default connect(({ data }) => ({ data }), { update })(Metadata);
