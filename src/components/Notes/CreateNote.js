import React, { useState, useCallback, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import {
  Heading,
  Content,
  ActionButton,
  Text,
  Flex,
  Picker,
  Item,
  Section,
  Divider,
  Well,
} from '@adobe/react-spectrum';

import { add, trim } from '../../reducers/data';
import { parse } from './utils';
import { namespace } from '../../configureStore';
import Intro from './Intro';

const DEFAULT_NOTE = `[00:00:00]





`;

const TUTORIAL_NOTE = `[00:00:00]
# I am a title. To create me, first type "#"

>I am a synopsis of a segment. To create me, type shift+period. A segment is created by adding a timecode on its own line. It goes from the timecode above it until the next timecode or until the end of the media. A synopsis summarizes what a segment is about.

**I am a keyword. To create me surround a word or phrase with two asterisks** **keyword2** 
**keyword3, keyword4**

I am free form notes in this segment.

[00:01:23]
# Adding Timecodes

>another summary

some more notes [00:01:58] with some time codes

Add a timecode by pressing **cmd+j** [00:02:03] on a mac, or ctrl+j on a PC.
You can click timecodes to skip to that moment in the media. 
You can also manually type in a timecode.
You can also inject 4 timecodes at the same time by pressing cmd+shift+j. It will inject the current time and 3 earlier timecodes (default is 1, 2, and 3 seconds before the current time).





`;

const CreateNote = ({ data: { items = [] }, add, trim }) => {
  const history = useHistory();

  const [gc, setGc] = useState(false);
  const [file, setFile] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [format, setFormat] = useState('');

  useEffect(() => {
    if (gc) return;

    try {
      const data = localStorage.getItem(`${namespace}_data`);
      if (data.length > 3000000) trim();
    } catch (e) {
      trim();
    }

    localStorage.removeItem('TEST');
  }, [gc, setGc, trim]);

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
      const extension = files[0].name.split('.').pop();
      const extensions = ['txt', 'md', 'rtf', 'docx', 'json'];
      const types = [
        'text/plain',
        'text/rtf',
        'application/rtf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/json',
      ];

      if (extensions.includes(extension) || types.includes(files[0].type)) setFile(files[0]);
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
      notes: DEFAULT_NOTE.split('\n').map(text => ({
        children: [{ text }],
      })),
      metadata: [],
      created: Date.now(),
      updated: Date.now(),
    });

    history.push(`/notes/${id}`);
  }, [add, history, items]);

  const createTutorialNote = useCallback(() => {
    const id = uuidv4();

    add({
      id,
      title: `Untitled ${items.length + 1}`,
      url: null,
      notes: TUTORIAL_NOTE.split('\n').map(text => ({
        children: [{ text }],
      })),
      metadata: [],
      created: Date.now(),
      updated: Date.now(),
    });

    history.push(`/notes/${id}`);
  }, [add, history, items]);

  return (
    <Flex direction="row" gap="size-100">
      <Content>
        <Well marginX="size-500">
          <Flex direction="column" gap="size-50">
            <Heading>Create</Heading>
            <ActionButton onPress={createEmptyNote}>New project</ActionButton>
            <ActionButton onPress={createTutorialNote}>Sample project</ActionButton>
            <Divider size="S" marginY="size-100" />
            <ActionButton onPress={triggerFileInput}>Import</ActionButton>
            <input
              type="file"
              accept="text/plain, *.txt, *.md, text/rtf, application/rtf, *.rtf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, *.docx, application/json, *.json"
              onChange={loadFile}
              ref={fileInput}
              aria-label="Choose file"
            />
            <Text>{file ? `File: ${file.name}` : null}</Text>
            <Picker
              label="Choose file format"
              selectedKey={format}
              onSelectionChange={setFormat}
              validationState={format === '' || isValid ? 'valid' : 'invalid'}
            >
              <Section title="Document">
                <Item key="text">Plain Text</Item>
                <Item key="rtf">Rich Text Format</Item>
                <Item key="docx">Word</Item>
              </Section>
              <Section title="Project">
                <Item key="json">JSON</Item>
              </Section>
            </Picker>
            <ActionButton isDisabled={!format || !isValid} onPress={createNote}>
              Load
            </ActionButton>
          </Flex>
        </Well>
      </Content>
      <Intro />
    </Flex>
  );
};

export default connect(({ data }) => ({ data }), { add, trim })(CreateNote);
