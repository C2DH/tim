import React, { useState, useCallback, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { Heading, Content, ActionButton, Text, Flex, Picker, Item } from '@adobe/react-spectrum';

import { add } from '../../reducers/data';
import { parse } from './utils';

const CreateNote = ({ data: { items = [] }, add }) => {
  const history = useHistory();

  const [file, setFile] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [format, setFormat] = useState('');

  useEffect(() => {
    const validate = async () => {
      try {
        await parse(file, format);
        setIsValid(true);
      } catch (error) {
        // console.error(error);
        setIsValid(false);
      }
    };
    validate();
  }, [file, format, setIsValid]);

  const loadFile = useCallback(
    async ({
      nativeEvent: {
        target: { files },
      },
    }) => {
      if (files.length === 0) return;
      console.log(files[0]);

      setFile(files[0]);
    },
    [setFile]
  );

  const fileInput = useRef(null);
  const triggerFileInput = useCallback(() => fileInput.current.click(), [fileInput]);

  const createNote = useCallback(async () => {
    const note = await parse(file, format);
    console.log(note);

    add(note);
    history.push(`/notes/${note.id}`);
  }, [file, format, add, history]);

  const createEmptyNote = useCallback(() => {
    const id = uuidv4();

    add({
      id,
      title: `Untitled ${items.length + 1}`,
      url: null,
      notes: [
        {
          children: [{ text: '[00:00:00]' }],
        },
      ],
      metadata: [],
      created: Date.now(),
      updated: Date.now(),
    });

    history.push(`/notes/${id}`);
  }, [add, history, items]);

  return (
    <Flex direction="row" gap="size-100">
      <Content>
        <Flex direction="column" gap="size-50">
          <Heading>Create note</Heading>
          <Text>Start with</Text>
          <ActionButton onPress={createEmptyNote}>empty note</ActionButton>
          <Text>or import text from</Text>
          <ActionButton onPress={triggerFileInput}>document file</ActionButton>
          <input
            type="file"
            accept="text/plain, *.txt, *.md, text/rtf, application/rtf, *.rtf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, *.docx, application/json, *.json"
            onChange={loadFile}
            ref={fileInput}
            aria-label="Choose file"
          />

          <Picker
            label="Choose document format"
            selectedKey={format}
            onSelectionChange={setFormat}
            validationState={format === '' || isValid ? 'valid' : 'invalid'}
          >
            <Item key="text">plain text</Item>
            <Item key="rtf">Rich Text Format</Item>
            <Item key="docx">Word</Item>
            <Item key="json">JSON</Item>
          </Picker>
          <ActionButton isDisabled={!format || !isValid} onPress={createNote}>
            Load
          </ActionButton>
        </Flex>
      </Content>
    </Flex>
  );
};

export default connect(({ data }) => ({ data }), { add })(CreateNote);
