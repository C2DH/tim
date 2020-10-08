import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import Md from 'markdown-it';

import { Flex, View, Content, ActionGroup, Item } from '@adobe/react-spectrum';

import { update } from '../../reducers/data';

import './Metadata.css';

const Metadata = ({ data, update }) => {
  const { items } = data;
  const { id } = useParams();
  const item = useMemo(() => items.find(({ id: _id }) => id === _id), [items, id]);

  // const text = data.notes.map(({ children }) => children.map(({ text }) => text).join('\n')).join('\n');
  // const md = new Md();
  // const parsed = md.parse(text, {});

  return (
    <View flex UNSAFE_style={{ overflowY: 'scroll' }}>
      <Content margin="size-100">
        <h1>{item.title}</h1>
      </Content>
    </View>
  );
};

export default connect(({ data }) => ({ data }), { update })(Metadata);
